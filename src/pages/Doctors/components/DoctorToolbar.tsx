import { Stethoscope, UserCheck, UserMinus, UserX, Calendar } from "lucide-react";

interface DoctorToolbarProps {
  onAddDoctor?: () => void;
  totalDoctors: number;
  activeCount: number;
  inactiveCount: number;
  onLeaveCount: number;
  lockedCount: number;
}

export default function DoctorToolbar({
  totalDoctors,
  activeCount,
  inactiveCount,
  onLeaveCount,
  lockedCount,
}: DoctorToolbarProps) {
  return (
    <div className="mb-6 space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tổng bác sĩ</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalDoctors}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Stethoscope size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Đang hoạt động</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <UserCheck size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ngưng hoạt động</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{inactiveCount}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <UserMinus size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nghỉ phép</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{onLeaveCount}</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Calendar size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Đã khóa</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{lockedCount}</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <UserX size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}
