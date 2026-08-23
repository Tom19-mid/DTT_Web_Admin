import { useState, useEffect } from "react";
import { X, ShieldCheck, Loader2, CreditCard, AlertCircle } from "lucide-react";
import type { FamilyMember } from "../types";

interface VerifyFamilyMemberModalProps {
  isOpen: boolean;
  member: FamilyMember | null;
  onClose: () => void;
  onConfirm: (memberId: number, cccdNumber: string) => Promise<void>;
}

export default function VerifyFamilyMemberModal({
  isOpen,
  member,
  onClose,
  onConfirm,
}: VerifyFamilyMemberModalProps) {
  const [cccdNumber, setCccdNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (member) {
      setCccdNumber(member.cccdNumber || "");
    } else {
      setCccdNumber("");
    }
    setError("");
  }, [member, isOpen]);

  if (!isOpen || !member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCccd = cccdNumber.trim();
    if (!cleanCccd) {
      setError("Vui lòng nhập số thẻ CCCD đối chiếu thực tế.");
      return;
    }
    if (!/^[0-9]{12}$/.test(cleanCccd)) {
      setError("Số CCCD phải gồm đúng 12 chữ số.");
      return;
    }

    setLoading(true);
    try {
      await onConfirm(member.id, cleanCccd);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Lỗi khi xác thực CCCD. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Xác thực CCCD người thân
              </h3>
              <p className="text-xs text-gray-500">
                Đối chiếu thẻ CCCD thực tế tại Quầy Tiếp Đón
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

        <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl mb-4 text-sm text-gray-700 space-y-1">
          <p>
            Người thân: <strong className="text-gray-900">{member.fullName}</strong> (
            <span className="text-blue-600 font-semibold">{member.relationship}</span>)
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
            <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1.5">
              <CreditCard size={16} className="text-gray-500" />
              Số CCCD thực tế (12 chữ số) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: 079198001234"
              maxLength={12}
              value={cccdNumber}
              onChange={(e) => {
                setCccdNumber(e.target.value);
                setError("");
              }}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-base font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md transition cursor-pointer text-sm disabled:opacity-50"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              <span>Duyệt & Xác thực</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
