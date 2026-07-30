import { useState } from "react";
import { initialPatients } from "./data";
import type { Patient } from "./types";
import PatientToolbar from "./components/PatientToolbar";
import PatientTable from "./components/PatientTable";
import PatientFormModal from "./components/PatientFormModal";
import PatientDetailModal from "./components/PatientDetailModal";
import ConfirmLockModal from "./components/ConfirmLockModal";

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [lockingPatient, setLockingPatient] = useState<Patient | null>(null);

  // Statistics based on verification status and status
  const totalPatients = patients.length;
  const activeCount = patients.filter((p) => (p.verificationStatus || p.status) === "Đã duyệt" || p.status === "Đang hoạt động").length;
  const inactiveCount = patients.filter((p) => (p.verificationStatus || p.status) === "Chờ duyệt" || p.status === "Ngưng hoạt động").length;
  const lockedCount = patients.filter((p) => (p.verificationStatus || p.status) === "Từ chối" || p.status === "Đã khóa").length;

  // Open modal for adding new patient
  const handleOpenAddModal = () => {
    setEditingPatient(null);
    setIsFormModalOpen(true);
  };

  // Open modal for viewing detail
  const handleOpenDetailModal = (patient: Patient) => {
    setViewingPatient(patient);
  };

  // Open modal for editing patient
  const handleOpenEditModal = (patient: Patient) => {
    setViewingPatient(null);
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
            ? { ...p, ...patientData, updatedAt: new Date().toISOString().replace("T", " ").substring(0, 19) }
            : p
        )
      );
    } else {
      // Add mode
      const newId = patients.length > 0 ? Math.max(...patients.map((p) => p.id)) + 1 : 1;
      const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);
      const newPatient: Patient = {
        gender: "Nam",
        address: "Chưa cập nhật",
        healthInsuranceNumber: `BHYT00000${newId}`,
        cccdNumber: `07920000000${newId}`,
        verificationStatus: "Chờ duyệt",
        verifiedAt: null,
        verifiedBy: null,
        verificationNote: null,
        createdAt: nowStr,
        updatedAt: nowStr,
        ...patientData,
        id: newId,
        patient_id: newId,
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
          p.id === lockingPatient.id
            ? { ...p, status: "Đã khóa", verificationStatus: "Từ chối", updatedAt: new Date().toISOString().replace("T", " ").substring(0, 19) }
            : p
        )
      );
      setLockingPatient(null);
    }
  };

  return (
    <div className="p-7 bg-[#f4f6f9] min-h-screen">
      <PatientToolbar
        onAddPatient={handleOpenAddModal}
        totalPatients={totalPatients}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        lockedCount={lockedCount}
      />
      <PatientTable
        patients={patients}
        onViewDetailPatient={handleOpenDetailModal}
        onEditPatient={handleOpenEditModal}
        onLockPatient={handleOpenLockModal}
      />

      {/* Detail Modal */}
      <PatientDetailModal
        isOpen={!!viewingPatient}
        patient={viewingPatient}
        onClose={() => setViewingPatient(null)}
        onEdit={handleOpenEditModal}
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