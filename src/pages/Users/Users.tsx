import { useState, useEffect, useCallback } from "react";
import userApi from "../../api/userApi";
import type { User } from "./types";
import UserToolbar from "./components/UserToolbar";
import UserTable from "./components/UserTable";
import UserFormModal from "./components/UserFormModal";
import ConfirmLockModal from "./components/ConfirmLockModal";
import { Loader2 } from "lucide-react";

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [lockingUser, setLockingUser] = useState<User | null>(null);

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

  // Statistics
  const totalUsers = users.length;
  const activeCount = users.filter((u) => u.status === "Đang hoạt động" || u.status === "Active").length;
  const inactiveCount = users.filter((u) => u.status === "Ngưng hoạt động" || u.status === "Inactive").length;
  const lockedCount = users.filter((u) => u.status === "Đã khóa" || u.status === "Locked").length;

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
  const handleSaveUser = async (userData: Omit<User, "id" | "stt"> & { id?: string | number }): Promise<void> => {
    const roleToIdMap: Record<string, number> = {
      Admin: 1,
      "Quản trị viên": 1,
      "Bác sĩ": 2,
      Doctor: 2,
      "Bệnh nhân": 3,
      Patient: 3,
      "Lễ tân tiếp đón": 4,
      "Điều dưỡng": 5,
      "Kỹ thuật viên CLS": 6,
      "Dược sĩ": 7,
    };

    const targetRoleId = roleToIdMap[String(userData.role)] || 3;
    const targetUserId = userData.userId || userData.id;

    if (targetUserId) {
      // Edit mode
      await userApi.update(targetUserId, {
        email: userData.email,
        phone: userData.phone || userData.phoneNumber,
        roleId: targetRoleId,
        fullName: userData.fullName || userData.email?.split("@")[0] || "Người dùng",
        status: userData.status,
      });
    } else {
      // Add mode
      await userApi.create({
        email: userData.email || "",
        phone: userData.phone || userData.phoneNumber || "",
        roleId: targetRoleId,
        fullName: userData.fullName || userData.email?.split("@")[0] || "Người dùng mới",
        status: userData.status || "Active",
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
      if (targetUserId) {
        try {
          await userApi.updateStatus(targetUserId, "Đã khóa");
          await reloadUsers();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          alert(err?.message || "Không thể khóa tài khoản.");
        }
      }
      setLockingUser(null);
    }
  };

  return (
    <div className="p-7 bg-[#f4f6f9] min-h-screen">
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
    </div>
  );
}