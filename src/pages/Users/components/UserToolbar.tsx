import { Plus } from "lucide-react";

interface UserToolbarProps {
  onAddUser?: () => void;
}

export default function UserToolbar({ onAddUser }: UserToolbarProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-gray-900">Quản lý tài khoản</h1>
      <button
        onClick={onAddUser}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-2xl shadow-sm transition flex items-center gap-2 cursor-pointer active:scale-95"
      >
        <Plus size={20} />
        <span>Thêm tài khoản mới</span>
      </button>
    </div>
  );
}
