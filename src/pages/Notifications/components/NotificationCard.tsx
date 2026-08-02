import { Calendar, X, Check, User, Clock, Eye, Trash2, CheckCircle2 } from "lucide-react";
import type { Notification } from "../types";

interface NotificationCardProps {
  notification: Notification;
  onViewDetail: (notification: Notification) => void;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function NotificationCard({
  notification,
  onViewDetail,
  onMarkAsRead,
  onDelete,
}: NotificationCardProps) {
  const getTypeConfig = () => {
    switch (notification.type) {
      case "APPOINTMENT_NEW":
        return {
          icon: Calendar,
          label: "Lịch hẹn mới",
          badgeBg: "bg-blue-100/80 text-blue-700 border-blue-200",
          iconBg: "bg-blue-50 text-blue-600 border-blue-200",
          borderLeft: "border-l-blue-600",
        };
      case "APPOINTMENT_CANCELLED":
        return {
          icon: X,
          label: "Cuộc hẹn đã hủy",
          badgeBg: "bg-rose-100/80 text-rose-700 border-rose-200",
          iconBg: "bg-rose-50 text-rose-600 border-rose-200",
          borderLeft: "border-l-rose-600",
        };
      case "APPOINTMENT_COMPLETED":
        return {
          icon: Check,
          label: "Hoàn tất khám",
          badgeBg: "bg-emerald-100/80 text-emerald-700 border-emerald-200",
          iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
          borderLeft: "border-l-emerald-600",
        };
      case "PATIENT_REGISTERED":
        return {
          icon: User,
          label: "Bệnh nhân mới",
          badgeBg: "bg-purple-100/80 text-purple-700 border-purple-200",
          iconBg: "bg-purple-50 text-purple-600 border-purple-200",
          borderLeft: "border-l-purple-600",
        };
      case "APPOINTMENT_REMINDER":
        return {
          icon: Clock,
          label: "Lời nhắc cuộc hẹn",
          badgeBg: "bg-amber-100/80 text-amber-700 border-amber-200",
          iconBg: "bg-amber-50 text-amber-600 border-amber-200",
          borderLeft: "border-l-amber-600",
        };
      default:
        return {
          icon: Clock,
          label: "Thông báo",
          badgeBg: "bg-gray-100 text-gray-700 border-gray-200",
          iconBg: "bg-gray-50 text-gray-600 border-gray-200",
          borderLeft: "border-l-gray-400",
        };
    }
  };

  const config = getTypeConfig();
  const IconComponent = config.icon;

  return (
    <div
      onClick={() => onViewDetail(notification)}
      className={`relative group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 p-6 sm:p-7 rounded-2xl border transition-all duration-200 cursor-pointer ${
        !notification.isRead
          ? `bg-blue-50/40 border-blue-200 ${config.borderLeft} border-l-4 shadow-xs hover:shadow-md hover:border-blue-300`
          : `bg-white border-gray-200/80 border-l-4 ${config.borderLeft} shadow-2xs hover:shadow-sm hover:border-gray-300`
      }`}
    >
      <div className="flex items-start gap-5 flex-1">
        {/* Icon Badge - Larger size */}
        <div
          className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center border shadow-2xs ${config.iconBg}`}
        >
          <IconComponent size={26} strokeWidth={2.2} />
        </div>

        {/* Content Details - Larger text */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`text-sm font-bold px-3 py-1 rounded-full border ${config.badgeBg}`}
            >
              {config.label}
            </span>

            {!notification.isRead && (
              <span className="inline-flex items-center gap-1.5 bg-blue-600 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-2xs animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white" />
                MỚI
              </span>
            )}
          </div>

          <h3
            className={`text-lg sm:text-xl leading-snug ${
              !notification.isRead ? "font-bold text-gray-900" : "font-semibold text-gray-800"
            }`}
          >
            {notification.title}
          </h3>

          <p className="text-base sm:text-lg text-gray-700 font-normal leading-relaxed mt-2">
            {notification.content}
          </p>

          <div className="flex items-center gap-2 mt-3 text-sm font-semibold text-gray-400">
            <Clock size={16} />
            <span>{notification.createdAt}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons - Larger size */}
      <div
        className="flex items-center gap-1.5 self-end sm:self-center pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 w-full sm:w-auto justify-end"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onViewDetail(notification)}
          title="Xem chi tiết"
          className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
        >
          <Eye size={22} />
        </button>

        {!notification.isRead && (
          <button
            onClick={() => onMarkAsRead(notification.notificationId)}
            title="Đánh dấu đã đọc"
            className="p-2.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
          >
            <CheckCircle2 size={22} />
          </button>
        )}

        <button
          onClick={() => onDelete(notification.notificationId)}
          title="Xóa thông báo"
          className="p-2.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
        >
          <Trash2 size={22} />
        </button>
      </div>
    </div>
  );
}
