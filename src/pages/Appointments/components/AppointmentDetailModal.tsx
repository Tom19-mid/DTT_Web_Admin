import {
  X,
  Edit,
  Calendar,
  Clock,
  User,
  UserCheck,
  FileText,
  AlertCircle,
  Activity,
  Users,
} from "lucide-react";
import type { Appointment } from "../types";
import StatusBadge from "./StatusBadge";

interface AppointmentDetailModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onEdit: (app: Appointment) => void;
}

const formatDateTimeDisplay = (dateStr?: string | null): string => {
  if (!dateStr || dateStr.trim() === "" || dateStr === "null") return "-";
  try {
    const dt = new Date(dateStr);
    if (isNaN(dt.getTime())) return dateStr;
    const day = String(dt.getDate()).padStart(2, "0");
    const month = String(dt.getMonth() + 1).padStart(2, "0");
    const year = dt.getFullYear();
    const hours = String(dt.getHours()).padStart(2, "0");
    const mins = String(dt.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${mins}`;
  } catch {
    return dateStr;
  }
};

const getCancellerInfo = (appointment: Appointment): string => {
  const directBy = appointment.cancelledBy || appointment.cancelled_by;
  if (directBy && directBy.trim() !== "" && directBy.trim() !== "null") {
    return directBy;
  }
  return "-";
};

const cleanCancelReason = (reasonStr?: string | null): string => {
  if (!reasonStr || reasonStr.trim() === "") return "-";
  if (reasonStr.includes("|")) {
    const parts = reasonStr.split("|");
    return parts[0].trim();
  }
  return reasonStr;
};

const parseNurseVitals = (nurseNoteStr?: string | null) => {
  if (!nurseNoteStr || nurseNoteStr.trim() === "" || nurseNoteStr === "null")
    return null;
  try {
    if (nurseNoteStr.startsWith("{") && nurseNoteStr.endsWith("}")) {
      return JSON.parse(nurseNoteStr);
    }
  } catch {
    // plain text
  }
  return { nurseNote: nurseNoteStr };
};

export default function AppointmentDetailModal({
  isOpen,
  appointment,
  onClose,
  onEdit,
}: AppointmentDetailModalProps) {
  if (!isOpen || !appointment) return null;

  const isCancelled =
    appointment.status === "Cancelled" || appointment.status === "Đã hủy";
  const rawNurseNote = appointment.nurseNote || appointment.nurse_note;
  const nurseVitals = parseNurseVitals(rawNurseNote);
  const memberIdVal = appointment.memberId || appointment.member_id;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-7 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Calendar size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Chi tiết lịch hẹn #{appointment.id}
              </h2>
              <div className="flex items-center gap-2.5 mt-1">
                <span className="text-lg font-bold text-gray-600">
                  STTK: #{appointment.queueNumber}
                </span>
                <span className="text-gray-300">•</span>
                <StatusBadge status={appointment.status || "Đã đặt lịch"} />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Details Content */}
        <div className="space-y-5 text-gray-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/80 p-5 rounded-2xl border border-gray-100">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-bold uppercase tracking-wider mb-1.5">
                <User size={18} className="text-blue-500" />
                Bệnh nhân
              </div>
              <p className="font-bold text-gray-900 text-lg">
                {appointment.patientName}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-bold uppercase tracking-wider mb-1.5">
                <UserCheck size={18} className="text-blue-500" />
                Bác sĩ phụ trách
              </div>
              <p className="font-bold text-gray-900 text-lg">
                {appointment.doctorName}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">
                <Calendar size={18} className="text-gray-400" />
                Ngày khám
              </div>
              <p className="font-bold text-gray-900 text-lg">
                {appointment.appointmentDate}
              </p>
            </div>

            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">
                <Clock size={18} className="text-gray-400" />
                Giờ khám
              </div>
              <p className="font-bold text-gray-900 text-lg">
                {appointment.appointmentTime}
              </p>
            </div>

            <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100">
              <div className="text-sm text-blue-700 font-bold uppercase tracking-wider mb-1">
                Số thứ tự khám
              </div>
              <p className="font-extrabold text-blue-600 text-2xl">
                #{appointment.queueNumber}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 font-bold uppercase tracking-wider mb-1.5">
              <FileText size={18} className="text-gray-500" />
              Lý do khám
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-900 leading-relaxed text-base font-normal">
              {appointment.reason || "-"}
            </div>
          </div>

          {/* Hủy lịch section (chỉ hiển thị khi trạng thái là Đã hủy / Cancelled) */}
          {isCancelled && (
            <div className="p-5 bg-rose-50/80 rounded-2xl border border-rose-100 text-rose-900 space-y-3">
              <div className="flex items-center gap-2 text-base font-bold text-rose-800 uppercase tracking-wider border-b border-rose-200/60 pb-2">
                <AlertCircle size={20} />
                Thông tin hủy lịch hẹn
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-base mt-2">
                <div>
                  <span className="text-gray-600 block text-sm font-semibold mb-0.5">
                    Lý do hủy:
                  </span>
                  <span className="font-normal text-rose-950 text-base block leading-snug">
                    {cleanCancelReason(
                      appointment.cancelReason || appointment.cancel_reason
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 block text-sm font-semibold mb-0.5">
                    Thời gian hủy:
                  </span>
                  <span className="font-normal text-rose-950 text-base block">
                    {formatDateTimeDisplay(
                      appointment.cancelTime ||
                        appointment.cancelledAt ||
                        appointment.cancelled_at,
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 block text-sm font-semibold mb-0.5">
                    Người hủy:
                  </span>
                  <span className="font-normal text-rose-950 text-base block">
                    {getCancellerInfo(appointment)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Ghi chú điều dưỡng (nurse_note) */}
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 font-bold uppercase tracking-wider mb-1.5">
              <Activity size={18} className="text-emerald-600" />
              Ghi chú điều dưỡng (nurse_note)
            </div>
            {nurseVitals ? (
              <div className="p-5 bg-emerald-50/70 rounded-2xl border border-emerald-100 text-emerald-950 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-base">
                  {nurseVitals.bloodPressure && (
                    <div>
                      <span className="text-gray-600 block text-sm font-semibold">
                        Huyết áp:
                      </span>
                      <span className="font-normal text-emerald-950 text-base">
                        {nurseVitals.bloodPressure} mmHg
                      </span>
                    </div>
                  )}
                  {nurseVitals.heartRate > 0 && (
                    <div>
                      <span className="text-gray-600 block text-sm font-semibold">
                        Nhịp tim:
                      </span>
                      <span className="font-normal text-emerald-950 text-base">
                        {nurseVitals.heartRate} bpm
                      </span>
                    </div>
                  )}
                  {nurseVitals.temperature > 0 && (
                    <div>
                      <span className="text-gray-600 block text-sm font-semibold">
                        Thân nhiệt:
                      </span>
                      <span className="font-normal text-emerald-950 text-base">
                        {nurseVitals.temperature} °C
                      </span>
                    </div>
                  )}
                  {nurseVitals.bmi > 0 && (
                    <div>
                      <span className="text-gray-600 block text-sm font-semibold">
                        BMI:
                      </span>
                      <span className="font-normal text-emerald-950 text-base">
                        {nurseVitals.bmi}
                      </span>
                    </div>
                  )}
                </div>
                {nurseVitals.nurseNote && (
                  <p className="text-base text-gray-900 mt-2 font-normal border-t border-emerald-200/60 pt-2">
                    <span className="font-bold text-gray-700">Nội dung:</span>{" "}
                    {nurseVitals.nurseNote}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-900 text-base font-normal">
                -
              </div>
            )}
          </div>

          {/* Ghi chú general */}
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 font-bold uppercase tracking-wider mb-1.5">
              <FileText size={18} className="text-gray-500" />
              Ghi chú
            </div>
            <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-100/70 text-gray-900 leading-relaxed text-base font-normal">
              {appointment.notes || appointment.note || "-"}
            </div>
          </div>

          {/* Ngày tạo, Ngày cập nhật, Mã thành viên gia đình (created_at, updated_at, member_id) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm">
            <div>
              <span className="block font-semibold text-gray-500 mb-0.5">
                Ngày tạo:
              </span>
              <span className="font-semibold text-gray-900 text-base">
                {formatDateTimeDisplay(
                  appointment.createdAt || appointment.created_at,
                )}
              </span>
            </div>
            <div>
              <span className="block font-semibold text-gray-500 mb-0.5">
                Cập nhật lần cuối:
              </span>
              <span className="font-semibold text-gray-900 text-base">
                {formatDateTimeDisplay(
                  appointment.updatedAt || appointment.updated_at,
                )}
              </span>
            </div>
            <div>
              <span className="block font-semibold text-gray-500 mb-0.5 flex items-center gap-1.5">
                <Users size={16} /> Thành viên gia đình:
              </span>
              <span className="font-bold text-gray-900 text-base">
                {memberIdVal ? `#${memberIdVal}` : "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-5 mt-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition cursor-pointer text-base"
          >
            Đóng
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(appointment);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition cursor-pointer text-base"
          >
            <Edit size={18} />
            <span>Chỉnh sửa</span>
          </button>
        </div>
      </div>
    </div>
  );
}
