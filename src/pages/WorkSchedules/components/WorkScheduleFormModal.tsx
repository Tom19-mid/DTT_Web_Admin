import { useState, useEffect, useRef } from "react";
import { X, Calendar, ChevronLeft, ChevronRight, Save, Clock, ChevronDown, Check, Sun, Sunset, AlertTriangle } from "lucide-react";
import type { WorkSchedule, TimeSlot } from "../types";
import doctorApi from "../../../api/doctorApi";

interface WorkScheduleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (schedules: WorkSchedule[]) => void;
  initialData?: WorkSchedule | null;
  nextScheduleId: number;
  doctors?: Array<{ doctorId: number; fullName: string }>;
  onAddToast?: (toast: {
    type: "success" | "error" | "info";
    title?: string;
    message: string;
  }) => void;
}

const monthNames = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
  "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
  "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

// Generate time options 06:00 → 22:00 with 30-min steps
const generateTimeOptions = (): string[] => {
  const times: string[] = [];
  for (let hour = 6; hour <= 22; hour++) {
    const hStr = String(hour).padStart(2, "0");
    times.push(`${hStr}:00`);
    if (hour < 22) times.push(`${hStr}:30`);
  }
  return times;
};

const TIME_OPTIONS = generateTimeOptions();
const SLOT_DURATION = 30;

const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const minutesToTime = (total: number): string => {
  const h = String(Math.floor(total / 60)).padStart(2, "0");
  const m = String(total % 60).padStart(2, "0");
  return `${h}:${m}`;
};

const generateTimeSlots = (
  startTime: string,
  endTime: string,
  scheduleCode: string,
  existingSlots: TimeSlot[] = []
): TimeSlot[] => {
  const startTotal = timeToMinutes(startTime);
  const endTotal = timeToMinutes(endTime);

  const existingMap = new Map<string, TimeSlot>();
  for (const slot of existingSlots) {
    if (slot.startTime && slot.endTime) {
      existingMap.set(`${slot.startTime}-${slot.endTime}`, slot);
    }
  }

  let order = 1;
  const newSlots: TimeSlot[] = [];
  let nextSlotId = existingSlots.reduce((max, s) => Math.max(max, s.slotId || 0), 0) + 1;

  let currTotal = startTotal;
  while (currTotal + SLOT_DURATION <= endTotal) {
    const nextTotal = currTotal + SLOT_DURATION;
    const slotStart = minutesToTime(currTotal);
    const slotEnd = minutesToTime(nextTotal);
    const key = `${slotStart}-${slotEnd}`;

    const existing = existingMap.get(key);
    if (existing) {
      newSlots.push({ ...existing, scheduleCode, slotOrder: order, slotCode: String(order) });
    } else {
      newSlots.push({
        slotId: nextSlotId++,
        slotCode: String(order),
        scheduleCode,
        slotOrder: order,
        startTime: slotStart,
        endTime: slotEnd,
        status: "Chưa đặt lịch",
      });
    }
    currTotal = nextTotal;
    order++;
  }

  return newSlots;
};

// Check if a time range crosses noon (12:00) — warns user to split shifts
const crossesNoon = (start: string, end: string): boolean => {
  const s = timeToMinutes(start);
  const e = timeToMinutes(end);
  const noon = 12 * 60;
  return s < noon && e > noon;
};

