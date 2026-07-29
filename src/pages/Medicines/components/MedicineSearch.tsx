import { Search, Filter, RotateCcw } from "lucide-react";
import type { MedicineCategory } from "../types";

interface MedicineSearchProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedCategoryId: number | "ALL";
  onCategoryChange: (val: number | "ALL") => void;
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  categories: MedicineCategory[];
  onReset: () => void;
}

export default function MedicineSearch({
  searchTerm,
  onSearchChange,
  selectedCategoryId,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  categories,
  onReset,
}: MedicineSearchProps) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
      {/* Search Input matching screenshot pill style */}
      <div className="relative w-full md:w-96">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm thuốc..."
          className="w-full pl-11 pr-4 py-3 bg-gray-100/80 border-0 rounded-full text-base text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/30 transition-all"
        />
      </div>

      {/* Filter Dropdowns & Reset */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        <div className="flex items-center gap-2 bg-gray-100/80 border border-gray-200/60 rounded-xl px-4 py-2.5 text-base text-gray-700">
          <Filter size={18} className="text-gray-400" />
          <span className="font-medium text-sm text-gray-500 hidden sm:inline">Nhóm:</span>

          {/* Category Filter */}
          <select
            value={selectedCategoryId}
            onChange={(e) =>
              onCategoryChange(
                e.target.value === "ALL" ? "ALL" : Number(e.target.value)
              )
            }
            className="bg-transparent text-base text-gray-800 font-semibold outline-none cursor-pointer pr-1"
          >
            <option value="ALL">Tất cả nhóm thuốc</option>
            {categories.map((cat) => (
              <option key={cat.categoryId} value={cat.categoryId}>
                ID: {cat.categoryId} ({cat.categoryName})
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="bg-gray-100/80 border border-gray-200/60 text-base text-gray-800 font-semibold rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="Đang hoạt động">Đang hoạt động</option>
          <option value="Ngưng hoạt động">Ngưng hoạt động</option>
        </select>

        {/* Reset Filters */}
        {(searchTerm || selectedCategoryId !== "ALL" || selectedStatus !== "ALL") && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-base font-semibold text-gray-600 bg-gray-200/80 hover:bg-gray-300 rounded-xl transition cursor-pointer"
            title="Đặt lại bộ lọc"
          >
            <RotateCcw size={16} />
            <span>Đặt lại</span>
          </button>
        )}
      </div>
    </div>
  );
}
