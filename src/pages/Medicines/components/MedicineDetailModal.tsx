import { X, Edit, Pill, Hash, Layers, Tag, DollarSign, Calendar, Info, FileText } from "lucide-react";
import type { Medicine, MedicineCategory } from "../types";
import StatusBadge from "./StatusBadge";

interface MedicineDetailModalProps {
  isOpen: boolean;
  medicine: Medicine | null;
  categories: MedicineCategory[];
  onClose: () => void;
  onEdit: (medicine: Medicine) => void;
}

export default function MedicineDetailModal({
  isOpen,
  medicine,
  categories,
  onClose,
  onEdit,
}: MedicineDetailModalProps) {
  if (!isOpen || !medicine) return null;

  const category = categories.find((c) => c.categoryId === medicine.categoryId);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Pill size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{medicine.medicineName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-base font-semibold text-gray-500">
                  Mã thuốc: #{medicine.medicineId}
                </span>
                <span className="text-gray-300">•</span>
                <StatusBadge status={medicine.status} />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Details Grid in INSERT Order */}
        <div className="space-y-4 text-base text-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">
                <Hash size={16} className="text-gray-400" />
                Mã thuốc
              </div>
              <p className="font-bold text-gray-900 text-base">#{medicine.medicineId}</p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">
                <Layers size={16} className="text-gray-400" />
                Mã nhóm thuốc
              </div>
              <p className="font-bold text-gray-900 text-base">
                ID: {medicine.categoryId} {category ? `(${category.categoryName})` : ""}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">
                <Tag size={16} className="text-gray-400" />
                Đơn vị tính
              </div>
              <span className="px-3.5 py-1 bg-gray-100 text-gray-800 rounded-lg font-bold text-base inline-block">
                {medicine.unit}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">
                <DollarSign size={16} className="text-gray-400" />
                Đơn giá
              </div>
              <p className="font-bold text-emerald-600 text-lg">
                {medicine.unitPrice.toLocaleString("vi-VN")} VNĐ
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">
              <Info size={16} className="text-gray-400" />
              Mô tả
            </div>
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 leading-relaxed text-base">
              {medicine.description || "Không có mô tả."}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">
              <FileText size={16} className="text-gray-400" />
              Hướng dẫn sử dụng
            </div>
            <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100/60 text-gray-800 leading-relaxed text-base">
              {medicine.defaultUsage || "Chưa có hướng dẫn sử dụng mặc định."}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">
                Số lượng tồn kho
              </div>
              <p className="text-xl font-bold text-gray-900">
                {medicine.stockQuantity.toLocaleString("vi-VN")} {medicine.unit}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">
                <Calendar size={16} className="text-gray-400" />
                Hạn sử dụng
              </div>
              <p className="text-lg font-bold text-gray-900">{formatDate(medicine.expiryDate)}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-5 mt-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition cursor-pointer text-base"
          >
            Đóng
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(medicine);
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition cursor-pointer text-base"
          >
            <Edit size={18} />
            <span>Chỉnh sửa</span>
          </button>
        </div>
      </div>
    </div>
  );
}
