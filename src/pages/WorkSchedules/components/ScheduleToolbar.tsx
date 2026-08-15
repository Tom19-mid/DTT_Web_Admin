import { CalendarDays, CheckCircle2, CalendarCheck, AlertTriangle, XCircle, Plus } from "lucide-react";

interface ScheduleToolbarProps {
  totalSchedules: number;
  emptyCount: number;
  availableCount: number;
  fullyBookedCount: number;
  unavailableCount: number;
  onAddSchedule: () => void;
}

export default function ScheduleToolbar({
  totalSchedules,
  emptyCount,
  availableCount,
  fullyBookedCount,
  unavailableCount,
  onAddSchedule,
}: ScheduleToolbarProps) {
  return (
    <div className="mb-6 space-y-5">
      {/* Action Header */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={onAddSchedule}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition cursor-pointer text-base active:scale-95"
        >
          <Plus size={20} />
          <span>Thêm lịch làm việc</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Tổng lịch làm việc
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {totalSchedules}
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <CalendarDays size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Trống lịch
            </p>
            <p className="text-2xl font-bold text-teal-600 mt-1">
              {emptyCount}
            </p>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <CalendarCheck size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Còn lịch để đặt
            </p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {availableCount}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Đã hết lịch
            </p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {fullyBookedCount}
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Không hoạt động
            </p>
            <p className="text-2xl font-bold text-rose-600 mt-1">
              {unavailableCount}
            </p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <XCircle size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}
