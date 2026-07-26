import { Pencil, LockKeyhole } from "lucide-react";

interface ActionButtonsProps {
  onEdit?: () => void;
  onLock?: () => void;
}

export default function ActionButtons({
  onEdit,
  onLock,
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
        title="Khóa tài khoản"
        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
      >
        <LockKeyhole size={20} />
      </button>
    </div>
  );
}
