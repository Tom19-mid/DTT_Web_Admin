import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import patientApi from "../../api/patientApi";
import type { Patient } from "./types";
import PatientToolbar from "./components/PatientToolbar";
import PatientTable from "./components/PatientTable";
import PatientFormModal from "./components/PatientFormModal";
import PatientDetailModal from "./components/PatientDetailModal";
import { getPatientAccountStatus } from "./components/PatientRow";
import ToastNotification, { type ToastMessage } from "../../components/common/ToastNotification";
import { notificationApi } from "../../api/notificationApi";
import NotificationDetailModal from "../Notifications/components/NotificationDetailModal";
import type { Notification } from "../Notifications/types";
import { Loader2 } from "lucide-react";

export default function Patients() {
  const location = useLocation();
  const [patients, setPatients] = useState<Patient[]>(() => patientApi.getCachedPatients() || []);
  const [loading, setLoading] = useState<boolean>(() => !patientApi.getCachedPatients());
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
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
    const loadData = async (silent = false) => {
      const cached = patientApi.getCachedPatients();
      if (!silent && !cached && patients.length === 0) {
        setLoading(true);
      }
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

    const handleFocus = () => {
      loadData(true);
    };

    window.addEventListener("focus", handleFocus);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadData(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadData(true);
      }
    }, 5000);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(interval);
    };
  }, [location.key]);

  // Statistics based on account status (Optimized with useMemo)
  const { totalPatients, activeCount, inactiveCount, lockedCount } = useMemo(() => {
    let active = 0,
      inactive = 0,
      locked = 0;
    patients.forEach((p) => {
      const st = getPatientAccountStatus(p);
      if (st === "Đang hoạt động") active++;
      else if (st === "Ngưng hoạt động") inactive++;
      else if (st === "Đã khóa") locked++;
    });
    return {
      totalPatients: patients.length,
      activeCount: active,
      inactiveCount: inactive,
      lockedCount: locked,
    };
  }, [patients]);

  // Open modal for adding new patient
  const handleOpenAddModal = () => {
    setEditingPatient(null);
    setIsFormModalOpen(true);
  };

  // Open modal for viewing detail
  // useCallback — giữ nguyên identity giữa các lần render để React.memo trên PatientRow phát huy
  // tác dụng (hàm mới mỗi render sẽ khiến mọi hàng re-render dù được memo).
  const handleOpenDetailModal = useCallback((patient: Patient) => {
    setViewingPatient(patient);
  }, []);

  // Open modal for editing patient
  const handleOpenEditModal = useCallback((patient: Patient) => {
    setViewingPatient(null);
    setEditingPatient(patient);
    setIsFormModalOpen(true);
  }, []);

  // Save (Add or Edit) patient
  const handleSavePatient = async (
    patientData: Omit<Patient, "id"> & { id?: number },
  ): Promise<void> => {
    const targetId =
      patientData.id || patientData.patientId || patientData.patient_id;
    const patientName = patientData.fullName || "Bệnh nhân";
    const adminUserId = getLoggedInAdminUserId();

    try {
      if (targetId) {
        // Edit mode
        const notiData: Notification = {
          notificationId: Date.now(),
          title: "Cập nhật hồ sơ bệnh nhân",
          content: `Hệ thống vừa cập nhật thông tin hồ sơ bệnh nhân "${patientName}" (Mã: #${targetId}).`,
          type: "system",
          isRead: false,
          createdAt: new Date().toISOString(),
          userId: adminUserId,
        };

        addToast({
          type: "success",
          title: "Cập nhật hồ sơ bệnh nhân",
          message: `Đã cập nhật thông tin hồ sơ bệnh nhân "${patientName}" thành công!`,
          onClick: () => setViewingNotification(notiData),
        });

        // Trigger notification immediately for instant bell badge update
        notificationApi.create(notiData).catch((e) => console.warn("Lỗi tạo thông báo:", e));

        const rawDob = patientData.dob || patientData.dateOfBirth || "";
        let isoDateOfBirth: string | undefined = undefined;
        if (rawDob && rawDob.includes("/")) {
          const parts = rawDob.split("/");
          if (parts.length === 3) {
            const [d, m, y] = parts;
            isoDateOfBirth = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
          }
        } else if (rawDob && rawDob.includes("-")) {
          isoDateOfBirth = rawDob;
        }

        await patientApi.update(targetId, {
          fullName: patientData.fullName || "",
          phone: patientData.phone || patientData.phoneNumber,
          gender: patientData.gender || undefined,
          address: patientData.address,
          cccdNumber: patientData.cccdNumber,
          healthInsuranceNumber: patientData.healthInsuranceNumber,
          dateOfBirth: isoDateOfBirth,
          verificationStatus: patientData.verificationStatus,
          verifiedBy: "Lễ tân",
          verificationNote: patientData.verificationNote || undefined,
          verifiedAt: patientData.verifiedAt || undefined,
        });
      } else {
        // Add mode
        setEditingPatient(null);
        setIsFormModalOpen(false);

        const notiData: Notification = {
          notificationId: Date.now(),
          title: "Thêm bệnh nhân mới",
          content: `Đã khởi tạo thành công hồ sơ bệnh nhân "${patientName}".`,
          type: "PATIENT_REGISTERED",
          isRead: false,
          createdAt: new Date().toISOString(),
          userId: adminUserId,
        };

        addToast({
          type: "success",
          title: "Thêm bệnh nhân mới",
          message: `Đã tạo mới hồ sơ bệnh nhân "${patientName}" thành công!`,
          onClick: () => setViewingNotification(notiData),
        });

        // Trigger notification immediately for instant bell badge update
        notificationApi.create(notiData).catch((e) => console.warn("Lỗi tạo thông báo:", e));

        await patientApi.create({
          fullName: patientData.fullName || "Bệnh nhân mới",
          phone: patientData.phone || patientData.phoneNumber || "",
          gender: patientData.gender || "Nam",
          address: patientData.address || "",
          cccdNumber: patientData.cccdNumber || "",
          healthInsuranceNumber: patientData.healthInsuranceNumber || "",
        });
      }

      reloadPatients();
    } catch (err) {
      console.error("handleSavePatient error:", err);
      reloadPatients();
      addToast({
        type: "error",
        title: "Lỗi thao tác",
        message: "Không thể lưu thông tin bệnh nhân. Vui lòng thử lại.",
      });
      throw err;
    }
  };

  return (
    <div className="p-7 bg-[#f4f6f9] min-h-screen relative">
      {/* Top-Right 3s Stacked Toast Notifications */}
      <ToastNotification toasts={toasts} onClose={removeToast} />
      <PatientToolbar
        onAddPatient={handleOpenAddModal}
        totalPatients={totalPatients}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        lockedCount={lockedCount}
      />

      {loading && patients.length === 0 ? (
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
        onAddToast={addToast}
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
