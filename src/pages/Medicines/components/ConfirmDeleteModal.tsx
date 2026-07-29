import { AlertTriangle, X } from "lucide-react";
import type { Medicine } from "../types";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  medicine: Medicine | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteModal({
  isOpen,
  medicine,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  if (!isOpen || !medicine) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-full">
            <AlertTriangle size={32} />
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900">Xác nhận xóa thuốc?</h3>
            <p className="text-sm text-gray-500 mt-1">
              Bạn có chắc chắn muốn xóa thuốc{" "}
              <span className="font-bold text-gray-900">"{medicine.medicineName}"</span> (Mã thuốc: #{medicine.medicineId})? Hành động này không thể hoàn tác.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 w-full pt-2">
            <button
              onClick={onClose}
              className="w-1/2 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition cursor-pointer text-sm"
            >
              Hủy bỏ
            </button>
            <button
              onClick={onConfirm}
              className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-md transition cursor-pointer text-sm"
            >
              Xác nhận xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
