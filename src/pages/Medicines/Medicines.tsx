import { useState } from "react";
import { initialMedicines, medicineCategories } from "./data";
import type { Medicine } from "./types";
import MedicineToolbar from "./components/MedicineToolbar";
import MedicineTable from "./components/MedicineTable";
import MedicineFormModal from "./components/MedicineFormModal";
import MedicineDetailModal from "./components/MedicineDetailModal";
import ConfirmStatusModal from "./components/ConfirmStatusModal";

export default function Medicines() {
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines);
  const [categories] = useState(medicineCategories);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  
  const [viewingMedicine, setViewingMedicine] = useState<Medicine | null>(null);
  const [statusTogglingMedicine, setStatusTogglingMedicine] = useState<Medicine | null>(null);

  // Open add modal
  const handleOpenAddModal = () => {
    setEditingMedicine(null);
    setIsFormModalOpen(true);
  };

  // Open edit modal
  const handleOpenEditModal = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setIsFormModalOpen(true);
  };

  // Open detail view modal
  const handleOpenDetailModal = (medicine: Medicine) => {
    setViewingMedicine(medicine);
  };

  // Open status change confirmation modal
  const handleOpenStatusModal = (medicine: Medicine) => {
    setStatusTogglingMedicine(medicine);
  };

  // Save medicine (Insert or Update)
  const handleSaveMedicine = (medicineData: Medicine) => {
    const exists = medicines.some((m) => m.medicineId === medicineData.medicineId);

    if (exists && editingMedicine) {
      // Update
      setMedicines((prev) =>
        prev.map((m) => (m.medicineId === medicineData.medicineId ? medicineData : m))
      );
    } else {
      // Insert
      setMedicines((prev) => [medicineData, ...prev]);
    }
  };

  // Confirm status toggle action
  const handleConfirmStatusToggle = () => {
    if (statusTogglingMedicine) {
      const nextStatus =
        statusTogglingMedicine.status === "Đang hoạt động"
          ? "Ngưng hoạt động"
          : "Đang hoạt động";

      setMedicines((prev) =>
        prev.map((m) =>
          m.medicineId === statusTogglingMedicine.medicineId
            ? { ...m, status: nextStatus }
            : m
        )
      );
      setStatusTogglingMedicine(null);
    }
  };

  const nextMedicineId =
    medicines.length > 0
      ? Math.max(...medicines.map((m) => m.medicineId)) + 1
      : 1;

  return (
    <div className="p-7 bg-[#f4f6f9] min-h-screen">
      {/* Top Toolbar matching SpecialtyToolbar design */}
      <MedicineToolbar onAddMedicine={handleOpenAddModal} />

      {/* Main Table View */}
      <MedicineTable
        medicines={medicines}
        categories={categories}
        onViewDetail={handleOpenDetailModal}
        onEditMedicine={handleOpenEditModal}
        onToggleStatus={handleOpenStatusModal}
      />

      {/* Add / Edit Form Modal */}
      <MedicineFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveMedicine}
        initialData={editingMedicine}
        categories={categories}
        nextMedicineId={nextMedicineId}
      />

      {/* Detail Modal */}
      <MedicineDetailModal
        isOpen={!!viewingMedicine}
        medicine={viewingMedicine}
        categories={categories}
        onClose={() => setViewingMedicine(null)}
        onEdit={(med) => {
          setViewingMedicine(null);
          handleOpenEditModal(med);
        }}
      />

      {/* Status Lock/Toggle Modal */}
      <ConfirmStatusModal
        isOpen={!!statusTogglingMedicine}
        medicine={statusTogglingMedicine}
        onClose={() => setStatusTogglingMedicine(null)}
        onConfirm={handleConfirmStatusToggle}
      />
    </div>
  );
}