import { useState } from "react";
import { initialSpecialties } from "./data";
import type { Specialty } from "./types";
import SpecialtyToolbar from "./components/SpecialtyToolbar";
import SpecialtyTable from "./components/SpecialtyTable";
import SpecialtyFormModal from "./components/SpecialtyFormModal";
import ConfirmLockModal from "./components/ConfirmLockModal";

export default function Specialties() {
  const [specialties, setSpecialties] = useState<Specialty[]>(initialSpecialties);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [lockingSpecialty, setLockingSpecialty] = useState<Specialty | null>(null);

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
  const handleSaveSpecialty = (
    specialtyData: Omit<Specialty, "id" | "stt"> & { id?: number }
  ) => {
    if (specialtyData.id) {
      // Edit mode
      setSpecialties((prev) =>
        prev.map((s) =>
          s.id === specialtyData.id
            ? { ...s, ...specialtyData }
            : s
        )
      );
    } else {
      // Add mode
      const newId =
        specialties.length > 0
          ? Math.max(...specialties.map((s) => s.id)) + 1
          : 1;
      const newStt = specialties.length + 1;
      const newSpecialty: Specialty = {
        ...specialtyData,
        id: newId,
        stt: newStt,
      };
      setSpecialties((prev) => [...prev, newSpecialty]);
    }
  };

  // Open lock confirmation modal
  const handleOpenLockModal = (specialty: Specialty) => {
    setLockingSpecialty(specialty);
  };

  // Confirm lock specialty action
  const handleConfirmLock = () => {
    if (lockingSpecialty) {
      setSpecialties((prev) =>
        prev.map((s) =>
          s.id === lockingSpecialty.id ? { ...s, status: "Đã khóa" } : s
        )
      );
      setLockingSpecialty(null);
    }
  };

  return (
    <div className="p-7 bg-[#f4f6f9] min-h-screen">
      <SpecialtyToolbar onAddSpecialty={handleOpenAddModal} />
      <SpecialtyTable
        specialties={specialties}
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