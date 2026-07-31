import { useState, useRef, useEffect } from "react";
import { Search, Filter, ChevronDown, Check, Calendar as CalendarIcon, RotateCcw, X } from "lucide-react";

interface ScheduleSearchProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedDate: string;
  onDateChange: (val: string) => void;
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  onShowAll: () => void;
}

const statusOptions = [
  { value: "ALL", label: "Tất cả trạng thái", dotColor: "bg-gray-400" },
  {
    value: "Trống lịch",
    label: "Trống lịch",
    dotColor: "bg-teal-500",
  },
  {
    value: "Còn lịch để đặt",
    label: "Còn lịch để đặt",
    dotColor: "bg-emerald-500",
  },
  {
    value: "Đã hết lịch để đặt",
    label: "Đã hết lịch để đặt",
    dotColor: "bg-amber-500",
  },
  {
    value: "Không hoạt động",
    label: "Không hoạt động",
    dotColor: "bg-rose-500",
  },
];

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

function DateFilterPicker({
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

  const selectedDateObj = parseDate(value);
  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const handleSelectDay = (day: number) => {
    const dStr = String(day).padStart(2, "0");
    const mStr = String(currentMonth + 1).padStart(2, "0");
    const yStr = String(currentYear);
    onChange(`${dStr}/${mStr}/${yStr}`);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative flex items-center">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-base font-semibold transition-all cursor-pointer select-none ${
            value
              ? "bg-blue-50 border-blue-500 text-blue-700 shadow-xs"
              : "bg-gray-100/80 hover:bg-gray-200/60 border-gray-200/80 text-gray-800"
          }`}
        >
          <CalendarIcon size={18} className={value ? "text-blue-600" : "text-gray-500"} />
          <span className="text-sm font-medium text-gray-500 hidden sm:inline">
            Ngày:
          </span>
          <span className="font-bold">{value || "Chọn ngày làm việc"}</span>
        </button>

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="p-1 hover:bg-gray-200 text-gray-400 hover:text-gray-600 rounded-full ml-1 transition cursor-pointer"
            title="Xóa lọc ngày"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 w-80 animation-fadeIn select-none">
          {/* Header Month/Year Selector */}
          <div className="flex items-center justify-between mb-3 gap-2">
            <select
              value={currentMonth}
              onChange={(e) =>
                setViewDate(new Date(currentYear, Number(e.target.value), 1))
              }
              className="font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl px-2.5 py-1.5 text-sm outline-none cursor-pointer"
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
              className="font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl px-2.5 py-1.5 text-sm outline-none cursor-pointer"
            >
              {Array.from({ length: 10 }, (_, i) => 2026 - i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-gray-400 text-xs mb-2">
            {dayNames.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-sm">
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const isSelected =
                value &&
                selectedDateObj.getDate() === day &&
                selectedDateObj.getMonth() === currentMonth &&
                selectedDateObj.getFullYear() === currentYear;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-9 w-9 flex items-center justify-center rounded-xl font-bold transition-all cursor-pointer ${
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

          {/* Quick Actions */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100 text-sm">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                const dStr = String(today.getDate()).padStart(2, "0");
                const mStr = String(today.getMonth() + 1).padStart(2, "0");
                const yStr = String(today.getFullYear());
                onChange(`${dStr}/${mStr}/${yStr}`);
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

export default function ScheduleSearch({
  searchTerm,
  onSearchChange,
  selectedDate,
  onDateChange,
  selectedStatus,
  onStatusChange,
  onShowAll,
}: ScheduleSearchProps) {
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setIsStatusOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentStatusLabel =
    statusOptions.find((s) => s.value === selectedStatus)?.label ||
    "Tất cả trạng thái";

  const hasFiltersActive = searchTerm || selectedDate || selectedStatus !== "ALL";

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
      {/* Search Input */}
      <div className="relative w-full lg:w-80">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm theo tên bác sĩ, mã lịch..."
          className="w-full pl-11 pr-4 py-3 bg-gray-100/80 border-0 rounded-full text-base text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/30 transition-all shadow-2xs"
        />
      </div>

      {/* Filter Options */}
      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
        {/* Date Filter */}
        <DateFilterPicker value={selectedDate} onChange={onDateChange} />

        {/* Status Dropdown */}
        <div className="relative" ref={statusRef}>
          <button
            type="button"
            onClick={() => setIsStatusOpen(!isStatusOpen)}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-base font-semibold transition-all cursor-pointer select-none ${
              isStatusOpen || selectedStatus !== "ALL"
                ? "bg-white border-blue-500 text-blue-600 ring-2 ring-blue-500/20 shadow-sm"
                : "bg-gray-100/80 hover:bg-gray-200/60 border-gray-200/80 text-gray-800"
            }`}
          >
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-500 hidden sm:inline">
              Trạng thái lịch:
            </span>
            <span className="font-bold text-gray-900">{currentStatusLabel}</span>
            <ChevronDown
              size={18}
              className={`text-gray-400 transition-transform duration-200 ${
                isStatusOpen ? "rotate-180 text-blue-600" : ""
              }`}
            />
          </button>

          {isStatusOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-xs font-bold text-gray-400 px-3 py-1.5 uppercase tracking-wider">
                Lọc theo trạng thái lịch
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
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
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

        {/* Nút Hiển thị tất cả lịch làm việc */}
        <button
          type="button"
          onClick={onShowAll}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-base font-bold rounded-xl transition cursor-pointer shadow-2xs active:scale-95 ${
            hasFiltersActive
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          title="Hiển thị toàn bộ tất cả lịch làm việc"
        >
          <RotateCcw size={17} />
          <span>Hiển thị tất cả lịch làm việc</span>
        </button>
      </div>
    </div>
  );
}
