import { useState, useRef, useEffect } from "react";
import { Search, Filter, RotateCcw, ChevronDown, Check, Boxes } from "lucide-react";
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

const statusOptions = [
  { value: "ALL", label: "Tất cả trạng thái", dotColor: "bg-gray-400" },
  { value: "Đang hoạt động", label: "Đang hoạt động", dotColor: "bg-emerald-500" },
  { value: "Ngưng hoạt động", label: "Ngưng hoạt động", dotColor: "bg-amber-500" },
];

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
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const categoryRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setIsStatusOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCategoryObj = categories.find((c) => c.categoryId === selectedCategoryId);
  const currentCategoryLabel =
    selectedCategoryId === "ALL"
      ? "Tất cả nhóm thuốc"
      : `ID: ${selectedCategoryId}${selectedCategoryObj ? ` (${selectedCategoryObj.categoryName})` : ""}`;

  const currentStatusLabel =
    statusOptions.find((s) => s.value === selectedStatus)?.label || "Tất cả trạng thái";

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
      {/* Search Input */}
      <div className="relative w-full md:w-96">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm thuốc..."
          className="w-full pl-11 pr-4 py-3 bg-gray-100/80 border-0 rounded-full text-base text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/30 transition-all shadow-2xs"
        />
      </div>

      {/* Custom Dropdowns */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        {/* Category Dropdown */}
        <div className="relative" ref={categoryRef}>
          <button
            type="button"
            onClick={() => {
              setIsCategoryOpen(!isCategoryOpen);
              setIsStatusOpen(false);
            }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-base font-semibold transition-all cursor-pointer select-none max-w-full ${
              isCategoryOpen
                ? "bg-white border-blue-500 text-blue-600 ring-2 ring-blue-500/20 shadow-sm"
                : "bg-gray-100/80 hover:bg-gray-200/60 border-gray-200/80 text-gray-800"
            }`}
          >
            <Boxes size={18} className="text-gray-500 shrink-0" />
            <span className="font-bold text-gray-900 truncate max-w-[240px] sm:max-w-[300px]">
              {currentCategoryLabel}
            </span>
            <ChevronDown
              size={18}
              className={`text-gray-400 shrink-0 transition-transform duration-200 ${
                isCategoryOpen ? "rotate-180 text-blue-600" : ""
              }`}
            />
          </button>

          {isCategoryOpen && (
            <div className="absolute left-0 top-full mt-2 min-w-[300px] sm:min-w-[340px] w-max max-w-[90vw] bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-xs font-bold text-gray-400 px-3 py-1.5 uppercase tracking-wider">
                Lọc theo nhóm thuốc
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    onCategoryChange("ALL");
                    setIsCategoryOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-base font-semibold transition cursor-pointer ${
                    selectedCategoryId === "ALL"
                      ? "bg-blue-50 text-blue-700 font-bold"
                      : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900"
                  }`}
                >
                  <span className="whitespace-nowrap">Tất cả nhóm thuốc</span>
                  {selectedCategoryId === "ALL" && <Check size={18} className="text-blue-600 shrink-0" />}
                </button>
                {categories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.categoryId;
                  return (
                    <button
                      key={cat.categoryId}
                      type="button"
                      onClick={() => {
                        onCategoryChange(cat.categoryId);
                        setIsCategoryOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-base font-semibold transition cursor-pointer ${
                        isSelected
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900"
                      }`}
                    >
                      <span className="whitespace-nowrap">
                        ID: {cat.categoryId} ({cat.categoryName})
                      </span>
                      {isSelected && <Check size={18} className="text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="relative" ref={statusRef}>
          <button
            type="button"
            onClick={() => {
              setIsStatusOpen(!isStatusOpen);
              setIsCategoryOpen(false);
            }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-base font-semibold transition-all cursor-pointer select-none ${
              isStatusOpen
                ? "bg-white border-blue-500 text-blue-600 ring-2 ring-blue-500/20 shadow-sm"
                : "bg-gray-100/80 hover:bg-gray-200/60 border-gray-200/80 text-gray-800"
            }`}
          >
            <Filter size={18} className="text-gray-500 shrink-0" />
            <span className="text-sm font-medium text-gray-500 hidden sm:inline">Trạng thái:</span>
            <span className="font-bold text-gray-900">{currentStatusLabel}</span>
            <ChevronDown
              size={18}
              className={`text-gray-400 shrink-0 transition-transform duration-200 ${
                isStatusOpen ? "rotate-180 text-blue-600" : ""
              }`}
            />
          </button>

          {isStatusOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-xs font-bold text-gray-400 px-3 py-1.5 uppercase tracking-wider">
                Lọc theo trạng thái
              </div>
              <div className="space-y-1">
                {statusOptions.map((option) => {
                  const isSelected = selectedStatus === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onStatusChange(option.value);
                        setIsStatusOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-base font-semibold transition cursor-pointer ${
                        isSelected
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${option.dotColor}`} />
                        <span>{option.label}</span>
                      </div>
                      {isSelected && <Check size={18} className="text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Reset Button */}
        {(searchTerm || selectedCategoryId !== "ALL" || selectedStatus !== "ALL") && (
          <button
            onClick={() => {
              onReset();
              setIsCategoryOpen(false);
              setIsStatusOpen(false);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-base font-semibold text-gray-600 bg-gray-200/80 hover:bg-gray-300 rounded-xl transition cursor-pointer active:scale-95"
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
