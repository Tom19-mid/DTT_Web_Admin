import { LockKeyhole, X } from "lucide-react";
import type { Patient } from "../types";

interface ConfirmLockModalProps {
  isOpen: boolean;
  patient: Patient | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmLockModal({
  isOpen,
  patient,
  onClose,
  onConfirm,
}: ConfirmLockModalProps) {
  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg transition cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center py-2">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4 shrink-0">
            <LockKeyhole size={28} />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Xác nhận khóa hồ sơ bệnh nhân
          </h3>

          <p className="text-base text-gray-600 mb-6">
            Bạn có chắc chắn muốn khóa hồ sơ của bệnh nhân{" "}
            <span className="font-bold text-gray-900">{patient.fullName || `Bệnh nhân #${patient.patientId || patient.id}`}</span>
            {(patient.code || patient.healthInsuranceNumber || patient.phoneNumber) && (
              <> (<span className="text-blue-600 font-bold">{patient.code || patient.healthInsuranceNumber || patient.phoneNumber}</span>)</>
            )} không?
          </p>

          <div className="flex items-center justify-center gap-3 w-full">
            <button
              onClick={onClose}
              className="w-1/2 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition cursor-pointer text-base"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm transition cursor-pointer text-base"
            >
              Khóa bệnh nhân
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
