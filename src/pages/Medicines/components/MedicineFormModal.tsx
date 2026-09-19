import { useState, useEffect, useRef } from "react";
import { X, Save, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import type { Medicine, MedicineCategory } from "../types";

interface MedicineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medicineData: Medicine) => void;
  initialData?: Medicine | null;
  categories: MedicineCategory[];
  nextMedicineId: number;
}

const monthNames = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const getTodayFormatted = () => {
  const today = new Date();
  const dStr = String(today.getDate()).padStart(2, "0");
  const mStr = String(today.getMonth() + 1).padStart(2, "0");
  const yStr = String(today.getFullYear());
  return `${dStr}/${mStr}/${yStr}`;
};

function CustomDatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const parseDate = (str: string) => {
    if (str && str.includes("/")) {
      const parts = str.split("/");
      if (parts.length === 3) {
        const [d, m, y] = parts;
        const dayNum = Number(d);
        const monthNum = Number(m);
        const yearNum = Number(y);
        if (!isNaN(dayNum) && !isNaN(monthNum) && !isNaN(yearNum)) {
          return new Date(yearNum, monthNum - 1, dayNum);
        }
      }
    } else if (str && str.includes("-")) {
      const parts = str.split("-");
      if (parts.length === 3) {
        const [y, m, d] = parts;
        return new Date(Number(y), Number(m) - 1, Number(d));
      }
    }
    return new Date();
  };

  const [viewDate, setViewDate] = useState<Date>(() => parseDate(value));
  const [prevValue, setPrevValue] = useState(value);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (prevValue !== value || prevIsOpen !== isOpen) {
    setPrevValue(value);
    setPrevIsOpen(isOpen);
    setViewDate(parseDate(value));
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedDate = parseDate(value);
  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const dStr = String(day).padStart(2, "0");
    const mStr = String(currentMonth + 1).padStart(2, "0");
    const yStr = String(currentYear);
    onChange(`${dStr}/${mStr}/${yStr}`);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          value={value}
          readOnly
          onClick={() => setIsOpen(!isOpen)}
          placeholder="Chọn hạn sử dụng (VD: 30/07/2028)"
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 pr-11 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer bg-white"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors cursor-pointer p-1"
        >
          <Calendar size={20} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 w-76 sm:w-80 animation-fadeIn select-none">
          {/* Header Month/Year Selector */}
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="flex items-center gap-1.5">
              <select
                value={currentMonth}
                onChange={(e) =>
                  setViewDate(new Date(currentYear, Number(e.target.value), 1))
                }
                className="font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl px-2.5 py-1.5 text-sm outline-none cursor-pointer transition-colors"
              >
                {monthNames.map((m, idx) => (
                  <option key={idx} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={currentYear}
                onChange={(e) =>
                  setViewDate(new Date(Number(e.target.value), currentMonth, 1))
                }
                className="font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl px-2.5 py-1.5 text-sm outline-none cursor-pointer transition-colors"
              >
                {Array.from({ length: 10 }, (_, i) => 2024 + i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-600 transition cursor-pointer"
                title="Tháng trước"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-600 transition cursor-pointer"
                title="Tháng sau"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-gray-500 text-sm mb-1.5">
            {dayNames.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const isSelected =
                value &&
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === currentMonth &&
                selectedDate.getFullYear() === currentYear;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md scale-105"
                      : "text-gray-800 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Action */}
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100 text-sm">
            <button
              type="button"
              onClick={() => {
                onChange(getTodayFormatted());
                setIsOpen(false);
              }}
              className="text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-gray-500 font-bold hover:text-gray-800 cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MedicineFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories,
  nextMedicineId,
}: MedicineFormModalProps) {
  const [categoryId, setCategoryId] = useState<number>(1);
  const [medicineName, setMedicineName] = useState<string>("");
  const [unit, setUnit] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [defaultUsage, setDefaultUsage] = useState<string>("");
  const [unitPriceStr, setUnitPriceStr] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>(getTodayFormatted());

  // Track props changes for initial form state reset
  const [prevInitialData, setPrevInitialData] = useState<Medicine | null | undefined>(undefined);
  const [prevIsOpen, setPrevIsOpen] = useState(false);

  if (initialData !== prevInitialData || isOpen !== prevIsOpen) {
    setPrevInitialData(initialData);
    setPrevIsOpen(isOpen);
    if (initialData) {
      setCategoryId(initialData.categoryId ?? 1);
      setMedicineName(initialData.medicineName ?? "");
      setUnit(initialData.unit ?? "");
      setDescription(initialData.description ?? "");
      setDefaultUsage(initialData.defaultUsage ?? "");
      setUnitPriceStr(initialData.unitPrice ? initialData.unitPrice.toLocaleString("vi-VN") : "");
      setExpiryDate(initialData.expiryDate ?? getTodayFormatted());
    } else {
      setCategoryId(1);
      setMedicineName("");
      setUnit("");
      setDescription("");
      setDefaultUsage("");
      setUnitPriceStr("");
      setExpiryDate(getTodayFormatted());
    }
  }

  if (!isOpen) return null;

  const handleUnitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, "");
    if (!digitsOnly) {
      setUnitPriceStr("");
      return;
    }
    const num = Number(digitsOnly);
    setUnitPriceStr(num.toLocaleString("vi-VN"));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineName.trim()) {
      alert("Vui lòng nhập Tên thuốc!");
      return;
    }

    const parsedPrice = Number(unitPriceStr.replace(/\D/g, "")) || 0;

    onSave({
      medicineId: initialData?.medicineId ?? nextMedicineId,
      categoryId: Number(categoryId),
      medicineName: medicineName.trim(),
      unit: unit.trim(),
      description: description.trim(),
      defaultUsage: defaultUsage.trim(),
      unitPrice: parsedPrice,
      stockQuantity: initialData ? initialData.stockQuantity : 0,
      expiryDate: expiryDate,
      status: initialData?.status || "Đang hoạt động",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {initialData ? "Chỉnh sửa thông tin thuốc" : "Thêm thuốc mới"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Nhập đầy đủ thông tin thuốc vào hệ thống
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mã nhóm thuốc */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Mã nhóm thuốc <span className="text-rose-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white transition-all cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  ID: {cat.categoryId} ({cat.categoryName})
                </option>
              ))}
            </select>
          </div>

          {/* Tên thuốc */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tên thuốc <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              placeholder="VD: Paracetamol 500mg, Amoxicillin..."
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Đơn vị tính */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Đơn vị tính <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Nhập đơn vị tính (Viên, Gói, Chai...)"
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            {/* Đơn giá (VNĐ) - Chữ thường font-normal */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Đơn giá (VNĐ) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={unitPriceStr}
                onChange={handleUnitPriceChange}
                placeholder="Nhập đơn giá (VD: 5.000)"
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả công dụng chính của thuốc..."
              rows={2}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
            />
          </div>

          {/* Hướng dẫn sử dụng */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Hướng dẫn sử dụng
            </label>
            <textarea
              value={defaultUsage}
              onChange={(e) => setDefaultUsage(e.target.value)}
              placeholder="VD: Uống 1 viên khi sốt hoặc đau, Uống sau bữa ăn..."
              rows={2}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
            />
          </div>

          {/* Hạn sử dụng (dùng CustomDatePicker) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Hạn sử dụng <span className="text-rose-500">*</span>
            </label>
            <CustomDatePicker value={expiryDate} onChange={setExpiryDate} />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition cursor-pointer text-base"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition cursor-pointer text-base"
            >
              <Save size={18} />
              <span>{initialData ? "Cập nhật" : "Lưu thuốc"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
