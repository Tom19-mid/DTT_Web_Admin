import { useState } from "react";
import { X } from "lucide-react";
import type { Specialty, SpecialtyStatus } from "../types";
import ConfirmLockModal from "./ConfirmLockModal";

interface SpecialtyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (specialtyData: Omit<Specialty, "id" | "stt"> & { id?: number }) => void;
  initialData?: Specialty | null;
}

export default function SpecialtyFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: SpecialtyFormModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [doctorCount, setDoctorCount] = useState<number>(0);
  const [status, setStatus] = useState<SpecialtyStatus>("Đang hoạt động");
  const [isConfirmLockOpen, setIsConfirmLockOpen] = useState(false);

  const [prevInitialData, setPrevInitialData] = useState<Specialty | null | undefined>(undefined);
  const [prevIsOpen, setPrevIsOpen] = useState(false);

  if (initialData !== prevInitialData || isOpen !== prevIsOpen) {
    setPrevInitialData(initialData);
    setPrevIsOpen(isOpen);
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
      setDoctorCount(initialData.doctorCount);
      setStatus(initialData.status);
    } else {
      setName("");
      setDescription("");
      setDoctorCount(0);
      setStatus("Đang hoạt động");
    }
    setIsConfirmLockOpen(false);
  }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Vui lòng nhập Tên chuyên khoa!");
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
      name: name.trim(),
      description: description.trim(),
      doctorCount: Number(doctorCount) || 0,
      status,
    });
    setIsConfirmLockOpen(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animation-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">
              {initialData ? "Chỉnh sửa chuyên khoa" : "Thêm chuyên khoa mới"}
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tên chuyên khoa
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Nội khoa, Tim mạch..."
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả chuyên khoa..."
                rows={3}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
              />
            </div>



            {/* Status shown only when editing */}
            {initialData && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as SpecialtyStatus)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white transition-all cursor-pointer"
                >
                  <option value="Đang hoạt động">Đang hoạt động</option>
                  <option value="Ngưng hoạt động">Ngưng hoạt động</option>
                  <option value="Đã khóa">Đã khóa</option>
                </select>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition cursor-pointer text-base"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition cursor-pointer text-base"
              >
                Lưu
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirm Lock Overlay */}
      <ConfirmLockModal
        isOpen={isConfirmLockOpen}
        specialty={{
          id: initialData?.id || 0,
          stt: initialData?.stt || 0,
          name: name || "Chuyên khoa",
          description,
          doctorCount,
          status: "Đã khóa",
        }}
        onClose={() => setIsConfirmLockOpen(false)}
        onConfirm={doSave}
      />
    </>
  );
}
