import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react";

interface AppointmentToolbarProps {
  onAddAppointment?: () => void;
  totalAppointments: number;
  waitingAndExaminingCount: number;
  completedCount: number;
  cancelledAndMissedCount: number;
}

export default function AppointmentToolbar({
  totalAppointments,
  waitingAndExaminingCount,
  completedCount,
  cancelledAndMissedCount,
}: AppointmentToolbarProps) {
  return (
    <div className="mb-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý lịch hẹn</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tổng lịch hẹn</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalAppointments}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Calendar size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Chờ & Đang khám</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{waitingAndExaminingCount}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Đã hoàn thành</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{completedCount}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Hủy & Vắng mặt</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{cancelledAndMissedCount}</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <XCircle size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}
