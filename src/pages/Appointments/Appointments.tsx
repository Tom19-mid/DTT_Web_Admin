import { useState, useMemo } from "react";
import { initialAppointments } from "./data";
import type { Appointment } from "./types";
import AppointmentToolbar from "./components/AppointmentToolbar";
import AppointmentTable from "./components/AppointmentTable";
import AppointmentFormModal from "./components/AppointmentFormModal";
import AppointmentDetailModal from "./components/AppointmentDetailModal";
import ConfirmCancelModal from "./components/ConfirmCancelModal";

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [cancellingAppointment, setCancellingAppointment] = useState<Appointment | null>(null);

  // Extract unique doctors list
  const doctors = useMemo(() => {
    const docSet = new Set<string>();
    appointments.forEach((app) => docSet.add(app.doctorName));
    return Array.from(docSet);
  }, [appointments]);

  // Statistics
  const totalAppointments = appointments.length;
  const waitingAndExaminingCount = appointments.filter(
    (a) => a.status === "Waiting" || a.status === "InProgress" || a.status === "Đang chờ khám" || a.status === "Đang khám"
  ).length;
  const completedCount = appointments.filter(
    (a) => a.status === "Completed" || a.status === "Đã hoàn thành"
  ).length;
  const cancelledAndMissedCount = appointments.filter(
    (a) => a.status === "Cancelled" || a.status === "NoShow" || a.status === "Đã hủy" || a.status === "Không đến khám"
  ).length;

  // Handlers
  const handleOpenAddModal = () => {
    setEditingAppointment(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (app: Appointment) => {
    setEditingAppointment(app);
    setIsFormModalOpen(true);
  };

  const handleOpenDetailModal = (app: Appointment) => {
    setViewingAppointment(app);
  };

  const handleOpenCancelModal = (app: Appointment) => {
    setCancellingAppointment(app);
  };

  const handleSaveAppointment = (appData: Appointment) => {
    const exists = appointments.some((a) => a.id === appData.id);
    if (exists && editingAppointment) {
      // Edit mode
      setAppointments((prev) =>
        prev.map((a) => (a.id === appData.id ? appData : a))
      );
    } else {
      // Add mode - Append to end of list
      setAppointments((prev) => [...prev, appData]);
    }
  };

  const handleConfirmCancelAppointment = (
    appointmentId: number,
    cancelReason: string,
    cancelledBy: string
  ) => {
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, "0")}/${String(
      now.getMonth() + 1
    ).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(
      2,
      "0"
    )}:${String(now.getMinutes()).padStart(2, "0")}`;

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === appointmentId
          ? {
              ...a,
              status: "Cancelled",
              cancelReason,
              cancelTime: formattedDate,
              cancelledBy,
            }
          : a
      )
    );
    setCancellingAppointment(null);
  };

  const nextAppointmentId =
    appointments.length > 0
      ? Math.max(...appointments.map((a) => a.id)) + 1
      : 1;

  return (
    <div className="p-7 bg-[#f4f6f9] min-h-screen">
      {/* Top Toolbar & Quick Summary Cards */}
      <AppointmentToolbar
        onAddAppointment={handleOpenAddModal}
        totalAppointments={totalAppointments}
        waitingAndExaminingCount={waitingAndExaminingCount}
        completedCount={completedCount}
        cancelledAndMissedCount={cancelledAndMissedCount}
      />

      {/* Main Table View */}
      <AppointmentTable
        appointments={appointments}
        doctors={doctors}
        onViewDetail={handleOpenDetailModal}
        onEditAppointment={handleOpenEditModal}
        onCancelAppointment={handleOpenCancelModal}
      />

      {/* Add / Edit Form Modal */}
      <AppointmentFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveAppointment}
        initialData={editingAppointment}
        doctors={doctors}
        nextAppointmentId={nextAppointmentId}
      />

      {/* Detail View Modal (Displays cancellation info when cancelled) */}
      <AppointmentDetailModal
        isOpen={!!viewingAppointment}
        appointment={viewingAppointment}
        onClose={() => setViewingAppointment(null)}
        onEdit={(app) => {
          setViewingAppointment(null);
          handleOpenEditModal(app);
        }}
      />

      {/* Confirm Cancel Appointment Modal */}
      <ConfirmCancelModal
        isOpen={!!cancellingAppointment}
        appointment={cancellingAppointment}
        onClose={() => setCancellingAppointment(null)}
        onConfirmCancel={handleConfirmCancelAppointment}
      />
    </div>
  );
}