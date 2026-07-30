import type { Doctor } from "../types";
import StatusBadge from "./StatusBadge";
import ActionButtons from "./ActionButtons";

interface DoctorRowProps {
  doctor: Doctor;
  onEdit?: (doctor: Doctor) => void;
  onLock?: (doctor: Doctor) => void;
}

export default function DoctorRow({
  doctor,
  onEdit,
  onLock,
}: DoctorRowProps) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
      <td className="py-4 px-4 text-center font-medium text-gray-500 text-base">
        {doctor.stt}
      </td>
      <td className="py-4 px-4 font-bold text-gray-900 text-base">
        {doctor.fullName}
      </td>
      <td className="py-4 px-4 text-gray-600 font-medium text-base">
        {doctor.specialty}
      </td>
      <td className="py-4 px-4 text-gray-600 font-medium text-base">
        {doctor.qualifications}
      </td>
      <td className="py-4 px-4 text-gray-600 font-medium text-base">
        {doctor.experience}
      </td>
      <td className="py-4 px-4 text-base">
        <a
          href={`mailto:${doctor.email}`}
          className="text-gray-600 font-medium hover:text-blue-600 transition-colors"
        >
          {doctor.email}
        </a>
      </td>
      <td className="py-4 px-4 text-center font-bold text-gray-800 text-base">
        {doctor.clinicRoom}
      </td>
      <td className="py-4 px-4">
        <StatusBadge status={doctor.status} />
      </td>
      <td className="py-4 px-4 text-center">
        <ActionButtons
          onEdit={() => onEdit && onEdit(doctor)}
          onLock={() => onLock && onLock(doctor)}
        />
      </td>
    </tr>
  );
}
