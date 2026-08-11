import { useState } from "react";
import type { Doctor } from "../types";
import StatusBadge from "./StatusBadge";
import ActionButtons from "./ActionButtons";

interface DoctorRowProps {
  doctor: Doctor;
  onViewDetail?: (doctor: Doctor) => void;
  onEdit?: (doctor: Doctor) => void;
  onLock?: (doctor: Doctor) => void;
}

export default function DoctorRow({
  doctor,
  onViewDetail,
  onEdit,
  onLock,
}: DoctorRowProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
      <td className="py-4 px-4 text-center font-bold text-gray-700 text-base">
        {doctor.doctorId || doctor.id}
      </td>
      <td className="py-4 px-4 font-bold text-gray-900 text-base">
        <button
          onClick={() => onViewDetail && onViewDetail(doctor)}
          className="hover:text-blue-600 transition text-left cursor-pointer flex items-center gap-2.5"
        >
          {doctor.avatar && !imgError ? (
            <img
              src={doctor.avatar}
              alt={doctor.fullName}
              onError={() => setImgError(true)}
              className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shrink-0">
              {doctor.fullName.charAt(0)}
            </div>
          )}
          <span>{doctor.fullName}</span>
        </button>
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
          onViewDetail={() => onViewDetail && onViewDetail(doctor)}
          onEdit={() => onEdit && onEdit(doctor)}
          onLock={() => onLock && onLock(doctor)}
        />
      </td>
    </tr>
  );
}
