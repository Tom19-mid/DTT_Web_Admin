import { AlertTriangle, Loader2 } from "lucide-react";
import type { FamilyMember } from "../types";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  member: FamilyMember | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export default function ConfirmDeleteModal({
  isOpen,
  member,
  onClose,
  onConfirm,
  loading = false,
}: ConfirmDeleteModalProps) {
  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shrink-0">
            <AlertTriangle size={26} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Xóa hồ sơ người thân?
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Hành động này không thể hoàn tác.
            </p>
          </div>
        </div>

        <p className="text-base text-gray-700 leading-relaxed mb-6">
          Bạn có chắc chắn muốn xóa hồ sơ người thân{" "}
          <strong className="text-gray-900 font-bold">
            "{member.fullName}"
          </strong>{" "}
          ({member.relationship}) khỏi tài khoản của bệnh nhân{" "}
          <strong className="text-blue-600 font-bold">
            {member.ownerFullName || "Bệnh nhân chính"}
          </strong>
          ?
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-100 transition cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-md transition cursor-pointer disabled:opacity-50"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            <span>Xóa hồ sơ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
