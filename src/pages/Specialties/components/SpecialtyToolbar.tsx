import { Plus, HeartPulse, CheckCircle, MinusCircle } from "lucide-react";

interface SpecialtyToolbarProps {
  onAddSpecialty?: () => void;
  totalSpecialties: number;
  activeCount: number;
  inactiveCount: number;
}

export default function SpecialtyToolbar({
  onAddSpecialty,
  totalSpecialties,
  activeCount,
  inactiveCount,
}: SpecialtyToolbarProps) {
  return (
    <div className="mb-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý chuyên khoa</h1>
        <button
          onClick={onAddSpecialty}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-2xl shadow-sm transition flex items-center gap-2 cursor-pointer active:scale-95 text-base"
        >
          <Plus size={20} />
          <span>Thêm chuyên khoa mới</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tổng chuyên khoa</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalSpecialties}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <HeartPulse size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Đang hoạt động</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ngưng hoạt động</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{inactiveCount}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <MinusCircle size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}
