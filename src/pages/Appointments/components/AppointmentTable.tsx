import { useState, useMemo } from "react";
import type { Appointment } from "../types";
import AppointmentSearch from "./AppointmentSearch";
import AppointmentRow from "./AppointmentRow";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const itemsPerPage = 8;

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
        app.id.toString().includes(term) ||
        app.patientName.toLowerCase().includes(term) ||
        app.doctorName.toLowerCase().includes(term) ||
        app.reason.toLowerCase().includes(term) ||
        (app.notes && app.notes.toLowerCase().includes(term));

      // Status filter (match DB code or Vietnamese)
      let matchesStatus = selectedStatus === "ALL";
      if (selectedStatus !== "ALL") {
        if (selectedStatus === "Scheduled" || selectedStatus === "Đã đặt lịch") {
          matchesStatus = app.status === "Scheduled" || app.status === "Đã đặt lịch";
        } else if (selectedStatus === "Waiting" || selectedStatus === "Đang chờ khám") {
          matchesStatus = app.status === "Waiting" || app.status === "Đang chờ khám";
        } else if (selectedStatus === "InProgress" || selectedStatus === "Đang khám") {
          matchesStatus = app.status === "InProgress" || app.status === "Đang khám";
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-100 text-base text-gray-600">
          <div>
            Hiển thị <span className="font-bold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> -{" "}
            <span className="font-bold text-gray-900">
              {Math.min(currentPage * itemsPerPage, filteredAppointments.length)}
            </span>{" "}
            trên <span className="font-bold text-gray-900">{filteredAppointments.length}</span> lịch hẹn
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-xl font-bold text-base cursor-pointer transition ${
                  currentPage === page
                    ? "bg-blue-600 text-white shadow-xs"
                    : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
