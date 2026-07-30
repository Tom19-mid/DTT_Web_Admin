import { useState } from "react";
import { X, Save } from "lucide-react";
import type { Doctor, DoctorStatus } from "../types";
import ConfirmLockModal from "./ConfirmLockModal";

interface DoctorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (doctorData: Omit<Doctor, "id" | "stt"> & { id?: number }) => void;
  initialData?: Doctor | null;
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
];

export default function DoctorFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: DoctorFormModalProps) {
  const [fullName, setFullName] = useState("");
  const [specialty, setSpecialty] = useState("Tim mạch");
  const [qualifications, setQualifications] = useState("");
  const [experience, setExperience] = useState("");
  const [email, setEmail] = useState("");
  const [clinicRoom, setClinicRoom] = useState("");
  const [status, setStatus] = useState<DoctorStatus>("Đang hoạt động");
  const [isConfirmLockOpen, setIsConfirmLockOpen] = useState(false);

  const [prevInitialData, setPrevInitialData] = useState<Doctor | null | undefined>(undefined);
  const [prevIsOpen, setPrevIsOpen] = useState(false);

  if (initialData !== prevInitialData || isOpen !== prevIsOpen) {
    setPrevInitialData(initialData);
    setPrevIsOpen(isOpen);
    if (initialData) {
      setFullName(initialData.fullName);
      setSpecialty(initialData.specialty);
      setQualifications(initialData.qualifications);
      setExperience(initialData.experience);
      setEmail(initialData.email);
      setClinicRoom(initialData.clinicRoom || "");
      setStatus(initialData.status);
    } else {
      setFullName("");
      setSpecialty("Tim mạch");
      setQualifications("");
      setExperience("");
      setEmail("");
      setClinicRoom("");
      setStatus("Đang hoạt động");
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

    // If status changed to "Đã khóa" and it wasn't locked previously
    if (status === "Đã khóa" && initialData?.status !== "Đã khóa") {
      setIsConfirmLockOpen(true);
      return;
    }

    doSave();
  };

  const doSave = () => {
    onSave({
      id: initialData?.id,
      fullName: fullName.trim(),
      specialty,
      qualifications: qualifications.trim(),
      experience: experience.trim(),
      email: email.trim(),
      clinicRoom: clinicRoom.trim(),
      status,
    });
    setIsConfirmLockOpen(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 relative animate-in fade-in zoom-in duration-200">
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
                  placeholder="VD: BS. Nguyen Van Binh..."
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
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white transition-all cursor-pointer font-medium"
                >
                  {specialtiesList.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
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
                  placeholder="VD: MD, PhD hoặc Thạc sĩ, Bác sĩ CKI..."
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
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="VD: dr.binh@clinic.com..."
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
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
                  placeholder="VD: P01, Room 102..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Status shown only when editing */}
            {initialData && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Trạng thái <span className="text-rose-500">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as DoctorStatus)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white transition-all cursor-pointer font-medium"
                >
                  <option value="Đang hoạt động">Đang hoạt động</option>
                  <option value="Ngưng hoạt động">Ngưng hoạt động</option>
                  <option value="Nghỉ phép">Nghỉ phép</option>
                  <option value="Đã khóa">Đã khóa</option>
                </select>
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
