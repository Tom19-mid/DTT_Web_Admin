import { X, Calendar, Clock, User, Check, Trash2, Tag, Info } from "lucide-react";
import type { Notification } from "../types";

interface NotificationDetailModalProps {
  notification: Notification | null;
  onClose: () => void;
  onDelete: (id: number) => void;
}

export default function NotificationDetailModal({
  notification,
  onClose,
  onDelete,
}: NotificationDetailModalProps) {
  if (!notification) return null;

  const getTypeBadge = () => {
    switch (notification.type) {
      case "APPOINTMENT_NEW":
        return {
          label: "Lịch hẹn mới",
          badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
          icon: Calendar,
        };
      case "APPOINTMENT_CANCELLED":
        return {
          label: "Lịch hẹn đã hủy",
          badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
          icon: X,
        };
      case "APPOINTMENT_COMPLETED":
        return {
          label: "Hoàn tất khám",
          badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: Check,
        };
      case "PATIENT_REGISTERED":
        return {
          label: "Bệnh nhân mới",
          badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
          icon: User,
        };
      case "APPOINTMENT_REMINDER":
        return {
          label: "Lời nhắc cuộc hẹn",
          badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
          icon: Clock,
        };
      default:
        return {
          label: "Thông báo",
          badgeClass: "bg-gray-50 text-gray-700 border-gray-200",
          icon: Info,
        };
    }
  };

  const typeConfig = getTypeBadge();
  const TypeIcon = typeConfig.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-7 sm:p-8 relative animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl border ${typeConfig.badgeClass}`}>
              <TypeIcon size={24} />
            </div>
            <div>
              <span className={`inline-block text-sm font-bold px-3 py-1 rounded-full border ${typeConfig.badgeClass}`}>
                {typeConfig.label}
              </span>
              <p className="text-base font-semibold text-gray-500 mt-1">
                Mã thông báo: <span className="font-bold text-gray-900 text-lg">{notification.notificationId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-2xl hover:bg-gray-100 transition cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body Content */}
        <div className="py-6 space-y-5">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug">
              {notification.title}
            </h2>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 font-medium">
              <Clock size={16} />
              <span>Gửi lúc: {notification.createdAt}</span>
              {notification.readAt && (
                <>
                  <span>•</span>
                  <span>Đã đọc lúc: {new Date(notification.readAt).toLocaleTimeString("vi-VN")}</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-gray-50/90 rounded-2xl p-5 border border-gray-100">
            <p className="text-lg sm:text-xl text-gray-800 leading-relaxed font-normal">
              {notification.content}
            </p>
          </div>

          {/* Related Info */}
          {(notification.relatedId || notification.relatedType) && (
            <div className="flex items-center gap-5 text-base font-medium text-gray-700 bg-blue-50/60 p-4 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-2 text-blue-700 font-bold">
                <Tag size={18} />
                <span>Liên kết:</span>
              </div>
              <div>Loại: <span className="font-bold text-gray-900">{notification.relatedType || "-"}</span></div>
              <div>Mã: <span className="font-bold text-blue-600 text-lg">{notification.relatedId || "-"}</span></div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-5 border-t border-gray-100">
          <button
            onClick={() => {
              onDelete(notification.notificationId);
              onClose();
            }}
            className="inline-flex items-center gap-2 px-5 py-3 text-rose-600 hover:bg-rose-50 rounded-2xl font-bold text-base transition cursor-pointer"
          >
            <Trash2 size={20} />
            <span>Xóa thông báo</span>
          </button>

          <button
            onClick={onClose}
            className="px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-base transition cursor-pointer shadow-sm active:scale-95"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
