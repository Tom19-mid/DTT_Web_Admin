import { Pencil, Lock, Unlock } from "lucide-react";

interface ActionButtonsProps {
  onEdit?: () => void;
  onLock?: () => void;
  isLocked?: boolean;
}

export default function ActionButtons({
  onEdit,
  onLock,
  isLocked = false,
}: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onEdit}
        title="Chỉnh sửa tài khoản"
        className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
      >
        <Pencil size={20} />
      </button>
      <button
        onClick={onLock}
        type="button"
        title={isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
        className={`p-2 rounded-lg transition-colors cursor-pointer ${
          isLocked
            ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
            : "text-rose-500 hover:text-rose-700 hover:bg-rose-50"
        }`}
      >
        {isLocked ? <Unlock size={20} /> : <Lock size={20} />}
      </button>
    </div>
  );
}
