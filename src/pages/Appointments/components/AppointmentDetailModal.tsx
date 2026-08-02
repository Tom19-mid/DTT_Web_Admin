import { X, Edit, Calendar, Clock, User, UserCheck, FileText, AlertCircle, Hash } from "lucide-react";
import type { Appointment } from "../types";
import StatusBadge from "./StatusBadge";

interface AppointmentDetailModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onEdit: (app: Appointment) => void;
}

export default function AppointmentDetailModal({
  isOpen,
  appointment,
  onClose,
  onEdit,
}: AppointmentDetailModalProps) {
  if (!isOpen || !appointment) return null;

  const isCancelled = appointment.status === "Cancelled" || appointment.status === "Đã hủy";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Calendar size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Chi tiết lịch hẹn #{appointment.id}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-base font-semibold text-gray-500">
                  STT: #{appointment.queueNumber}
                </span>
                <span className="text-gray-300">•</span>
                <StatusBadge status={appointment.status} />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Details Content */}
        <div className="space-y-4 text-base text-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">
                <User size={16} className="text-gray-400" />
                Bệnh nhân
              </div>
              <p className="font-bold text-gray-900 text-base">{appointment.patientName}</p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">
                <UserCheck size={16} className="text-gray-400" />
                Bác sĩ phụ trách
              </div>
              <p className="font-bold text-gray-900 text-base">{appointment.doctorName}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">
                <Calendar size={16} className="text-gray-400" />
                Ngày khám
              </div>
              <p className="font-semibold text-gray-900 text-base">{appointment.appointmentDate}</p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">
                <Clock size={16} className="text-gray-400" />
                Giờ khám
              </div>
              <p className="font-semibold text-gray-900 text-base">{appointment.appointmentTime}</p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">
                <Hash size={16} className="text-gray-400" />
                Số thứ tự
              </div>
              <p className="font-bold text-blue-600 text-lg">#{appointment.queueNumber}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">
              <FileText size={16} className="text-gray-400" />
              Lý do khám
            </div>
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 leading-relaxed text-base font-medium">
              {appointment.reason}
            </div>
          </div>

          {/* Hủy lịch section (chỉ hiển thị khi trạng thái là Đã hủy / Cancelled) */}
          {isCancelled && (
            <div className="p-4 bg-rose-50/80 rounded-xl border border-rose-100 text-rose-900 space-y-2">
              <div className="flex items-center gap-1.5 text-sm font-bold text-rose-700 uppercase tracking-wider">
                <AlertCircle size={16} />
                Thông tin hủy lịch hẹn
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm mt-2">
                <div>
                  <span className="text-gray-500 block text-xs font-semibold">Lý do hủy:</span>
                  <span className="font-bold text-rose-900">{appointment.cancelReason || "Bệnh nhân bận việc"}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs font-semibold">Thời gian hủy:</span>
                  <span className="font-bold text-rose-900">{appointment.cancelTime || "01/08/2026 08:10"}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs font-semibold">Người hủy:</span>
                  <span className="font-bold text-rose-900">{appointment.cancelledBy || "Lễ tân"}</span>
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">
              <FileText size={16} className="text-gray-400" />
              Ghi chú
            </div>
            <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100/60 text-gray-800 leading-relaxed text-base">
              {appointment.notes || "Không có ghi chú."}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-5 mt-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition cursor-pointer text-base"
          >
            Đóng
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(appointment);
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition cursor-pointer text-base"
          >
            <Edit size={18} />
            <span>Chỉnh sửa</span>
          </button>
        </div>
      </div>
    </div>
  );
}
