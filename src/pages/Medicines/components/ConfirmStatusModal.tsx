import { LockKeyhole, X } from "lucide-react";
import type { Medicine } from "../types";

interface ConfirmStatusModalProps {
  isOpen: boolean;
  medicine: Medicine | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmStatusModal({
  isOpen,
  medicine,
  onClose,
  onConfirm,
}: ConfirmStatusModalProps) {
  if (!isOpen || !medicine) return null;

  const isOperating = medicine.status === "Đang hoạt động";
  const targetStatus = isOperating ? "Ngưng hoạt động" : "Đang hoạt động";
  const targetStatusClass =
    targetStatus === "Đang hoạt động" ? "text-emerald-600" : "text-amber-600";

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
          <div className="p-3 bg-amber-100 text-amber-600 rounded-full">
            <LockKeyhole size={32} />
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900">Xác nhận chuyển trạng thái</h3>
            <p className="text-base text-gray-600 mt-2">
              Bạn có muốn thay đổi trạng thái của thuốc{" "}
              <span className="font-bold text-gray-900">"{medicine.medicineName}"</span> sang{" "}
              <span className={`font-bold ${targetStatusClass}`}>"{targetStatus}"</span>?
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 w-full pt-2">
            <button
              onClick={onClose}
              className="w-1/2 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition cursor-pointer text-base"
            >
              Hủy bỏ
            </button>
            <button
              onClick={onConfirm}
              className="w-1/2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition cursor-pointer text-base"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
