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

  // Statistics
  const totalMedicines = medicines.length;
  const activeCount = medicines.filter(
    (m) => m.status === "Active" || m.status === "Đang hoạt động"
  ).length;
  const inactiveCount = medicines.filter(
    (m) => m.status === "Inactive" || m.status === "Ngưng hoạt động"
  ).length;
  const categoriesCount = categories.length;

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
      // Insert - Append to end of list
      setMedicines((prev) => [...prev, medicineData]);
    }
  };

  // Confirm status toggle action
  const handleConfirmStatusToggle = () => {
    if (statusTogglingMedicine) {
      const nextStatus =
        statusTogglingMedicine.status === "Đang hoạt động" || statusTogglingMedicine.status === "Active"
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
      {/* Top Toolbar with Summary Cards */}
      <MedicineToolbar
        onAddMedicine={handleOpenAddModal}
        totalMedicines={totalMedicines}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        categoriesCount={categoriesCount}
      />

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