import { X, Calendar, Clock, User } from "lucide-react";
import type { WorkSchedule } from "../types";
import { ScheduleStatusBadge } from "./ScheduleStatusBadge";
import TimeSlotSubTable from "./TimeSlotSubTable";

interface WorkScheduleDetailModalProps {
  isOpen: boolean;
  schedule: WorkSchedule | null;
  onClose: () => void;
}

export default function WorkScheduleDetailModal({
  isOpen,
  schedule,
  onClose,
}: WorkScheduleDetailModalProps) {
  if (!isOpen || !schedule) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-6 sm:p-8 relative max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xl shadow-2xs">
              <Calendar size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Chi tiết Lịch làm việc (Mã: {schedule.scheduleCode})
              </h2>
              <p className="text-base text-gray-500 mt-0.5">
                Bác sĩ: <span className="font-bold text-gray-800">{schedule.doctorName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        {/* Schedule Info Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6 bg-gray-50/90 p-5 rounded-2xl border border-gray-200/90 shadow-2xs">
          <div>
            <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <User size={15} className="text-blue-600" /> Bác sĩ phụ trách:
            </span>
            <p className="font-bold text-gray-900 text-lg">{schedule.doctorName}</p>
          </div>

          <div>
            <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Calendar size={15} className="text-blue-600" /> Ngày làm việc:
            </span>
            <p className="font-bold text-gray-900 text-lg">{schedule.workDate}</p>
          </div>

          <div>
            <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Clock size={15} className="text-emerald-600" /> Ca trực:
            </span>
            <p className="font-extrabold text-emerald-700 text-lg">
              {schedule.startTime} - {schedule.endTime}
            </p>
          </div>

          <div className="sm:col-span-3 pt-3 border-t border-gray-200/80 flex items-center justify-between">
            <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">
              Trạng thái ca làm việc:
            </span>
            <ScheduleStatusBadge status={schedule.status} />
          </div>
        </div>

        {/* Time slots detailed list */}
        <TimeSlotSubTable
          scheduleCode={schedule.scheduleCode}
          timeSlots={schedule.timeSlots}
          isModal={true}
        />

        {/* Footer */}
        <div className="flex items-center justify-end pt-5 border-t border-gray-100 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-7 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition cursor-pointer text-base"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
