import { useState, useEffect, useRef } from "react";
import { X, Save, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import type { Doctor, DoctorStatus } from "../types";
import ConfirmLockModal from "./ConfirmLockModal";

interface DoctorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (doctorData: any) => Promise<void> | void;
  initialData?: Doctor | null;
  specialtiesOptions?: Array<{ specialtyId: number; specialtyName: string }>;
}

const specialtiesList = [
  "Tim mạch",
  "Thần kinh học",
  "Nội khoa",
  "Da liễu",
  "Chấn thương chỉnh hình",
  "Phụ khoa",
  "Nhãn khoa",
  "Tai Mũi Họng",
  "Nhi khoa",
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

const getTodayFormatted = () => {
  const today = new Date();
  const dStr = String(today.getDate()).padStart(2, "0");
  const mStr = String(today.getMonth() + 1).padStart(2, "0");
  const yStr = String(today.getFullYear());
  return `${dStr}/${mStr}/${yStr}`;
};

// Custom Date Picker Component matching AppointmentFormModal UI with auto-scroll down
function CustomLeaveDatePicker({
  value,
  onChange,
  placeholder,
  alignRight = false,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  alignRight?: boolean;
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

  // Auto scroll modal scrollbar to the bottom when calendar opens so it's 100% visible
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const scrollContainer = containerRef.current.closest(".overflow-y-auto");
      if (scrollContainer) {
        setTimeout(() => {
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: "smooth",
          });
        }, 60);
      } else {
        setTimeout(() => {
          containerRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }, 60);
      }
    }
  }, [isOpen]);

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

  const handleToggle = () => {
    if (!isOpen && !value) {
      onChange(getTodayFormatted());
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          value={value}
          readOnly
          onClick={handleToggle}
          placeholder={placeholder || "DD/MM/YYYY"}
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 pr-11 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer bg-white font-medium"
        />
        <button
          type="button"
          onClick={handleToggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer p-1"
        >
          <Calendar size={20} />
        </button>
      </div>

      {isOpen && (
        <div
          className={`absolute ${
            alignRight ? "right-0" : "left-0"
          } top-full mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 w-76 sm:w-80 select-none animate-in fade-in zoom-in-95 duration-150`}
        >
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
                {Array.from({ length: 12 }, (_, i) => 2024 + i).map((y) => (
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
              className="text-gray-500 hover:text-gray-700 font-semibold cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DoctorFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  specialtiesOptions,
}: DoctorFormModalProps) {
  const [fullName, setFullName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [specialty, setSpecialty] = useState("Nội tổng quát");
  const [specialtyId, setSpecialtyId] = useState<number | undefined>(undefined);
  const [qualifications, setQualifications] = useState("");
  const [experience, setExperience] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [clinicRoom, setClinicRoom] = useState("");
  const [status, setStatus] = useState<DoctorStatus>("Đang hoạt động");

  // Leave fields
  const [leaveStartDate, setLeaveStartDate] = useState("");
  const [leaveEndDate, setLeaveEndDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");

  const [isConfirmLockOpen, setIsConfirmLockOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [prevInitialData, setPrevInitialData] = useState<Doctor | null | undefined>(undefined);
  const [prevIsOpen, setPrevIsOpen] = useState(false);

  if (initialData !== prevInitialData || isOpen !== prevIsOpen) {
    setPrevInitialData(initialData);
    setPrevIsOpen(isOpen);
    if (initialData) {
      setFullName(initialData.fullName || "");
      setAvatar(initialData.avatar || initialData.avatarUrl || "");
      setSpecialty(initialData.specialtyName || initialData.specialty || "Nội tổng quát");
      setSpecialtyId(initialData.specialtyId || undefined);
      setQualifications(initialData.qualifications || initialData.degree || "");
      setExperience(String(initialData.experience ?? initialData.experienceYears ?? ""));
      setPhone(initialData.phone || "");
      setEmail(initialData.email || initialData.userEmail || "");
      setClinicRoom(initialData.clinicRoom || "");
      setStatus(initialData.status);
      setLeaveStartDate(initialData.leaveStartDate || getTodayFormatted());
      setLeaveEndDate(initialData.leaveEndDate || getTodayFormatted());
      setLeaveReason(initialData.leaveReason || "");
    } else {
      setFullName("");
      setAvatar("");
      setSpecialty("Nội tổng quát");
      setSpecialtyId(undefined);
      setQualifications("");
      setExperience("");
      setPhone("");
      setEmail("");
      setClinicRoom("");
      setStatus("Đang hoạt động");
      setLeaveStartDate(getTodayFormatted());
      setLeaveEndDate(getTodayFormatted());
      setLeaveReason("");
    }
    setIsConfirmLockOpen(false);
  }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert("Vui lòng nhập Họ tên bác sĩ!");
      return;
    }

    if (status === "Đã khóa" && initialData?.status !== "Đã khóa") {
      setIsConfirmLockOpen(true);
      return;
    }

    doSave();
  };

  const doSave = async () => {
    try {
      setIsSubmitting(true);
      await onSave({
        doctorId: initialData?.doctorId ?? initialData?.id,
        id: initialData?.doctorId ?? initialData?.id,
        fullName: fullName.trim(),
        avatar: avatar.trim() || undefined,
        specialty,
        specialtyName: specialty,
        specialtyId: specialtyId,
        qualifications: qualifications.trim(),
        degree: qualifications.trim(),
        experience: experience.trim(),
        experienceYears: Number(experience) || 0,
        phone: phone.trim(),
        email: email.trim(),
        clinicRoom: clinicRoom.trim(),
        status,
        ratingAverage: initialData?.ratingAverage || initialData?.rating || 5.0,
        totalReviews: initialData?.totalReviews || initialData?.reviewCount || 0,
        leaveStartDate: status === "Nghỉ phép" ? leaveStartDate : undefined,
        leaveEndDate: status === "Nghỉ phép" ? leaveEndDate : undefined,
        leaveReason: status === "Nghỉ phép" ? leaveReason : undefined,
        leaveStatus: status === "Nghỉ phép" ? "Chờ duyệt" : undefined,
      });
      setIsConfirmLockOpen(false);
      onClose();
    } catch (err: any) {
      alert(err.message || "Lỗi khi lưu thông tin bác sĩ!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {initialData ? "Chỉnh sửa bác sĩ" : "Thêm bác sĩ mới"}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Nhập đầy đủ thông tin bác sĩ vào hệ thống
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Họ và tên */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="VD: BS. Nguyễn Văn Bình..."
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* Chuyên khoa */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Chuyên khoa <span className="text-rose-500">*</span>
                </label>
                <select
                  value={specialty}
                  onChange={(e) => {
                    const newSpecName = e.target.value;
                    setSpecialty(newSpecName);
                    if (specialtiesOptions && specialtiesOptions.length > 0) {
                      const matched = specialtiesOptions.find(
                        (s) => s.specialtyName.toLowerCase().trim() === newSpecName.toLowerCase().trim()
                      );
                      if (matched) {
                        setSpecialtyId(matched.specialtyId);
                      }
                    }
                  }}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white transition-all cursor-pointer font-medium"
                >
                  {((specialtiesOptions && specialtiesOptions.length > 0)
                    ? specialtiesOptions.map((s) => s.specialtyName)
                    : specialtiesList
                  ).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* URL Hình ảnh */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Link Hình ảnh Avatar (Tùy chọn)
              </label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="VD: https://images.unsplash.com/photo..."
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Trình độ chuyên môn */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Trình độ chuyên môn
                </label>
                <input
                  type="text"
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  placeholder="VD: MD, PhD..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* Kinh nghiệm */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Kinh nghiệm
                </label>
                <input
                  type="text"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="VD: 12 năm..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Số điện thoại */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Số điện thoại <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="VD: 0901234567..."
                  required
                  maxLength={10}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="VD: dr.binh@clinic.com..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Phòng khám */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Phòng khám
              </label>
              <input
                type="text"
                value={clinicRoom}
                onChange={(e) => setClinicRoom(e.target.value)}
                placeholder="VD: Phòng 101, Phòng 102..."
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            {/* Trạng thái */}
            {initialData && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Trạng thái <span className="text-rose-500">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => {
                    const newStatus = e.target.value as DoctorStatus;
                    setStatus(newStatus);
                    if (newStatus === "Nghỉ phép") {
                      if (!leaveStartDate) setLeaveStartDate(getTodayFormatted());
                      if (!leaveEndDate) setLeaveEndDate(getTodayFormatted());
                      setTimeout(() => {
                        const scrollContainer = document.querySelector(".overflow-y-auto");
                        if (scrollContainer) {
                          scrollContainer.scrollTo({
                            top: scrollContainer.scrollHeight,
                            behavior: "smooth",
                          });
                        }
                      }, 80);
                    }
                  }}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white transition-all cursor-pointer font-medium"
                >
                  <option value="Đang hoạt động">Đang hoạt động</option>
                  <option value="Ngưng hoạt động">Ngưng hoạt động</option>
                  <option value="Nghỉ phép">Nghỉ phép</option>
                  <option value="Đã khóa">Đã khóa</option>
                </select>
              </div>
            )}

            {/* Phân vùng Thông tin Nghỉ phép (CHỈ hiển thị khi status === "Nghỉ phép") */}
            {status === "Nghỉ phép" && (
              <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-base">
                  <Calendar size={20} className="text-blue-600" />
                  <span>Thông tin đơn nghỉ phép</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Ngày bắt đầu nghỉ
                    </label>
                    <CustomLeaveDatePicker
                      value={leaveStartDate || getTodayFormatted()}
                      onChange={setLeaveStartDate}
                      placeholder="DD/MM/YYYY"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Ngày kết thúc nghỉ
                    </label>
                    <CustomLeaveDatePicker
                      value={leaveEndDate || getTodayFormatted()}
                      onChange={setLeaveEndDate}
                      placeholder="DD/MM/YYYY"
                      alignRight={true}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Lý do xin nghỉ phép
                  </label>
                  <textarea
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="Nhập lý do xin nghỉ phép..."
                    rows={3}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none font-medium"
                  />
                </div>
              </div>
            )}

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
                <span>{initialData ? "Cập nhật" : "Tạo bác sĩ"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirm Lock Overlay */}
      <ConfirmLockModal
        isOpen={isConfirmLockOpen}
        doctor={{
          id: initialData?.id || 0,
          stt: initialData?.stt || 0,
          fullName: fullName || "Bác sĩ",
          avatar,
          specialty,
          qualifications,
          experience,
          email,
          clinicRoom,
          status: "Đã khóa",
        }}
        onClose={() => setIsConfirmLockOpen(false)}
        onConfirm={doSave}
      />
    </>
  );
}
