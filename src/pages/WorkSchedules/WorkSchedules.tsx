import { useState } from "react";
import { initialWorkSchedules } from "./data";
import type { WorkSchedule } from "./types";
import ScheduleToolbar from "./components/ScheduleToolbar";
import ScheduleTable from "./components/ScheduleTable";
import WorkScheduleFormModal from "./components/WorkScheduleFormModal";
import WorkScheduleDetailModal from "./components/WorkScheduleDetailModal";
import ConfirmLockScheduleModal from "./components/ConfirmLockScheduleModal";

export default function WorkSchedules() {
  const [schedules, setSchedules] = useState<WorkSchedule[]>(initialWorkSchedules);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<WorkSchedule | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingSchedule, setViewingSchedule] = useState<WorkSchedule | null>(null);

  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [scheduleToLock, setScheduleToLock] = useState<WorkSchedule | null>(null);

  // Statistics
  const totalSchedules = schedules.length;
  const emptyCount = schedules.filter((s) => s.status === "Trống lịch").length;
  const availableCount = schedules.filter((s) => s.status === "Còn lịch để đặt").length;
  const fullyBookedCount = schedules.filter(
    (s) => s.status === "Đã hết lịch để đặt"
  ).length;
  const unavailableCount = schedules.filter(
    (s) => s.status === "Không hoạt động"
  ).length;

  // Next Schedule ID auto increment (6, 7, 8...)
  const nextScheduleId =
    schedules.length > 0
      ? Math.max(...schedules.map((s) => Number(s.scheduleId) || 0)) + 1
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

  const handleConfirmLock = () => {
    if (!scheduleToLock) return;

    setSchedules((prev) =>
      prev.map((item) => {
        if (item.scheduleId === scheduleToLock.scheduleId) {
          const isCurrentlyLocked = item.status === "Không hoạt động";

          // ONLY "Chưa đặt lịch" slots get closed. "Đã đặt lịch" slots remain UNCHANGED!
          const updatedSlots = item.timeSlots.map((slot) => {
            if (slot.status === "Đã đặt lịch") {
              return { ...slot, status: "Đã đặt lịch" as const };
            }
            if (!isCurrentlyLocked) {
              // When locking, only close "Chưa đặt lịch" slots
              return slot.status === "Chưa đặt lịch"
                ? { ...slot, status: "Đã đóng" as const }
                : slot;
            } else {
              // When unlocking, revert "Đã đóng" back to "Chưa đặt lịch"
              return slot.status === "Đã đóng"
                ? { ...slot, status: "Chưa đặt lịch" as const }
                : slot;
            }
          });

          // Determine parent status when unlocking
          let newStatus: string;
          if (!isCurrentlyLocked) {
            newStatus = "Không hoạt động";
          } else {
            const hasBooked = updatedSlots.some((s) => s.status === "Đã đặt lịch");
            const hasAvailable = updatedSlots.some((s) => s.status === "Chưa đặt lịch");
            if (hasBooked && hasAvailable) {
              newStatus = "Còn lịch để đặt";
            } else if (hasBooked) {
              newStatus = "Đã hết lịch để đặt";
            } else {
              newStatus = "Trống lịch";
            }
          }

          return {
            ...item,
            status: newStatus,
            timeSlots: updatedSlots,
          };
        }
        return item;
      })
    );
    setIsLockModalOpen(false);
    setScheduleToLock(null);
  };

  const handleSaveSchedule = (savedData: WorkSchedule) => {
    if (editingSchedule) {
      setSchedules((prev) =>
        prev.map((item) =>
          item.scheduleId === savedData.scheduleId ? savedData : item
        )
      );
    } else {
      // Append new schedule to the end of the array (bottom of list)
      setSchedules((prev) => [...prev, savedData]);
    }
  };

  return (
    <div className="p-7 bg-[#f4f6f9] min-h-screen">
      <ScheduleToolbar
        totalSchedules={totalSchedules}
        emptyCount={emptyCount}
        availableCount={availableCount}
        fullyBookedCount={fullyBookedCount}
        unavailableCount={unavailableCount}
        onAddSchedule={handleOpenAdd}
      />

      <ScheduleTable
        schedules={schedules}
        onView={handleOpenView}
        onEdit={handleOpenEdit}
        onToggleLock={handleRequestLock}
      />

      {/* Add / Edit Schedule Modal (Sequential nextScheduleId) */}
      <WorkScheduleFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveSchedule}
        initialData={editingSchedule}
        nextScheduleId={nextScheduleId}
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