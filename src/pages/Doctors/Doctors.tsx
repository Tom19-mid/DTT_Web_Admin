import { useState, useEffect, useCallback } from "react";
import { Stethoscope, CalendarX } from "lucide-react";
import type { Doctor } from "./types";
import DoctorToolbar from "./components/DoctorToolbar";
import DoctorTable from "./components/DoctorTable";
import DoctorFormModal from "./components/DoctorFormModal";
import DoctorDetailModal from "./components/DoctorDetailModal";
import ConfirmLockModal from "./components/ConfirmLockModal";
import DoctorLeaves from "../DoctorLeaves/DoctorLeaves";
import { doctorApi } from "../../api/doctorApi";
import { specialtyApi } from "../../api/specialtyApi";
import ToastNotification, { type ToastMessage } from "../../components/common/ToastNotification";
import { notificationApi } from "../../api/notificationApi";
import NotificationDetailModal from "../Notifications/components/NotificationDetailModal";
import type { Notification } from "../Notifications/types";

interface DoctorsProps {
  defaultTab?: "doctors" | "leaves";
}

const mapDoctorRecord = (d: any, index: number): Doctor => {
  const rawStatus = String(d.status || "Active").trim();
  let formattedStatus: any = "Đang hoạt động";
  const lower = rawStatus.toLowerCase();
  if (lower === "active" || lower === "đang hoạt động")
    formattedStatus = "Đang hoạt động";
  else if (lower === "inactive" || lower === "ngưng hoạt động")
    formattedStatus = "Ngưng hoạt động";
  else if (lower === "onleave" || lower === "nghỉ phép")
    formattedStatus = "Nghỉ phép";
  else if (lower === "locked" || lower === "đã khóa")
    formattedStatus = "Đã khóa";

  const rVal = Number(d.rating ?? d.ratingAverage ?? 5.0);
  const revVal = Number(d.reviewCount ?? d.totalReviews ?? 0);

  return {
    ...d,
    doctorId: d.doctorId || d.id || index + 1,
    id: d.doctorId || d.id || index + 1,
    stt: index + 1,
    avatar: d.avatarUrl || d.avatar || "",
    avatarUrl: d.avatarUrl || d.avatar || "",
    specialty: d.specialtyName || d.specialty || "Nội tổng quát",
    qualifications: d.degree || d.qualifications || "Chuyên khoa Bác sĩ",
    experience: d.experienceYears ?? d.experience ?? 0,
    status: formattedStatus,
    rating: rVal,
    ratingAverage: rVal,
    reviewCount: revVal,
    totalReviews: revVal,
  };
};

