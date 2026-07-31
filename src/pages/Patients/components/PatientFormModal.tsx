import { useState, useEffect, useRef } from "react";
import { X, Calendar, ChevronLeft, ChevronRight, Save } from "lucide-react";
import type { Patient, PatientStatus, Gender, VerificationStatus } from "../types";
import ConfirmLockModal from "./ConfirmLockModal";

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patientData: Omit<Patient, "id"> & { id?: number }) => void;
  initialData?: Patient | null;
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

  useEffect(() => {
    setViewDate(parseDate(value));
  }, [value, isOpen]);

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
          placeholder="Chọn ngày sinh (VD: 15/03/1985)"
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 pr-11 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer bg-white font-medium"
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
        <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 w-88 animation-fadeIn select-none">
          {/* Header Month/Year Selector */}
          <div className="flex items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-2">
              <select
                value={currentMonth}
                onChange={(e) =>
                  setViewDate(new Date(currentYear, Number(e.target.value), 1))
                }
                className="font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl px-3 py-2 text-base outline-none cursor-pointer transition-colors"
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
                className="font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl px-3 py-2 text-base outline-none cursor-pointer transition-colors"
              >
                {Array.from({ length: 100 }, (_, i) => 2026 - i).map((y) => (
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
                className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition cursor-pointer"
                title="Tháng trước"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition cursor-pointer"
                title="Tháng sau"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-gray-500 text-base mb-2">
            {dayNames.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
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
                  className={`h-10 w-10 flex items-center justify-center rounded-xl text-base font-bold transition-all cursor-pointer ${
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
          <div className="flex items-center justify-between pt-4 mt-3 border-t border-gray-100 text-base">
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

export default function PatientFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: PatientFormModalProps) {
  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<Gender>("Nam");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [healthInsuranceNumber, setHealthInsuranceNumber] = useState("");
  const [cccdNumber, setCccdNumber] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("Chờ duyệt");
  const [status, setStatus] = useState<PatientStatus>("Đang hoạt động");
  const [isConfirmLockOpen, setIsConfirmLockOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code);
      setFullName(initialData.fullName);
      setDob(initialData.dob);
      setGender(initialData.gender || "Nam");
      setPhone(initialData.phone);
      setAddress(initialData.address || "");
      setHealthInsuranceNumber(initialData.healthInsuranceNumber || "");
      setCccdNumber(initialData.cccdNumber || "");
      setVerificationStatus(initialData.verificationStatus || "Chờ duyệt");
      setStatus(initialData.status);
    } else {
      setCode("");
      setFullName("");
      setDob("");
      setGender("Nam");
      setPhone("");
      setAddress("");
      setHealthInsuranceNumber("");
      setCccdNumber("");
      setVerificationStatus("Chờ duyệt");
      setStatus("Đang hoạt động");
    }
    setIsConfirmLockOpen(false);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert("Vui lòng nhập Họ tên bệnh nhân!");
      return;
    }

    if (status === "Đã khóa" && initialData?.status !== "Đã khóa") {
      setIsConfirmLockOpen(true);
      return;
    }

    doSave();
  };

  const doSave = () => {
    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);
    onSave({
      id: initialData?.id,
      patient_id: initialData?.patient_id || initialData?.id,
      code: code.trim() || `#00000${Math.floor(Math.random() * 90) + 10}`,
      fullName: fullName.trim(),
      dob: dob.trim(),
      gender,
      address: address.trim(),
      healthInsuranceNumber: healthInsuranceNumber.trim(),
      cccdNumber: cccdNumber.trim(),
      phone: phone.trim(),
      specialty: initialData?.specialty || "Nội khoa",
      status: verificationStatus === "Từ chối" ? "Đã khóa" : status,
      verificationStatus,
      verifiedAt: verificationStatus === "Chờ duyệt" ? null : (initialData?.verifiedAt || nowStr),
      verifiedBy: verificationStatus === "Chờ duyệt" ? null : (initialData?.verifiedBy || "Lễ tân"),
      verificationNote: initialData?.verificationNote || (verificationStatus === "Đã duyệt" ? "Đã xác minh đầy đủ thông tin." : verificationStatus === "Từ chối" ? "Thông tin chưa hợp lệ." : null),
      createdAt: initialData?.createdAt || nowStr,
      updatedAt: nowStr,
    });
    setIsConfirmLockOpen(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {initialData ? "Chỉnh sửa bệnh nhân" : "Tạo bệnh nhân mới"}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Nhập đầy đủ thông tin bệnh nhân vào hệ thống
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
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mã bệnh nhân */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Mã bệnh nhân
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="VD: #000009 (Để trống tự tạo)"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* Họ và tên */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên bệnh nhân..."
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Ngày sinh */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Ngày sinh <span className="text-rose-500">*</span>
                </label>
                <CustomDatePicker value={dob} onChange={setDob} />
              </div>

              {/* Giới tính */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Giới tính <span className="text-rose-500">*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white transition-all cursor-pointer font-medium"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Số điện thoại */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nhập số điện thoại..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* Số thẻ BHYT */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Số thẻ BHYT
                </label>
                <input
                  type="text"
                  value={healthInsuranceNumber}
                  onChange={(e) => setHealthInsuranceNumber(e.target.value)}
                  placeholder="VD: BHYT000001..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Số CCCD / CMND */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Số CCCD / CMND
                </label>
                <input
                  type="text"
                  value={cccdNumber}
                  onChange={(e) => setCccdNumber(e.target.value)}
                  placeholder="VD: 079200000001..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* Địa chỉ */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Địa chỉ thường trú
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="VD: Quận 1, TP. Hồ Chí Minh..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Trạng thái xác thực */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Trạng thái xác thực hồ sơ <span className="text-rose-500">*</span>
              </label>
              <select
                value={verificationStatus}
                onChange={(e) => setVerificationStatus(e.target.value as VerificationStatus)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white transition-all cursor-pointer font-medium"
              >
                <option value="Chờ duyệt">Chờ duyệt</option>
                <option value="Đã duyệt">Đã duyệt</option>
                <option value="Từ chối">Từ chối</option>
              </select>
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
                <span>{initialData ? "Cập nhật" : "Tạo bệnh nhân"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Lock Confirmation Modal overlay over Edit form */}
      <ConfirmLockModal
        isOpen={isConfirmLockOpen}
        patient={{
          id: initialData?.id || 0,
          code: code || initialData?.code || "#000000",
          fullName: fullName || "Bệnh nhân",
          dob,
          gender,
          address,
          healthInsuranceNumber,
          cccdNumber,
          phone,
          specialty: initialData?.specialty || "Nội khoa",
          status: "Đã khóa",
          verificationStatus: "Từ chối",
          verifiedAt: initialData?.verifiedAt || null,
          verifiedBy: initialData?.verifiedBy || null,
          verificationNote: initialData?.verificationNote || null,
          createdAt: initialData?.createdAt || "",
          updatedAt: initialData?.updatedAt || "",
        }}
        onClose={() => setIsConfirmLockOpen(false)}
        onConfirm={doSave}
      />
    </>
  );
}
