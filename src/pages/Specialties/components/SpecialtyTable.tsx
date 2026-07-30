import { useState, useMemo } from "react";
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
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedScale, setSelectedScale] = useState("ALL");

  const handleReset = () => {
    setSearchTerm("");
    setSelectedStatus("ALL");
    setSelectedScale("ALL");
  };

  const filteredSpecialties = useMemo(() => {
    return specialties.filter((specialty) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        specialty.name.toLowerCase().includes(term) ||
        specialty.description.toLowerCase().includes(term);

      const matchesStatus =
        selectedStatus === "ALL" || specialty.status === selectedStatus;

      let matchesScale = true;
      if (selectedScale === "HAS_DOCTORS") {
        matchesScale = specialty.doctorCount > 0;
      } else if (selectedScale === "NO_DOCTORS") {
        matchesScale = specialty.doctorCount === 0;
      }

      return matchesSearch && matchesStatus && matchesScale;
    });
  }, [specialties, searchTerm, selectedStatus, selectedScale]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-6">
      <SpecialtySearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedScale={selectedScale}
        onScaleChange={setSelectedScale}
        onReset={handleReset}
      />

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[850px]">
          <thead>
            <tr className="bg-gray-200/70 text-gray-800 font-bold text-base">
              <th className="py-4 px-4 text-center rounded-l-xl">STT</th>
              <th className="py-4 px-4">Tên chuyên khoa</th>
              <th className="py-4 px-4">Mô tả</th>
              <th className="py-4 px-4 text-center">Số lượng bác sĩ</th>
              <th className="py-4 px-4">Trạng thái</th>
              <th className="py-4 px-4 text-center rounded-r-xl">Chỉnh sửa</th>
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
                  className="text-center py-10 text-gray-500 font-medium text-lg"
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
