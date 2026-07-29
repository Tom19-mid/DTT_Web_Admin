import { Plus } from "lucide-react";

interface MedicineToolbarProps {
  onAddMedicine: () => void;
}

export default function MedicineToolbar({ onAddMedicine }: MedicineToolbarProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-gray-900">Quản lý thuốc</h1>
      <button
        onClick={onAddMedicine}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-2xl shadow-sm transition flex items-center gap-2 cursor-pointer active:scale-95 text-base"
      >
        <Plus size={20} />
        <span>Thêm thuốc mới</span>
      </button>
    </div>
  );
}
