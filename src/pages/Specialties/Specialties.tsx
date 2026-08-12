import { useState, useEffect } from "react";
import type { Specialty } from "./types";
import specialtyApi from "../../api/specialtyApi";
import SpecialtyToolbar from "./components/SpecialtyToolbar";
import SpecialtyTable from "./components/SpecialtyTable";
import SpecialtyFormModal from "./components/SpecialtyFormModal";
import ConfirmLockModal from "./components/ConfirmLockModal";

export default function Specialties() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [lockingSpecialty, setLockingSpecialty] = useState<Specialty | null>(null);

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
    try {
      const targetStatus = specialtyData.status === "Ngưng hoạt động" ? false : true;
      if (specialtyData.id || specialtyData.specialtyId) {
        // Edit mode
        const targetId = specialtyData.specialtyId || specialtyData.id!;
        await specialtyApi.update(targetId, {
          specialtyName: specialtyData.specialtyName || specialtyData.name || "",
          description: specialtyData.description || "",
          status: targetStatus,
        });
      } else {
        // Add mode
        await specialtyApi.create({
          specialtyName: specialtyData.specialtyName || specialtyData.name || "",
          description: specialtyData.description || "",
          status: targetStatus,
        });
      }
      await fetchSpecialties();
    } catch (err: any) {
      alert(err.message || "Lỗi khi lưu thông tin chuyên khoa!");
    }
  };

  // Open lock / status toggle confirmation modal
  const handleOpenLockModal = (specialty: Specialty) => {
    setLockingSpecialty(specialty);
  };

  // Confirm lock/toggle specialty status action
  const handleConfirmLock = async () => {
    if (lockingSpecialty) {
      try {
        const targetId = lockingSpecialty.specialtyId || lockingSpecialty.id!;
        const currentBool = lockingSpecialty.status === "Đang hoạt động" || lockingSpecialty.rawStatus === true;
        const newBoolStatus = !currentBool;
        await specialtyApi.toggleStatus(targetId, newBoolStatus);
        await fetchSpecialties();
      } catch (err: any) {
        alert(err.message || "Lỗi khi cập nhật trạng thái chuyên khoa!");
      } finally {
        setLockingSpecialty(null);
      }
    }
  };

  return (
    <div className="p-7 bg-[#f4f6f9] min-h-screen">
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
    </div>
  );
}