export default function Doctors({ defaultTab = "doctors" }: DoctorsProps) {
  const [activeTab, setActiveTab] = useState<"doctors" | "leaves">(defaultTab);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    const cached = doctorApi.getCachedDoctors();
    return cached ? cached.map(mapDoctorRecord) : [];
  });
  const [specialties, setSpecialties] = useState<
    Array<{ specialtyId: number; specialtyName: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(() => !doctorApi.getCachedDoctors());
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [viewingDoctor, setViewingDoctor] = useState<Doctor | null>(null);
  const [lockingDoctor, setLockingDoctor] = useState<Doctor | null>(null);
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

  // Fetch doctors list from Backend API
  const fetchDoctors = useCallback(async (showLoading = false) => {
    try {
      if (showLoading && !doctorApi.getCachedDoctors()) setIsLoading(true);
      const data = await doctorApi.getAll();
      const mapped: Doctor[] = data.map(mapDoctorRecord);
      setDoctors(mapped);
    } catch (error) {
      console.error("Lỗi khi tải danh sách bác sĩ:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch specialties list from Backend API
  const fetchSpecialties = useCallback(async () => {
    try {
      const data = await specialtyApi.getAll();
      if (Array.isArray(data)) {
        setSpecialties(data);
      }
    } catch (error) {
      console.warn("Lỗi khi tải danh sách chuyên khoa:", error);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "doctors") {
      fetchDoctors(doctors.length === 0);
      fetchSpecialties();
    }
  }, [activeTab, fetchDoctors, fetchSpecialties, doctors.length]);

  // Statistics
  const totalDoctors = doctors.length;
  const activeCount = doctors.filter(
    (d) => d.status === "Đang hoạt động" || d.status === "Active",
  ).length;
  const inactiveCount = doctors.filter(
    (d) => d.status === "Ngưng hoạt động" || d.status === "Inactive",
  ).length;
  const onLeaveCount = doctors.filter(
    (d) => d.status === "Nghỉ phép" || d.status === "OnLeave",
  ).length;
  const lockedCount = doctors.filter(
    (d) => d.status === "Đã khóa" || d.status === "Locked",
  ).length;

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

  // Open modal for viewing doctor detail
  const handleOpenDetailModal = (doctor: Doctor) => {
    setViewingDoctor(doctor);
  };

  // Save (Add or Edit) doctor via API
  const handleSaveDoctor = async (doctorData: any) => {
    const targetId = doctorData.doctorId || doctorData.id;
    const docName = doctorData.fullName || "bác sĩ";
    const adminUserId = getLoggedInAdminUserId();

    // Find specialtyId by matched name
    let selectedSpecId = doctorData.specialtyId;
    if (doctorData.specialty) {
      const matchedSpec = specialties.find(
        (s) =>
          s.specialtyName.toLowerCase().trim() ===
          doctorData.specialty.toLowerCase().trim(),
      );
      if (matchedSpec) selectedSpecId = matchedSpec.specialtyId;
    }

    const avatarValue = doctorData.avatar || doctorData.avatarUrl || "";

    try {
      if (targetId) {
        // Edit mode
        setEditingDoctor(null);
        setIsFormModalOpen(false);

        // Optimistic update
        setDoctors((prev) =>
          prev.map((d) =>
            d.doctorId === targetId || d.id === targetId
              ? { ...d, ...doctorData, specialty: doctorData.specialty }
              : d
          )
        );

        const notiData: Notification = {
          notificationId: Date.now(),
          title: "Cập nhật thông tin bác sĩ",
          content: `Hệ thống vừa cập nhật thông tin bác sĩ "${docName}".`,
          type: "system",
          isRead: false,
          createdAt: new Date().toISOString(),
          userId: adminUserId,
        };

        addToast({
          type: "success",
          title: "Cập nhật bác sĩ",
          message: `Đã cập nhật thông tin bác sĩ "${docName}" thành công!`,
          onClick: () => setViewingNotification(notiData),
        });

        // Trigger notification immediately for instant bell badge update
        notificationApi.create(notiData).catch((e) => console.warn("Lỗi tạo thông báo:", e));

        await doctorApi.update(targetId, {
          fullName: doctorData.fullName,
          degree: doctorData.degree || doctorData.qualifications,
          experienceYears:
            Number(doctorData.experienceYears || doctorData.experience) || 0,
          clinicRoom: doctorData.clinicRoom,
          specialtyId: selectedSpecId,
          phone: doctorData.phone,
          email: doctorData.email,
          status: doctorData.status,
          avatar: avatarValue,
          avatarUrl: avatarValue,
          isTestData: doctorData.isTestData,
          leaveStartDate: doctorData.leaveStartDate,
          leaveEndDate: doctorData.leaveEndDate,
          leaveReason: doctorData.leaveReason,
          leaveStatus: doctorData.leaveStatus,
        });
      } else {
        // Add mode
        setEditingDoctor(null);
        setIsFormModalOpen(false);

        const notiData: Notification = {
          notificationId: Date.now(),
          title: "Thêm bác sĩ mới",
          content: `Đã tạo mới hồ sơ thông tin bác sĩ "${docName}".`,
          type: "system",
          isRead: false,
          createdAt: new Date().toISOString(),
          userId: adminUserId,
        };

        addToast({
          type: "success",
          title: "Thêm bác sĩ mới",
          message: `Đã thêm mới bác sĩ "${docName}" thành công!`,
          onClick: () => setViewingNotification(notiData),
        });

        // Trigger notification immediately for instant bell badge update
        notificationApi.create(notiData).catch((e) => console.warn("Lỗi tạo thông báo:", e));

        await doctorApi.create({
          fullName: doctorData.fullName,
          degree: doctorData.degree || doctorData.qualifications,
          experienceYears:
            Number(doctorData.experienceYears || doctorData.experience) || 0,
          clinicRoom: doctorData.clinicRoom,
          specialtyId: selectedSpecId || 1,
          phone: doctorData.phone || "",
          email: doctorData.email,
          status: doctorData.status || "Active",
          avatar: avatarValue,
          avatarUrl: avatarValue,
          isTestData: doctorData.isTestData,
          leaveStartDate: doctorData.leaveStartDate,
          leaveEndDate: doctorData.leaveEndDate,
          leaveReason: doctorData.leaveReason,
          leaveStatus: doctorData.leaveStatus,
        });
      }

      // Refresh list from Backend silently
      fetchDoctors(false);
    } catch (error: any) {
      console.error("Lỗi lưu thông tin bác sĩ:", error);
      fetchDoctors(false);
      addToast({
        type: "error",
        title: "Lỗi thao tác",
        message: "Không thể lưu thông tin bác sĩ. Vui lòng thử lại.",
      });
    }
  };

  // Open lock confirmation modal
  const handleOpenLockModal = (doctor: Doctor) => {
    setLockingDoctor(doctor);
  };

  // Confirm lock/unlock doctor action via API
  const handleConfirmLock = async () => {
    if (lockingDoctor) {
      const targetId = lockingDoctor.doctorId || lockingDoctor.id;
      const docName = lockingDoctor.fullName || "bác sĩ";
      const isCurrentlyLocked =
        lockingDoctor.status === "Đã khóa" || lockingDoctor.status === "Locked";
      const newStatus = isCurrentlyLocked ? "Active" : "Đã khóa";
      const actionTitle = isCurrentlyLocked
        ? "Mở khóa tài khoản bác sĩ"
        : "Khóa tài khoản bác sĩ";
      const actionMessage = isCurrentlyLocked
        ? `Đã mở khóa tài khoản bác sĩ "${docName}" thành công!`
        : `Đã khóa tài khoản bác sĩ "${docName}" thành công!`;
      const notiContent = isCurrentlyLocked
        ? `Tài khoản bác sĩ "${docName}" đã được mở khóa và chuyển sang trạng thái Đang hoạt động.`
        : `Tài khoản bác sĩ "${docName}" đã chuyển sang trạng thái Đã khóa.`;
      const adminUserId = getLoggedInAdminUserId();

      const notiData: Notification = {
        notificationId: Date.now(),
        title: actionTitle,
        content: notiContent,
        type: "system",
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: adminUserId,
      };

      // 1. Close modal immediately
      setLockingDoctor(null);

      // 2. Optimistic UI update
      if (targetId) {
        setDoctors((prev) =>
          prev.map((d) =>
            d.doctorId === targetId || d.id === targetId
              ? { ...d, status: newStatus }
              : d
          )
        );

        // 3. Show Toast immediately with onClick
        addToast({
          type: "success",
          title: actionTitle,
          message: actionMessage,
          onClick: () => setViewingNotification(notiData),
        });

        // 4. Background API execution
        try {
          await doctorApi.updateStatus(targetId, newStatus);
          notificationApi.create(notiData).catch((e) => console.warn("Lỗi tạo thông báo:", e));

          fetchDoctors(false);
        } catch (error: any) {
          console.error("Lỗi khi cập nhật trạng thái bác sĩ:", error);
          fetchDoctors(false);
          addToast({
            type: "error",
            title: "Lỗi thao tác",
            message:
              error?.message ||
              `Không thể ${isCurrentlyLocked ? "mở khóa" : "khóa"} tài khoản bác sĩ.`,
          });
        }
      }
    }
  };

  return (
    <div className="p-7 bg-[#f4f6f9] min-h-screen relative">
      {/* Top-Right 3s Stacked Toast Notifications */}
      <ToastNotification toasts={toasts} onClose={removeToast} />
      {/* Navigation Header & Main 2 Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {activeTab === "doctors"
              ? "Quản lý bác sĩ"
              : "Quản lý nghỉ phép bác sĩ"}
          </h1>
        </div>

        {/* 2 Tabs */}
        <div className="flex bg-gray-200/70 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("doctors")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === "doctors"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
            }`}
          >
            <Stethoscope size={18} />
            <span>Quản lý bác sĩ</span>
          </button>
          <button
            onClick={() => setActiveTab("leaves")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === "leaves"
                ? "bg-white text-purple-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
            }`}
          >
            <CalendarX size={18} />
            <span>Quản lý nghỉ phép bác sĩ</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Doctor Management View */}
      {activeTab === "doctors" && (
        <>
          <DoctorToolbar
            onAddDoctor={handleOpenAddModal}
            totalDoctors={totalDoctors}
            activeCount={activeCount}
            inactiveCount={inactiveCount}
            onLeaveCount={onLeaveCount}
            lockedCount={lockedCount}
          />

          {isLoading && doctors.length === 0 ? (
            <div className="flex items-center justify-center p-12 bg-white rounded-2xl shadow-xs">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600 font-medium text-base">
                  Đang tải danh sách bác sĩ...
                </p>
              </div>
            </div>
          ) : (
            <DoctorTable
              doctors={doctors}
              onViewDoctorDetail={handleOpenDetailModal}
              onEditDoctor={handleOpenEditModal}
              onLockDoctor={handleOpenLockModal}
            />
          )}

          {/* Add / Edit Form Modal */}
          <DoctorFormModal
            isOpen={isFormModalOpen}
            onClose={() => setIsFormModalOpen(false)}
            onSave={handleSaveDoctor}
            initialData={editingDoctor}
            specialtiesOptions={specialties}
            onAddToast={addToast}
          />

          {/* Doctor Detail Modal */}
          <DoctorDetailModal
            isOpen={!!viewingDoctor}
            doctor={viewingDoctor}
            onClose={() => setViewingDoctor(null)}
            onEdit={(doc) => {
              setViewingDoctor(null);
              handleOpenEditModal(doc);
            }}
          />

          {/* Lock Confirmation Modal */}
          <ConfirmLockModal
            isOpen={!!lockingDoctor}
            doctor={lockingDoctor}
            onClose={() => setLockingDoctor(null)}
            onConfirm={handleConfirmLock}
          />
        </>
      )}

      {/* Tab 2: Doctor Leave Management View */}
      {activeTab === "leaves" && (
        <DoctorLeaves onLeaveUpdated={() => fetchDoctors(false)} />
      )}

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
