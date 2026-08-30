import { useState, useEffect, useCallback } from "react";
import type { Specialty } from "./types";
import specialtyApi from "../../api/specialtyApi";
import SpecialtyToolbar from "./components/SpecialtyToolbar";
import SpecialtyTable from "./components/SpecialtyTable";
import SpecialtyFormModal from "./components/SpecialtyFormModal";
import ConfirmLockModal from "./components/ConfirmLockModal";
import ToastNotification, { type ToastMessage } from "../../components/common/ToastNotification";
import { notificationApi } from "../../api/notificationApi";
import NotificationDetailModal from "../Notifications/components/NotificationDetailModal";
import type { Notification } from "../Notifications/types";

export default function Specialties() {
  const [specialties, setSpecialties] = useState<Specialty[]>(() => specialtyApi.getCachedSpecialties() || []);
  const [loading, setLoading] = useState<boolean>(() => !specialtyApi.getCachedSpecialties());
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [lockingSpecialty, setLockingSpecialty] = useState<Specialty | null>(null);
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

  const fetchSpecialties = async (showSpinner = false) => {
    if (showSpinner && !specialtyApi.getCachedSpecialties()) setLoading(true);
    try {
      const data = await specialtyApi.getAll();
      setSpecialties(data);
    } catch (err) {
      console.error("Lỗi lấy danh sách chuyên khoa:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialties(specialties.length === 0);
  }, []);

  // Statistics
  const totalSpecialties = specialties.length;
  const activeCount = specialties.filter((s) => s.status === "Đang hoạt động").length;
  const inactiveCount = specialties.filter((s) => s.status === "Ngưng hoạt động").length;

  // Open modal for adding new specialty
  const handleOpenAddModal = () => {
    setEditingSpecialty(null);
    setIsFormModalOpen(true);
  };

  // Open modal for editing specialty
  const handleOpenEditModal = (specialty: Specialty) => {
    setEditingSpecialty(specialty);
    setIsFormModalOpen(true);
  };

  // Save (Add or Edit) specialty
  const handleSaveSpecialty = async (
    specialtyData: Omit<Specialty, "id" | "stt"> & { id?: number }
  ) => {
    const specName = specialtyData.specialtyName || specialtyData.name || "Chuyên khoa";
    const adminUserId = getLoggedInAdminUserId();

    try {
      const targetStatus = specialtyData.status === "Ngưng hoạt động" ? false : true;
      if (specialtyData.id || specialtyData.specialtyId) {
        // Edit mode
        const targetId = specialtyData.specialtyId || specialtyData.id!;
        setEditingSpecialty(null);
        setIsFormModalOpen(false);

        // Optimistic update
        const notiData: Notification = {
          notificationId: Date.now(),
          title: "Cập nhật chuyên khoa",
          content: `Hệ thống vừa cập nhật thông tin chuyên khoa "${specName}".`,
          type: "system",
          isRead: false,
          createdAt: new Date().toISOString(),
          userId: adminUserId,
        };

        addToast({
          type: "success",
          title: "Cập nhật chuyên khoa",
          message: `Đã cập nhật thông tin chuyên khoa "${specName}" thành công!`,
          onClick: () => setViewingNotification(notiData),
        });

        // Trigger notification immediately for instant bell badge update
        notificationApi.create(notiData).catch((e) => console.warn("Lỗi tạo thông báo:", e));

        await specialtyApi.update(targetId, {
          specialtyName: specName,
          description: specialtyData.description || "",
          status: targetStatus,
        });
      } else {
        // Add mode
        setEditingSpecialty(null);
        setIsFormModalOpen(false);

        const notiData: Notification = {
          notificationId: Date.now(),
          title: "Thêm chuyên khoa mới",
          content: `Đã tạo mới thành công chuyên khoa "${specName}".`,
          type: "system",
          isRead: false,
          createdAt: new Date().toISOString(),
          userId: adminUserId,
        };

        addToast({
          type: "success",
          title: "Thêm chuyên khoa mới",
          message: `Đã thêm mới chuyên khoa "${specName}" thành công!`,
          onClick: () => setViewingNotification(notiData),
        });

        // Trigger notification immediately for instant bell badge update
        notificationApi.create(notiData).catch((e) => console.warn("Lỗi tạo thông báo:", e));

        await specialtyApi.create({
          specialtyName: specName,
          description: specialtyData.description || "",
          status: targetStatus,
        });
      }
      fetchSpecialties(false);
    } catch (err: any) {
      fetchSpecialties(false);
      addToast({
        type: "error",
        title: "Lỗi thao tác",
        message: err.message || "Lỗi khi lưu thông tin chuyên khoa!",
      });
    }
  };

  // Open lock / status toggle confirmation modal
  const handleOpenLockModal = (specialty: Specialty) => {
    setLockingSpecialty(specialty);
  };

  // Confirm lock/toggle specialty status action
  const handleConfirmLock = async () => {
    if (lockingSpecialty) {
      const specName = lockingSpecialty.specialtyName || lockingSpecialty.name || "Chuyên khoa";
      const isCurrentlyLocked =
        lockingSpecialty.status === "Ngưng hoạt động" ||
        lockingSpecialty.status === "Inactive" ||
        lockingSpecialty.status === false;
      const newBoolStatus = isCurrentlyLocked;
      const actionTitle = isCurrentlyLocked
        ? "Mở lại chuyên khoa"
        : "Ngưng hoạt động chuyên khoa";
      const actionMessage = isCurrentlyLocked
        ? `Đã mở lại chuyên khoa "${specName}" thành công!`
        : `Đã chuyển chuyên khoa "${specName}" sang trạng thái Ngưng hoạt động!`;
      const notiContent = isCurrentlyLocked
        ? `Chuyên khoa "${specName}" đã được kích hoạt và chuyển sang trạng thái Đang hoạt động.`
        : `Chuyên khoa "${specName}" đã được chuyển sang trạng thái Ngưng hoạt động.`;
      const adminUserId = getLoggedInAdminUserId();
      const targetId = lockingSpecialty.specialtyId || lockingSpecialty.id!;

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
      setLockingSpecialty(null);

      // 2. Optimistic UI update
      setSpecialties((prev) =>
        prev.map((s) =>
          s.specialtyId === targetId || s.id === targetId
            ? { ...s, status: newBoolStatus ? "Đang hoạt động" : "Ngưng hoạt động" }
            : s
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
        await specialtyApi.toggleStatus(targetId, newBoolStatus);
        notificationApi.create(notiData).catch((e) => console.warn("Lỗi tạo thông báo:", e));

        fetchSpecialties(false);
      } catch (err: any) {
        fetchSpecialties(false);
        addToast({
          type: "error",
          title: "Lỗi thao tác",
          message:
            err.message ||
            `Lỗi khi ${isCurrentlyLocked ? "mở lại" : "ngưng hoạt động"} chuyên khoa!`,
        });
      }
    }
  };

  return (
    <div className="p-7 bg-[#f4f6f9] min-h-screen relative">
      {/* Top-Right 3s Stacked Toast Notifications */}
      <ToastNotification toasts={toasts} onClose={removeToast} />

      <SpecialtyToolbar
        onAddSpecialty={handleOpenAddModal}
        totalSpecialties={totalSpecialties}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
      />
      <SpecialtyTable
        specialties={specialties}
        loading={loading}
        onEditSpecialty={handleOpenEditModal}
        onLockSpecialty={handleOpenLockModal}
      />

      {/* Add / Edit Form Modal */}
      <SpecialtyFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveSpecialty}
        initialData={editingSpecialty}
      />

      {/* Lock Confirmation Modal */}
      <ConfirmLockModal
        isOpen={!!lockingSpecialty}
        specialty={lockingSpecialty}
        onClose={() => setLockingSpecialty(null)}
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