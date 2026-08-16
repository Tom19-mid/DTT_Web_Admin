import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import userApi from "../../api/userApi";
import type { User } from "./types";
import UserToolbar from "./components/UserToolbar";
import UserTable from "./components/UserTable";
import UserFormModal from "./components/UserFormModal";
import ConfirmLockModal from "./components/ConfirmLockModal";
import ToastNotification, { type ToastMessage } from "../../components/common/ToastNotification";
import { notificationApi } from "../../api/notificationApi";
import NotificationDetailModal from "../Notifications/components/NotificationDetailModal";
import type { Notification } from "../Notifications/types";
import { Loader2 } from "lucide-react";

export default function Users() {
  const location = useLocation();
  const [users, setUsers] = useState<User[]>(() => userApi.getCachedUsers() || []);
  const [loading, setLoading] = useState<boolean>(() => !userApi.getCachedUsers());
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [lockingUser, setLockingUser] = useState<User | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [viewingNotification, setViewingNotification] = useState<Notification | null>(null);

  const addToast = useCallback((item: Omit<ToastMessage, "id">) => {
    const id = Date.now().toString() + "_" + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [{ ...item, id }, ...prev]);
  }, []);

  const removeToast = useCallback((id?: string) => {
    if (id) {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    } else {
      setToasts([]);
    }
  }, []);

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

  const reloadUsers = useCallback(async (forceRefresh = true) => {
    try {
      const data = await userApi.getAll(undefined, forceRefresh);
      setUsers(data);
    } catch (err) {
      console.warn("Lỗi khi tải danh sách người dùng:", err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadData = async (silent = false) => {
      if (!silent && !userApi.getCachedUsers()) {
        setLoading(true);
      }
      try {
        const data = await userApi.getAll();
        if (isMounted) {
          setUsers(data);
          setLoading(false);
        }
      } catch (err) {
        console.warn("Lỗi khi tải danh sách người dùng:", err);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData(!!userApi.getCachedUsers());

    const handleFocus = () => {
      loadData(true);
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", handleFocus);
    };
  }, [location.key]);

  // Statistics based on account status (Optimized with useMemo)
  const { totalUsers, activeCount, inactiveCount, lockedCount } = useMemo(() => {
    let active = 0,
      inactive = 0,
      locked = 0;
    users.forEach((u) => {
      const st = u.status || "Active";
      if (st === "Active" || st === "Đang hoạt động") active++;
      else if (st === "Inactive" || st === "Ngưng hoạt động" || st === "OnLeave" || st === "Nghỉ phép") inactive++;
      else if (st === "Locked" || st === "Đã khóa") locked++;
    });
    return {
      totalUsers: users.length,
      activeCount: active,
      inactiveCount: inactive,
      lockedCount: locked,
    };
  }, [users]);

  // Open modal for adding new user
  const handleOpenAddModal = () => {
    setEditingUser(null);
    setIsFormModalOpen(true);
  };

  // Open modal for editing user
  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setIsFormModalOpen(true);
  };

  // Save (Add or Edit) user
  const handleSaveUser = async (userData: any) => {
    const targetUserId = userData.userId || userData.id;
    const userName = userData.fullName || userData.email || "Tài khoản";

    let targetRoleId = Number(userData.roleId);
    if (!targetRoleId || isNaN(targetRoleId)) {
      const r = String(userData.role || userData.roleName || "").trim();
      if (r === "Admin" || r === "Quản trị viên") targetRoleId = 1;
      else if (r === "Bác sĩ" || r === "Doctor") targetRoleId = 2;
      else if (r === "Bệnh nhân" || r === "Patient") targetRoleId = 3;
      else if (r === "Lễ tân tiếp đón") targetRoleId = 4;
      else if (r === "Điều dưỡng") targetRoleId = 5;
      else if (r === "Kỹ thuật viên CLS") targetRoleId = 6;
      else if (r === "Dược sĩ") targetRoleId = 7;
      else targetRoleId = 3;
    }

    const roleName =
      userData.roleName ||
      userData.role ||
      (targetRoleId === 1 ? "Admin" : targetRoleId === 2 ? "Bác sĩ" : "Bệnh nhân");
    const adminUserId = getLoggedInAdminUserId();

    try {
      if (targetUserId) {
        // Edit mode
        setEditingUser(null);
        setIsModalOpen(false);

        // Optimistic update
        setUsers((prev) =>
          prev.map((u) =>
            u.userId === targetUserId || u.id === targetUserId
              ? { ...u, ...userData, fullName: userName, roleName }
              : u
          )
        );

        const notiData: Notification = {
          notificationId: Date.now(),
          title: "Cập nhật tài khoản",
          content: `Hệ thống vừa cập nhật thông tin tài khoản "${userName}" (${roleName}).`,
          type: "system",
          isRead: false,
          createdAt: new Date().toISOString(),
          userId: adminUserId,
        };

        addToast({
          type: "success",
          title: "Cập nhật tài khoản",
          message: `Đã cập nhật thông tin tài khoản "${userName}" thành công!`,
          onClick: () => setViewingNotification(notiData),
        });

        // Trigger notification immediately for instant bell badge update
        notificationApi.create(notiData).catch((e) => console.warn("Lỗi tạo thông báo:", e));

        await userApi.update(targetUserId, {
          email: userData.email,
          phone: userData.phone || userData.phoneNumber,
          roleId: targetRoleId,
          fullName: userName,
          status: userData.status,
        });
      } else {
        // Add mode
        setEditingUser(null);
        setIsModalOpen(false);

        const notiData: Notification = {
          notificationId: Date.now(),
          title: "Thêm tài khoản mới",
          content: `Đã tạo mới thành công tài khoản "${userName}" với vai trò ${roleName}.`,
          type: "PATIENT_REGISTERED",
          isRead: false,
          createdAt: new Date().toISOString(),
          userId: adminUserId,
        };

        addToast({
          type: "success",
          title: "Thêm mới tài khoản",
          message: `Đã thêm mới tài khoản "${userName}" (${roleName}) thành công!`,
          onClick: () => setViewingNotification(notiData),
        });

        // Trigger notification immediately for instant bell badge update
        notificationApi.create(notiData).catch((e) => console.warn("Lỗi tạo thông báo:", e));

        await userApi.create({
          email: userData.email || "",
          phone: userData.phone || userData.phoneNumber || "",
          roleId: targetRoleId,
          fullName: userName,
          status: userData.status || "Active",
        });
      }
      reloadUsers();
    } catch (error: any) {
      reloadUsers();
      addToast({
        type: "error",
        title: "Lỗi thao tác",
        message: error.message || "Không thể lưu thông tin tài khoản. Vui lòng thử lại.",
      });
    }
  };

  // Open lock confirmation modal
  const handleOpenLockModal = (user: User) => {
    setLockingUser(user);
  };

  // Confirm lock/unlock user action
  const handleConfirmLock = async () => {
    if (lockingUser) {
      const targetUserId = lockingUser.userId || lockingUser.id;
      const userName = lockingUser.fullName || lockingUser.email || "Tài khoản";
      const isCurrentlyLocked =
        lockingUser.status === "Đã khóa" || lockingUser.status === "Locked";
      const newStatus = isCurrentlyLocked ? "Active" : "Đã khóa";
      const actionTitle = isCurrentlyLocked ? "Mở khóa tài khoản" : "Khóa tài khoản";
      const actionMessage = isCurrentlyLocked
        ? `Đã mở khóa tài khoản "${userName}" thành công!`
        : `Đã khóa tài khoản "${userName}" thành công!`;
      const notiContent = isCurrentlyLocked
        ? `Tài khoản "${userName}" đã được mở khóa và chuyển sang trạng thái Đang hoạt động.`
        : `Tài khoản "${userName}" đã được chuyển sang trạng thái Đã khóa.`;
      const adminUserId = getLoggedInAdminUserId();

      const notiData: Notification = {
        notificationId: Date.now(),
        title: actionTitle,
        content: notiContent,
        type: "system",
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: adminUserId,
      };

      // 1. Close modal immediately
      setLockingUser(null);

      // 2. Optimistic UI update
      if (targetUserId) {
        setUsers((prev) =>
          prev.map((u) =>
            u.userId === targetUserId || u.id === targetUserId
              ? { ...u, status: newStatus }
              : u
          )
        );

        // 3. Show Toast immediately with onClick
        addToast({
          type: "success",
          title: actionTitle,
          message: actionMessage,
          onClick: () => setViewingNotification(notiData),
        });

        // 4. Background execution
        try {
          await userApi.updateStatus(targetUserId, newStatus);
          notificationApi.create(notiData).catch((e) => console.warn("Lỗi tạo thông báo:", e));

          reloadUsers();
        } catch (err: any) {
          reloadUsers();
          addToast({
            type: "error",
            title: "Lỗi thao tác",
            message:
              err?.message ||
              `Không thể ${isCurrentlyLocked ? "mở khóa" : "khóa"} tài khoản.`,
          });
        }
      }
    }
  };

  return (
    <div className="p-7 bg-[#f4f6f9] min-h-screen relative">
      {/* Top-Right 3s Stacked Toast Notifications */}
      <ToastNotification toasts={toasts} onClose={removeToast} />

      <UserToolbar
        onAddUser={handleOpenAddModal}
        totalUsers={totalUsers}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        lockedCount={lockedCount}
      />

      {loading && users.length === 0 ? (
        <div className="py-24 flex flex-col justify-center items-center">
          <Loader2 className="animate-spin text-blue-700 mb-3" size={36} />
          <p className="text-gray-600 font-medium text-base">Đang tải danh sách tài khoản người dùng...</p>
        </div>
      ) : (
        <UserTable
          users={users}
          onEditUser={handleOpenEditModal}
          onLockUser={handleOpenLockModal}
        />
      )}

      {/* Add / Edit Form Modal */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveUser}
        initialData={editingUser}
      />

      {/* Lock Account Confirmation Modal */}
      <ConfirmLockModal
        isOpen={!!lockingUser}
        user={lockingUser}
        onClose={() => setLockingUser(null)}
        onConfirm={handleConfirmLock}
      />

      {/* Notification Detail Modal triggered on Toast click */}
      <NotificationDetailModal
        notification={viewingNotification}
        onClose={() => setViewingNotification(null)}
        onDelete={async (id) => {
          await notificationApi.delete(id);
          setViewingNotification(null);
        }}
      />
    </div>
  );
}