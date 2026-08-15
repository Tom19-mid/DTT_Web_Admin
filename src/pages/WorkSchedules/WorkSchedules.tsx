import { useState, useEffect } from "react";
import { initialWorkSchedules } from "./data";
import type { WorkSchedule, DoctorItem } from "./types";
import ScheduleToolbar from "./components/ScheduleToolbar";
import ScheduleTable from "./components/ScheduleTable";
import DoctorScheduleSlotsView from "./components/DoctorScheduleSlotsView";
import WorkScheduleFormModal from "./components/WorkScheduleFormModal";
import WorkScheduleDetailModal from "./components/WorkScheduleDetailModal";
import ConfirmLockScheduleModal from "./components/ConfirmLockScheduleModal";
import workScheduleApi from "../../api/workScheduleApi";
import doctorApi from "../../api/doctorApi";
import { CalendarDays, Clock, Loader2 } from "lucide-react";

export default function WorkSchedules() {
  const [activeTab, setActiveTab] = useState<"schedules" | "slots">(
    "schedules",
  );
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<WorkSchedule | null>(
    null,
  );

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingSchedule, setViewingSchedule] = useState<WorkSchedule | null>(
    null,
  );

  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [scheduleToLock, setScheduleToLock] = useState<WorkSchedule | null>(
    null,
  );

  // Fetch data from Back-End API
  const fetchSchedules = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const data = await workScheduleApi.getAll();
      if (Array.isArray(data) && data.length > 0) {
        setSchedules(data);
      } else {
        setSchedules(initialWorkSchedules);
      }
    } catch (error) {
      console.warn(
        "Lỗi khi tải lịch làm việc từ API, sử dụng mock data fallback:",
        error,
      );
      setSchedules(initialWorkSchedules);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules(true);
    doctorApi.getAll().then((docList) => {
      if (Array.isArray(docList)) setDoctors(docList);
    });
  }, []);

  // Statistics
  const safeSchedules = Array.isArray(schedules) ? schedules : [];
  const totalSchedules = safeSchedules.length;
  const emptyCount = safeSchedules.filter(
    (s) => s?.status === "Trống lịch",
  ).length;
  const availableCount = safeSchedules.filter(
    (s) => s?.status === "Còn lịch để đặt",
  ).length;
  const fullyBookedCount = safeSchedules.filter(
    (s) => s?.status === "Đã hết lịch để đặt",
  ).length;
  const unavailableCount = safeSchedules.filter(
    (s) => s?.status === "Không hoạt động",
  ).length;

  // Next Schedule ID auto increment (6, 7, 8...)
  const nextScheduleId =
    safeSchedules.length > 0
      ? Math.max(...safeSchedules.map((s) => Number(s?.scheduleId) || 0)) + 1
      : 1;

  // Handlers
  const handleOpenAdd = () => {
    setEditingSchedule(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (sch: WorkSchedule) => {
    setEditingSchedule(sch);
    setIsFormModalOpen(true);
  };

  const handleOpenView = (sch: WorkSchedule) => {
    setViewingSchedule(sch);
    setIsDetailModalOpen(true);
  };

  const handleRequestLock = (sch: WorkSchedule) => {
    setScheduleToLock(sch);
    setIsLockModalOpen(true);
  };

  const handleConfirmLock = async () => {
    if (!scheduleToLock?.scheduleId) return;

    try {
      const isCurrentlyLocked = scheduleToLock.status === "Không hoạt động";
      await workScheduleApi.toggleLock(
        scheduleToLock.scheduleId,
        !isCurrentlyLocked,
      );
      await fetchSchedules(false);
    } catch (error: any) {
      console.error("Lỗi khi khóa/mở khóa lịch làm việc:", error);
      setSchedules((prev) =>
        prev.map((item) => {
          if (item.scheduleId === scheduleToLock.scheduleId) {
            const isCurrentlyLocked = item.status === "Không hoạt động";
            const updatedSlots = (item.timeSlots || []).map((slot) => {
              if (slot.status === "Đã đặt lịch") return slot;
              return !isCurrentlyLocked
                ? { ...slot, status: "Đã đóng" as const }
                : { ...slot, status: "Chưa đặt lịch" as const };
            });
            return {
              ...item,
              status: !isCurrentlyLocked
                ? "Không hoạt động"
                : "Còn lịch để đặt",
              timeSlots: updatedSlots,
            };
          }
          return item;
        }),
      );
    } finally {
      setIsLockModalOpen(false);
      setScheduleToLock(null);
    }
  };

  const handleSaveSchedule = async (savedData: WorkSchedule) => {
    try {
      let docId = savedData.doctorId || 1;
      if (savedData.doctorName && doctors.length > 0) {
        const found = doctors.find(
          (d) =>
            d.fullName
              ?.toLowerCase()
              .includes(savedData.doctorName!.toLowerCase()) ||
            savedData
              .doctorName!.toLowerCase()
              .includes(d.fullName?.toLowerCase() || ""),
        );
        if (found) docId = found.doctorId;
      }

      if (editingSchedule && editingSchedule.scheduleId) {
        await workScheduleApi.update(editingSchedule.scheduleId, {
          doctorId: docId,
          doctorName: savedData.doctorName,
          workDate: savedData.workDate,
          startTime: savedData.startTime,
          endTime: savedData.endTime,
          status: savedData.status,
          timeSlots: savedData.timeSlots,
        });
      } else {
        await workScheduleApi.create({
          doctorId: docId,
          doctorName: savedData.doctorName,
          workDate: savedData.workDate || "",
          startTime: savedData.startTime || "08:00",
          endTime: savedData.endTime || "12:00",
          status: savedData.status || "Trống lịch",
        });
      }
      await fetchSchedules(false);
    } catch (error: any) {
      console.error("Lỗi khi lưu lịch làm việc:", error);
      if (editingSchedule) {
        setSchedules((prev) =>
          prev.map((item) =>
            item.scheduleId === savedData.scheduleId ? savedData : item,
          ),
        );
      } else {
        setSchedules((prev) => [...prev, savedData]);
      }
    }
  };

  return (
    <div className="p-7 bg-[#f4f6f9] min-h-screen">
      {/* Navigation Header & Main 2 Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {activeTab === "schedules"
              ? "Lịch làm của bác sĩ"
              : "Lịch làm việc của bác sĩ"}
          </h1>
        </div>

        {/* 2 Tabs Switcher */}
        <div className="bg-gray-200/80 p-1.5 rounded-2xl flex items-center gap-1.5 self-start md:self-auto shadow-inner select-none">
          <button
            onClick={() => setActiveTab("schedules")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === "schedules"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
            }`}
          >
            <CalendarDays size={18} />
            <span>Lịch làm của bác sĩ</span>
          </button>
          <button
            onClick={() => setActiveTab("slots")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === "slots"
                ? "bg-white text-emerald-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
            }`}
          >
            <Clock size={18} />
            <span>Lịch làm việc của bác sĩ</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Lịch làm của bác sĩ (doctor_schedules) */}
      {activeTab === "schedules" && (
        <>
          <ScheduleToolbar
            totalSchedules={totalSchedules}
            emptyCount={emptyCount}
            availableCount={availableCount}
            fullyBookedCount={fullyBookedCount}
            unavailableCount={unavailableCount}
            onAddSchedule={handleOpenAdd}
          />

          {isLoading ? (
            <div className="p-12 text-center text-gray-500 font-normal bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span>Đang tải dữ liệu lịch làm việc...</span>
            </div>
          ) : (
            <ScheduleTable
              schedules={safeSchedules}
              onView={handleOpenView}
              onEdit={handleOpenEdit}
              onToggleLock={handleRequestLock}
            />
          )}
        </>
      )}

      {/* Tab 2: Lịch làm việc của bác sĩ (doctor_schedule_slots) */}
      {activeTab === "slots" && (
        <DoctorScheduleSlotsView
          schedules={safeSchedules}
          isLoading={isLoading}
        />
      )}

      {/* Add / Edit Schedule Modal */}
      <WorkScheduleFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveSchedule}
        initialData={editingSchedule}
        nextScheduleId={nextScheduleId}
        doctors={doctors}
      />

      {/* View Detail Modal */}
      <WorkScheduleDetailModal
        isOpen={isDetailModalOpen}
        schedule={viewingSchedule}
        onClose={() => setIsDetailModalOpen(false)}
      />

      {/* Confirm Lock Modal */}
      <ConfirmLockScheduleModal
        isOpen={isLockModalOpen}
        schedule={scheduleToLock}
        onClose={() => {
          setIsLockModalOpen(false);
          setScheduleToLock(null);
        }}
        onConfirm={handleConfirmLock}
      />
    </div>
  );
}
