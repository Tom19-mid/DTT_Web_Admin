import type { Patient } from "../types";
import StatusBadge from "./StatusBadge";
import ActionButtons from "./ActionButtons";

interface PatientRowProps {
  patient: Patient;
  onViewDetail?: (patient: Patient) => void;
  onEdit?: (patient: Patient) => void;
  onLock?: (patient: Patient) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const getPatientAccountStatus = (patient: Patient) => {
  switch (patient.status) {
    case "Đã duyệt":
    case "Chờ duyệt":
    case "Active":
      return "Đang hoạt động";
    case "Inactive":
      return "Ngưng hoạt động";
    case "Từ chối":
    case "Locked":
      return "Đã khóa";
    default:
      return patient.status || "Đang hoạt động";
  }
};

export default function PatientRow({
  patient,
  onViewDetail,
  onEdit,
  onLock,
}: PatientRowProps) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
      {/* 1. Mã bệnh nhân */}
      <td className="py-4 px-4 font-medium text-gray-700 text-base text-center">
        <button
          onClick={() => onViewDetail && onViewDetail(patient)}
          className="hover:text-blue-600 transition cursor-pointer"
        >
          {patient.code || String(patient.id)}
        </button>
      </td>

      {/* 2. Họ và tên */}
      <td className="py-4 px-4 font-bold text-gray-900 text-base">
        <button
          onClick={() => onViewDetail && onViewDetail(patient)}
          className="hover:text-blue-600 transition-colors text-left cursor-pointer"
        >
          {patient.fullName}
        </button>
      </td>

      {/* 3. Ngày sinh */}
      <td className="py-4 px-4 text-gray-700 font-medium text-base text-center">
        {patient.dob}
      </td>

      {/* 4. Số điện thoại */}
      <td className="py-4 px-4 text-gray-700 font-medium text-base text-center">
        {patient.phone}
      </td>

      {/* 5. Giới tính */}
      <td className="py-4 px-4 text-gray-700 font-medium text-base text-center">
        {patient.gender || "Nam"}
      </td>

      {/* 6. Trạng thái */}
      <td className="py-4 px-4 text-center">
        <StatusBadge status={getPatientAccountStatus(patient)} />
      </td>

      {/* 7. Trạng thái xác thực hồ sơ */}
      <td className="py-4 px-4 text-center">
        <StatusBadge status={patient.verificationStatus || "Chờ duyệt"} />
      </td>

      {/* 8. Chỉnh sửa */}
      <td className="py-4 px-4 text-center">
        <ActionButtons
          onViewDetail={() => onViewDetail && onViewDetail(patient)}
          onEdit={() => onEdit && onEdit(patient)}
          onLock={() => onLock && onLock(patient)}
        />
      </td>
    </tr>
  );
}
