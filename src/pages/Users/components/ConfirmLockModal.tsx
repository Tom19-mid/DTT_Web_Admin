import { Lock, Unlock, X } from "lucide-react";
import type { User } from "../types";

interface ConfirmLockModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmLockModal({
  isOpen,
  user,
  onClose,
  onConfirm,
}: ConfirmLockModalProps) {
  if (!isOpen || !user) return null;

  const isCurrentlyLocked = user.status === "Đã khóa" || user.status === "Locked";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center py-2">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 shrink-0 shadow-2xs ${
              isCurrentlyLocked
                ? "bg-emerald-100 text-emerald-600"
                : "bg-rose-100 text-rose-600"
            }`}
          >
            {isCurrentlyLocked ? <Unlock size={28} /> : <Lock size={28} />}
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {isCurrentlyLocked ? "Mở khóa tài khoản" : "Xác nhận khóa tài khoản"}
          </h3>

          <p className="text-base text-gray-600 mb-6 leading-relaxed">
            {isCurrentlyLocked ? (
              <>
                Bạn có chắc chắn muốn mở tài khoản{" "}
                <span className="font-bold text-gray-900">{user.email}</span> (SĐT:{" "}
                <span className="text-blue-600 font-bold">{user.phoneNumber || user.phone}</span>) không?
              </>
            ) : (
              <>
                Bạn có chắc chắn muốn khóa tài khoản{" "}
                <span className="font-bold text-gray-900">{user.email}</span> (SĐT:{" "}
                <span className="text-blue-600 font-bold">{user.phoneNumber || user.phone}</span>) không?
              </>
            )}
          </p>

          <div className="flex items-center justify-center gap-3 w-full">
            <button
              onClick={onClose}
              className="w-1/2 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition cursor-pointer text-base"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              className={`w-1/2 py-2.5 text-white font-bold rounded-xl shadow-sm transition cursor-pointer text-base ${
                isCurrentlyLocked
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {isCurrentlyLocked ? "Mở tài khoản" : "Khóa tài khoản"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
