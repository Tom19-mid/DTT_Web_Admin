import { useState, useMemo } from "react";
import type { Medicine, MedicineCategory } from "../types";
import MedicineSearch from "./MedicineSearch";
import MedicineRow from "./MedicineRow";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MedicineTableProps {
  medicines: Medicine[];
  categories: MedicineCategory[];
  onViewDetail: (medicine: Medicine) => void;
  onEditMedicine: (medicine: Medicine) => void;
  onToggleStatus: (medicine: Medicine) => void;
}

export default function MedicineTable({
  medicines,
  categories,
  onViewDetail,
  onEditMedicine,
  onToggleStatus,
}: MedicineTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "ALL">("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleReset = () => {
    setSearchTerm("");
    setSelectedCategoryId("ALL");
    setSelectedStatus("ALL");
    setCurrentPage(1);
  };

  const filteredMedicines = useMemo(() => {
    return medicines.filter((med) => {
      // Search term matching ID, name, description, usage
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        med.medicineId.toString().includes(term) ||
        med.medicineName.toLowerCase().includes(term) ||
        med.description.toLowerCase().includes(term) ||
        med.defaultUsage.toLowerCase().includes(term) ||
        med.unit.toLowerCase().includes(term);

      // Category filter
      const matchesCategory =
        selectedCategoryId === "ALL" || med.categoryId === selectedCategoryId;

      // Status filter
      const matchesStatus =
        selectedStatus === "ALL" ||
        med.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [medicines, searchTerm, selectedCategoryId, selectedStatus]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage) || 1;
  const paginatedMedicines = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMedicines.slice(start, start + itemsPerPage);
  }, [filteredMedicines, currentPage]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-6">
      {/* Search & Filter Toolbar */}
      <MedicineSearch
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={(val) => {
          setSelectedCategoryId(val);
          setCurrentPage(1);
        }}
        selectedStatus={selectedStatus}
        onStatusChange={(val) => {
          setSelectedStatus(val);
          setCurrentPage(1);
        }}
        categories={categories}
        onReset={handleReset}
      />

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          <thead>
            <tr className="bg-gray-200/70 text-gray-800 font-bold text-base">
              {/* Columns in exact INSERT order */}
              <th className="py-4 px-4 text-center rounded-l-xl">Mã thuốc</th>
              <th className="py-4 px-4 text-center">Mã nhóm thuốc</th>
              <th className="py-4 px-4">Tên thuốc</th>
              <th className="py-4 px-4">Đơn vị tính</th>
              <th className="py-4 px-4">Mô tả</th>
              <th className="py-4 px-4">Hướng dẫn sử dụng</th>
              <th className="py-4 px-4">Đơn giá</th>
              <th className="py-4 px-4 text-center">Số lượng tồn kho</th>
              <th className="py-4 px-4">Hạn sử dụng</th>
              <th className="py-4 px-4">Trạng thái</th>
              <th className="py-4 px-4 text-center rounded-r-xl">Chỉnh sửa</th>
            </tr>
          </thead>
          <tbody>
            {paginatedMedicines.length > 0 ? (
              paginatedMedicines.map((med) => (
                <MedicineRow
                  key={med.medicineId}
                  medicine={med}
                  onViewDetail={onViewDetail}
                  onEdit={onEditMedicine}
                  onToggleStatus={onToggleStatus}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={11}
                  className="text-center py-10 text-gray-500 font-medium text-base"
                >
                  Không tìm thấy thuốc nào khớp với từ khóa.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredMedicines.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-100 text-base text-gray-600">
          <div>
            Hiển thị <span className="font-bold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> -{" "}
            <span className="font-bold text-gray-900">
              {Math.min(currentPage * itemsPerPage, filteredMedicines.length)}
            </span>{" "}
            trên <span className="font-bold text-gray-900">{filteredMedicines.length}</span> thuốc
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
