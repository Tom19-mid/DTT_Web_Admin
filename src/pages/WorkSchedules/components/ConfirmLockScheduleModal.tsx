import { LockKeyhole, X, AlertCircle } from "lucide-react";
import type { WorkSchedule } from "../types";

interface ConfirmLockScheduleModalProps {
  isOpen: boolean;
  schedule: WorkSchedule | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmLockScheduleModal({
  isOpen,
  schedule,
  onClose,
  onConfirm,
}: ConfirmLockScheduleModalProps) {
  if (!isOpen || !schedule) return null;

  const isCurrentlyLocked = schedule.status === "Không hoạt động";
  const bookedSlotsCount = schedule.timeSlots.filter(
    (s) => s.status === "Đã đặt lịch"
  ).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center py-2">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4 shrink-0 shadow-2xs">
            <LockKeyhole size={28} />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {isCurrentlyLocked ? "Mở khóa lịch làm việc" : "Xác nhận khóa lịch làm việc"}
          </h3>

          <p className="text-base text-gray-600 mb-4 leading-relaxed">
            Bạn có chắc chắn muốn {isCurrentlyLocked ? "mở khóa" : "khóa lịch làm việc"} {" "}
            <span className="font-bold text-gray-900">{schedule.doctorName || `Bác sĩ ${schedule.doctorId}`}</span> (Ngày:{" "}
            <span className="font-bold text-blue-600">{schedule.workDate}</span>) không?
          </p>

          {!isCurrentlyLocked && (
            <div className="w-full bg-amber-50 border border-amber-200/80 rounded-xl p-3 mb-5 text-left flex items-start gap-2.5">
              <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900 font-semibold leading-normal">
                Lưu ý: Chỉ những khung giờ <span className="font-bold text-amber-700 font-extrabold">Chưa đặt lịch</span> mới chuyển sang trạng thái <span className="font-bold text-rose-700">Đã đóng</span>. Các khung giờ <span className="font-bold text-emerald-700">Đã đặt lịch</span> ({bookedSlotsCount} suất) sẽ giữ nguyên không thể đóng.
              </p>
            </div>
          )}

          <div className="flex items-center justify-center gap-3 w-full">
            <button
              onClick={onClose}
              className="w-1/2 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition cursor-pointer text-base"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`w-1/2 py-2.5 text-white font-bold rounded-xl shadow-sm transition cursor-pointer text-base ${
                isCurrentlyLocked
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {isCurrentlyLocked ? "Mở khóa lịch" : "Khóa lịch làm việc"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
