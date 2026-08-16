import { useState, useMemo, useEffect } from "react";
import { initialNotifications } from "./data";
import type { Notification } from "./types";
import NotificationToolbar from "./components/NotificationToolbar";
import NotificationCard from "./components/NotificationCard";
import NotificationDetailModal from "./components/NotificationDetailModal";
import ConfirmDeleteNotificationModal from "./components/ConfirmDeleteNotificationModal";
import CreateNotificationModal from "./components/CreateNotificationModal";
import Pagination from "../../components/common/Pagination";
import { ChevronLeft, ChevronRight, BellOff, Loader2 } from "lucide-react";
import { notificationApi, type CreateNotificationPayload } from "../../api/notificationApi";

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(() => notificationApi.getCachedNotifications() || []);
  const [isLoading, setIsLoading] = useState(() => !notificationApi.getCachedNotifications());

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

  // Create Notification Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Retrieve logged-in Admin's userId from localStorage
  const getLoggedInAdminUserId = (): string | undefined => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        return parsed?.userId || parsed?.id;
      }
    } catch (e) {}
    return undefined;
  };

  // Fetch notifications from Backend API
  const fetchNotifications = async (showLoading = false) => {
    if (showLoading && !notificationApi.getCachedNotifications()) {
      setIsLoading(true);
    }
    try {
      const adminUserId = getLoggedInAdminUserId();
      const data = await notificationApi.getAll(adminUserId ? { userId: adminUserId } : undefined);
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.warn("Lỗi tải danh sách thông báo từ API:", error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(notifications.length === 0);

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
      const id = e.detail as number;
      if (id) {
        setNotifications((prev) =>
          prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n))
        );
      }
    };

    const handleAllRead = () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    };

    const handleNotificationDeleted = (e: any) => {
      const id = e.detail as number;
      if (id) {
        setNotifications((prev) => prev.filter((n) => n.notificationId !== id));
      }
    };

    const handleNotificationUpdated = () => {
      fetchNotifications(false);
    };

    window.addEventListener("notification_updated", handleNotificationUpdated);
    window.addEventListener("new_notification_created", handleNewNotification as EventListener);
    window.addEventListener("notification_read", handleNotificationRead as EventListener);
    window.addEventListener("notification_all_read", handleAllRead);
    window.addEventListener("notification_deleted", handleNotificationDeleted as EventListener);
    return () => {
      window.removeEventListener("notification_updated", handleNotificationUpdated);
      window.removeEventListener("new_notification_created", handleNewNotification as EventListener);
      window.removeEventListener("notification_read", handleNotificationRead as EventListener);
      window.removeEventListener("notification_all_read", handleAllRead);
      window.removeEventListener("notification_deleted", handleNotificationDeleted as EventListener);
    };
  }, []);

  const handleCreateNotification = async (payload: CreateNotificationPayload): Promise<boolean> => {
    const adminUserId = getLoggedInAdminUserId();
    const result = await notificationApi.create({
      ...payload,
      userId: payload.userId || adminUserId,
    });
    if (result) {
      await fetchNotifications();
      window.dispatchEvent(new Event("notification_updated"));
      return true;
    }
    return false;
  };

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
        String(n.notificationId || "").includes(term) ||
        (n.title && n.title.toLowerCase().includes(term)) ||
        (n.content && n.content.toLowerCase().includes(term));

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
  const handleMarkAsRead = async (id: number) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.notificationId === id
          ? { ...n, isRead: true, readAt: n.readAt || new Date().toISOString() }
          : n
      )
    );
    await notificationApi.markAsRead(id);
    window.dispatchEvent(new Event("notification_updated"));
  };

  const handleMarkAllAsRead = async () => {
    const now = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true, readAt: n.readAt || now }))
    );
    await notificationApi.markAllAsRead();
    window.dispatchEvent(new Event("notification_updated"));
  };

  const handleOpenDeleteConfirm = (notification: Notification) => {
    setDeletingNotification(notification);
  };

  const handleConfirmDeleteSingle = async () => {
    if (deletingNotification) {
      const idToDelete = deletingNotification.notificationId;
      setNotifications((prev) =>
        prev.filter((n) => n.notificationId !== idToDelete)
      );
      setDeletingNotification(null);
      await notificationApi.delete(idToDelete);
      window.dispatchEvent(new Event("notification_updated"));
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
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* Main Content Container */}
      {isLoading && notifications.length === 0 ? (
        <div className="p-12 text-center text-gray-500 font-normal bg-white rounded-2xl border border-gray-100/80 shadow-xs flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="text-base font-medium text-gray-700">Đang tải dữ liệu thông báo...</span>
        </div>
      ) : (
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
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
              totalItems={filteredNotifications.length}
              itemsPerPage={itemsPerPage}
              itemLabel="thông báo"
            />
          )}
        </div>
      )}

      {/* Create Notification Modal */}
      <CreateNotificationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateNotification}
      />

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