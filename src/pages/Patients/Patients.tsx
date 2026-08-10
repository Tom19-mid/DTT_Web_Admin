import { useState, useEffect, useCallback } from "react";
import patientApi from "../../api/patientApi";
import type { Patient } from "./types";
import PatientToolbar from "./components/PatientToolbar";
import PatientTable from "./components/PatientTable";
import PatientFormModal from "./components/PatientFormModal";
import PatientDetailModal from "./components/PatientDetailModal";
import { getPatientAccountStatus } from "./components/PatientRow";
import { Loader2 } from "lucide-react";

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);

  const reloadPatients = useCallback(async () => {
    try {
      const data = await patientApi.getAll();
      setPatients(data);
    } catch (err) {
      console.warn("Lỗi khi tải danh sách bệnh nhân:", err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const data = await patientApi.getAll();
        if (isMounted) {
          setPatients(data);
          setLoading(false);
        }
      } catch (err) {
        console.warn("Lỗi khi tải danh sách bệnh nhân:", err);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Statistics based on account status
  const totalPatients = patients.length;
  const activeCount = patients.filter(
    (p) => getPatientAccountStatus(p) === "Đang hoạt động",
  ).length;
  const inactiveCount = patients.filter(
    (p) => getPatientAccountStatus(p) === "Ngưng hoạt động",
  ).length;
  const lockedCount = patients.filter(
    (p) => getPatientAccountStatus(p) === "Đã khóa",
  ).length;

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
  const handleSavePatient = async (
    patientData: Omit<Patient, "id"> & { id?: number },
  ): Promise<void> => {
    const targetId =
      patientData.id || patientData.patientId || patientData.patient_id;

    try {
      if (targetId) {
        // Edit mode
        // [BUG FIX] Thêm dateOfBirth vào payload — trước đây bị thiếu hoàn toàn nên ngày sinh không bao giờ được lưu.
        // Form gửi dob dạng "DD/MM/YYYY" (ví dụ: "15/03/1990") — cần convert sang "YYYY-MM-DD" để C# DateTime? parse được.
        const rawDob = patientData.dob || patientData.dateOfBirth || "";
        let isoDateOfBirth: string | undefined = undefined;
        if (rawDob && rawDob.includes("/")) {
          const parts = rawDob.split("/");
          if (parts.length === 3) {
            const [d, m, y] = parts;
            isoDateOfBirth = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`; // "1990-03-15"
          }
        } else if (rawDob && rawDob.includes("-")) {
          isoDateOfBirth = rawDob; // đã là ISO format, giữ nguyên
        }

        await patientApi.update(targetId, {
          fullName: patientData.fullName || "",
          phone: patientData.phone || patientData.phoneNumber,
          // [BUG FIX] Không dùng fallback "Nam" khi gender rỗng/null —
          // nếu gửi "Nam" lên API thì backend sẽ ghi đè gender=NULL trong DB thành "Nam"
          // dù người dùng không thay đổi giới tính.
          // Gửi undefined để backend bỏ qua field này khi gender chưa được chọn.
          gender: patientData.gender || undefined,
          address: patientData.address,
          cccdNumber: patientData.cccdNumber,
          healthInsuranceNumber: patientData.healthInsuranceNumber,
          dateOfBirth: isoDateOfBirth, // [BUG FIX] đã thêm — "YYYY-MM-DD" hoặc undefined
          verificationStatus: patientData.verificationStatus,
          verifiedBy: "Lễ tân",
          verificationNote: patientData.verificationNote || undefined,
          verifiedAt: patientData.verifiedAt || undefined,
        });
      } else {
        // Add mode
        await patientApi.create({
          fullName: patientData.fullName || "Bệnh nhân mới",
          phone: patientData.phone || patientData.phoneNumber || "",
          gender: patientData.gender || "Nam",
          address: patientData.address || "",
          cccdNumber: patientData.cccdNumber || "",
          healthInsuranceNumber: patientData.healthInsuranceNumber || "",
        });
      }

      await reloadPatients();
    } catch (err) {
      console.error("handleSavePatient error:", err);
      // [BUG FIX] Phải throw err để doSave() trong PatientFormModal bắt được và alert() thông báo lỗi rõ ràng.
      throw err;
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

      {loading ? (
        <div className="py-24 flex flex-col justify-center items-center">
          <Loader2 className="animate-spin text-blue-700 mb-3" size={36} />
          <p className="text-gray-600 font-medium text-base">
            Đang tải danh sách hồ sơ bệnh nhân...
          </p>
        </div>
      ) : (
        <PatientTable
          patients={patients}
          onViewDetailPatient={handleOpenDetailModal}
          onEditPatient={handleOpenEditModal}
        />
      )}

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
    </div>
  );
}
