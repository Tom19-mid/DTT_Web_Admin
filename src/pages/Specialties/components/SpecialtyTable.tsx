import { useState } from "react";
import type { Specialty } from "../types";
import SpecialtySearch from "./SpecialtySearch";
import SpecialtyRow from "./SpecialtyRow";

interface SpecialtyTableProps {
  specialties: Specialty[];
  onEditSpecialty?: (specialty: Specialty) => void;
  onLockSpecialty?: (specialty: Specialty) => void;
}

export default function SpecialtyTable({
  specialties,
  onEditSpecialty,
  onLockSpecialty,
}: SpecialtyTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSpecialties = specialties.filter((specialty) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      specialty.name.toLowerCase().includes(term) ||
      specialty.description.toLowerCase().includes(term) ||
      specialty.status.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-6">
      <SpecialtySearch value={searchTerm} onChange={setSearchTerm} />

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[850px]">
          <thead>
            <tr className="bg-gray-200/70 text-gray-800 font-bold text-base">
              <th className="py-4 px-4 text-center rounded-l-xl">STT</th>
              <th className="py-4 px-4">Tên chuyên khoa</th>
              <th className="py-4 px-4">Mô tả</th>
              <th className="py-4 px-4 text-center">Số lượng bác sĩ</th>
              <th className="py-4 px-4">Trạng thái</th>
              <th className="py-4 px-4 rounded-r-xl">Chỉnh sửa</th>
            </tr>
          </thead>
          <tbody>
            {filteredSpecialties.length > 0 ? (
              filteredSpecialties.map((specialty) => (
                <SpecialtyRow
                  key={specialty.id}
                  specialty={specialty}
                  onEdit={onEditSpecialty}
                  onLock={onLockSpecialty}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-10 text-gray-500 font-medium text-base"
                >
                  Không tìm thấy chuyên khoa nào khớp với từ khóa.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
