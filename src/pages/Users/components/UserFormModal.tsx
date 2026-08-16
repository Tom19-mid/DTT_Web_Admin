import { useState } from "react";
import { X, Save as SaveIcon, AlertCircle, Loader2 } from "lucide-react";
import type { User, UserRole, UserStatus } from "../types";
import ConfirmLockModal from "./ConfirmLockModal";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    userData: Omit<User, "id" | "stt"> & { id?: string | number },
  ) => Promise<void>;
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
  const [role, setRole] = useState<UserRole | string>("Admin");
  const [status, setStatus] = useState<UserStatus | string>("Đang hoạt động");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmLockOpen, setIsConfirmLockOpen] = useState(false);

  const [prevInitialData, setPrevInitialData] = useState<
    User | null | undefined
  >(undefined);
  const [prevIsOpen, setPrevIsOpen] = useState(false);

  const normalizeRole = (r?: string, roleId?: number): string => {
    if (roleId === 1 || r === "Quản trị viên" || r === "Admin") return "Admin";
    if (roleId === 2 || r === "Bác sĩ" || r === "Doctor") return "Bác sĩ";
    if (roleId === 3 || r === "Bệnh nhân" || r === "Patient")
      return "Bệnh nhân";
    if (roleId === 4 || r === "Lễ tân tiếp đón") return "Lễ tân tiếp đón";
    if (roleId === 5 || r === "Điều dưỡng") return "Điều dưỡng";
    if (roleId === 6 || r === "Kỹ thuật viên CLS") return "Kỹ thuật viên CLS";
    if (roleId === 7 || r === "Dược sĩ") return "Dược sĩ";
    return r || "Admin";
  };

  const normalizeStatus = (s?: string): string => {
    if (!s) return "Đang hoạt động";
    const str = s.trim().toLowerCase();
    if (str === "locked" || str === "đã khóa") return "Đã khóa";
    if (str === "inactive" || str === "ngưng hoạt động")
      return "Ngưng hoạt động";
    if (str === "onleave" || str === "nghỉ phép")
      return "Nghỉ phép";
    return "Đang hoạt động";
  };

  if (initialData !== prevInitialData || isOpen !== prevIsOpen) {
    setPrevInitialData(initialData);
    setPrevIsOpen(isOpen);
    if (initialData) {
      setFullName(initialData.fullName || "");
      setEmail(initialData.email || "");
      setPhone(initialData.phone || initialData.phoneNumber || "");
      setRole(normalizeRole(initialData.role, initialData.roleId));
      setStatus(normalizeStatus(initialData.status));
    } else {
      setFullName("");
      setEmail("");
      setPhone("");
      setRole("Admin");
      setStatus("Đang hoạt động");
    }
    setErrorMessage("");
    setIsSubmitting(false);
    setIsConfirmLockOpen(false);
  }

  if (!isOpen) return null;

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (val.trim().length > 10) {
      setErrorMessage("Số điện thoại không được vượt quá 10 chữ số.");
    } else if (
      errorMessage === "Số điện thoại không được vượt quá 10 chữ số."
    ) {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!fullName.trim()) {
      setErrorMessage("Vui lòng nhập Họ và tên!");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Vui lòng nhập Email!");
      return;
    }

    const cleanPhone = phone.trim();
    if (cleanPhone && cleanPhone.length > 10) {
      setErrorMessage("Số điện thoại không được vượt quá 10 chữ số.");
      return;
    }

    // If status is changed to "Đã khóa" and it wasn't locked previously
    if (status === "Đã khóa" && initialData?.status !== "Đã khóa") {
      setIsConfirmLockOpen(true);
      return;
    }

    await doSave();
  };

  const doSave = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const today = new Date();
      const formattedDate = `${String(today.getDate()).padStart(2, "0")}/${String(
        today.getMonth() + 1,
      ).padStart(2, "0")}/${today.getFullYear()}`;

      const getRoleId = (r: string): number => {
        if (r === "Admin" || r === "Quản trị viên") return 1;
        if (r === "Bác sĩ" || r === "Doctor") return 2;
        if (r === "Bệnh nhân" || r === "Patient") return 3;
        if (r === "Lễ tân tiếp đón") return 4;
        if (r === "Điều dưỡng") return 5;
        if (r === "Kỹ thuật viên CLS") return 6;
        if (r === "Dược sĩ") return 7;
        return 3;
      };

      const selectedRoleId = getRoleId(role);

      await onSave({
        id: initialData?.id,
        userId: initialData?.userId,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        phoneNumber: phone.trim(),
        role,
        roleId: selectedRoleId,
        roleName: role,
        status,
        createdAt: initialData?.createdAt || formattedDate,
        updatedAt: initialData?.updatedAt || formattedDate,
      });

      setIsConfirmLockOpen(false);
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Không thể lưu tài khoản. Vui lòng kiểm tra lại!",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPhoneInvalid = phone.trim().length > 10;

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
              disabled={isSubmitting}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          {/* Inline Alert Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm font-medium animate-in fade-in duration-200">
              <AlertCircle size={20} className="shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Họ và tên */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Họ và tên <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ và tên..."
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
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
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="Nhập số điện thoại..."
                  className={`w-full border rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none transition-all ${
                    isPhoneInvalid
                      ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/20"
                      : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  }`}
                />
                {isPhoneInvalid && (
                  <p className="text-xs text-rose-500 font-medium mt-1">
                    Số điện thoại không được vượt quá 10 chữ số.
                  </p>
                )}
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
                  <option value="Bác sĩ">Bác sĩ</option>
                  <option value="Bệnh nhân">Bệnh nhân</option>
                  <option value="Lễ tân tiếp đón">Lễ tân tiếp đón</option>
                  <option value="Điều dưỡng">Điều dưỡng</option>
                  <option value="Kỹ thuật viên CLS">Kỹ thuật viên CLS</option>
                  <option value="Dược sĩ">Dược sĩ</option>
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
                    {status === "Nghỉ phép" && (
                      <option value="Nghỉ phép" disabled>
                        Nghỉ phép (Chỉnh trong Quản lý bác sĩ)
                      </option>
                    )}
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
                disabled={isSubmitting}
                className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition cursor-pointer text-base disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isPhoneInvalid}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition cursor-pointer text-base disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <SaveIcon size={18} />
                )}
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
          fullName,
          email: email || "",
          phone,
          role,
          createdAt: initialData?.createdAt || "",
          updatedAt: initialData?.updatedAt || "",
          status: "Đã khóa",
        }}
        onClose={() => setIsConfirmLockOpen(false)}
        onConfirm={doSave}
      />
    </>
  );
}
