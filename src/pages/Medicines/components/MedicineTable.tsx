import { useState, useMemo } from "react";
import type { Medicine, MedicineCategory } from "../types";
import MedicineSearch from "./MedicineSearch";
import MedicineRow from "./MedicineRow";
import Pagination from "../../../components/common/Pagination";
import { Loader2 } from "lucide-react";

interface MedicineTableProps {
  medicines: Medicine[];
  categories: MedicineCategory[];
  loading?: boolean;
  onViewDetail: (medicine: Medicine) => void;
  onEditMedicine: (medicine: Medicine) => void;
  onToggleStatus: (medicine: Medicine) => void;
}

export default function MedicineTable({
  medicines,
  categories,
  loading = false,
  onViewDetail,
  onEditMedicine,
  onToggleStatus,
}: MedicineTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "ALL">(
    "ALL",
  );
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleReset = () => {
    setSearchTerm("");
    setSelectedCategoryId("ALL");
    setSelectedStatus("ALL");
    setCurrentPage(1);
  };

  const filteredMedicines = useMemo(() => {
    return medicines.filter((med) => {
      const term = searchTerm.toLowerCase().trim();
      const name = (med.medicineName || med.name || "").toLowerCase();
      const desc = (med.description || "").toLowerCase();
      const usage = (med.defaultUsage || med.usage || "").toLowerCase();

      const matchesSearch =
        !term ||
        name.includes(term) ||
        desc.includes(term) ||
        usage.includes(term);

      const matchesCategory =
        selectedCategoryId === "ALL" ||
        med.categoryId === Number(selectedCategoryId);

      const matchesStatus =
        selectedStatus === "ALL" || med.status === selectedStatus;

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
            {loading && medicines.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  className="text-center py-12 text-gray-500 font-medium"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <span className="text-gray-600 font-medium text-base">
                      Đang tải danh sách thuốc...
                    </span>
                  </div>
                </td>
              </tr>
            ) : paginatedMedicines.length > 0 ? (
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
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          totalItems={filteredMedicines.length}
          itemsPerPage={itemsPerPage}
          itemLabel="thuốc"
        />
      )}
    </div>
  );
}
