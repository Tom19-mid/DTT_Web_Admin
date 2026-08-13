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

interface DoctorsProps {
  defaultTab?: "doctors" | "leaves";
}

export default function Doctors({ defaultTab = "doctors" }: DoctorsProps) {
  const [activeTab, setActiveTab] = useState<"doctors" | "leaves">(defaultTab);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<
    Array<{ specialtyId: number; specialtyName: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [viewingDoctor, setViewingDoctor] = useState<Doctor | null>(null);
  const [lockingDoctor, setLockingDoctor] = useState<Doctor | null>(null);

  // Fetch doctors list from Backend API
  const fetchDoctors = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await doctorApi.getAll();
      const mapped: Doctor[] = data.map((d: any, index: number) => {
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
      });
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
    fetchDoctors();
    fetchSpecialties();
  }, [fetchDoctors, fetchSpecialties]);

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

    if (targetId) {
      // Edit mode
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
        leaveStartDate: doctorData.leaveStartDate,
        leaveEndDate: doctorData.leaveEndDate,
        leaveReason: doctorData.leaveReason,
        leaveStatus: doctorData.leaveStatus,
      });
    } else {
      // Add mode
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
        leaveStartDate: doctorData.leaveStartDate,
        leaveEndDate: doctorData.leaveEndDate,
        leaveReason: doctorData.leaveReason,
        leaveStatus: doctorData.leaveStatus,
      });
    }

    // Refresh list from Backend
    await fetchDoctors();
  };

  // Open lock confirmation modal
  const handleOpenLockModal = (doctor: Doctor) => {
    setLockingDoctor(doctor);
  };

  // Confirm lock doctor action via API
  const handleConfirmLock = async () => {
    if (lockingDoctor) {
      const targetId = lockingDoctor.doctorId || lockingDoctor.id;
      if (targetId) {
        try {
          await doctorApi.updateStatus(targetId, "Đã khóa");
          await fetchDoctors();
        } catch (error) {
          console.error("Lỗi khi khóa tài khoản bác sĩ:", error);
        }
      }
      setLockingDoctor(null);
    }
  };

  return (
    <div className="p-7 bg-[#f4f6f9] min-h-screen">
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
        <div className="bg-gray-200/80 p-1.5 rounded-2xl flex items-center gap-1.5 self-start md:self-auto shadow-inner select-none">
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

          {isLoading ? (
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
      {activeTab === "leaves" && <DoctorLeaves />}
    </div>
  );
}
