import { useState, useMemo } from "react";
import { initialNotifications } from "./data";
import type { Notification } from "./types";
import NotificationToolbar from "./components/NotificationToolbar";
import NotificationCard from "./components/NotificationCard";
import NotificationDetailModal from "./components/NotificationDetailModal";
import ConfirmDeleteNotificationModal from "./components/ConfirmDeleteNotificationModal";
import { ChevronLeft, ChevronRight, BellOff } from "lucide-react";

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selected Notification for Detail Modal
  const [viewingNotification, setViewingNotification] = useState<Notification | null>(null);

  // Confirmation Modal states
  const [deletingNotification, setDeletingNotification] = useState<Notification | null>(null);
  const [isClearAllReadModalOpen, setIsClearAllReadModalOpen] = useState(false);

  // Statistics calculation
  const totalCount = notifications.length;
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  // Filtered Notifications list
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        n.title.toLowerCase().includes(term) ||
        n.content.toLowerCase().includes(term);

      const matchesStatus =
        selectedStatus === "ALL" ||
        (selectedStatus === "UNREAD" && !n.isRead) ||
        (selectedStatus === "READ" && n.isRead);

      return matchesSearch && matchesStatus;
    });
  }, [notifications, searchTerm, selectedStatus]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage) || 1;
  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredNotifications.slice(start, start + itemsPerPage);
  }, [filteredNotifications, currentPage]);

  // Handlers
  const handleMarkAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.notificationId === id
          ? { ...n, isRead: true, readAt: n.readAt || new Date().toISOString() }
          : n
      )
    );
  };

  const handleMarkAllAsRead = () => {
    const now = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true, readAt: n.readAt || now }))
    );
  };

  const handleOpenDeleteConfirm = (notification: Notification) => {
    setDeletingNotification(notification);
  };

  const handleConfirmDeleteSingle = () => {
    if (deletingNotification) {
      setNotifications((prev) =>
        prev.filter((n) => n.notificationId !== deletingNotification.notificationId)
      );
      setDeletingNotification(null);
    }
  };

  const handleOpenClearReadConfirm = () => {
    setIsClearAllReadModalOpen(true);
  };

  const handleConfirmClearReadNotifications = () => {
    setNotifications((prev) => prev.filter((n) => !n.isRead));
    setIsClearAllReadModalOpen(false);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("ALL");
    setCurrentPage(1);
  };

  const handleViewDetail = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.notificationId);
    }
    setViewingNotification(notification);
  };

  return (
    <div className="p-7 bg-[#f4f6f9] min-h-screen">
      {/* Summary Stats & Toolbar */}
      <NotificationToolbar
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        selectedStatus={selectedStatus}
        onStatusChange={(val) => {
          setSelectedStatus(val);
          setCurrentPage(1);
        }}
        totalCount={totalCount}
        unreadCount={unreadCount}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearReadNotifications={handleOpenClearReadConfirm}
        onShowAll={handleResetFilters}
      />

      {/* Main Content Container */}
      <div className="bg-white rounded-2xl border border-gray-100/80 shadow-xs p-6">
        {paginatedNotifications.length > 0 ? (
          <div className="space-y-3.5">
            {paginatedNotifications.map((notification) => (
              <NotificationCard
                key={notification.notificationId}
                notification={notification}
                onViewDetail={handleViewDetail}
                onMarkAsRead={handleMarkAsRead}
                onDelete={() => handleOpenDeleteConfirm(notification)}
              />
            ))}
          </div>
        ) : (
          <div className="py-14 text-center">
            <BellOff className="mx-auto text-gray-300 mb-3" size={52} />
            <h3 className="text-lg font-bold text-gray-800">Không tìm thấy thông báo nào</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              Không có thông báo nào phù hợp với bộ lọc hoặc từ khóa tìm kiếm của bạn.
            </p>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredNotifications.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-5 border-t border-gray-100 text-base text-gray-600">
            <div>
              Hiển thị <span className="font-bold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> -{" "}
              <span className="font-bold text-gray-900">
                {Math.min(currentPage * itemsPerPage, filteredNotifications.length)}
              </span>{" "}
              trên <span className="font-bold text-gray-900">{filteredNotifications.length}</span> thông báo
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-2.5 border border-gray-200 bg-white rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
              >
                <ChevronLeft size={18} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-xl font-bold text-base cursor-pointer transition ${
                    currentPage === page
                      ? "bg-blue-600 text-white shadow-xs"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2.5 border border-gray-200 bg-white rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notification Detail Modal */}
      <NotificationDetailModal
        notification={viewingNotification}
        onClose={() => setViewingNotification(null)}
        onDelete={(id) => {
          const target = notifications.find((n) => n.notificationId === id);
          if (target) {
            handleOpenDeleteConfirm(target);
          }
        }}
      />

      {/* Confirm Delete Single Notification Modal */}
      <ConfirmDeleteNotificationModal
        isOpen={!!deletingNotification}
        notification={deletingNotification}
        onClose={() => setDeletingNotification(null)}
        onConfirm={handleConfirmDeleteSingle}
      />

      {/* Confirm Clear All Read Notifications Modal */}
      <ConfirmDeleteNotificationModal
        isOpen={isClearAllReadModalOpen}
        notification={null}
        isClearAllRead={true}
        onClose={() => setIsClearAllReadModalOpen(false)}
        onConfirm={handleConfirmClearReadNotifications}
      />
    </div>
  );
}