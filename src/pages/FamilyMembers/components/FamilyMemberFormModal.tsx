import { useState, useEffect, useRef } from "react";
import {
  X,
  HeartHandshake,
  Loader2,
  UserCheck,
  AlertCircle,
  ShieldCheck,
  User,
  FileText,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { FamilyMember } from "../types";
import type { PatientOwnerOption } from "../../../api/familyMemberApi";

interface FamilyMemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: any) => Promise<void>;
  initialData?: FamilyMember | null;
  patientOwners: PatientOwnerOption[];
}

const relationshipOptions = [
  "Bố",
  "Mẹ",
  "Vợ",
  "Chồng",
  "Con",
  "Anh",
  "Chị",
  "Em",
  "Ông",
  "Bà",
  "Khác",
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

function CustomDatePicker({
  value,
  onChange,
  placeholder = "Chọn ngày sinh (VD: 15/03/1985)",
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
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
          placeholder={placeholder}
          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 pr-11 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer font-medium"
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

export default function FamilyMemberFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  patientOwners,
}: FamilyMemberFormModalProps) {
  const isEdit = !!initialData;

  const [ownerPatientId, setOwnerPatientId] = useState<number | string>("");
  const [fullName, setFullName] = useState("");
  const [relationship, setRelationship] = useState("Bố");
  const [customRelationship, setCustomRelationship] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Nam");
  const [phone, setPhone] = useState("");
  const [cccdNumber, setCccdNumber] = useState("");
  const [healthInsuranceNumber, setHealthInsuranceNumber] = useState("");
  const [address, setAddress] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("Chờ duyệt");
  const [verifiedBy, setVerifiedBy] = useState("Lễ tân");
  const [verificationNote, setVerificationNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const prevIsOpenRef = useRef(false);
  const prevInitialDataRef = useRef<FamilyMember | null | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      const isFirstOpen = !prevIsOpenRef.current;
      const isDataChanged = initialData !== prevInitialDataRef.current;

      if (isFirstOpen || isDataChanged) {
        prevIsOpenRef.current = true;
        prevInitialDataRef.current = initialData;

        if (initialData) {
          setOwnerPatientId(initialData.ownerPatientId || "");
          setFullName(initialData.fullName || "");
          let rel = initialData.relationship || "Bố";
          if (rel.toLowerCase() === "cha") rel = "Bố";

          if (relationshipOptions.includes(rel)) {
            setRelationship(rel);
            setCustomRelationship("");
          } else {
            setRelationship("Khác");
            setCustomRelationship(rel);
          }

          // Format date input sang dd/MM/yyyy
          const rawDob = initialData.dob || initialData.dateOfBirth || "";
          if (rawDob && rawDob.includes("-")) {
            const parts = rawDob.split("-");
            if (parts.length === 3) {
              setDob(
                `${parts[2].padStart(2, "0")}/${parts[1].padStart(2, "0")}/${parts[0]}`,
              );
            } else {
              setDob(rawDob);
            }
          } else {
            setDob(rawDob);
          }

          setGender(initialData.gender || "Nam");
          setPhone(initialData.phone || initialData.phoneNumber || "");
          setCccdNumber(initialData.cccdNumber || "");
          setHealthInsuranceNumber(initialData.healthInsuranceNumber || "");
          setAddress(initialData.address || "");

          const ver = initialData.verificationStatus || "Chờ duyệt";
          setVerificationStatus(ver);
          setVerifiedBy(initialData.verifiedBy || "Lễ tân");
          setVerificationNote(initialData.verificationNote || "");
        } else {
          const today = new Date();
          const dStr = String(today.getDate()).padStart(2, "0");
          const mStr = String(today.getMonth() + 1).padStart(2, "0");
          const yStr = String(today.getFullYear());
          const todayFormatted = `${dStr}/${mStr}/${yStr}`;

          setOwnerPatientId(
            patientOwners.length > 0 ? patientOwners[0].patientId : "",
          );
          setFullName("");
          setRelationship("Bố");
          setCustomRelationship("");
          setDob(todayFormatted);
          setGender("Nam");
          setPhone("");
          setCccdNumber("");
          setHealthInsuranceNumber("");
          setAddress("");
          setVerificationStatus("Chờ duyệt");
          setVerifiedBy("Lễ tân");
          setVerificationNote("");
        }
        setErrors({});
      }
    } else {
      prevIsOpenRef.current = false;
    }
  }, [initialData, isOpen, patientOwners]);

  // Nếu mở modal tạo mới và chưa có ownerPatientId nhưng patientOwners vừa được load xong
  useEffect(() => {
    if (isOpen && !initialData && !ownerPatientId && patientOwners.length > 0) {
      setOwnerPatientId(patientOwners[0].patientId);
    }
  }, [isOpen, initialData, ownerPatientId, patientOwners]);

  // Khi chọn sang Đã duyệt hoặc Từ chối -> chỉ chuẩn bị người thực hiện nếu chưa có, KHÔNG tự ý ghi đè ghi chú
  const handleVerificationStatusChange = (newStatus: string) => {
    setVerificationStatus(newStatus);
    if (newStatus === "Đã duyệt" || newStatus === "Từ chối") {
      if (!verifiedBy) setVerifiedBy("Lễ tân");
    }
  };

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!isEdit && (!ownerPatientId || Number(ownerPatientId) <= 0)) {
      errs.ownerPatientId = "Vui lòng chọn Bệnh nhân chính sở hữu hồ sơ.";
    }

    if (!fullName.trim()) {
      errs.fullName = "Họ và tên không được để trống.";
    }

    if (relationship === "Khác" && !customRelationship.trim()) {
      errs.relationship = "Vui lòng nhập mối quan hệ cụ thể.";
    }

    if (
      phone.trim().length > 0 &&
      (phone.trim().length !== 10 || !/^\d{10}$/.test(phone.trim()))
    ) {
      errs.phone = "Số điện thoại phải đúng 10 chữ số.";
    }

    if (
      cccdNumber.trim().length > 0 &&
      (cccdNumber.trim().length !== 12 || !/^\d{12}$/.test(cccdNumber.trim()))
    ) {
      errs.cccdNumber = "Số CCCD / CMND phải đúng 12 chữ số.";
    }

    if (verificationStatus === "Đã duyệt") {
      if (!cccdNumber.trim()) {
        errs.cccdNumber = "Vui lòng nhập số CCCD / CMND để duyệt xác thực.";
      } else if (
        cccdNumber.trim().length !== 12 ||
        !/^\d{12}$/.test(cccdNumber.trim())
      ) {
        errs.cccdNumber = "Số CCCD / CMND phải đúng 12 chữ số.";
      }
    }

    if (verificationStatus === "Đã duyệt" || verificationStatus === "Từ chối") {
      if (!verifiedBy.trim()) {
        errs.verifiedBy = "Vui lòng chọn người thực hiện xác thực.";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const finalRelationship =
        relationship === "Khác" ? customRelationship.trim() : relationship;

      let formattedDob = dob;
      if (dob && dob.includes("-")) {
        const [y, m, d] = dob.split("-");
        formattedDob = `${d}/${m}/${y}`;
      }

      const isApproved =
        verificationStatus === "Đã duyệt" || verificationStatus === "verified";
      const isRejected =
        verificationStatus === "Từ chối" || verificationStatus === "rejected";
      const nowIso = new Date().toISOString();

      await onSave({
        id: initialData?.id,
        realId: initialData?.id,
        memberId: initialData?.id,
        ownerPatientId: Number(ownerPatientId),
        fullName: fullName.trim(),
        relationship: finalRelationship,
        dob: formattedDob,
        dateOfBirth: dob,
        gender: gender,
        phone: phone.trim(),
        phoneNumber: phone.trim(),
        cccd: cccdNumber.trim(),
        cccdNumber: cccdNumber.trim(),
        bhyt: healthInsuranceNumber.trim(),
        healthInsuranceNumber: healthInsuranceNumber.trim(),
        address: address.trim(),
        verificationStatus: verificationStatus,
        verifiedBy:
          isApproved || isRejected ? verifiedBy.trim() || "Lễ tân" : undefined,
        verificationNote: verificationNote.trim(),
        verifiedAt: isApproved || isRejected ? nowIso : undefined,
      });

      onClose();
    } catch (err: any) {
      console.error("Lỗi khi lưu người thân:", err);
      setErrors((prev) => ({
        ...prev,
        form: err?.message || "Lỗi khi lưu thông tin. Vui lòng thử lại.",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-xs">
              <HeartHandshake size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isEdit
                  ? "Chỉnh sửa hồ sơ người thân"
                  : "Thêm hồ sơ người thân mới"}
              </h2>
              <p className="text-sm text-gray-500">
                {isEdit
                  ? `Mã hồ sơ: ${initialData?.id || initialData?.code}`
                  : "Liên kết hồ sơ người thân vào tài khoản Bệnh nhân chính"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        {/* Real-time Error Banner */}
        {(cccdNumber.trim().length > 12 || phone.trim().length > 10) && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium flex items-center gap-2.5 animate-in fade-in duration-150">
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
            <span>
              {cccdNumber.trim().length > 12
                ? "Số CCCD / CMND không được vượt quá 12 chữ số."
                : "Số điện thoại không được vượt quá 10 chữ số."}
            </span>
          </div>
        )}

        {/* Global error banner if any */}
        {errors.form && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errors.form}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Bệnh nhân chính sở hữu */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1.5">
              <UserCheck size={16} className="text-blue-600" />
              Bệnh nhân chính (Chủ tài khoản){" "}
              <span className="text-rose-500">*</span>
            </label>
            {isEdit ? (
              <div className="px-4 py-2.5 bg-gray-50/70 border border-gray-300 rounded-xl text-base font-bold text-gray-900">
                {initialData?.ownerFullName || "lenhattan"}
              </div>
            ) : (
              <select
                value={ownerPatientId}
                onChange={(e) => setOwnerPatientId(e.target.value)}
                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-base font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer ${
                  errors.ownerPatientId ? "border-rose-400 ring-2 ring-rose-400/20" : "border-gray-300"
                }`}
              >
                <option value="">-- Chọn bệnh nhân chính --</option>
                {patientOwners.map((p) => (
                  <option key={p.patientId} value={p.patientId}>
                    {p.fullName}
                  </option>
                ))}
              </select>
            )}
            {errors.ownerPatientId && (
              <p className="text-rose-500 text-xs font-semibold mt-1">
                {errors.ownerPatientId}
              </p>
            )}
          </div>

          {/* 2. Họ và tên & Mối quan hệ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Họ và tên người thân <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="VD: NGUYỄN VĂN A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-base font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition uppercase ${
                  errors.fullName ? "border-rose-400 ring-2 ring-rose-400/20" : "border-gray-300"
                }`}
              />
              {errors.fullName && (
                <p className="text-rose-500 text-xs font-semibold mt-1">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Mối quan hệ <span className="text-rose-500">*</span>
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-base font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
              >
                {relationshipOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {relationship === "Khác" && (
                <input
                  type="text"
                  placeholder="Nhập mối quan hệ (VD: Cô, Dì, Chú, Bác...)"
                  value={customRelationship}
                  onChange={(e) => setCustomRelationship(e.target.value)}
                  className={`mt-2 w-full px-4 py-2.5 bg-white border rounded-xl text-base font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition ${
                    errors.relationship ? "border-rose-400 ring-2 ring-rose-400/20" : "border-gray-300"
                  }`}
                />
              )}
              {errors.relationship && (
                <p className="text-rose-500 text-xs font-semibold mt-1">
                  {errors.relationship}
                </p>
              )}
            </div>
          </div>

          {/* 3. Ngày sinh & Giới tính */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Ngày sinh
              </label>
              <CustomDatePicker
                value={dob}
                onChange={setDob}
                placeholder="Chọn ngày sinh (VD: 15/03/1985)"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Giới tính
              </label>
              <div className="flex items-center gap-6 mt-2.5">
                {["Nam", "Nữ", "Khác"].map((g) => (
                  <label
                    key={g}
                    className="flex items-center gap-2 font-semibold text-gray-700 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={gender === g}
                      onChange={() => setGender(g)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{g}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Số điện thoại & Số CCCD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Số điện thoại (nếu có)
              </label>
              <input
                type="text"
                placeholder="VD: 0912345678"
                value={phone}
                maxLength={10}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setPhone(val);
                  if (errors.phone && val.length === 10) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.phone;
                      return copy;
                    });
                  }
                }}
                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-base font-medium text-gray-900 outline-none transition ${
                  (phone.trim().length > 0 && phone.trim().length !== 10) ||
                  errors.phone
                    ? "border-rose-500 ring-2 ring-rose-500/20"
                    : "border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                }`}
              />
              {phone.trim().length > 0 && phone.trim().length !== 10 ? (
                <p className="text-xs text-rose-500 mt-1 font-medium">
                  Số điện thoại phải đúng 10 chữ số (hiện tại:{" "}
                  {phone.trim().length}/10 số).
                </p>
              ) : errors.phone ? (
                <p className="text-rose-500 text-xs font-semibold mt-1">
                  {errors.phone}
                </p>
              ) : null}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Số CCCD / CMND (12 số)
              </label>
              <input
                type="text"
                placeholder="VD: 079198001234"
                value={cccdNumber}
                maxLength={12}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 12);
                  setCccdNumber(val);
                  if (errors.cccdNumber && val.length === 12) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.cccdNumber;
                      return copy;
                    });
                  }
                }}
                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-base font-medium text-gray-900 outline-none transition ${
                  (cccdNumber.trim().length > 0 &&
                    cccdNumber.trim().length !== 12) ||
                  errors.cccdNumber
                    ? "border-rose-500 ring-2 ring-rose-500/20"
                    : "border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                }`}
              />
              {cccdNumber.trim().length > 0 &&
              cccdNumber.trim().length !== 12 ? (
                <p className="text-xs text-rose-500 mt-1 font-medium">
                  Số CCCD / CMND phải đúng 12 chữ số (hiện tại:{" "}
                  {cccdNumber.trim().length}/12 số).
                </p>
              ) : errors.cccdNumber ? (
                <p className="text-rose-500 text-xs font-semibold mt-1">
                  {errors.cccdNumber}
                </p>
              ) : null}
            </div>
          </div>

          {/* 5. Mã thẻ BHYT & Trạng thái xác thực */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Số thẻ BHYT (nếu có)
              </label>
              <input
                type="text"
                placeholder="VD: BHYT0000001"
                value={healthInsuranceNumber}
                onChange={(e) => setHealthInsuranceNumber(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-base font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition uppercase"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Trạng thái xác thực hồ sơ
              </label>
              <select
                value={verificationStatus}
                onChange={(e) => handleVerificationStatusChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-base font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
              >
                <option value="Chờ duyệt">Chờ duyệt</option>
                <option value="Đã duyệt">Đã duyệt</option>
                <option value="Từ chối">Từ chối</option>
              </select>
            </div>
          </div>

          {/* 6. Khi chọn 'Đã duyệt' hoặc 'Từ chối' -> Mở rộng trường Người thực hiện và Ghi chú xác thực */}
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
                  Người thực hiện xác thực{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <select
                  value={verifiedBy || "Lễ tân"}
                  onChange={(e) => setVerifiedBy(e.target.value)}
                  className="w-full p-3 bg-white border border-gray-300/90 rounded-xl text-base font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition shadow-2xs cursor-pointer"
                >
                  <option value="Lễ tân">Lễ tân</option>
                </select>
                {errors.verifiedBy && (
                  <p className="text-rose-500 text-xs font-semibold mt-1">
                    {errors.verifiedBy}
                  </p>
                )}
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

          {/* 7. Địa chỉ thường trú */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Địa chỉ thường trú
            </label>
            <textarea
              rows={2}
              placeholder="VD: Số 123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-base font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-100 transition cursor-pointer text-base"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50 text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>{isEdit ? "Lưu thay đổi" : "Thêm hồ sơ"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
