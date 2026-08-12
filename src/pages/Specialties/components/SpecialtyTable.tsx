import { useState, useMemo } from "react";
import type { Specialty } from "../types";
import SpecialtySearch from "./SpecialtySearch";
import SpecialtyRow from "./SpecialtyRow";
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
                    <span className="text-base text-gray-600">
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-100 text-base text-gray-600">
          <div>
            Hiển thị{" "}
            <span className="font-bold text-gray-900">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            -{" "}
            <span className="font-bold text-gray-900">
              {Math.min(currentPage * itemsPerPage, filteredSpecialties.length)}
            </span>{" "}
            trên{" "}
            <span className="font-bold text-gray-900">
              {filteredSpecialties.length}
            </span>{" "}
            chuyên khoa
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-xl font-bold text-base cursor-pointer transition ${
                  currentPage === page
                    ? "bg-blue-600 text-white shadow-xs"
                    : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