// ─── Custom Date Picker ────────────────────────────────────────────────────────
function CustomDatePicker({
  value,
  onChange,
  onOpenStateChange,
}: {
  value: string;
  onChange: (val: string) => void;
  onOpenStateChange?: (open: boolean) => void;
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
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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
        <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 w-84 select-none">
          <div className="flex items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-2">
              <select
                value={currentMonth}
                onChange={(e) => setViewDate(new Date(currentYear, Number(e.target.value), 1))}
                className="font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer"
              >
                {monthNames.map((m, idx) => <option key={idx} value={idx}>{m}</option>)}
              </select>
              <select
                value={currentYear}
                onChange={(e) => setViewDate(new Date(Number(e.target.value), currentMonth, 1))}
                className="font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer"
              >
                {Array.from({ length: 10 }, (_, i) => 2026 - i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 cursor-pointer">
                <ChevronLeft size={18} />
              </button>
              <button type="button" onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 cursor-pointer">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-bold text-gray-400 text-xs mb-2">
            {dayNames.map((d) => <div key={d}>{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1 text-sm">
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => <div key={`empty-${idx}`} />)}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const isSelected = value &&
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
            <button type="button" onClick={() => setIsOpen(false)} className="text-gray-500 font-bold hover:text-gray-800 cursor-pointer">
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Custom Time Select ────────────────────────────────────────────────────────
function CustomTimeSelect({
  value,
  onChange,
  options,
  placeholder,
  onOpenStateChange,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
  onOpenStateChange?: (isOpen: boolean) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onOpenStateChange) onOpenStateChange(isOpen);
  }, [isOpen, onOpenStateChange]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeEl = listRef.current.querySelector('[data-selected="true"]');
      if (activeEl) activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between border rounded-xl px-4 py-2.5 text-base text-gray-900 bg-white transition-all select-none ${
          disabled
            ? "opacity-40 cursor-not-allowed bg-gray-50"
            : isOpen
              ? "border-blue-500 ring-2 ring-blue-500/20 cursor-pointer"
              : "border-gray-300 hover:border-gray-400 cursor-pointer"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Clock size={18} className="text-gray-400" />
          <span className="font-normal text-gray-800 text-base">{value || placeholder}</span>
        </div>
        <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-blue-600" : ""}`} />
      </button>

      {isOpen && (
        <div
          ref={listRef}
          className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-1.5 max-h-56 overflow-y-auto space-y-0.5"
        >
          {options.map((timeOption) => {
            const isSelected = value === timeOption;
            return (
              <button
                key={timeOption}
                type="button"
                data-selected={isSelected}
                onClick={() => { onChange(timeOption); setIsOpen(false); }}
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

// ─── Slot Preview Panel ────────────────────────────────────────────────────────
function SlotPreview({
  startTime,
  endTime,
  label,
  color,
  existingSlots,
  scheduleId,
}: {
  startTime: string;
  endTime: string;
  label: string;
  color: "blue" | "violet";
  existingSlots?: TimeSlot[];
  scheduleId: number;
}) {
  const isValid = timeToMinutes(startTime) < timeToMinutes(endTime);
  const slots = isValid
    ? generateTimeSlots(startTime, endTime, String(scheduleId), existingSlots || [])
    : [];

  const bg = color === "blue" ? "bg-blue-50/70 border-blue-100" : "bg-violet-50/70 border-violet-100";
  const iconColor = color === "blue" ? "text-blue-600" : "text-violet-600";
  const titleColor = color === "blue" ? "text-blue-900" : "text-violet-900";
  const descColor = color === "blue" ? "text-blue-700" : "text-violet-700";
  const slotBorderColor = color === "blue" ? "border-blue-200 text-blue-800" : "border-violet-200 text-violet-800";

  const noon12 = crossesNoon(startTime, endTime);

  return (
    <div className={`border rounded-2xl p-3.5 ${bg}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <Clock size={15} className={iconColor} />
        <p className={`text-sm font-bold ${titleColor}`}>
          Khung giờ {label} (tự động chia 30 phút)
        </p>
      </div>
      <p className={`text-xs mb-2.5 ${descColor}`}>
        {isValid
          ? `${slots.length} khung giờ trong khoảng ${startTime} – ${endTime}`
          : "Giờ kết thúc phải lớn hơn giờ bắt đầu"}
      </p>

      {isValid ? (
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
          {slots.map((slot, i) => (
            <span
              key={i}
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg border bg-white ${
                slot.status === "Đã đặt lịch"
                  ? "bg-amber-100 text-amber-800 border-amber-200"
                  : slotBorderColor
              }`}
            >
              {slot.startTime} - {slot.endTime}
              {slot.status === "Đã đặt lịch" && " (Đã đặt)"}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-rose-600 font-bold">⚠️ Giờ kết thúc phải lớn hơn giờ bắt đầu!</p>
      )}

      {/* Warning: shift crosses noon */}
      {isValid && noon12 && (
        <div className="mt-2.5 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
          <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-bold">Lưu ý:</span> Ca này kéo qua 12:00 — sẽ có slot trong giờ nghỉ trưa.
            Khuyến nghị kết thúc ca sáng lúc <strong>11:30</strong> và thêm ca chiều từ <strong>13:30</strong>.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Shift Card ────────────────────────────────────────────────────────────────
function ShiftCard({
  label,
  icon,
  checked,
  onToggle,
  startTime,
  onStartChange,
  endTime,
  onEndChange,
  defaultStart,
  defaultEnd,
  color,
  existingSlots,
  scheduleId,
  onOpenStateChange,
}: {
  label: string;
  icon: React.ReactNode;
  checked: boolean;
  onToggle: () => void;
  startTime: string;
  onStartChange: (v: string) => void;
  endTime: string;
  onEndChange: (v: string) => void;
  defaultStart: string;
  defaultEnd: string;
  color: "blue" | "violet";
  existingSlots?: TimeSlot[];
  scheduleId: number;
  onOpenStateChange?: (open: boolean) => void;
}) {
  const borderColor = color === "blue"
    ? checked ? "border-blue-400 bg-blue-50/30" : "border-gray-200 bg-gray-50/50"
    : checked ? "border-violet-400 bg-violet-50/30" : "border-gray-200 bg-gray-50/50";

  const checkboxColor = color === "blue"
    ? "border-blue-500 bg-blue-600"
    : "border-violet-500 bg-violet-600";

  const labelColor = color === "blue"
    ? checked ? "text-blue-800" : "text-gray-600"
    : checked ? "text-violet-800" : "text-gray-600";

  const defaultHint = `Mặc định: ${defaultStart} – ${defaultEnd}`;

  return (
    <div className={`border-2 rounded-2xl p-4 transition-all duration-200 ${borderColor}`}>
      {/* Header row: checkbox + label */}
      <label className="flex items-center gap-3 cursor-pointer select-none mb-0">
        <div
          onClick={onToggle}
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer ${
            checked ? checkboxColor + " border-transparent" : "border-gray-300 bg-white"
          }`}
        >
          {checked && <Check size={13} className="text-white" strokeWidth={3} />}
        </div>
        <div className="flex items-center gap-2" onClick={onToggle}>
          {icon}
          <span className={`font-bold text-sm ${labelColor}`}>{label}</span>
          {!checked && (
            <span className="text-xs text-gray-400 font-normal">({defaultHint})</span>
          )}
        </div>
      </label>

      {/* Expanded content when checked */}
      {checked && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Giờ bắt đầu <span className="text-rose-500">*</span></label>
              <CustomTimeSelect
                value={startTime}
                onChange={onStartChange}
                options={TIME_OPTIONS}
                placeholder={defaultStart}
                onOpenStateChange={onOpenStateChange}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Giờ kết thúc <span className="text-rose-500">*</span></label>
              <CustomTimeSelect
                value={endTime}
                onChange={onEndChange}
                options={TIME_OPTIONS}
                placeholder={defaultEnd}
                onOpenStateChange={onOpenStateChange}
              />
            </div>
          </div>

          <SlotPreview
            startTime={startTime}
            endTime={endTime}
            label={label}
            color={color}
            existingSlots={existingSlots}
            scheduleId={scheduleId}
          />
        </div>
      )}
    </div>
  );
}

// ─── Main Modal ────────────────────────────────────────────────────────────────
export default function WorkScheduleFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  nextScheduleId,
  doctors = [],
  onAddToast,
}: WorkScheduleFormModalProps) {
  const [fetchedDoctors, setFetchedDoctors] = useState<Array<{ doctorId: number; fullName: string }>>([]);

  useEffect(() => {
    if (isOpen) {
      doctorApi.getAll().then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setFetchedDoctors(res.map((d: any) => ({ doctorId: d.doctorId, fullName: d.fullName })));
        }
      });
    }
  }, [isOpen]);

  const activeDoctors = doctors && doctors.length > 0 ? doctors : fetchedDoctors;
  const doctorOptions: Array<{ id: number; name: string }> = activeDoctors.map((d) => ({
    id: d.doctorId,
    name: d.fullName,
  }));

  if (
    initialData?.doctorName &&
    !doctorOptions.some((d) => d.name.trim().toLowerCase() === initialData.doctorName!.trim().toLowerCase())
  ) {
    doctorOptions.unshift({ id: initialData.doctorId || 999, name: initialData.doctorName });
  }

  // ── Form states ──
  const [selectedDoctorId, setSelectedDoctorId] = useState<number>(doctorOptions[0]?.id || 1);
  const [doctorName, setDoctorName] = useState<string>(doctorOptions[0]?.name || "");
  const [workDate, setWorkDate] = useState("");

  // Ca sáng
  const [morningChecked, setMorningChecked] = useState(false);
  const [morningStart, setMorningStart] = useState("07:30");
  const [morningEnd, setMorningEnd] = useState("11:30");

  // Ca chiều
  const [afternoonChecked, setAfternoonChecked] = useState(false);
  const [afternoonStart, setAfternoonStart] = useState("13:30");
  const [afternoonEnd, setAfternoonEnd] = useState("16:30");

  const modalScrollRef = useRef<HTMLDivElement>(null);

  // Sync when modal opens or initialData changes (edit mode keeps legacy 1-shift)
  const [prevInitialData, setPrevInitialData] = useState<WorkSchedule | null | undefined>(undefined);
  const [prevIsOpen, setPrevIsOpen] = useState(false);
  const [prevDoctorOptionsLen, setPrevDoctorOptionsLen] = useState(0);

  if (
    initialData !== prevInitialData ||
    isOpen !== prevIsOpen ||
    doctorOptions.length !== prevDoctorOptionsLen
  ) {
    setPrevInitialData(initialData);
    setPrevIsOpen(isOpen);
    setPrevDoctorOptionsLen(doctorOptions.length);

    if (initialData) {
      // EDIT mode: pre-fill whichever shift matches initialData
      const matched =
        doctorOptions.find(
          (d) =>
            (initialData.doctorId && d.id === initialData.doctorId) ||
            (initialData.doctorName &&
              d.name.trim().toLowerCase() === initialData.doctorName.trim().toLowerCase())
        ) || doctorOptions[0];

      setSelectedDoctorId(matched ? matched.id : (initialData.doctorId || 1));
      setDoctorName(initialData.doctorName || (matched ? matched.name : ""));
      setWorkDate(initialData.workDate || "");

      // Phân biệt ca sáng / ca chiều dựa theo giờ bắt đầu (>= 12:00 là ca chiều)
      const isAfternoon = timeToMinutes(initialData.startTime || "07:30") >= 12 * 60;
      if (isAfternoon) {
        setMorningChecked(false);
        setAfternoonChecked(true);
        setAfternoonStart(initialData.startTime || "13:30");
        setAfternoonEnd(initialData.endTime || "16:30");
      } else {
        setMorningChecked(true);
        setMorningStart(initialData.startTime || "07:30");
        setMorningEnd(initialData.endTime || "11:30");
        setAfternoonChecked(false);
      }
    } else if (isOpen) {
      // ADD mode: reset to defaults — nothing checked
      const today = new Date();
      const dStr = String(today.getDate()).padStart(2, "0");
      const mStr = String(today.getMonth() + 1).padStart(2, "0");
      const yStr = String(today.getFullYear());

      if (!selectedDoctorId || !doctorOptions.some((d) => d.id === selectedDoctorId)) {
        setSelectedDoctorId(doctorOptions[0]?.id || 1);
        setDoctorName(doctorOptions[0]?.name || "");
      }
      setWorkDate(`${dStr}/${mStr}/${yStr}`);
      setMorningChecked(false);
      setMorningStart("07:30");
      setMorningEnd("11:30");
      setAfternoonChecked(false);
      setAfternoonStart("13:30");
      setAfternoonEnd("16:30");
    }
  }

  const notifyWarning = (message: string, title = "Lỗi lịch làm việc") => {
    if (onAddToast) {
      onAddToast({ type: "error", title, message });
    } else {
      alert(message);
    }
  };

  const handleDropdownOpened = (open: boolean) => {
    if (open && modalScrollRef.current) {
      setTimeout(() => {
        modalScrollRef.current?.scrollTo({ top: modalScrollRef.current.scrollHeight, behavior: "smooth" });
      }, 100);
    }
  };

  if (!isOpen) return null;

  const isEditMode = !!initialData;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!workDate) {
      notifyWarning("Vui lòng chọn Ngày làm việc!", "Thiếu thông tin");
      return;
    }

    if (!morningChecked && !afternoonChecked) {
      notifyWarning("Vui lòng chọn ít nhất một ca làm việc (Ca sáng hoặc Ca chiều)!", "Thiếu thông tin");
      return;
    }

    const results: WorkSchedule[] = [];

    if (morningChecked) {
      if (timeToMinutes(morningStart) >= timeToMinutes(morningEnd)) {
        notifyWarning("Ca sáng: Giờ kết thúc phải lớn hơn giờ bắt đầu!", "Không hợp lệ");
        return;
      }

      // Guard edit mode: check booked slots outside new range
      if (initialData?.timeSlots) {
        const hasBookedOutsideRange = initialData.timeSlots.some((slot) => {
          if (slot.status !== "Đã đặt lịch" || !slot.startTime || !slot.endTime) return false;
          const slotStart = timeToMinutes(slot.startTime);
          const slotEnd = timeToMinutes(slot.endTime);
          return slotStart < timeToMinutes(morningStart) || slotEnd > timeToMinutes(morningEnd);
        });
        if (hasBookedOutsideRange) {
          notifyWarning(
            "Không thể thu hẹp ca sáng vì có khung giờ đã được đặt lịch nằm ngoài phạm vi mới!",
            "Không thể cập nhật"
          );
          return;
        }
      }

      const schId = initialData?.scheduleId ?? nextScheduleId;
      results.push({
        scheduleId: schId,
        scheduleCode: String(schId),
        doctorId: selectedDoctorId,
        doctorName,
        workDate,
        startTime: morningStart,
        endTime: morningEnd,
        status: initialData?.status || "Trống lịch",
        timeSlots: generateTimeSlots(morningStart, morningEnd, String(schId), initialData?.timeSlots || []),
      });
    }

    if (afternoonChecked) {
      if (timeToMinutes(afternoonStart) >= timeToMinutes(afternoonEnd)) {
        notifyWarning("Ca chiều: Giờ kết thúc phải lớn hơn giờ bắt đầu!", "Không hợp lệ");
        return;
      }

      // Guard edit mode: check booked slots outside new range
      if (isEditMode && !morningChecked && initialData?.timeSlots) {
        const hasBookedOutsideRange = initialData.timeSlots.some((slot) => {
          if (slot.status !== "Đã đặt lịch" || !slot.startTime || !slot.endTime) return false;
          const slotStart = timeToMinutes(slot.startTime);
          const slotEnd = timeToMinutes(slot.endTime);
          return slotStart < timeToMinutes(afternoonStart) || slotEnd > timeToMinutes(afternoonEnd);
        });
        if (hasBookedOutsideRange) {
          notifyWarning(
            "Không thể thu hẹp ca chiều vì có khung giờ đã được đặt lịch nằm ngoài phạm vi mới!",
            "Không thể cập nhật"
          );
          return;
        }
      }

      const schId2 = (isEditMode && !morningChecked)
        ? (initialData?.scheduleId ?? nextScheduleId)
        : ((initialData?.scheduleId ?? nextScheduleId) + (morningChecked ? 1 : 0));
      results.push({
        scheduleId: schId2,
        scheduleCode: String(schId2),
        doctorId: selectedDoctorId,
        doctorName,
        workDate,
        startTime: afternoonStart,
        endTime: afternoonEnd,
        status: (isEditMode && !morningChecked) ? (initialData?.status || "Trống lịch") : "Trống lịch",
        timeSlots: generateTimeSlots(
          afternoonStart,
          afternoonEnd,
          String(schId2),
          (isEditMode && !morningChecked) ? (initialData?.timeSlots || []) : []
        ),
      });
    }

    onSave(results);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        ref={modalScrollRef}
        className="bg-white rounded-3xl shadow-xl w-full max-w-xl p-6 relative max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditMode ? "Chỉnh sửa lịch làm việc" : "Thêm lịch làm việc mới"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {isEditMode
                ? `Mã lịch: #${initialData.scheduleCode || initialData.scheduleId}`
                : "Chọn ca làm việc — hệ thống tự chia khung giờ 30 phút"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-xl p-1 hover:bg-gray-100 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bác sĩ phụ trách */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Bác sĩ phụ trách <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => {
                const docId = Number(e.target.value);
                setSelectedDoctorId(docId);
                const found = doctorOptions.find((d) => d.id === docId);
                if (found) setDoctorName(found.name);
              }}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base font-normal text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white transition-all cursor-pointer"
            >
              {doctorOptions.map((doc) => (
                <option key={doc.id} value={doc.id}>{doc.name}</option>
              ))}
            </select>
          </div>

          {/* Ngày làm việc */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Ngày làm việc <span className="text-rose-500">*</span>
            </label>
            <CustomDatePicker
              value={workDate}
              onChange={setWorkDate}
              onOpenStateChange={handleDropdownOpened}
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Chọn ca làm việc</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Ca sáng */}
          {(!isEditMode || morningChecked) && (
            <ShiftCard
              label="Ca sáng"
              icon={<Sun size={16} className={morningChecked ? "text-amber-500" : "text-gray-400"} />}
              checked={morningChecked}
              onToggle={() => setMorningChecked((v) => !v)}
              startTime={morningStart}
              onStartChange={setMorningStart}
              endTime={morningEnd}
              onEndChange={setMorningEnd}
              defaultStart="07:30"
              defaultEnd="11:30"
              color="blue"
              existingSlots={isEditMode && morningChecked ? initialData?.timeSlots : undefined}
              scheduleId={initialData?.scheduleId ?? nextScheduleId}
              onOpenStateChange={handleDropdownOpened}
            />
          )}

          {/* Ca chiều */}
          {(!isEditMode || afternoonChecked) && (
            <ShiftCard
              label="Ca chiều"
              icon={<Sunset size={16} className={afternoonChecked ? "text-violet-500" : "text-gray-400"} />}
              checked={afternoonChecked}
              onToggle={() => setAfternoonChecked((v) => !v)}
              startTime={afternoonStart}
              onStartChange={setAfternoonStart}
              endTime={afternoonEnd}
              onEndChange={setAfternoonEnd}
              defaultStart="13:30"
              defaultEnd="16:30"
              color="violet"
              existingSlots={isEditMode && afternoonChecked ? initialData?.timeSlots : undefined}
              scheduleId={(isEditMode && !morningChecked) ? (initialData?.scheduleId ?? nextScheduleId) : ((initialData?.scheduleId ?? nextScheduleId) + 1)}
              onOpenStateChange={handleDropdownOpened}
            />
          )}

          {/* No shift selected hint */}
          {!morningChecked && !afternoonChecked && (
            <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <AlertTriangle size={16} className="text-gray-400 shrink-0" />
              <p className="text-sm text-gray-500">
                Tick vào <strong>Ca sáng</strong> hoặc <strong>Ca chiều</strong> (hoặc cả hai) để cấu hình lịch làm việc.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition cursor-pointer text-base"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition cursor-pointer text-base"
            >
              <Save size={18} />
              <span>
                {isEditMode
                  ? "Cập nhật"
                  : morningChecked && afternoonChecked
                    ? "Tạo 2 ca làm việc"
                    : "Tạo lịch làm việc"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
