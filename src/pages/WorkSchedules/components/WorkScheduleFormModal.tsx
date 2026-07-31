  import { useState, useEffect, useRef } from "react";
import { X, Calendar, ChevronLeft, ChevronRight, Save, Clock, ChevronDown, Check } from "lucide-react";
import type { WorkSchedule, TimeSlot } from "../types";
import { doctorsList } from "../data";

interface WorkScheduleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (scheduleData: WorkSchedule) => void;
  initialData?: WorkSchedule | null;
  nextScheduleId: number;
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

// Generate time options from 08:00 to 22:00
const generateTimeOptions8to22 = (): string[] => {
  const times: string[] = [];
  for (let hour = 8; hour <= 22; hour++) {
    const hStr = String(hour).padStart(2, "0");
    times.push(`${hStr}:00`);
    if (hour < 22) {
      times.push(`${hStr}:30`);
    }
  }
  return times;
};

const TIME_OPTIONS_8_TO_22 = generateTimeOptions8to22();

function CustomDatePicker({
  value,
  onChange,
  onOpenStateChange,
}: {
  value: string;
  onChange: (val: string) => void;
  onOpenStateChange?: (isOpen: boolean) => void;
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
    if (onOpenStateChange) onOpenStateChange(isOpen);
  }, [isOpen, onOpenStateChange]);

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
          placeholder="Chọn ngày (VD: 31/07/2026)"
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
        <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 w-84 animation-fadeIn select-none">
          <div className="flex items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-2">
              <select
                value={currentMonth}
                onChange={(e) =>
                  setViewDate(new Date(currentYear, Number(e.target.value), 1))
                }
                className="font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer"
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
                className="font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer"
              >
                {Array.from({ length: 10 }, (_, i) => 2026 - i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  setViewDate(new Date(currentYear, currentMonth - 1, 1))
                }
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() =>
                  setViewDate(new Date(currentYear, currentMonth + 1, 1))
                }
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-bold text-gray-400 text-xs mb-2">
            {dayNames.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-sm">
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} />
            ))}

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

