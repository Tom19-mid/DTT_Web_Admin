import { useState, useEffect, useCallback, useMemo } from "react";
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
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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

  const reloadUsers = useCallback(async () => {
    try {
      const data = await userApi.getAll();
      setUsers(data);
    } catch (err) {
      console.warn("Lỗi khi tải danh sách người dùng:", err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
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

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Statistics based on account status (Optimized with useMemo)
  const { totalUsers, activeCount, inactiveCount, lockedCount } = useMemo(() => {
    let active = 0,
      inactive = 0,
      locked = 0;
    users.forEach((u) => {
      const st = u.status || "Active";
      if (st === "Active" || st === "Đang hoạt động") active++;
      else if (st === "Inactive" || st === "Ngưng hoạt động") inactive++;
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
    const roleName = userData.roleName || (userData.roleId === 1 ? "Admin" : userData.roleId === 2 ? "Bác sĩ" : "Bệnh nhân");
    const targetRoleId = Number(userData.roleId) || 3;
    const adminUserId = getLoggedInAdminUserId();

    if (targetUserId) {
      // Edit mode
      await userApi.update(targetUserId, {
        email: userData.email,
        phone: userData.phone || userData.phoneNumber,
        roleId: targetRoleId,
        fullName: userName,
        status: userData.status,
      });

      const createdNoti = await notificationApi.create({
        title: "Cập nhật tài khoản",
        content: `Hệ thống vừa cập nhật thông tin tài khoản "${userName}" (${roleName}).`,
        type: "system",
        userId: adminUserId,
      });

      addToast({
        type: "success",
        title: "Cập nhật tài khoản",
        message: `Đã cập nhật thông tin tài khoản "${userName}" thành công!`,
        onClick: createdNoti ? () => setViewingNotification(createdNoti) : undefined,
      });
    } else {
      // Add mode
      await userApi.create({
        email: userData.email || "",
        phone: userData.phone || userData.phoneNumber || "",
        roleId: targetRoleId,
        fullName: userName,
        status: userData.status || "Active",
      });

      const createdNoti = await notificationApi.create({
        title: "Thêm tài khoản mới",
        content: `Đã tạo mới thành công tài khoản "${userName}" với vai trò ${roleName}.`,
        type: "PATIENT_REGISTERED",
        userId: adminUserId,
      });

      addToast({
        type: "success",
        title: "Thêm mới tài khoản",
        message: `Đã thêm mới tài khoản "${userName}" (${roleName}) thành công!`,
        onClick: createdNoti ? () => setViewingNotification(createdNoti) : undefined,
      });
    }

    await reloadUsers();
  };

  // Open lock confirmation modal
  const handleOpenLockModal = (user: User) => {
    setLockingUser(user);
  };

  // Confirm lock user action
  const handleConfirmLock = async () => {
    if (lockingUser) {
      const targetUserId = lockingUser.userId || lockingUser.id;
      const userName = lockingUser.fullName || lockingUser.email || "Tài khoản";
      const adminUserId = getLoggedInAdminUserId();

      if (targetUserId) {
        try {
          await userApi.updateStatus(targetUserId, "Đã khóa");
          await reloadUsers();

          const createdNoti = await notificationApi.create({
            title: "Khóa tài khoản",
            content: `Tài khoản "${userName}" đã được chuyển sang trạng thái Đã khóa.`,
            type: "system",
            userId: adminUserId,
          });

          addToast({
            type: "success",
            title: "Khóa tài khoản",
            message: `Đã khóa tài khoản "${userName}" thành công!`,
            onClick: createdNoti ? () => setViewingNotification(createdNoti) : undefined,
          });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          addToast({
            type: "error",
            title: "Lỗi thao tác",
            message: err?.message || "Không thể khóa tài khoản.",
          });
        }
      }
      setLockingUser(null);
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

      {loading ? (
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