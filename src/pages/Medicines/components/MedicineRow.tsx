import { Pencil, Lock, Unlock, Eye } from "lucide-react";
import type { Medicine } from "../types";
import StatusBadge from "./StatusBadge";

interface MedicineRowProps {
  medicine: Medicine;
  onViewDetail: (medicine: Medicine) => void;
  onEdit: (medicine: Medicine) => void;
  onToggleStatus: (medicine: Medicine) => void;
}

export default function MedicineRow({
  medicine,
  onViewDetail,
  onEdit,
  onToggleStatus,
}: MedicineRowProps) {
  // Format date YYYY-MM-DD -> DD/MM/YYYY
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const isCurrentlyLocked =
    medicine.status === "Ngưng hoạt động" || medicine.status === "Inactive";

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors text-base text-gray-700">
      {/* 1. Mã thuốc */}
      <td className="py-4 px-4 font-medium text-gray-500 text-base text-center">
        {medicine.medicineId}
      </td>

      {/* 2. Mã nhóm thuốc (chỉ hiển thị ID: x) */}
      <td className="py-4 px-4 text-base text-center font-medium text-gray-700">
        ID: {medicine.categoryId}
      </td>

      {/* 3. Tên thuốc */}
      <td className="py-4 px-4 font-bold text-gray-900 text-base">
        <button
          onClick={() => onViewDetail(medicine)}
          className="hover:text-blue-600 transition text-left cursor-pointer"
        >
          {medicine.medicineName}
        </button>
      </td>

      {/* 4. Đơn vị tính */}
      <td className="py-4 px-4 text-base font-medium text-gray-600">
        {medicine.unit}
      </td>

      {/* 5. Mô tả */}
      <td className="py-4 px-4 text-base text-gray-600 font-normal max-w-[200px] truncate" title={medicine.description}>
        {medicine.description || "-"}
      </td>

      {/* 6. Hướng dẫn sử dụng */}
      <td className="py-4 px-4 text-base text-gray-600 font-normal max-w-[200px] truncate" title={medicine.defaultUsage}>
        {medicine.defaultUsage || "-"}
      </td>

      {/* 7. Đơn giá */}
      <td className="py-4 px-4 font-bold text-emerald-600 text-base whitespace-nowrap">
        {medicine.unitPrice.toLocaleString("vi-VN")} đ
      </td>

      {/* 8. Số lượng tồn kho */}
      <td className="py-4 px-4 text-center font-bold text-gray-900 text-base">
        {medicine.stockQuantity.toLocaleString("vi-VN")}
      </td>

      {/* 9. Hạn sử dụng */}
      <td className="py-4 px-4 text-base text-gray-600 font-medium whitespace-nowrap">
        {formatDate(medicine.expiryDate)}
      </td>

      {/* 10. Trạng thái */}
      <td className="py-4 px-4">
        <StatusBadge status={medicine.status} />
      </td>

      {/* 11. Chỉnh sửa (Actions) */}
      <td className="py-4 px-4 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => onViewDetail(medicine)}
            title="Xem chi tiết"
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
          >
            <Eye size={20} />
          </button>
          <button
            onClick={() => onEdit(medicine)}
            title="Chỉnh sửa thuốc"
            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
          >
            <Pencil size={20} />
          </button>
          <button
            onClick={() => onToggleStatus(medicine)}
            type="button"
            title={isCurrentlyLocked ? "Mở lại thuốc" : "Ngưng hoạt động thuốc"}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isCurrentlyLocked
                ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                : "text-rose-500 hover:text-rose-700 hover:bg-rose-50"
            }`}
          >
            {isCurrentlyLocked ? <Unlock size={20} /> : <Lock size={20} />}
          </button>
        </div>
      </td>
    </tr>
  );
}
