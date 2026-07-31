import { useState } from "react";
import type { WorkSchedule } from "../types";
import { ScheduleStatusBadge } from "./ScheduleStatusBadge";
import TimeSlotSubTable from "./TimeSlotSubTable";
import { ChevronDown, ChevronRight, Calendar, Eye, Pencil, Lock, Unlock } from "lucide-react";

interface ScheduleRowProps {
  schedule: WorkSchedule;
  defaultExpanded?: boolean;
  onView: (schedule: WorkSchedule) => void;
  onEdit: (schedule: WorkSchedule) => void;
  onToggleLock: (schedule: WorkSchedule) => void;
}

export default function ScheduleRow({
  schedule,
  defaultExpanded = false,
  onView,
  onEdit,
  onToggleLock,
}: ScheduleRowProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const isLocked = schedule.status === "Không hoạt động";

  return (
    <>
      {/* Parent Schedule Row */}
      <tr className="border-b border-gray-100 hover:bg-gray-50/70 transition-colors">
        {/* Mã lịch làm việc (Ở trên - Tròn màu xanh nước biển) */}
        <td className="py-4 px-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              title={isExpanded ? "Thu gọn khung giờ" : "Xem chi tiết khung giờ khám"}
            >
              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-100/90 text-blue-600 font-bold flex items-center justify-center text-sm shadow-2xs">
              {schedule.scheduleCode}
            </div>
          </div>
        </td>
        <td className="py-4 px-4 font-bold text-gray-900 text-base">
          <p className="font-bold text-gray-900 text-base">{schedule.doctorName}</p>
        </td>
        {/* Ngày làm việc - Chữ đậm font-bold text-gray-900 */}
        <td className="py-4 px-4 text-center font-medium text-gray-700 text-base">
          <div className="inline-flex items-center gap-1.5 bg-gray-100/80 px-3 py-1 rounded-xl">
            <Calendar size={15} className="text-gray-500" />
            <span className="font-bold text-gray-900">{schedule.workDate}</span>
          </div>
        </td>
        <td className="py-4 px-4 text-center font-medium text-gray-700 text-base">
          {schedule.startTime}
        </td>
        <td className="py-4 px-4 text-center font-medium text-gray-700 text-base">
          {schedule.endTime}
        </td>
        <td className="py-4 px-4 text-center">
          <ScheduleStatusBadge status={schedule.status} />
        </td>
        {/* Action Column: Eye (Gray), Pencil (Blue), Lock (Rose) matching Appointments page */}
        <td className="py-4 px-4 text-center">
          <div className="flex items-center justify-center gap-1">
            {/* Eye Icon - View Details (Gray) */}
            <button
              type="button"
              onClick={() => onView(schedule)}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              title="Xem chi tiết khung giờ"
            >
              <Eye size={20} />
            </button>

            {/* Pencil Icon - Edit Schedule (Blue) */}
            <button
              type="button"
              onClick={() => onEdit(schedule)}
              className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              title="Chỉnh sửa lịch làm việc"
            >
              <Pencil size={20} />
            </button>

            {/* Lock Icon - Lock / Set Unavailable (Rose/Emerald) */}
            <button
              type="button"
              onClick={() => onToggleLock(schedule)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isLocked
                  ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  : "text-rose-500 hover:text-rose-700 hover:bg-rose-50"
              }`}
              title={isLocked ? "Mở khóa lịch làm việc" : "Khóa / Đóng lịch làm việc (Không hoạt động)"}
            >
              {isLocked ? <Unlock size={20} /> : <Lock size={20} />}
            </button>
          </div>
        </td>
      </tr>

      {/* Indented Sub-Table Row */}
      {isExpanded && (
        <tr>
          <td colSpan={7} className="p-0 bg-slate-50/50">
            <TimeSlotSubTable
              scheduleCode={schedule.scheduleCode}
              timeSlots={schedule.timeSlots}
            />
          </td>
        </tr>
      )}
    </>
  );
}
