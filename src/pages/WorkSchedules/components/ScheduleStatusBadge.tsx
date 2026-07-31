import type { ScheduleStatus, SlotStatus } from "../types";

interface ScheduleStatusBadgeProps {
  status: ScheduleStatus;
}

export function ScheduleStatusBadge({ status }: ScheduleStatusBadgeProps) {
  switch (status) {
    case "Trống lịch":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-teal-100 text-teal-800 border border-teal-200 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span>Trống lịch</span>
        </span>
      );
    case "Còn lịch để đặt":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Còn lịch để đặt</span>
        </span>
      );
    case "Đã hết lịch để đặt":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-800 border border-amber-200 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Đã hết lịch để đặt</span>
        </span>
      );
    case "Không hoạt động":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-rose-100 text-rose-800 border border-rose-200 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>Không hoạt động</span>
        </span>
      );
    default:
      return null;
  }
}

interface SlotStatusBadgeProps {
  status: SlotStatus;
}

export function SlotStatusBadge({ status }: SlotStatusBadgeProps) {
  switch (status) {
    case "Chưa đặt lịch":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-800 border border-amber-300">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Chưa đặt lịch</span>
        </span>
      );
    case "Đã đặt lịch":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Đã đặt lịch</span>
        </span>
      );
    case "Đã đóng":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-rose-100 text-rose-800 border border-rose-300">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>Đã đóng</span>
        </span>
      );
    default:
      return null;
  }
}