// Custom Time Picker matching AppointmentFormModal UI with auto-scroll and regular font weight
function CustomTimeSelect({
  value,
  onChange,
  options,
  placeholder,
  onOpenStateChange,
}: {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
  onOpenStateChange?: (isOpen: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onOpenStateChange) onOpenStateChange(isOpen);
  }, [isOpen, onOpenStateChange]);

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

  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeEl = listRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between border rounded-xl px-4 py-2.5 text-base text-gray-900 bg-white transition-all cursor-pointer select-none ${
          isOpen
            ? "border-blue-500 ring-2 ring-blue-500/20"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Clock size={18} className="text-gray-400" />
          <span className="font-normal text-gray-800 text-base">{value || placeholder}</span>
        </div>
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-blue-600" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          ref={listRef}
          className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-1.5 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-150 space-y-0.5"
        >
          {options.map((timeOption) => {
            const isSelected = value === timeOption;
            return (
              <button
                key={timeOption}
                type="button"
                data-selected={isSelected}
                onClick={() => {
                  onChange(timeOption);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-base font-normal transition cursor-pointer ${
                  isSelected
                    ? "bg-blue-50 text-blue-700 font-bold"
                    : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900"
                }`}
              >
                <span>{timeOption}</span>
                {isSelected && <Check size={18} className="text-blue-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function WorkScheduleFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  nextScheduleId,
}: WorkScheduleFormModalProps) {
  const [doctorName, setDoctorName] = useState(doctorsList[0]);
  const [workDate, setWorkDate] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("12:00");
  const modalScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialData) {
      setDoctorName(initialData.doctorName);
      setWorkDate(initialData.workDate);
      setStartTime(initialData.startTime);
      setEndTime(initialData.endTime);
    } else {
      const today = new Date();
      const dStr = String(today.getDate()).padStart(2, "0");
      const mStr = String(today.getMonth() + 1).padStart(2, "0");
      const yStr = String(today.getFullYear());
      setDoctorName(doctorsList[0]);
      setWorkDate(`${dStr}/${mStr}/${yStr}`);
      setStartTime("08:00");
      setEndTime("12:00");
    }
  }, [initialData, isOpen]);

  const handleDropdownOpened = (open: boolean) => {
    if (open && modalScrollRef.current) {
      setTimeout(() => {
        modalScrollRef.current?.scrollTo({
          top: modalScrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workDate) {
      alert("Vui lòng chọn Ngày làm việc!");
      return;
    }

    const targetScheduleId = initialData?.scheduleId ?? nextScheduleId;
    const scheduleCodeStr = String(targetScheduleId);

    let generatedSlots: TimeSlot[] = initialData?.timeSlots || [];

    if (!initialData) {
      const slotDuration = 30; // Default 30-minute interval
      const [startH, startM] = startTime.split(":").map(Number);
      const [endH, endM] = endTime.split(":").map(Number);
      let currTotal = startH * 60 + startM;
      const endTotal = endH * 60 + endM;

      let order = 1;
      const newSlots: TimeSlot[] = [];

      while (currTotal + slotDuration <= endTotal) {
        const nextTotal = currTotal + slotDuration;
        const sH = String(Math.floor(currTotal / 60)).padStart(2, "0");
        const sM = String(currTotal % 60).padStart(2, "0");
        const eH = String(Math.floor(nextTotal / 60)).padStart(2, "0");
        const eM = String(nextTotal % 60).padStart(2, "0");

        newSlots.push({
          slotId: Math.floor(Math.random() * 9000) + 1000,
          slotCode: String(order),
          scheduleCode: scheduleCodeStr,
          slotOrder: order,
          startTime: `${sH}:${sM}`,
          endTime: `${eH}:${eM}`,
          status: "Chưa đặt lịch",
        });

        currTotal = nextTotal;
        order++;
      }
      generatedSlots = newSlots;
    } else {
      // If editing, ensure timeSlots scheduleCode matches parent scheduleCode
      generatedSlots = generatedSlots.map((slot) => ({
        ...slot,
        scheduleCode: scheduleCodeStr,
      }));
    }

    onSave({
      scheduleId: targetScheduleId,
      scheduleCode: scheduleCodeStr,
      doctorId: 1,
      doctorName,
      workDate,
      startTime,
      endTime,
      status: initialData?.status || "Trống lịch",
      timeSlots: generatedSlots,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div
        ref={modalScrollRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {initialData ? "Chỉnh sửa lịch làm việc" : "Thêm lịch làm việc bác sĩ"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Nhập các thông tin lịch làm việc bác sĩ vào hệ thống
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form - Fits content cleanly without huge bottom whitespace */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bác sĩ */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Bác sĩ <span className="text-rose-500">*</span>
            </label>
            <select
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base font-normal text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white transition-all cursor-pointer"
            >
              {doctorsList.map((doc) => (
                <option key={doc} value={doc}>
                  {doc}
                </option>
              ))}
            </select>
          </div>

          {/* Ngày làm việc */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Ngày làm việc <span className="text-rose-500">*</span>
            </label>
            <CustomDatePicker
              value={workDate}
              onChange={setWorkDate}
              onOpenStateChange={handleDropdownOpened}
            />
          </div>

          {/* Thời gian bắt đầu & Thời gian kết thúc */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Thời gian bắt đầu <span className="text-rose-500">*</span>
              </label>
              <CustomTimeSelect
                value={startTime}
                onChange={setStartTime}
                options={TIME_OPTIONS_8_TO_22}
                placeholder="Chọn giờ bắt đầu"
                onOpenStateChange={handleDropdownOpened}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Thời gian kết thúc <span className="text-rose-500">*</span>
              </label>
              <CustomTimeSelect
                value={endTime}
                onChange={setEndTime}
                options={TIME_OPTIONS_8_TO_22}
                placeholder="Chọn giờ kết thúc"
                onOpenStateChange={handleDropdownOpened}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-100 mt-5">
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
              <span>{initialData ? "Cập nhật" : "Tạo lịch làm việc"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
