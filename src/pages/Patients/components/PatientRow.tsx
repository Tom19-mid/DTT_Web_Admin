import type { Patient } from "../types";
import StatusBadge from "./StatusBadge";
import ActionButtons from "./ActionButtons";

interface PatientRowProps {
  patient: Patient;
  onEdit?: (patient: Patient) => void;
  onLock?: (patient: Patient) => void;
}

export default function PatientRow({
  patient,
  onEdit,
  onLock,
}: PatientRowProps) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
      <td className="py-4 px-4 font-bold text-blue-600 text-base">
        {patient.code}
      </td>
      <td className="py-4 px-4 font-bold text-gray-900 text-base">
        {patient.fullName}
      </td>
      <td className="py-4 px-4 text-gray-600 font-medium text-base">
        {patient.dob}
      </td>
      <td className="py-4 px-4 text-gray-700 font-medium text-base">
        {patient.phone}
      </td>
      <td className="py-4 px-4 text-gray-600 font-medium text-base">
        {patient.specialty}
      </td>
      <td className="py-4 px-4">
        <StatusBadge status={patient.status} />
      </td>
      <td className="py-4 px-4">
        <ActionButtons
          onEdit={() => onEdit && onEdit(patient)}
          onLock={() => onLock && onLock(patient)}
        />
      </td>
    </tr>
  );
}
