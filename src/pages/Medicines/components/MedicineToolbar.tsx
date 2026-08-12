import { Plus, Pill, CheckCircle, MinusCircle, Boxes } from "lucide-react";

interface MedicineToolbarProps {
  onAddMedicine: () => void;
  onOpenCategoryManager?: () => void;
  totalMedicines: number;
  activeCount: number;
  inactiveCount: number;
  categoriesCount: number;
}

export default function MedicineToolbar({
  onAddMedicine,
  onOpenCategoryManager,
  totalMedicines,
  activeCount,
  inactiveCount,
  categoriesCount,
}: MedicineToolbarProps) {
  return (
    <div className="mb-6 space-y-4">
      {/* Action bar below Tabs */}
      <div className="flex items-center justify-end">
        <button
          onClick={onAddMedicine}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer active:scale-95 text-base"
        >
          <Plus size={20} />
          <span>Thêm thuốc mới</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tổng loại thuốc</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalMedicines}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Pill size={24} />
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

        <div
          onClick={onOpenCategoryManager}
          className="bg-white p-5 rounded-2xl border border-purple-100 hover:border-purple-300 shadow-xs flex items-center justify-between cursor-pointer transition group"
        >
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-purple-600 transition">Nhóm danh mục</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{categoriesCount}</p>
          </div>
          <div className="p-3 bg-purple-50 group-hover:bg-purple-100 text-purple-600 rounded-xl transition">
            <Boxes size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}

