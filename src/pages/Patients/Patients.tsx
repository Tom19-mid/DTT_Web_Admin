import { useState } from "react";
import { initialPatients } from "./data";
import type { Patient } from "./types";
import PatientToolbar from "./components/PatientToolbar";
import PatientTable from "./components/PatientTable";
import PatientFormModal from "./components/PatientFormModal";
import ConfirmLockModal from "./components/ConfirmLockModal";

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [lockingPatient, setLockingPatient] = useState<Patient | null>(null);

  // Open modal for adding new patient
  const handleOpenAddModal = () => {
    setEditingPatient(null);
    setIsFormModalOpen(true);
  };

  // Open modal for editing patient
  const handleOpenEditModal = (patient: Patient) => {
    setEditingPatient(patient);
    setIsFormModalOpen(true);
  };

  // Save (Add or Edit) patient
  const handleSavePatient = (patientData: Omit<Patient, "id"> & { id?: number }) => {
    if (patientData.id) {
      // Edit mode
      setPatients((prev) =>
        prev.map((p) =>
          p.id === patientData.id
            ? { ...p, ...patientData }
            : p
        )
      );
    } else {
      // Add mode
      const newId = patients.length > 0 ? Math.max(...patients.map((p) => p.id)) + 1 : 1;
      const newPatient: Patient = {
        ...patientData,
        id: newId,
      };
      setPatients((prev) => [...prev, newPatient]);
    }
  };

  // Open lock confirmation modal
  const handleOpenLockModal = (patient: Patient) => {
    setLockingPatient(patient);
  };

  // Confirm lock patient action
  const handleConfirmLock = () => {
    if (lockingPatient) {
      setPatients((prev) =>
        prev.map((p) =>
          p.id === lockingPatient.id ? { ...p, status: "Đã khóa" } : p
        )
      );
      setLockingPatient(null);
    }
  };

  return (
    <div className="p-7 bg-[#f4f6f9] min-h-screen">
      <PatientToolbar onAddPatient={handleOpenAddModal} />
      <PatientTable
        patients={patients}
        onEditPatient={handleOpenEditModal}
        onLockPatient={handleOpenLockModal}
      />

      {/* Add / Edit Form Modal */}
      <PatientFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSavePatient}
        initialData={editingPatient}
      />

      {/* Lock Confirmation Modal */}
      <ConfirmLockModal
        isOpen={!!lockingPatient}
        patient={lockingPatient}
        onClose={() => setLockingPatient(null)}
        onConfirm={handleConfirmLock}
      />
    </div>
  );
}