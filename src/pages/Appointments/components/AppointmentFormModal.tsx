import { useState, useEffect, useRef } from "react";
import { X, Save, Calendar, ChevronLeft, ChevronRight, Clock, ChevronDown, Check } from "lucide-react";
import type { Appointment, AppointmentStatusName } from "../types";

interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appData: Appointment) => void;
  initialData?: Appointment | null;
  doctors: string[];
  nextAppointmentId: number;
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

// Generate 30-minute time slots from 08:00 to 22:00
const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let hour = 8; hour < 22; hour++) {
    const startHour = String(hour).padStart(2, "0");
    const endHourHalf = String(hour).padStart(2, "0");
    const endHourNext = String(hour + 1).padStart(2, "0");

    slots.push(`${startHour}:00 - ${endHourHalf}:30`);
    slots.push(`${endHourHalf}:30 - ${endHourNext}:00`);
  }
  return slots;
};

const AVAILABLE_TIME_SLOTS = generateTimeSlots();

function CustomDatePicker({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
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
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          placeholder="Chọn ngày khám (VD: 30/07/2026)"
          className={`w-full border border-gray-300 rounded-xl px-4 py-2.5 pr-11 text-base font-semibold outline-none transition-all ${
            disabled
              ? "bg-gray-100/80 text-gray-600 cursor-not-allowed"
              : "bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          }`}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors p-1 ${
            disabled ? "cursor-not-allowed text-gray-400" : "hover:text-blue-600 cursor-pointer"
          }`}
        >
          <Calendar size={20} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 w-76 sm:w-80 animation-fadeIn select-none">
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

// Custom Time Slot Picker Component with regular font weight
function CustomTimePicker({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

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

  // Auto scroll to active item when opened
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
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between border rounded-xl px-4 py-2.5 text-base font-semibold transition-all select-none ${
          disabled
            ? "bg-gray-100/80 text-gray-600 border-gray-300 cursor-not-allowed"
            : isOpen
            ? "bg-white text-gray-900 border-blue-500 ring-2 ring-blue-500/20 cursor-pointer"
            : "bg-white text-gray-900 border-gray-300 hover:border-gray-400 cursor-pointer"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Clock size={18} className={disabled ? "text-gray-400" : "text-gray-500"} />
          <span className="font-semibold text-base">{value || "Chọn giờ khám"}</span>
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
          className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white rounded-2xl shadow-xl border border-gray-200 p-1.5 max-h-52 overflow-y-auto animate-in fade-in zoom-in-95 duration-150 space-y-0.5"
        >
          {AVAILABLE_TIME_SLOTS.map((slot) => {
            const isSelected = value === slot;
            return (
              <button
                key={slot}
                type="button"
                data-selected={isSelected}
                onClick={() => {
                  onChange(slot);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-base font-normal transition cursor-pointer ${
                  isSelected
                    ? "bg-blue-50 text-blue-700 font-bold"
                    : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900"
                }`}
              >
                <span>{slot}</span>
                {isSelected && <Check size={18} className="text-blue-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const statusOptions: { value: AppointmentStatusName; label: string }[] = [
  { value: "Scheduled", label: "Đã đặt lịch" },
  { value: "CheckedIn", label: "Đã check in" },
  { value: "Waiting", label: "Đang chờ khám" },
  { value: "WaitingDoctor", label: "Đang chờ bác sĩ" },
  { value: "InProgress", label: "Đang khám" },
  { value: "WaitingTestResults", label: "Đang chờ kết quả xét nghiệm" },
  { value: "PendingDispensing", label: "Đang chờ phát thuốc" },
  { value: "Completed", label: "Đã hoàn thành" },
  { value: "Cancelled", label: "Đã hủy" },
  { value: "NoShow", label: "Không đến khám" },
];

export default function AppointmentFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  doctors,
  nextAppointmentId,
}: AppointmentFormModalProps) {
  const [patientName, setPatientName] = useState<string>("");
  const [doctorName, setDoctorName] = useState<string>(doctors[0] || "BS. Trần Minh Tuấn");
  const formatNurseNoteForEdit = (rawStr?: string | null): string => {
    if (!rawStr || rawStr.trim() === "" || rawStr === "null") return "";
    try {
      if (rawStr.startsWith("{") && rawStr.endsWith("}")) {
        const obj = JSON.parse(rawStr);
        const lines: string[] = [];
        if (obj.bloodPressure) lines.push(`Huyết áp: ${obj.bloodPressure}`);
        if (obj.heartRate) lines.push(`Nhịp tim: ${obj.heartRate}`);
        if (obj.temperature) lines.push(`Thân nhiệt: ${obj.temperature}`);
        if (obj.bmi) lines.push(`BMI: ${obj.bmi}`);
        if (obj.nurseNote) lines.push(`Ghi chú điều dưỡng: ${obj.nurseNote}`);
        if (lines.length > 0) return lines.join("\n");
      }
    } catch {
      // plain text
    }
    return rawStr;
  };

  const formatDateTimeDisplay = (dateStr?: string | null): string => {
    if (!dateStr || dateStr.trim() === "" || dateStr === "null") return "";
    try {
      const dt = new Date(dateStr);
      if (isNaN(dt.getTime())) return dateStr;
      const day = String(dt.getDate()).padStart(2, "0");
      const month = String(dt.getMonth() + 1).padStart(2, "0");
      const year = dt.getFullYear();
      const hours = String(dt.getHours()).padStart(2, "0");
      const mins = String(dt.getMinutes()).padStart(2, "0");
      return `${day}/${month}/${year} ${hours}:${mins}`;
    } catch {
      return dateStr;
    }
  };

  const [appointmentDate, setAppointmentDate] = useState<string>(getTodayFormatted());
  const [appointmentTime, setAppointmentTime] = useState<string>("08:00 - 08:30");
  const [reason, setReason] = useState<string>("");
  const [queueNumber, setQueueNumber] = useState<number | "">(1);
  const [status, setStatus] = useState<AppointmentStatusName>("Scheduled");
  const [notes, setNotes] = useState<string>("");
  const [cancelReason, setCancelReason] = useState<string>("");
  const [cancelTime, setCancelTime] = useState<string>("");
  const [cancelledBy, setCancelledBy] = useState<string>("-");
  const [nurseNote, setNurseNote] = useState<string>("");
  const [memberIdVal, setMemberIdVal] = useState<string | number | null>(null);

  // Track props changes for initial form state reset
  const [prevInitialData, setPrevInitialData] = useState<Appointment | null | undefined>(undefined);
  const [prevIsOpen, setPrevIsOpen] = useState(false);

  if (initialData !== prevInitialData || isOpen !== prevIsOpen) {
    setPrevInitialData(initialData);
    setPrevIsOpen(isOpen);
    if (initialData) {
      setPatientName(initialData.patientName);
      setDoctorName(initialData.doctorName);
      setAppointmentDate(initialData.appointmentDate);
      setAppointmentTime(initialData.appointmentTime);
      setReason(initialData.reason);
      setQueueNumber(initialData.queueNumber);
      setStatus(initialData.status);
      setNotes(initialData.notes || initialData.note || "");
      setCancelReason(initialData.cancelReason || initialData.cancel_reason || "");
      setNurseNote(formatNurseNoteForEdit(initialData.nurseNote || initialData.nurse_note));
      setMemberIdVal(initialData.memberId || initialData.member_id || null);
      const rawCancelTime = initialData.cancelTime || initialData.cancelledAt || initialData.cancelled_at;
      setCancelTime(formatDateTimeDisplay(rawCancelTime));
      const rawBy = initialData.cancelledBy || initialData.cancelled_by;
      if (rawBy && rawBy.toLowerCase().includes("admin")) {
        setCancelledBy("Admin");
      } else if (rawBy && initialData.doctorName && rawBy.toLowerCase().includes(initialData.doctorName.toLowerCase())) {
        setCancelledBy(initialData.doctorName);
      } else {
        setCancelledBy("Lễ tân");
      }
    } else {
      setPatientName("");
      setDoctorName(doctors[0] || "BS. Trần Minh Tuấn");
      setAppointmentDate(getTodayFormatted());
      setAppointmentTime("08:00 - 08:30");
      setReason("");
      setQueueNumber(1);
      setStatus("Scheduled");
      setNotes("");
      setCancelReason("");
      setCancelTime("");
      setCancelledBy("Lễ tân");
      setNurseNote("");
      setMemberIdVal(null);
    }
  }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      alert("Vui lòng nhập Tên bệnh nhân!");
      return;
    }

    onSave({
      appointmentId: initialData?.appointmentId ?? initialData?.id ?? nextAppointmentId,
      // Không còn fallback "?? 1" (âm thầm trỏ vào bệnh nhân/bác sĩ #1) — Appointments.tsx.handleSaveAppointment
      // giờ tự đối chiếu patientName/doctorName với DB thật và báo lỗi rõ ràng nếu không khớp được ai.
      patientId: initialData?.patientId,
      doctorId: initialData?.doctorId,
      id: initialData?.id ?? nextAppointmentId,
      patientName: patientName.trim(),
      doctorName,
      appointmentDate,
      appointmentTime,
      reason: reason.trim(),
      queueNumber: Number(queueNumber) || 1,
      status,
      cancelReason: (status === "Cancelled" || status === "Đã hủy") ? cancelReason.trim() || null : null,
      cancelTime: (status === "Cancelled" || status === "Đã hủy") ? cancelTime.trim() || null : null,
      cancelledBy: (status === "Cancelled" || status === "Đã hủy") ? cancelledBy.trim() || null : null,
      notes: notes.trim() || null,
      note: notes.trim() || null,
      nurseNote: nurseNote.trim() || null,
      nurse_note: nurseNote.trim() || null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {initialData ? "Chỉnh sửa lịch hẹn" : "Tạo lịch hẹn mới"}
            </h2>
            <p className="text-base text-gray-500 mt-0.5">
              Nhập thông tin chi tiết lịch hẹn khám bệnh
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Bệnh nhân */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Tên bệnh nhân <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Nhập tên bệnh nhân..."
                required
                disabled={!!initialData}
                className={`w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base outline-none transition-all ${
                  initialData
                    ? "bg-gray-100/80 text-gray-800 font-bold cursor-not-allowed"
                    : "bg-white text-gray-900 font-normal focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                }`}
              />
            </div>

            {/* Bác sĩ */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Bác sĩ phụ trách <span className="text-rose-500">*</span>
              </label>
              <select
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                required
                disabled={!!initialData}
                className={`w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base outline-none transition-all ${
                  initialData
                    ? "bg-gray-100/80 text-gray-800 font-bold cursor-not-allowed"
                    : "bg-white text-gray-900 font-normal focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                }`}
              >
                {doctors.map((doc) => (
                  <option key={doc} value={doc}>
                    {doc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ngày khám & Giờ khám */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ngày khám */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Ngày khám <span className="text-rose-500">*</span>
              </label>
              <CustomDatePicker value={appointmentDate} onChange={setAppointmentDate} disabled={!!initialData} />
            </div>

            {/* Giờ khám */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Giờ khám <span className="text-rose-500">*</span>
              </label>
              <CustomTimePicker value={appointmentTime} onChange={setAppointmentTime} disabled={!!initialData} />
            </div>
          </div>

          {/* Lý do khám */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Lý do khám <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Khám sức khỏe tổng quát, Sốt và ho..."
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Số thứ tự khám */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Số thứ tự khám (STTK) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={queueNumber}
                onChange={(e) => setQueueNumber(e.target.value === "" ? "" : Number(e.target.value))}
                min={1}
                required
                disabled={!!initialData}
                className={`w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base font-bold outline-none transition-all ${
                  initialData
                    ? "bg-gray-100/80 text-gray-800 cursor-not-allowed"
                    : "bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                }`}
              />
            </div>

            {/* Trạng thái */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Trạng thái <span className="text-rose-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AppointmentStatusName)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white transition-all cursor-pointer"
              >
                {statusOptions.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Các trường nếu trạng thái là "Đã hủy" / "Cancelled" */}
          {(status === "Cancelled" || status === "Đã hủy") && (
            <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-100 space-y-3">
              <p className="text-sm font-bold text-rose-800 uppercase tracking-wider">Thông tin hủy lịch hẹn</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Lý do hủy</label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Bệnh nhân bận việc..."
                    rows={2}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-base text-gray-900 font-normal bg-white outline-none focus:border-rose-500 transition-all resize-y"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Người hủy</label>
                  <select
                    value={cancelledBy}
                    onChange={(e) => setCancelledBy(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-base text-gray-900 font-normal bg-white outline-none focus:border-rose-500 cursor-pointer"
                  >
                    <option value="Lễ tân" className="cursor-pointer py-1">Lễ tân</option>
                    <option value="Admin" className="cursor-pointer py-1">Admin</option>
                    {doctorName && doctorName !== "Gói Khám Sức Khỏe" && (
                      <option value={doctorName} className="cursor-pointer py-1">
                        {doctorName}
                      </option>
                    )}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Thành viên gia đình (Read-only) */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Thành viên gia đình
            </label>
            <input
              type="text"
              value={memberIdVal ? `Thành viên #${memberIdVal}` : "-"}
              disabled
              readOnly
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base font-bold bg-gray-100/80 text-gray-800 cursor-not-allowed outline-none"
            />
          </div>

          {/* Ghi chú điều dưỡng (nurse_note) */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Ghi chú điều dưỡng (nurse_note)
            </label>
            <textarea
              value={nurseNote}
              onChange={(e) => setNurseNote(e.target.value)}
              placeholder="Ghi chú điều dưỡng / chỉ số sinh hiệu..."
              rows={Math.max(5, (nurseNote.match(/\n/g) || []).length + 1)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-white"
            />
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Ghi chú
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú thêm về lịch hẹn..."
              rows={2}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
            />
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
              <span>{initialData ? "Cập nhật" : "Tạo lịch hẹn"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
