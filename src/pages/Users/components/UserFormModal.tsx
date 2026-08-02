import { useState, useEffect } from "react";
import { X, Save as SaveIcon } from "lucide-react";
import type { User, UserRole, UserStatus } from "../types";
import ConfirmLockModal from "./ConfirmLockModal";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Omit<User, "id" | "stt"> & { id?: number }) => void;
  initialData?: User | null;
}

export default function UserFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: UserFormModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("Admin");
  const [status, setStatus] = useState<UserStatus>("Đang hoạt động");
  const [isConfirmLockOpen, setIsConfirmLockOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFullName(initialData.fullName);
      setEmail(initialData.email);
      setPhone(initialData.phone);
      setRole(initialData.role);
      setStatus(initialData.status);
    } else {
      setFullName("");
      setEmail("");
      setPhone("");
      setRole("Admin");
      setStatus("Đang hoạt động");
    }
    setIsConfirmLockOpen(false);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      alert("Vui lòng nhập Email!");
      return;
    }

    // If status is changed to "Đã khóa" and it wasn't locked previously
    if (status === "Đã khóa" && initialData?.status !== "Đã khóa") {
      setIsConfirmLockOpen(true);
      return;
    }

    doSave();
  };

  const doSave = () => {
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, "0")}/${String(
      today.getMonth() + 1
    ).padStart(2, "0")}/${today.getFullYear()}`;

    onSave({
      id: initialData?.id,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role,
      status,
      createdAt: initialData?.createdAt || formattedDate,
      lastLogin: initialData?.lastLogin || formattedDate,
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
                {initialData ? "Chỉnh sửa tài khoản" : "Tạo tài khoản mới"}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Nhập đầy đủ thông tin tài khoản người dùng vào hệ thống
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
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email..."
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Vai trò */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Vai trò <span className="text-rose-500">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white transition-all cursor-pointer font-medium"
                >
                  <option value="Admin">Admin</option>
                  <option value="Bệnh nhân">Bệnh nhân</option>
                  <option value="Bác sĩ">Bác sĩ</option>
                </select>
              </div>

              {/* Trạng thái (hiển thị khi chỉnh sửa) */}
              {initialData ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Trạng thái <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as UserStatus)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white transition-all cursor-pointer font-medium"
                  >
                    <option value="Đang hoạt động">Đang hoạt động</option>
                    <option value="Ngưng hoạt động">Ngưng hoạt động</option>
                    <option value="Đã khóa">Đã khóa</option>
                  </select>
                </div>
              ) : (
                <div />
              )}
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
                <SaveIcon size={18} />
                <span>{initialData ? "Cập nhật" : "Tạo tài khoản"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirm Lock Overlay */}
      <ConfirmLockModal
        isOpen={isConfirmLockOpen}
        user={{
          id: initialData?.id || 0,
          stt: initialData?.stt || 0,
          fullName: fullName || "Tài khoản",
          email: email || "",
          phone,
          role,
          createdAt: initialData?.createdAt || "",
          lastLogin: initialData?.lastLogin || "",
          status: "Đã khóa",
        }}
        onClose={() => setIsConfirmLockOpen(false)} // Bấm Hủy -> Quay về form chỉnh sửa!
        onConfirm={doSave} // Bấm Khóa -> Khóa tài khoản và lưu!
      />
    </>
  );
}
