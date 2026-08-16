import { useState, useEffect, useCallback, useMemo } from "react";
import type { Appointment } from "./types";
import AppointmentToolbar from "./components/AppointmentToolbar";
import AppointmentTable from "./components/AppointmentTable";
import AppointmentFormModal from "./components/AppointmentFormModal";
import AppointmentDetailModal from "./components/AppointmentDetailModal";
import ConfirmCancelModal from "./components/ConfirmCancelModal";
import { appointmentApi } from "../../api/appointmentApi";
import { doctorApi } from "../../api/doctorApi";
import { patientApi } from "../../api/patientApi";
import ToastNotification, { type ToastMessage } from "../../components/common/ToastNotification";
import { notificationApi } from "../../api/notificationApi";
import NotificationDetailModal from "../Notifications/components/NotificationDetailModal";
import type { Notification } from "../Notifications/types";

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dbDoctors, setDbDoctors] = useState<any[]>([]);
  const [dbPatients, setDbPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [cancellingAppointment, setCancellingAppointment] = useState<Appointment | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [viewingNotification, setViewingNotification] = useState<Notification | null>(null);

  const addToast = useCallback((item: Omit<ToastMessage, "id">) => {
    const id = Date.now().toString() + "_" + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [{ ...item, id }, ...prev]);
  }, []);

  const removeToast = useCallback((id?: string) => {
    if (id) {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    } else {
      setToasts([]);
    }
  }, []);

  const getLoggedInAdminUserId = (): string | undefined => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        return parsed?.userId || parsed?.id;
      }
    } catch (e) {}
    return undefined;
  };

  // Helper map backend status strings to frontend AppointmentStatusName
  const mapBackendStatus = (st?: string): string => {
    if (!st) return "Scheduled";
    const lower = st.toLowerCase();
    if (lower === "confirmed" || lower === "scheduled" || lower === "đã đặt lịch") return "Scheduled";
    if (lower === "checkedin" || lower === "đã check in") return "CheckedIn";
    if (lower === "waitingfordoctor" || lower === "waiting" || lower === "đang chờ khám") return "Waiting";
    if (lower === "inprogress" || lower === "đang khám") return "InProgress";
    if (lower === "completed" || lower === "đã hoàn thành") return "Completed";
    if (lower === "cancelled" || lower === "đã hủy") return "Cancelled";
    if (lower === "noshow" || lower === "không đến khám") return "NoShow";
    return st;
  };

  // Fetch appointments list from API
  const fetchAppointments = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await appointmentApi.getAll();
      if (Array.isArray(data)) {
        const mapped: Appointment[] = data.map((a: any, index: number) => {
          const apptId = Number(a.appointmentId || a.id || index + 1);
          return {
            ...a,
            id: apptId,
            appointmentId: apptId,
            patientId: a.patientId,
            doctorId: a.doctorId,
            patientName: a.patientName || `Bệnh nhân #${a.patientId}`,
            doctorName: a.doctorName || "BS. Bệnh viện DTT",
            specialtyName: a.specialtyName || "Khám tổng quát",
            appointmentDate: a.date || a.appointmentDate || "",
            appointmentTime: a.timeSlot || a.appointmentTime || "08:30 - 09:30",
            queueNumber: a.queueNumber || index + 1,
            status: mapBackendStatus(a.status),
            reason: a.reason || "",
            fee: a.fee || "250.000đ",
            cancelReason: a.cancelReason || a.cancel_reason || null,
            cancelTime: a.cancelTime || a.cancelledAt || a.cancelled_at || a.cancelAt || null,
            cancelledAt: a.cancelledAt || a.cancelled_at || a.cancelTime || null,
            cancelledBy: a.cancelledBy || a.cancelled_by || null,
            note: a.note || a.notes || null,
            notes: a.note || a.notes || null,
            createdAt: a.createdAt || a.created_at || "",
            updatedAt: a.updatedAt || a.updated_at || "",
            memberId: a.memberId || a.member_id || null,
            nurseNote: a.nurseNote || a.nurse_note || null,
          };
        });
        setAppointments(mapped);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách lịch hẹn từ API:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    Promise.all([
      appointmentApi.getAll(),
      doctorApi.getAll(),
      patientApi.getAll(),
    ])
      .then(([appData, docsData, patientsData]) => {
        if (!isMounted) return;
        if (Array.isArray(appData)) {
          const mapped: Appointment[] = appData.map((a: any, index: number) => {
            const apptId = Number(a.appointmentId || a.id || index + 1);
            return {
              ...a,
              id: apptId,
              appointmentId: apptId,
              patientId: a.patientId,
              doctorId: a.doctorId,
              patientName: a.patientName || `Bệnh nhân #${a.patientId}`,
              doctorName: a.doctorName || "BS. Bệnh viện DTT",
              specialtyName: a.specialtyName || "Khám tổng quát",
              appointmentDate: a.date || a.appointmentDate || "",
              appointmentTime: a.timeSlot || a.appointmentTime || "08:30 - 09:30",
              queueNumber: a.queueNumber || index + 1,
              status: mapBackendStatus(a.status),
              reason: a.reason || "",
              fee: a.fee || "250.000đ",
              note: a.note || a.notes || null,
              notes: a.note || a.notes || null,
              createdAt: a.createdAt || a.created_at || "",
              updatedAt: a.updatedAt || a.updated_at || "",
              memberId: a.memberId || a.member_id || null,
              nurseNote: a.nurseNote || a.nurse_note || null,
            };
          });
          setAppointments(mapped);
        }
        if (Array.isArray(docsData)) setDbDoctors(docsData);
        if (Array.isArray(patientsData)) setDbPatients(patientsData);
      })
      .catch((error) => {
        console.error("Lỗi tải song song dữ liệu Lịch hẹn:", error);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Extract unique doctors list from API + fetched doctors
  const doctors = useMemo(() => {
    const docSet = new Set<string>();
    dbDoctors.forEach((d) => {
      if (d.fullName) docSet.add(d.fullName);
    });
    appointments.forEach((app) => {
      if (app.doctorName) docSet.add(app.doctorName);
    });
    if (docSet.size === 0) {
      docSet.add("BS. Trần Minh Tuấn");
      docSet.add("BS. Nguyễn Thị Lan");
    }
    return Array.from(docSet);
  }, [appointments, dbDoctors]);

  // Statistics
  const totalAppointments = appointments.length;
  const waitingAndExaminingCount = appointments.filter(
    (a) => a.status === "Waiting" || a.status === "InProgress" || a.status === "CheckedIn" || a.status === "Đang chờ khám" || a.status === "Đang khám"
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

  // Save (Create or Update) appointment via API
  const handleSaveAppointment = async (appData: Appointment) => {
    try {
      const targetId = appData.appointmentId || appData.id;
      const patientName = appData.patientName || "Bệnh nhân";
      const doctorName = appData.doctorName || "Bác sĩ";
      const adminUserId = getLoggedInAdminUserId();

      // Find matching patient ID from dbPatients list
      let matchedPatientId = appData.patientId || 1;
      if (appData.patientName) {
        const foundP = dbPatients.find(
          (p) => p.fullName?.toLowerCase().trim() === appData.patientName?.toLowerCase().trim()
        );
        if (foundP) matchedPatientId = foundP.patientId || foundP.id || matchedPatientId;
      }

      // Find matching doctor ID from dbDoctors list
      let matchedDoctorId = appData.doctorId || 1;
      if (appData.doctorName) {
        const foundD = dbDoctors.find(
          (d) => d.fullName?.toLowerCase().trim() === appData.doctorName?.toLowerCase().trim()
        );
        if (foundD) matchedDoctorId = foundD.doctorId || foundD.id || matchedDoctorId;
      }

      // Map status name to statusId
      let statusId = 1;
      const st = String(appData.status || "Scheduled").toLowerCase();
      if (st.includes("completed") || st.includes("hoàn thành")) statusId = 4;
      else if (st.includes("cancelled") || st.includes("hủy")) statusId = 5;
      else if (st.includes("noshow") || st.includes("không đến")) statusId = 6;
      else if (st.includes("checkedin") || st.includes("check in")) statusId = 7;
      else if (st.includes("waiting") || st.includes("chờ")) statusId = 2;
      else if (st.includes("inprogress") || st.includes("đang khám")) statusId = 3;

      if (targetId && editingAppointment) {
        // Edit mode API
        await appointmentApi.update(targetId, {
          patientId: matchedPatientId,
          doctorId: matchedDoctorId,
          doctorName: appData.doctorName,
          specialtyName: appData.specialtyName,
          date: appData.appointmentDate,
          timeSlot: appData.appointmentTime,
          reason: appData.reason,
          fee: appData.fee,
          statusId,
          cancelReason: appData.cancelReason || appData.cancel_reason,
          cancelledBy: appData.cancelledBy || appData.cancelled_by,
          note: appData.notes || appData.note,
          notes: appData.notes || appData.note,
          nurseNote: appData.nurseNote || appData.nurse_note,
        });

        // Also update status if explicitly changed to a new status
        if (appData.status && editingAppointment && editingAppointment.status !== appData.status) {
          await appointmentApi.updateStatus(targetId, appData.status);
        }

        const createdNoti = await notificationApi.create({
          title: "Cập nhật lịch hẹn",
          content: `Lịch hẹn #${targetId} của bệnh nhân "${patientName}" (Bác sĩ: ${doctorName}) đã được cập nhật.`,
          type: "system",
          userId: adminUserId,
        });

        addToast({
          type: "success",
          title: "Cập nhật lịch hẹn",
          message: `Đã cập nhật thông tin lịch hẹn #${targetId} thành công!`,
          onClick: createdNoti ? () => setViewingNotification(createdNoti) : undefined,
        });
      } else {
        // Add mode API
        await appointmentApi.create({
          patientId: matchedPatientId,
          doctorId: matchedDoctorId,
          doctorName: appData.doctorName,
          specialtyName: appData.specialtyName,
          date: appData.appointmentDate,
          timeSlot: appData.appointmentTime,
          reason: appData.reason,
          fee: appData.fee || "250.000đ",
        });

        const createdNoti = await notificationApi.create({
          title: "Đặt lịch hẹn mới",
          content: `Đã tạo mới thành công lịch hẹn cho bệnh nhân "${patientName}".`,
          type: "APPOINTMENT_NEW",
          userId: adminUserId,
        });

        addToast({
          type: "success",
          title: "Tạo lịch hẹn mới",
          message: `Đã tạo mới lịch hẹn của bệnh nhân "${patientName}" thành công!`,
          onClick: createdNoti ? () => setViewingNotification(createdNoti) : undefined,
        });
      }

      // Refresh list from Backend
      await fetchAppointments();
    } catch (error: any) {
      console.error("Lỗi khi lưu lịch hẹn qua API:", error);
      addToast({
        type: "error",
        title: "Lỗi thao tác",
        message: error.message || "Không thể lưu thông tin lịch hẹn. Vui lòng thử lại.",
      });
    }
  };

  // Confirm cancel appointment via API
  const handleConfirmCancelAppointment = async (
    appointmentId: number,
    cancelReason: string,
    cancelledBy: string
  ) => {
    const targetApp = appointments.find((a) => a.id === appointmentId || a.appointmentId === appointmentId) || cancellingAppointment;
    const patientName = targetApp?.patientName || "Bệnh nhân";
    const adminUserId = getLoggedInAdminUserId();

    try {
      await appointmentApi.cancel(appointmentId, cancelReason, cancelledBy);
      await fetchAppointments();

      const createdNoti = await notificationApi.create({
        title: "Hủy lịch hẹn",
        content: `Lịch hẹn #${appointmentId} của bệnh nhân "${patientName}" đã bị hủy. Lý do: ${cancelReason || "Theo yêu cầu"}.`,
        type: "APPOINTMENT_CANCELLED",
        userId: adminUserId,
      });

      addToast({
        type: "error",
        title: "Hủy lịch hẹn",
        message: `Đã hủy lịch hẹn #${appointmentId} của bệnh nhân "${patientName}" thành công!`,
        onClick: createdNoti ? () => setViewingNotification(createdNoti) : undefined,
      });
    } catch (error: any) {
      console.error("Lỗi khi hủy lịch hẹn qua API:", error);
      addToast({
        type: "error",
        title: "Lỗi thao tác",
        message: error.message || "Không thể hủy lịch hẹn. Vui lòng thử lại.",
      });
    } finally {
      setCancellingAppointment(null);
    }
  };

  const nextAppointmentId =
    appointments.length > 0
      ? Math.max(...appointments.map((a) => a.id || 0)) + 1
      : 1;

  return (
    <div className="p-7 bg-[#f4f6f9] min-h-screen relative">
      {/* Top-Right 3s Stacked Toast Notifications */}
      <ToastNotification toasts={toasts} onClose={removeToast} />

      {/* Top Toolbar & Quick Summary Cards */}
      <AppointmentToolbar
        onAddAppointment={handleOpenAddModal}
        totalAppointments={totalAppointments}
        waitingAndExaminingCount={waitingAndExaminingCount}
        completedCount={completedCount}
        cancelledAndMissedCount={cancelledAndMissedCount}
      />

      {/* Main Table View */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12 bg-white rounded-2xl shadow-xs">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 font-medium text-base">Đang tải danh sách lịch hẹn...</p>
          </div>
        </div>
      ) : (
        <AppointmentTable
          appointments={appointments}
          doctors={doctors}
          onViewDetail={handleOpenDetailModal}
          onEditAppointment={handleOpenEditModal}
          onCancelAppointment={handleOpenCancelModal}
        />
      )}

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

      {/* Notification Detail Modal triggered on Toast click */}
      <NotificationDetailModal
        notification={viewingNotification}
        onClose={() => setViewingNotification(null)}
        onDelete={async (id) => {
          await notificationApi.delete(id);
          setViewingNotification(null);
        }}
      />
    </div>
  );
}