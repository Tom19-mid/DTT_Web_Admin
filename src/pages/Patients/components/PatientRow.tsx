import type { Patient } from "../types";
import StatusBadge from "./StatusBadge";
import ActionButtons from "./ActionButtons";

interface PatientRowProps {
  patient: Patient;
  onViewDetail?: (patient: Patient) => void;
  onEdit?: (patient: Patient) => void;
  onLock?: (patient: Patient) => void;
}

export default function PatientRow({
  patient,
  onViewDetail,
  onEdit,
  onLock,
}: PatientRowProps) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
      <td className="py-4 px-4 font-bold text-blue-600 text-base text-center">
        <button
          onClick={() => onViewDetail && onViewDetail(patient)}
          className="hover:underline cursor-pointer"
        >
          {patient.code || `#${patient.id}`}
        </button>
      </td>
      <td className="py-4 px-4 font-bold text-gray-900 text-base">
        <button
          onClick={() => onViewDetail && onViewDetail(patient)}
          className="hover:text-blue-600 transition-colors text-left cursor-pointer"
        >
          {patient.fullName}
        </button>
      </td>
      <td className="py-4 px-4 text-gray-600 font-semibold text-base text-center">
        {patient.dob}
      </td>
      <td className="py-4 px-4 text-gray-800 font-semibold text-base">
        {patient.phone}
      </td>
      <td className="py-4 px-4 text-gray-800 font-bold text-base text-center">
        {patient.gender || "Nam"}
      </td>
      <td className="py-4 px-4 text-left">
        <StatusBadge status={patient.verificationStatus || patient.status} />
      </td>
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
