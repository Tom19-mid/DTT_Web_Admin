import { useState, useMemo } from "react";
import type { Specialty } from "../types";
import SpecialtySearch from "./SpecialtySearch";
import SpecialtyRow from "./SpecialtyRow";
import Pagination from "../../../components/common/Pagination";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface SpecialtyTableProps {
  specialties: Specialty[];
  loading?: boolean;
  onEditSpecialty?: (specialty: Specialty) => void;
  onLockSpecialty?: (specialty: Specialty) => void;
}

export default function SpecialtyTable({
  specialties,
  loading = false,
  onEditSpecialty,
  onLockSpecialty,
}: SpecialtyTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedScale, setSelectedScale] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleReset = () => {
    setSearchTerm("");
    setSelectedStatus("ALL");
    setSelectedScale("ALL");
    setCurrentPage(1);
  };

  const filteredSpecialties = useMemo(() => {
    return specialties.filter((specialty) => {
      const term = searchTerm.toLowerCase().trim();
      const name = (
        specialty.name ||
        specialty.specialtyName ||
        ""
      ).toLowerCase();
      const desc = (specialty.description || "").toLowerCase();

      const matchesSearch = !term || name.includes(term) || desc.includes(term);

      const matchesStatus =
        selectedStatus === "ALL" || specialty.status === selectedStatus;

      let matchesScale = true;
      if (selectedScale === "HAS_DOCTORS") {
        matchesScale = (specialty.doctorCount || 0) > 0;
      } else if (selectedScale === "NO_DOCTORS") {
        matchesScale = (specialty.doctorCount || 0) === 0;
      }

      return matchesSearch && matchesStatus && matchesScale;
    });
  }, [specialties, searchTerm, selectedStatus, selectedScale]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredSpecialties.length / itemsPerPage) || 1;
  const paginatedSpecialties = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSpecialties.slice(start, start + itemsPerPage);
  }, [filteredSpecialties, currentPage]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-6">
      <SpecialtySearch
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        selectedStatus={selectedStatus}
        onStatusChange={(val) => {
          setSelectedStatus(val);
          setCurrentPage(1);
        }}
        selectedScale={selectedScale}
        onScaleChange={(val) => {
          setSelectedScale(val);
          setCurrentPage(1);
        }}
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
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-12 text-gray-500 font-medium"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <span className="text-gray-600 font-medium text-base">
                      Đang tải danh sách chuyên khoa...
                    </span>
                  </div>
                </td>
              </tr>
            ) : paginatedSpecialties.length > 0 ? (
              paginatedSpecialties.map((specialty) => (
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

      {/* Pagination Footer */}
      {filteredSpecialties.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          totalItems={filteredSpecialties.length}
          itemsPerPage={itemsPerPage}
          itemLabel="chuyên khoa"
        />
      )}
    </div>
  );
}
