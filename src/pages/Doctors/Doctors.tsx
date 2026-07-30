import { useState } from "react";
import { initialDoctors } from "./data";
import type { Doctor } from "./types";
import DoctorToolbar from "./components/DoctorToolbar";
import DoctorTable from "./components/DoctorTable";
import DoctorFormModal from "./components/DoctorFormModal";
import ConfirmLockModal from "./components/ConfirmLockModal";

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [lockingDoctor, setLockingDoctor] = useState<Doctor | null>(null);

  // Statistics
  const totalDoctors = doctors.length;
  const activeCount = doctors.filter((d) => d.status === "Đang hoạt động").length;
  const inactiveCount = doctors.filter((d) => d.status === "Ngưng hoạt động").length;
  const lockedCount = doctors.filter((d) => d.status === "Đã khóa").length;

  // Open modal for adding new doctor
  const handleOpenAddModal = () => {
    setEditingDoctor(null);
    setIsFormModalOpen(true);
  };

  // Open modal for editing doctor
  const handleOpenEditModal = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setIsFormModalOpen(true);
  };

  // Save (Add or Edit) doctor
  const handleSaveDoctor = (doctorData: Omit<Doctor, "id" | "stt"> & { id?: number }) => {
    if (doctorData.id) {
      // Edit mode
      setDoctors((prev) =>
        prev.map((d) =>
          d.id === doctorData.id
            ? { ...d, ...doctorData }
            : d
        )
      );
    } else {
      // Add mode
      const newId = doctors.length > 0 ? Math.max(...doctors.map((d) => d.id)) + 1 : 1;
      const newStt = doctors.length + 1;
      const newDoctor: Doctor = {
        ...doctorData,
        id: newId,
        stt: newStt,
      };
      setDoctors((prev) => [...prev, newDoctor]);
    }
  };

  // Open lock confirmation modal
  const handleOpenLockModal = (doctor: Doctor) => {
    setLockingDoctor(doctor);
  };

  // Confirm lock doctor action
  const handleConfirmLock = () => {
    if (lockingDoctor) {
      setDoctors((prev) =>
        prev.map((d) =>
          d.id === lockingDoctor.id ? { ...d, status: "Đã khóa" } : d
        )
      );
      setLockingDoctor(null);
    }
  };

  return (
    <div className="p-7 bg-[#f4f6f9] min-h-screen">
      <DoctorToolbar
        onAddDoctor={handleOpenAddModal}
        totalDoctors={totalDoctors}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        lockedCount={lockedCount}
      />
      <DoctorTable
        doctors={doctors}
        onEditDoctor={handleOpenEditModal}
        onLockDoctor={handleOpenLockModal}
      />

      {/* Add / Edit Form Modal */}
      <DoctorFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveDoctor}
        initialData={editingDoctor}
      />

      {/* Lock Confirmation Modal */}
      <ConfirmLockModal
        isOpen={!!lockingDoctor}
        doctor={lockingDoctor}
        onClose={() => setLockingDoctor(null)}
        onConfirm={handleConfirmLock}
      />
    </div>
  );
}
