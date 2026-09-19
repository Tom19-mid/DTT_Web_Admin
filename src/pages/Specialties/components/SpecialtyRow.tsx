import type { Specialty } from "../types";
import StatusBadge from "./StatusBadge";
import ActionButtons from "./ActionButtons";

interface SpecialtyRowProps {
  specialty: Specialty;
  onEdit?: (specialty: Specialty) => void;
  onLock?: (specialty: Specialty) => void;
}

export default function SpecialtyRow({
  specialty,
  onEdit,
  onLock,
}: SpecialtyRowProps) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
      <td className="py-4 px-4 text-center font-medium text-gray-500 text-base">
        {specialty.stt}
      </td>
      <td className="py-4 px-4 font-bold text-gray-900 text-base">
        {specialty.name}
      </td>
      <td className="py-4 px-4 text-gray-600 font-medium text-base">
        {specialty.description}
      </td>
      <td className="py-4 px-4 text-center font-medium text-gray-700 text-base">
        {specialty.doctorCount}
      </td>
      <td className="py-4 px-4">
        <StatusBadge status={specialty.status ?? "Đang hoạt động"} />
      </td>
      <td className="py-4 px-4 text-center">
        <ActionButtons
          onEdit={() => onEdit && onEdit(specialty)}
          onLock={() => onLock && onLock(specialty)}
          isLocked={
            specialty.status === "Ngưng hoạt động" ||
            specialty.status === "Inactive" ||
            specialty.status === false
          }
        />
      </td>
    </tr>
  );
}
