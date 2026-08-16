import { useState, useEffect, useRef } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

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

interface CustomDatePickerProps {
  value: string; // Accepts "dd/MM/yyyy" or "yyyy-MM-dd"
  onChange: (val: string) => void; // Returns "dd/MM/yyyy"
  placeholder?: string;
}

export default function CustomDatePicker({
  value,
  onChange,
  placeholder = "dd/mm/yyyy",
  className = "",
}: CustomDatePickerProps) {
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

  const handleSelectToday = () => {
    const now = new Date();
    const dStr = String(now.getDate()).padStart(2, "0");
    const mStr = String(now.getMonth() + 1).padStart(2, "0");
    const yStr = String(now.getFullYear());
    onChange(`${dStr}/${mStr}/${yStr}`);
    setViewDate(now);
    setIsOpen(false);
  };

  // Convert yyyy-MM-dd to dd/MM/yyyy for input display if needed
  const displayFormattedValue = () => {
    if (!value) return "";
    if (value.includes("/")) return value;
    if (value.includes("-")) {
      const parts = value.split("-");
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    return value;
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative flex items-center">
        <input
          type="text"
          value={displayFormattedValue()}
          readOnly
          onClick={() => setIsOpen(!isOpen)}
          placeholder={placeholder}
          className={`w-48 border border-blue-300 rounded-xl pl-4 pr-11 py-2.5 text-base text-gray-900 font-extrabold placeholder:font-extrabold placeholder:text-gray-900 placeholder:opacity-100 bg-blue-50/70 hover:bg-blue-100/60 transition cursor-pointer outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-wide shadow-xs ${className}`}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer p-0.5"
          title="Mở lịch chọn ngày"
        >
          <Calendar size={20} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-3xl shadow-2xl border border-gray-200 p-4.5 w-80 text-sm select-none animate-in fade-in zoom-in-95 duration-150">
          {/* Header Month/Year Selector */}
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="flex items-center gap-1.5">
              <select
                value={currentMonth}
                onChange={(e) =>
                  setViewDate(new Date(currentYear, Number(e.target.value), 1))
                }
                className="font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl px-3 py-1.5 text-sm outline-none cursor-pointer transition-colors"
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
                className="font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl px-3 py-1.5 text-sm outline-none cursor-pointer transition-colors"
              >
                {Array.from({ length: 30 }, (_, i) => 2030 - i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-600 transition cursor-pointer"
                title="Tháng trước"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-600 transition cursor-pointer"
                title="Tháng sau"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-gray-500 text-xs mb-2">
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
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition cursor-pointer mx-auto ${
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

          {/* Footer Actions */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-sm font-semibold">
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-blue-600 hover:text-blue-800 cursor-pointer font-bold"
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-800 cursor-pointer font-bold"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
