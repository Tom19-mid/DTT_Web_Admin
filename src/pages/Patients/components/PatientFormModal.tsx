import { useState, useEffect, useRef } from "react";
import {
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Save,
  AlertCircle,
  ShieldCheck,
  User,
  FileText,
} from "lucide-react";
import type {
  Patient,
  PatientStatus,
  Gender,
  VerificationStatus,
} from "../types";
import { formatGenderVi } from "../../../api/patientApi";

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
        <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 w-80 animation-fadeIn select-none">
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
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition cursor-pointer"
                title="Tháng trước"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition cursor-pointer"
                title="Tháng sau"
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

          <div className="grid grid-cols-7 gap-1">
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
                  className={`h-9 w-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-xs scale-105"
                      : "text-gray-800 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-3 mt-2.5 border-t border-gray-100 text-sm font-bold">
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
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-800 cursor-pointer font-medium"
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
  onAddToast,
}: PatientFormModalProps) {
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<Gender | string>("Nam");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [healthInsuranceNumber, setHealthInsuranceNumber] = useState("");
  const [cccdNumber, setCccdNumber] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<
    VerificationStatus | string
  >("Chờ duyệt");
  const [verifiedBy, setVerifiedBy] = useState("Lễ tân");
  const [verificationNote, setVerificationNote] = useState("");
  const [status, setStatus] = useState<PatientStatus | string>(
    "Đang hoạt động",
  );

  const [confirmType, setConfirmType] = useState<"approve" | "reject" | null>(
    null,
  );

  const [prevInitialData, setPrevInitialData] = useState<
    Patient | null | undefined
  >(undefined);
  const [prevIsOpen, setPrevIsOpen] = useState(false);

  const notifyError = (message: string) => {
    if (onAddToast) {
      onAddToast({ type: "error", message });
    } else {
      alert(message);
    }
  };

  if (initialData !== prevInitialData || isOpen !== prevIsOpen) {
    setPrevInitialData(initialData);
    setPrevIsOpen(isOpen);
    if (initialData) {
      setFullName(initialData.fullName || "");
      setDob(initialData.dob || initialData.dateOfBirth || "");
      setGender(formatGenderVi(initialData.gender) || "");
      setPhone(initialData.phone || initialData.phoneNumber || "");

      const rawAddr = initialData.address || "";
      setAddress(rawAddr === "Chưa cập nhật" ? "" : rawAddr);

      setHealthInsuranceNumber(initialData.healthInsuranceNumber || "");
      setCccdNumber(initialData.cccdNumber || "");
      setVerificationStatus(initialData.verificationStatus || "Chờ duyệt");
      setVerifiedBy("Lễ tân");
      setVerificationNote(initialData.verificationNote || "");
      setStatus(initialData.status || "Đang hoạt động");
    } else {
      setFullName("");
      setDob("");
      setGender("");
      setPhone("");
      setAddress("");
      setHealthInsuranceNumber("");
      setCccdNumber("");
      setVerificationStatus("Chờ duyệt");
      setVerifiedBy("Lễ tân");
      setVerificationNote("");
      setStatus("Đang hoạt động");
    }
    setConfirmType(null);
  }

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      notifyError("Vui lòng nhập Họ tên bệnh nhân!");
      return;
    }
    if (phone.trim().length > 0 && (phone.trim().length !== 10 || !/^\d{10}$/.test(phone.trim()))) {
      notifyError("Số điện thoại phải đúng 10 chữ số!");
      return;
    }
    if (cccdNumber.trim().length > 0 && (cccdNumber.trim().length !== 12 || !/^\d{12}$/.test(cccdNumber.trim()))) {
      notifyError("Số CCCD / CMND phải đúng 12 chữ số!");
      return;
    }

    const wasApproved =
      initialData?.verificationStatus === "Đã duyệt" ||
      initialData?.verificationStatus === "verified";
    const wasRejected =
      initialData?.verificationStatus === "Từ chối" ||
      initialData?.verificationStatus === "rejected";

    if (verificationStatus === "Đã duyệt") {
      if (!cccdNumber.trim()) {
        notifyError(
          "Vui lòng nhập số CCCD / CMND để duyệt xác thực hồ sơ bệnh nhân!",
        );
        return;
      }
      if (cccdNumber.trim().length !== 12 || !/^\d{12}$/.test(cccdNumber.trim())) {
        notifyError("Số CCCD / CMND phải đúng 12 chữ số để duyệt xác thực!");
        return;
      }
      if (!verifiedBy.trim()) {
        notifyError("Vui lòng nhập Người thực hiện xác thực!");
        return;
      }

      if (!wasApproved) {
        setConfirmType("approve");
        return;
      }
    }

    if (verificationStatus === "Từ chối") {
      if (!verifiedBy.trim()) {
        notifyError("Vui lòng nhập Người thực hiện xác thực!");
        return;
      }

      if (!wasRejected) {
        setConfirmType("reject");
        return;
      }
    }

    doSave();
  };

  const doSave = async () => {
    const nowStr = new Date().toISOString();
    try {
      await onSave({
        id: initialData?.id,
        patientId: initialData?.patientId ?? initialData?.id,
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
        verifiedAt: verificationStatus === "Chờ duyệt" ? null : nowStr,
        verifiedBy:
          verificationStatus === "Chờ duyệt"
            ? null
            : verifiedBy.trim() || "Lễ Tân",
        verificationNote:
          verificationStatus === "Chờ duyệt"
            ? null
            : verificationNote.trim() ||
              (verificationStatus === "Đã duyệt"
                ? "Đã đối chiếu thẻ CCCD thực tế"
                : "Hủy do không đủ giấy tờ"),
        createdAt: initialData?.createdAt || nowStr,
        updatedAt: nowStr,
      });
      setConfirmType(null);
      onClose();
    } catch (err) {
      notifyError(
        "Cập nhật thất bại: " +
          (err instanceof Error ? err.message : String(err)),
      );
    }
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
            {/* Error Banner */}
            {(cccdNumber.trim().length > 12 || phone.trim().length > 10) && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2.5">
                <AlertCircle size={18} className="shrink-0 text-rose-600" />
                <span className="font-medium">
                  {cccdNumber.trim().length > 12
                    ? "Số CCCD / CMND không được vượt quá 12 chữ số."
                    : "Số điện thoại không được vượt quá 10 chữ số."}
                </span>
              </div>
            )}

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
                  <option value="">-- Chọn giới tính --</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
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
                  maxLength={10}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="Nhập số điện thoại (10 số)..."
                  className={`w-full border rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none transition-all ${
                    phone.trim().length > 0 && phone.trim().length !== 10
                      ? "border-rose-500 ring-2 ring-rose-500/20"
                      : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  }`}
                />
                {phone.trim().length > 0 && phone.trim().length !== 10 && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">
                    Số điện thoại phải đúng 10 chữ số (hiện tại: {phone.trim().length}/10 số).
                  </p>
                )}
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
                  Số CCCD / CMND (12 số)
                </label>
                <input
                  type="text"
                  value={cccdNumber}
                  maxLength={12}
                  onChange={(e) => setCccdNumber(e.target.value.replace(/\D/g, "").slice(0, 12))}
                  placeholder="VD: 079200000001..."
                  className={`w-full border rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none transition-all ${
                    cccdNumber.trim().length > 0 && cccdNumber.trim().length !== 12
                      ? "border-rose-500 ring-2 ring-rose-500/20"
                      : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  }`}
                />
                {cccdNumber.trim().length > 0 && cccdNumber.trim().length !== 12 && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">
                    Số CCCD / CMND phải đúng 12 chữ số (hiện tại: {cccdNumber.trim().length}/12 số).
                  </p>
                )}
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
                  placeholder="Nhập địa chỉ thường trú"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Trạng thái xác thực */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Trạng thái xác thực hồ sơ{" "}
                <span className="text-rose-500">*</span>
              </label>
              <select
                value={verificationStatus}
                onChange={(e) => {
                  const nextStatus = e.target.value as VerificationStatus;
                  setVerificationStatus(nextStatus);
                  if (nextStatus === "Chờ duyệt") {
                    setVerificationNote("");
                  }
                }}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white transition-all cursor-pointer font-medium"
              >
                <option value="Chờ duyệt">Chờ duyệt</option>
                <option value="Đã duyệt">Đã duyệt</option>
                <option value="Từ chối">Từ chối</option>
              </select>
            </div>

            {/* Khi chọn 'Đã duyệt' hoặc 'Từ chối' -> Mở rộng khung thông tin xác thực */}
            {(verificationStatus === "Đã duyệt" ||
              verificationStatus === "Từ chối") && (
              <div
                className={`p-5 rounded-2xl space-y-4 shadow-2xs animate-in fade-in zoom-in-95 duration-150 border ${
                  verificationStatus === "Đã duyệt"
                    ? "bg-emerald-50/70 border-emerald-300/80"
                    : "bg-rose-50/70 border-rose-300/80"
                }`}
              >
                <h4
                  className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${
                    verificationStatus === "Đã duyệt"
                      ? "text-emerald-800"
                      : "text-rose-800"
                  }`}
                >
                  {verificationStatus === "Đã duyệt" ? (
                    <>
                      <ShieldCheck size={18} className="text-emerald-600" />
                      Thông tin phê duyệt xác thực CCCD
                    </>
                  ) : (
                    <>
                      <AlertCircle size={18} className="text-rose-600" />
                      Thông tin từ chối xác thực hồ sơ
                    </>
                  )}
                </h4>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1.5 flex items-center gap-1.5">
                    <User
                      size={16}
                      className={
                        verificationStatus === "Đã duyệt"
                          ? "text-emerald-700"
                          : "text-rose-700"
                      }
                    />
                    Người thực hiện xác thực <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={verifiedBy || "Lễ tân"}
                    onChange={(e) => setVerifiedBy(e.target.value)}
                    className="w-full p-3 bg-white border border-gray-300/90 rounded-xl text-base font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition shadow-2xs cursor-pointer"
                  >
                    <option value="Lễ tân">Lễ tân</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1.5 flex items-center gap-1.5">
                    <FileText
                      size={16}
                      className={
                        verificationStatus === "Đã duyệt"
                          ? "text-emerald-700"
                          : "text-rose-700"
                      }
                    />
                    Ghi chú xác thực (tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={verificationNote}
                    onChange={(e) => setVerificationNote(e.target.value)}
                    placeholder="Nhập ghi chú xác thực nếu có..."
                    className="w-full p-3 bg-white border border-gray-300/90 rounded-xl text-base font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition shadow-2xs"
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
                <span>{initialData ? "Cập nhật" : "Tạo bệnh nhân"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal for Verification (Approve or Reject) */}
      {confirmType && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setConfirmType(null)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg transition cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center py-2">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 shrink-0 ${
                  confirmType === "approve"
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-rose-100 text-rose-600"
                }`}
              >
                <AlertCircle size={30} />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {confirmType === "approve"
                  ? "Xác nhận duyệt hồ sơ"
                  : "Xác nhận từ chối hồ sơ"}
              </h3>

              <p className="text-base text-gray-600 mb-6 leading-relaxed">
                {confirmType === "approve"
                  ? "Bạn có chắc chắn muốn duyệt bệnh nhân này không?"
                  : "Bạn có chắc chắn muốn Từ chối duyệt bệnh nhân này không?"}
              </p>

              <div className="flex items-center justify-center gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setConfirmType(null)}
                  className="w-1/2 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition cursor-pointer text-base"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={doSave}
                  className={`w-1/2 py-2.5 text-white font-bold rounded-xl shadow-sm transition cursor-pointer text-base ${
                    confirmType === "approve"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  Đồng ý
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
