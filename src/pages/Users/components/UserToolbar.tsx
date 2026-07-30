import { Plus, Users, UserCheck, UserMinus, UserX } from "lucide-react";

interface UserToolbarProps {
  onAddUser?: () => void;
  totalUsers: number;
  activeCount: number;
  inactiveCount: number;
  lockedCount: number;
}

export default function UserToolbar({
  onAddUser,
  totalUsers,
  activeCount,
  inactiveCount,
  lockedCount,
}: UserToolbarProps) {
  return (
    <div className="mb-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý tài khoản</h1>
        <button
          onClick={onAddUser}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-2xl shadow-sm transition flex items-center gap-2 cursor-pointer active:scale-95 text-base"
        >
          <Plus size={20} />
          <span>Thêm tài khoản mới</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tổng tài khoản</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalUsers}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users size={24} />
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
