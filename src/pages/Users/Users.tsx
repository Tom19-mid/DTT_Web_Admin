import { useState } from "react";
import { initialUsers } from "./data";
import type { User } from "./types";
import UserToolbar from "./components/UserToolbar";
import UserTable from "./components/UserTable";
import UserFormModal from "./components/UserFormModal";
import ConfirmLockModal from "./components/ConfirmLockModal";

export default function Users() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [lockingUser, setLockingUser] = useState<User | null>(null);

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
  const handleSaveUser = (userData: Omit<User, "id" | "stt"> & { id?: number }) => {
    if (userData.id) {
      // Edit mode
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userData.id
            ? { ...u, ...userData }
            : u
        )
      );
    } else {
      // Add mode
      const newId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
      const newStt = users.length + 1;
      const newUser: User = {
        ...userData,
        id: newId,
        stt: newStt,
      };
      setUsers((prev) => [...prev, newUser]);
    }
  };

  // Open lock confirmation modal
  const handleOpenLockModal = (user: User) => {
    setLockingUser(user);
  };

  // Confirm lock user action
  const handleConfirmLock = () => {
    if (lockingUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === lockingUser.id ? { ...u, status: "Đã khóa" } : u
        )
      );
      setLockingUser(null);
    }
  };

  return (
    <div className="p-7 bg-[#f4f6f9] min-h-screen">
      <UserToolbar onAddUser={handleOpenAddModal} />
      <UserTable
        users={users}
        onEditUser={handleOpenEditModal}
        onLockUser={handleOpenLockModal}
      />

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