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
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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

  const fetchSpecialties = async () => {
    setLoading(true);
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
    fetchSpecialties();
  }, []);

  // Statistics
  const totalSpecialties = specialties.length;
  const activeCount = specialties.filter((s) => s.status === "Đang hoạt động" || s.rawStatus === true).length;
  const inactiveCount = specialties.filter((s) => s.status === "Ngưng hoạt động" || s.rawStatus === false).length;

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
        await specialtyApi.update(targetId, {
          specialtyName: specName,
          description: specialtyData.description || "",
          status: targetStatus,
        });

        const createdNoti = await notificationApi.create({
          title: "Cập nhật chuyên khoa",
          content: `Hệ thống vừa cập nhật thông tin chuyên khoa "${specName}".`,
          type: "system",
          userId: adminUserId,
        });

        addToast({
          type: "success",
          title: "Cập nhật chuyên khoa",
          message: `Đã cập nhật thông tin chuyên khoa "${specName}" thành công!`,
          onClick: createdNoti ? () => setViewingNotification(createdNoti) : undefined,
        });
      } else {
        // Add mode
        await specialtyApi.create({
          specialtyName: specName,
          description: specialtyData.description || "",
          status: targetStatus,
        });

        const createdNoti = await notificationApi.create({
          title: "Thêm chuyên khoa mới",
          content: `Đã tạo mới thành công chuyên khoa "${specName}".`,
          type: "system",
          userId: adminUserId,
        });

        addToast({
          type: "success",
          title: "Thêm chuyên khoa mới",
          message: `Đã thêm mới chuyên khoa "${specName}" thành công!`,
          onClick: createdNoti ? () => setViewingNotification(createdNoti) : undefined,
        });
      }
      await fetchSpecialties();
    } catch (err: any) {
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
      const adminUserId = getLoggedInAdminUserId();

      try {
        const targetId = lockingSpecialty.specialtyId || lockingSpecialty.id!;
        const currentBool = lockingSpecialty.status === "Đang hoạt động" || lockingSpecialty.rawStatus === true;
        const newBoolStatus = !currentBool;
        await specialtyApi.toggleStatus(targetId, newBoolStatus);
        await fetchSpecialties();

        const createdNoti = await notificationApi.create({
          title: "Khóa chuyên khoa",
          content: `Chuyên khoa "${specName}" đã được chuyển sang trạng thái Đã khóa/Ngưng hoạt động.`,
          type: "system",
          userId: adminUserId,
        });

        addToast({
          type: "success",
          title: "Khóa chuyên khoa",
          message: `Đã cập nhật trạng thái chuyên khoa "${specName}" thành công!`,
          onClick: createdNoti ? () => setViewingNotification(createdNoti) : undefined,
        });
      } catch (err: any) {
        addToast({
          type: "error",
          title: "Lỗi thao tác",
          message: err.message || "Lỗi khi cập nhật trạng thái chuyên khoa!",
        });
      } finally {
        setLockingSpecialty(null);
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