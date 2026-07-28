import { useState } from "react";
import type { Doctor } from "../types";
import DoctorSearch from "./DoctorSearch";
import DoctorRow from "./DoctorRow";

interface DoctorTableProps {
  doctors: Doctor[];
  onEditDoctor?: (doctor: Doctor) => void;
  onLockDoctor?: (doctor: Doctor) => void;
}

export default function DoctorTable({
  doctors,
  onEditDoctor,
  onLockDoctor,
}: DoctorTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDoctors = doctors.filter((doctor) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      doctor.fullName.toLowerCase().includes(term) ||
      doctor.email.toLowerCase().includes(term) ||
      doctor.specialty.toLowerCase().includes(term) ||
      doctor.qualifications.toLowerCase().includes(term) ||
      doctor.experience.toLowerCase().includes(term) ||
      (doctor.clinicRoom && doctor.clinicRoom.toLowerCase().includes(term)) ||
      doctor.status.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-6">
      <DoctorSearch value={searchTerm} onChange={setSearchTerm} />

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[980px]">
          <thead>
            <tr className="bg-gray-200/70 text-gray-800 font-bold text-base">
              <th className="py-4 px-4 text-center rounded-l-xl">STT</th>
              <th className="py-4 px-4">Họ và tên</th>
              <th className="py-4 px-4">Chuyên khoa</th>
              <th className="py-4 px-4">Trình độ chuyên môn</th>
              <th className="py-4 px-4">Kinh nghiệm</th>
              <th className="py-4 px-4">Email</th>
              <th className="py-4 px-4">Phòng khám</th>
              <th className="py-4 px-4">Trạng thái</th>
              <th className="py-4 px-4 rounded-r-xl">Chỉnh sửa</th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor) => (
                <DoctorRow
                  key={doctor.id}
                  doctor={doctor}
                  onEdit={onEditDoctor}
                  onLock={onLockDoctor}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className="text-center py-10 text-gray-500 font-medium text-base"
                >
                  Không tìm thấy bác sĩ nào khớp với từ khóa.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
