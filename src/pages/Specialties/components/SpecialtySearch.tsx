import { useState, useRef, useEffect } from "react";
import { Search, Filter, RotateCcw, ChevronDown, Check, Layers } from "lucide-react";

interface SpecialtySearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedScale: string;
  onScaleChange: (value: string) => void;
  onReset: () => void;
}

const statusOptions = [
  { value: "ALL", label: "Tất cả trạng thái", dotColor: "bg-gray-400" },
  { value: "Đang hoạt động", label: "Đang hoạt động", dotColor: "bg-emerald-500" },
  { value: "Ngưng hoạt động", label: "Ngưng hoạt động", dotColor: "bg-amber-500" },
];

const scaleOptions = [
  { value: "ALL", label: "Tất cả quy mô" },
  { value: "HAS_DOCTORS", label: "Có bác sĩ phụ trách" },
  { value: "NO_DOCTORS", label: "Chưa có bác sĩ" },
];

export default function SpecialtySearch({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedScale,
  onScaleChange,
  onReset,
}: SpecialtySearchProps) {
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isScaleOpen, setIsScaleOpen] = useState(false);

  const statusRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setIsStatusOpen(false);
      }
      if (scaleRef.current && !scaleRef.current.contains(e.target as Node)) {
        setIsScaleOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentStatusLabel =
    statusOptions.find((s) => s.value === selectedStatus)?.label || "Tất cả trạng thái";

  const currentScaleLabel =
    scaleOptions.find((s) => s.value === selectedScale)?.label || "Tất cả quy mô";

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
          placeholder="Tìm chuyên khoa..."
          className="w-full pl-11 pr-4 py-3 bg-gray-100/80 border-0 rounded-full text-base text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/30 transition-all shadow-2xs"
        />
      </div>

      {/* Custom Dropdowns */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        {/* Status Dropdown */}
        <div className="relative" ref={statusRef}>
          <button
            type="button"
            onClick={() => {
              setIsStatusOpen(!isStatusOpen);
              setIsScaleOpen(false);
            }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-base font-semibold transition-all cursor-pointer select-none ${
              isStatusOpen
                ? "bg-white border-blue-500 text-blue-600 ring-2 ring-blue-500/20 shadow-sm"
                : "bg-gray-100/80 hover:bg-gray-200/60 border-gray-200/80 text-gray-800"
            }`}
          >
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-500 hidden sm:inline">Trạng thái:</span>
            <span className="font-bold text-gray-900">{currentStatusLabel}</span>
            <ChevronDown
              size={18}
              className={`text-gray-400 transition-transform duration-200 ${
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
                      {isSelected && <Check size={18} className="text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Scale Dropdown */}
        <div className="relative" ref={scaleRef}>
          <button
            type="button"
            onClick={() => {
              setIsScaleOpen(!isScaleOpen);
              setIsStatusOpen(false);
            }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-base font-semibold transition-all cursor-pointer select-none ${
              isScaleOpen
                ? "bg-white border-blue-500 text-blue-600 ring-2 ring-blue-500/20 shadow-sm"
                : "bg-gray-100/80 hover:bg-gray-200/60 border-gray-200/80 text-gray-800"
            }`}
          >
            <Layers size={18} className="text-gray-500" />
            <span className="font-bold text-gray-900">{currentScaleLabel}</span>
            <ChevronDown
              size={18}
              className={`text-gray-400 transition-transform duration-200 ${
                isScaleOpen ? "rotate-180 text-blue-600" : ""
              }`}
            />
          </button>

          {isScaleOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-xs font-bold text-gray-400 px-3 py-1.5 uppercase tracking-wider">
                Lọc theo quy mô
              </div>
              <div className="space-y-1">
                {scaleOptions.map((opt) => {
                  const isSelected = selectedScale === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onScaleChange(opt.value);
                        setIsScaleOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-base font-semibold transition cursor-pointer ${
                        isSelected
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check size={18} className="text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Reset Button */}
        {(searchTerm || selectedStatus !== "ALL" || selectedScale !== "ALL") && (
          <button
            onClick={() => {
              onReset();
              setIsStatusOpen(false);
              setIsScaleOpen(false);
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
