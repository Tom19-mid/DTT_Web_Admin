import { useState, useEffect, useRef } from "react";
import { Bell, ChevronRight, CheckCheck, Loader2, Calendar, Clock, User, Info, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Avarta from "../../assets/images/Avarta.png";
import { useAuth } from "../../context/AuthContext";
import { notificationApi } from "../../api/notificationApi";
import type { Notification } from "../../pages/Notifications/types";
import NotificationDetailModal from "../../pages/Notifications/components/NotificationDetailModal";

export default function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD">("ALL");
  const [viewingNotification, setViewingNotification] = useState<Notification | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications for the logged-in Admin
  const fetchNotifications = async () => {
    try {
      const data = await notificationApi.getAll(user?.userId ? { userId: user.userId } : undefined);
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (error) {
      console.warn("Navbar: Lỗi lấy thông báo:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 10 seconds for background safety
    const interval = setInterval(fetchNotifications, 10000);

    const handleNotificationUpdated = () => {
      fetchNotifications();
    };

    const handleNewNotification = (e: any) => {
      const newNoti = e.detail as Notification;
      if (newNoti) {
        setNotifications((prev) => [
          newNoti,
          ...prev.filter((n) => n.notificationId !== newNoti.notificationId),
        ]);
      }
    };

    const handleNotificationRead = (e: any) => {
      const detail = e.detail;
      const id = typeof detail === "object" && detail !== null ? detail.id : detail;
      const realId = typeof detail === "object" && detail !== null ? detail.realId : id;
      if (id || realId) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.notificationId === id || n.notificationId === realId
              ? { ...n, isRead: true }
              : n
          )
        );
      }
    };

    const handleAllRead = () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    };

    const handleNotificationDeleted = (e: any) => {
      const detail = e.detail;
      const id = typeof detail === "object" && detail !== null ? detail.id : detail;
      const realId = typeof detail === "object" && detail !== null ? detail.realId : id;
      if (id || realId) {
        setNotifications((prev) =>
          prev.filter((n) => n.notificationId !== id && n.notificationId !== realId)
        );
      }
    };

    window.addEventListener("notification_updated", handleNotificationUpdated);
    window.addEventListener("new_notification_created", handleNewNotification as EventListener);
    window.addEventListener("notification_read", handleNotificationRead as EventListener);
    window.addEventListener("notification_all_read", handleAllRead);
    window.addEventListener("notification_deleted", handleNotificationDeleted as EventListener);
    return () => {
      clearInterval(interval);
      window.removeEventListener("notification_updated", handleNotificationUpdated);
      window.removeEventListener("new_notification_created", handleNewNotification as EventListener);
      window.removeEventListener("notification_read", handleNotificationRead as EventListener);
      window.removeEventListener("notification_all_read", handleAllRead);
      window.removeEventListener("notification_deleted", handleNotificationDeleted as EventListener);
    };
  }, [user?.userId]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const displayBadge = () => {
    if (unreadCount === 0) return null;
    if (unreadCount > 20) return "20+";
    return unreadCount.toString();
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "UNREAD") return !n.isRead;
    return true;
  });

  const handleItemClick = (noti: Notification) => {
    // 1. Open Detail Modal & Close Dropdown immediately (0ms)
    setViewingNotification(noti);
    setIsOpen(false);

    // 2. Optimistically update read state in background
    if (!noti.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === noti.notificationId ? { ...n, isRead: true } : n))
      );
      notificationApi.markAsRead(noti.notificationId).catch(console.warn);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    notificationApi.markAllAsRead().catch(console.warn);
  };

  const handleDeleteNotification = (id: number) => {
    setViewingNotification(null);
    setNotifications((prev) => prev.filter((n) => n.notificationId !== id));
    notificationApi.delete(id).catch(console.warn);
  };

  const badgeText = displayBadge();

  return (
    <header className="h-20 bg-white flex items-center justify-between px-8 shadow-xs border-b border-gray-200/80 sticky top-0 z-30">
      {/* Left Area - Empty after search bar removal */}
      <div className="flex items-center gap-3">
        {/* Search bar removed as requested */}
      </div>

      {/* Right Area */}
      <div className="flex items-center gap-6">
        {/* Notifications Bell Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            title="Thông báo"
            className="relative p-3 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-2xl transition cursor-pointer active:scale-95"
          >
            <Bell size={24} />
            {badgeText && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-extrabold text-[11px] px-1.5 py-0.5 rounded-full ring-2 ring-white min-w-[20px] text-center shadow-xs animate-in zoom-in-75">
                {badgeText}
              </span>
            )}
          </button>

          {/* Facebook-style Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 top-14 w-96 max-w-[92vw] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
              {/* Popover Header */}
              <div className="p-4 sm:p-5 border-b border-gray-100 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-gray-900">Thông báo</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-600 font-bold text-xs rounded-full border border-rose-100">
                        {badgeText} chưa đọc
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                    >
                      Đọc tất cả
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab("ALL")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeTab === "ALL"
                        ? "bg-blue-50 text-blue-600 border border-blue-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200/70"
                    }`}
                  >
                    Tất cả ({notifications.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("UNREAD")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeTab === "UNREAD"
                        ? "bg-blue-50 text-blue-600 border border-blue-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200/70"
                    }`}
                  >
                    Chưa đọc ({unreadCount})
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.slice(0, 10).map((noti) => (
                    <div
                      key={noti.notificationId}
                      onClick={() => handleItemClick(noti)}
                      className={`p-4 flex items-start gap-3.5 hover:bg-blue-50/50 transition cursor-pointer group relative ${
                        !noti.isRead ? "bg-blue-50/20" : ""
                      }`}
                    >
                      {/* Icon */}
                      <div className="p-2.5 bg-blue-100 text-blue-600 rounded-2xl shrink-0 mt-0.5 group-hover:scale-105 transition">
                        <Bell size={18} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-4">
                        <p className={`text-sm leading-snug truncate ${!noti.isRead ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                          {noti.title}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
                          {noti.content}
                        </p>
                        <span className="text-[11px] font-semibold text-gray-400 mt-1 block">
                          {noti.createdAt ? new Date(noti.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : ""}
                        </span>
                      </div>

                      {/* Unread Blue Dot */}
                      {!noti.isRead && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-blue-600 rounded-full shrink-0 shadow-2xs" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center text-gray-400 font-medium text-sm">
                    Không có thông báo nào
                  </div>
                )}
              </div>

              {/* Popover Footer - Blue Link to Notifications Page */}
              <div className="p-3 bg-gray-50/80 border-t border-gray-100 text-center">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/notifications");
                  }}
                  className="w-full py-2 px-4 text-blue-600 hover:text-blue-800 font-bold text-sm inline-flex items-center justify-center gap-1.5 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                >
                  <span>Trang thông báo</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-8 border-l border-gray-200" />

        {/* User Info */}
        <div className="flex items-center gap-3.5 cursor-pointer select-none">
          <div className="w-12 h-12 rounded-full bg-white overflow-hidden shrink-0 border-2 border-gray-200/80 shadow-xs flex items-center justify-center">
            <img src={Avarta} alt="Avatar" className="w-full h-full object-cover object-center" />
          </div>

          <div>
            <p className="font-bold text-base text-gray-900 leading-tight">
              {user?.fullName || "Admin"}
            </p>
            <p className="text-sm text-gray-500 mt-0.5 font-medium">
              {user?.roleName || "Quản trị viên"}
            </p>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <NotificationDetailModal
        notification={viewingNotification}
        onClose={() => setViewingNotification(null)}
        onDelete={handleDeleteNotification}
      />
    </header>
  );
}
