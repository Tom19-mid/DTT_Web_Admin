import { useState, useMemo } from "react";
import type { Appointment } from "../types";
import AppointmentSearch from "./AppointmentSearch";
import AppointmentRow from "./AppointmentRow";
import Pagination from "../../../components/common/Pagination";

interface AppointmentTableProps {
  appointments: Appointment[];
  doctors: string[];
  onViewDetail: (app: Appointment) => void;
  onEditAppointment: (app: Appointment) => void;
  onCancelAppointment: (app: Appointment) => void;
}

export default function AppointmentTable({
  appointments,
  doctors,
  onViewDetail,
  onEditAppointment,
  onCancelAppointment,
}: AppointmentTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleReset = () => {
    setSearchTerm("");
    setSelectedStatus("ALL");
    setSelectedDoctor("ALL");
    setCurrentPage(1);
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((app) => {
      // Search term matching ID, patient, doctor, reason, notes
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        (app.id ?? "").toString().includes(term) ||
        (app.patientName || "").toLowerCase().includes(term) ||
        (app.doctorName || "").toLowerCase().includes(term) ||
        (app.reason || "").toLowerCase().includes(term) ||
        (app.notes && app.notes.toLowerCase().includes(term));

      // Status filter (match DB code or Vietnamese)
      let matchesStatus = selectedStatus === "ALL";
      if (selectedStatus !== "ALL") {
        if (selectedStatus === "Scheduled" || selectedStatus === "Đã đặt lịch") {
          matchesStatus = app.status === "Scheduled" || app.status === "Đã đặt lịch";
        } else if (selectedStatus === "CheckedIn" || selectedStatus === "Đã check in") {
          matchesStatus = app.status === "CheckedIn" || app.status === "Đã check in";
        } else if (selectedStatus === "Waiting" || selectedStatus === "Đang chờ khám") {
          matchesStatus = app.status === "Waiting" || app.status === "Đang chờ khám";
        } else if (selectedStatus === "WaitingDoctor" || selectedStatus === "WaitingForDoctor" || selectedStatus === "Đang chờ bác sĩ") {
          matchesStatus = app.status === "WaitingDoctor" || app.status === "WaitingForDoctor" || app.status === "Đang chờ bác sĩ";
        } else if (selectedStatus === "InProgress" || selectedStatus === "Đang khám") {
          matchesStatus = app.status === "InProgress" || app.status === "Đang khám";
        } else if (selectedStatus === "WaitingTestResults" || selectedStatus === "AwaitingTestResults" || selectedStatus === "Đang chờ kết quả xét nghiệm") {
          matchesStatus = app.status === "WaitingTestResults" || app.status === "AwaitingTestResults" || app.status === "Đang chờ kết quả xét nghiệm";
        } else if (selectedStatus === "PendingDispensing" || selectedStatus === "Đang chờ phát thuốc") {
          matchesStatus = app.status === "PendingDispensing" || app.status === "Đang chờ phát thuốc";
        } else if (selectedStatus === "Completed" || selectedStatus === "Đã hoàn thành") {
          matchesStatus = app.status === "Completed" || app.status === "Đã hoàn thành";
        } else if (selectedStatus === "Cancelled" || selectedStatus === "Đã hủy") {
          matchesStatus = app.status === "Cancelled" || app.status === "Đã hủy";
        } else if (selectedStatus === "NoShow" || selectedStatus === "Không đến khám") {
          matchesStatus = app.status === "NoShow" || app.status === "Không đến khám";
        }
      }

      // Doctor filter
      const matchesDoctor =
        selectedDoctor === "ALL" || app.doctorName === selectedDoctor;

      return matchesSearch && matchesStatus && matchesDoctor;
    });
  }, [appointments, searchTerm, selectedStatus, selectedDoctor]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage) || 1;
  const paginatedAppointments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAppointments.slice(start, start + itemsPerPage);
  }, [filteredAppointments, currentPage]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-6">
      {/* Search & Filter Toolbar */}
      <AppointmentSearch
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        selectedStatus={selectedStatus}
        onStatusChange={(val) => {
          setSelectedStatus(val);
          setCurrentPage(1);
        }}
        selectedDoctor={selectedDoctor}
        onDoctorChange={(val) => {
          setSelectedDoctor(val);
          setCurrentPage(1);
        }}
        doctors={doctors}
        onReset={handleReset}
      />

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-200/70 text-gray-800 font-bold text-base">
              <th className="py-4 px-4 text-center rounded-l-xl">Mã lịch hẹn</th>
              <th className="py-4 px-4">Bệnh nhân</th>
              <th className="py-4 px-4">Bác sĩ</th>
              <th className="py-4 px-4">Ngày khám</th>
              <th className="py-4 px-4">Giờ khám</th>
              <th className="py-4 px-4">Lý do khám</th>
              <th className="py-4 px-4 text-center">Số thứ tự khám</th>
              <th className="py-4 px-4">Trạng thái</th>
              <th className="py-4 px-4 text-center rounded-r-xl">Chỉnh sửa</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAppointments.length > 0 ? (
              paginatedAppointments.map((app) => (
                <AppointmentRow
                  key={app.id}
                  appointment={app}
                  onViewDetail={onViewDetail}
                  onEdit={onEditAppointment}
                  onCancelAppointment={onCancelAppointment}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className="text-center py-10 text-gray-500 font-medium text-base"
                >
                  Không tìm thấy lịch hẹn nào khớp với từ khóa.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredAppointments.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          totalItems={filteredAppointments.length}
          itemsPerPage={itemsPerPage}
          itemLabel="lịch hẹn"
        />
      )}
    </div>
  );
}
