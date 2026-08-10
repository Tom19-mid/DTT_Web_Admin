import { Eye, Pencil } from "lucide-react";

interface ActionButtonsProps {
  onViewDetail?: () => void;
  onEdit?: () => void;
}

export default function ActionButtons({
  onViewDetail,
  onEdit,
}: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {onViewDetail && (
        <button
          onClick={onViewDetail}
          title="Xem chi tiết bệnh nhân"
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
        >
          <Eye size={20} />
        </button>
      )}
      <button
        onClick={onEdit}
        title="Chỉnh sửa hồ sơ bệnh nhân"
        className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
      >
        <Pencil size={20} />
      </button>
    </div>
  );
}
