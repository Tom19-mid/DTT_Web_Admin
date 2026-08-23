import { useState, useEffect, useCallback } from "react";
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
import ToastNotification, { type ToastMessage } from "../../components/common/ToastNotification";
import { notificationApi } from "../../api/notificationApi";
import NotificationDetailModal from "../Notifications/components/NotificationDetailModal";
import type { Notification } from "../Notifications/types";
import { CalendarDays, Clock, Loader2 } from "lucide-react";

export default function WorkSchedules() {
  const [activeTab, setActiveTab] = useState<"schedules" | "slots">(
    "schedules",
  );
  const [schedules, setSchedules] = useState<WorkSchedule[]>(() => workScheduleApi.getCachedSchedules() || []);
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(() => !workScheduleApi.getCachedSchedules());

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

  // Fetch data from Back-End API
  // Trước đây khi API trả về mảng RỖNG HỢP LỆ (đúng nghĩa là chưa có lịch làm việc nào) cũng bị thay
  // bằng initialWorkSchedules (dữ liệu mẫu giả — bác sĩ "BS. Nguyễn Văn Bình" không có thật) như thể
  // đó là lịch thật, khiến Admin tưởng nhầm hệ thống đã có sẵn lịch. Chỉ dùng dữ liệu mẫu khi API THẬT
  // SỰ LỖI (catch), không dùng khi API trả về thành công nhưng danh sách rỗng.
  const fetchSchedules = async (showLoading = false) => {
    if (showLoading && !workScheduleApi.getCachedSchedules()) setIsLoading(true);
    try {
      const data = await workScheduleApi.getAll();
      setSchedules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.warn(
        "Lỗi khi tải lịch làm việc từ API, sử dụng mock data fallback:",
        error,
      );
      setSchedules(initialWorkSchedules);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (!workScheduleApi.getCachedSchedules()) {
      setIsLoading(true);
    }
    Promise.all([workScheduleApi.getAll(), doctorApi.getAll()])
      .then(([schData, docList]) => {
        if (!isMounted) return;
        if (Array.isArray(schData)) {
          setSchedules(schData);
        }
        if (Array.isArray(docList)) setDoctors(docList);
      })
      .catch((error) => {
        console.warn("Lỗi tải dữ liệu song song trong WorkSchedules:", error);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    fetchSchedules(false);
  }, [activeTab]);

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

    const docName = scheduleToLock.doctorName || "bác sĩ";
    const schId = scheduleToLock.scheduleId;
    const adminUserId = getLoggedInAdminUserId();
    const isCurrentlyLocked = scheduleToLock.status === "Không hoạt động";
    const nextStatus = !isCurrentlyLocked ? "Không hoạt động" : "Trống lịch";

    // 1. Close modal immediately
    setIsLockModalOpen(false);
    setScheduleToLock(null);

    // 2. Optimistic UI update for 0ms instant UI change
    setSchedules((prev) =>
      prev.map((s) => (s.scheduleId === schId ? { ...s, status: nextStatus } : s))
    );

    const notiData: Notification = {
      notificationId: Date.now(),
      title: "Khóa / Đổi trạng thái lịch làm việc",
      content: `Lịch làm việc #${schId} của bác sĩ "${docName}" đã chuyển sang trạng thái ${!isCurrentlyLocked ? "Không hoạt động / Đã khóa" : "Hoạt động trở lại"}.`,
      type: "system",
      isRead: false,
      createdAt: new Date().toISOString(),
      userId: adminUserId,
    };

    // 3. Show Toast immediately with onClick to open modal
    addToast({
      type: "success",
      title: "Khóa lịch làm việc",
      message: `Đã cập nhật trạng thái lịch làm việc #${schId} của bác sĩ "${docName}" thành công!`,
      onClick: () => setViewingNotification(notiData),
    });

    // 4. Immediately trigger system notification (updates bell badge in 0ms)
    notificationApi.create(notiData).catch((e) => console.warn("Lỗi tạo thông báo:", e));

    // 5. Background execution
    try {
      await workScheduleApi.toggleLock(schId, !isCurrentlyLocked);
      fetchSchedules(false);
    } catch (error: any) {
      console.error("Lỗi khi khóa/mở khóa lịch làm việc:", error);
      fetchSchedules(false);
      addToast({
        type: "error",
        title: "Lỗi thao tác",
        message: error.message || "Lỗi khi cập nhật trạng thái lịch làm việc!",
      });
    }
  };

  const handleSaveSchedule = async (savedData: WorkSchedule) => {
    const docName = savedData.doctorName || "bác sĩ";
    const adminUserId = getLoggedInAdminUserId();

    setIsFormModalOpen(false);

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

    try {
      if (editingSchedule && editingSchedule.scheduleId) {
        const schId = editingSchedule.scheduleId;
        setEditingSchedule(null);

        // Optimistic update
        setSchedules((prev) =>
          prev.map((s) => (s.scheduleId === schId ? { ...s, ...savedData, doctorId: docId } : s))
        );

        const notiData: Notification = {
          notificationId: Date.now(),
          title: "Cập nhật lịch làm việc",
          content: `Hệ thống vừa cập nhật thông tin lịch làm việc #${schId} của bác sĩ "${docName}".`,
          type: "system",
          isRead: false,
          createdAt: new Date().toISOString(),
          userId: adminUserId,
        };

        addToast({
          type: "success",
          title: "Cập nhật lịch làm việc",
          message: `Đã cập nhật lịch làm việc #${schId} của bác sĩ "${docName}" thành công!`,
          onClick: () => setViewingNotification(notiData),
        });

        // Trigger notification immediately for instant bell badge update
        notificationApi.create(notiData).catch((e) => console.warn("Lỗi tạo thông báo:", e));

        await workScheduleApi.update(schId, {
          doctorId: docId,
          doctorName: savedData.doctorName,
          workDate: savedData.workDate,
          startTime: savedData.startTime,
          endTime: savedData.endTime,
          status: savedData.status,
          timeSlots: savedData.timeSlots,
        });
      } else {
        setEditingSchedule(null);
        const notiData: Notification = {
          notificationId: Date.now(),
          title: "Thêm lịch làm việc mới",
          content: `Đã tạo mới thành công lịch làm việc cho bác sĩ "${docName}" vào ngày ${savedData.workDate || ""}.`,
          type: "system",
          isRead: false,
          createdAt: new Date().toISOString(),
          userId: adminUserId,
        };

        addToast({
          type: "success",
          title: "Thêm lịch làm việc",
          message: `Đã thêm mới lịch làm việc của bác sĩ "${docName}" thành công!`,
          onClick: () => setViewingNotification(notiData),
        });

        // Trigger notification immediately for instant bell badge update
        notificationApi.create(notiData).catch((e) => console.warn("Lỗi tạo thông báo:", e));

        await workScheduleApi.create({
          doctorId: docId,
          doctorName: savedData.doctorName,
          workDate: savedData.workDate || "",
          startTime: savedData.startTime || "08:00",
          endTime: savedData.endTime || "12:00",
          status: savedData.status || "Trống lịch",
        });
      }
      fetchSchedules(false);
    } catch (error: any) {
      console.error("Lỗi khi lưu lịch làm việc:", error);
      fetchSchedules(false);
      addToast({
        type: "error",
        title: "Lỗi thao tác",
        message: error.message || "Lỗi khi lưu thông tin lịch làm việc!",
      });
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

          {isLoading && schedules.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-normal bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span>Đang tải dữ liệu lịch làm việc...</span>
            </div>
          ) : (
            <ScheduleTable
              schedules={safeSchedules}
              doctors={doctors}
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
          doctors={doctors}
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
        onAddToast={addToast}
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
