import {
  HeartHandshake,
  UserCheck,
  Clock,
  UserX,
  Plus,
} from "lucide-react";

interface FamilyMemberToolbarProps {
  onAddMember?: () => void;
  totalMembers: number;
  verifiedCount: number;
  pendingCount: number;
  rejectedCount: number;
}

export default function FamilyMemberToolbar({
  onAddMember,
  totalMembers,
  verifiedCount,
  pendingCount,
  rejectedCount,
}: FamilyMemberToolbarProps) {
  return (
    <div className="mb-6 space-y-5">
      {/* Header with Title and Add Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Người thân của bệnh nhân
        </h1>

        {onAddMember && (
          <button
            onClick={onAddMember}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-2xl shadow-sm transition-all duration-200 cursor-pointer active:scale-98"
          >
            <Plus size={20} />
            <span>Thêm người thân</span>
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Tổng người thân
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {totalMembers}
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <HeartHandshake size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Đã xác thực CCCD
            </p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {verifiedCount}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <UserCheck size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Chờ duyệt CCCD
            </p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {pendingCount}
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Từ chối / Đã khóa
            </p>
            <p className="text-2xl font-bold text-rose-600 mt-1">
              {rejectedCount}
            </p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <UserX size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}
