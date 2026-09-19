import { useState, useEffect } from "react";
import { X, ShieldX, Loader2, AlertCircle } from "lucide-react";
import type { FamilyMember } from "../types";

interface RejectFamilyMemberModalProps {
  isOpen: boolean;
  member: FamilyMember | null;
  onClose: () => void;
  onConfirm: (memberId: number, reason?: string) => Promise<void>;
}

export default function RejectFamilyMemberModal({
  isOpen,
  member,
  onClose,
  onConfirm,
}: RejectFamilyMemberModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setReason("");
    setError("");
  }, [member, isOpen]);

  if (!isOpen || !member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onConfirm(member.id, reason.trim() || undefined);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Lỗi khi từ chối hồ sơ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shrink-0">
              <ShieldX size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Từ chối xác thực người thân
              </h3>
              <p className="text-xs text-gray-500">
                Hồ sơ sẽ được đánh dấu "Từ chối" và cần bổ sung/sửa lại thông tin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-3.5 bg-rose-50/50 border border-rose-100 rounded-xl mb-4 text-sm text-gray-700 space-y-1">
          <p>
            Người thân: <strong className="text-gray-900">{member.fullName}</strong> (
            <span className="text-rose-600 font-semibold">{member.relationship}</span>)
          </p>
          <p>
            Chủ tài khoản: <strong className="text-gray-900">{member.ownerFullName || "Bệnh nhân"}</strong>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Lý do từ chối <span className="text-gray-400 font-medium">(không bắt buộc)</span>
            </label>
            <textarea
              placeholder="VD: Thông tin CCCD không khớp với hồ sơ thực tế..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError("");
              }}
              rows={3}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition resize-none"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-100 transition cursor-pointer text-sm"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-md transition cursor-pointer text-sm disabled:opacity-50"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              <span>Từ chối hồ sơ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
