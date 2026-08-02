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
    <div className="flex items-center justify-center gap-1.5">
      <button
        onClick={onEdit}
        title="Chỉnh sửa chuyên khoa"
        className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
      >
        <Pencil size={20} />
      </button>
      <button
        onClick={onLock}
        title="Đổi trạng thái (Đang / Ngưng hoạt động)"
        className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
      >
        <LockKeyhole size={20} />
      </button>
    </div>
  );
}
