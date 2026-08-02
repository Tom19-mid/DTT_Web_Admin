import { AlertTriangle, X } from "lucide-react";
import type { Notification } from "../types";

interface ConfirmDeleteNotificationModalProps {
  isOpen: boolean;
  notification: Notification | null;
  isClearAllRead?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteNotificationModal({
  isOpen,
  notification,
  isClearAllRead = false,
  onClose,
  onConfirm,
}: ConfirmDeleteNotificationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-full">
            <AlertTriangle size={32} />
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {isClearAllRead
                ? "Xác nhận xóa tất cả thông báo đã đọc?"
                : "Xác nhận xóa thông báo?"}
            </h3>
            <p className="text-base text-gray-600 mt-2">
              {isClearAllRead ? (
                "Bạn có chắc chắn muốn xóa toàn bộ các thông báo đã đọc khỏi danh sách không?"
              ) : (
                <>
                  Bạn có chắc chắn muốn xóa thông báo{" "}
                  <span className="font-bold text-gray-900">"{notification?.title}"</span> (Mã thông báo: {notification?.notificationId})?
                </>
              )}
            </p>
            <p className="text-xs text-rose-500 font-semibold mt-1">
              Hành động này không thể hoàn tác.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 w-full pt-2">
            <button
              onClick={onClose}
              className="w-1/2 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition cursor-pointer text-base"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition cursor-pointer text-base"
            >
              Xác nhận xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
