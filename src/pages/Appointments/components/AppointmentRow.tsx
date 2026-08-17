import { memo } from "react";
import { Eye, Pencil, LockKeyhole } from "lucide-react";
import type { Appointment } from "../types";
import StatusBadge from "./StatusBadge";

interface AppointmentRowProps {
  appointment: Appointment;
  onViewDetail: (app: Appointment) => void;
  onEdit: (app: Appointment) => void;
  onCancelAppointment: (app: Appointment) => void;
}

// React.memo — cùng lý do PatientRow: tránh re-render toàn bảng khi state không liên quan ở trang
// cha thay đổi (đây là màn giao dịch nhiều nhất trong hệ thống theo audit hiệu năng).
function AppointmentRow({
  appointment,
  onViewDetail,
  onEdit,
  onCancelAppointment,
}: AppointmentRowProps) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors text-base text-gray-700">
      {/* 1. Mã lịch hẹn */}
      <td className="py-4 px-4 font-medium text-gray-500 text-base text-center">
        {appointment.id}
      </td>

      {/* 2. Bệnh nhân */}
      <td className="py-4 px-4 font-bold text-gray-900 text-base">
        <button
          onClick={() => onViewDetail(appointment)}
          className="hover:text-blue-600 transition text-left cursor-pointer"
        >
          {appointment.patientName}
        </button>
      </td>

      {/* 3. Bác sĩ */}
      <td className="py-4 px-4 text-base font-semibold text-gray-800">
        {appointment.doctorName}
      </td>

      {/* 4. Ngày khám */}
      <td className="py-4 px-4 text-base text-gray-600 font-medium whitespace-nowrap">
        {appointment.appointmentDate}
      </td>

      {/* 5. Giờ khám */}
      <td className="py-4 px-4 text-base text-gray-600 font-medium whitespace-nowrap">
        {appointment.appointmentTime}
      </td>

      {/* 6. Lý do khám */}
      <td className="py-4 px-4 text-base text-gray-700 font-normal max-w-[250px] truncate" title={appointment.reason}>
        {appointment.reason}
      </td>

      {/* 7. Số thứ tự khám (Màu xanh nước biển) */}
      <td className="py-4 px-4 text-center font-bold text-base text-blue-600">
        {appointment.queueNumber}
      </td>

      {/* 8. Trạng thái */}
      <td className="py-4 px-4">
        <StatusBadge status={appointment.status} />
      </td>

      {/* 9. Hành động (Chỉnh sửa) */}
      <td className="py-4 px-4">
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => onViewDetail(appointment)}
            title="Xem chi tiết"
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
          >
            <Eye size={20} />
          </button>
          <button
            onClick={() => onEdit(appointment)}
            title="Chỉnh sửa"
            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
          >
            <Pencil size={20} />
          </button>
          <button
            onClick={() => onCancelAppointment(appointment)}
            title="Hủy lịch hẹn"
            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <LockKeyhole size={20} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default memo(AppointmentRow);
