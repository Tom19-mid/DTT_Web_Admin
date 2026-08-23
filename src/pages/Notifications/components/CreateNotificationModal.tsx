import { useState } from "react";
import { X, Send, Bell, Loader2 } from "lucide-react";
import type { CreateNotificationPayload } from "../../../api/notificationApi";

interface CreateNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateNotificationPayload) => Promise<boolean>;
}

export default function CreateNotificationModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateNotificationModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("system");
  // Trước đây modal này không có ô chọn đối tượng nhận — backend luôn ngầm hiểu "phát cho bệnh
  // nhân", nên Bác sĩ KHÔNG BAO GIỜ nhận được thông báo Admin tạo (đúng như QA report "Admin tạo
  // thông báo nhưng trên winforms bác sĩ không thấy thông báo đó").
  const [targetRole, setTargetRole] = useState<"PATIENT" | "DOCTOR">("PATIENT");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Vui lòng nhập tiêu đề thông báo.");
      return;
    }
    if (!content.trim()) {
      setErrorMsg("Vui lòng nhập nội dung thông báo.");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);
    try {
      const success = await onSubmit({
        title: title.trim(),
        content: content.trim(),
        type: type,
        targetRole,
      });

      if (success) {
        setTitle("");
        setContent("");
        setType("system");
        setTargetRole("PATIENT");
        onClose();
      } else {
        setErrorMsg("Tạo thông báo thất bại. Vui lòng thử lại.");
      }
    } catch (err) {
      setErrorMsg("Đã xảy ra lỗi khi kết nối máy chủ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl px-7 sm:px-8 py-6 relative animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 shadow-2xs">
              <Bell size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Tạo thông báo mới</h2>
              <p className="text-sm text-gray-500 font-medium mt-0.5">Phát thông báo tới người dùng hệ thống</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 text-gray-400 hover:text-gray-600 rounded-2xl hover:bg-gray-100 transition cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="pt-5 pb-0 space-y-5">
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-base font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-base font-bold text-gray-800 mb-2">
              Đối tượng nhận <span className="text-rose-500">*</span>
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value as "PATIENT" | "DOCTOR")}
              className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-gray-50/50 text-gray-900 font-medium text-base focus:outline-none focus:border-blue-500 focus:bg-white transition"
            >
              <option value="PATIENT">Tất cả Bệnh nhân (App Mobile)</option>
              <option value="DOCTOR">Tất cả Bác sĩ (WinForms)</option>
            </select>
          </div>

          <div>
            <label className="block text-base font-bold text-gray-800 mb-2">
              Loại thông báo <span className="text-rose-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-gray-50/50 text-gray-900 font-medium text-base focus:outline-none focus:border-blue-500 focus:bg-white transition"
            >
              <option value="system">Thông báo Hệ thống (Chung)</option>
              <option value="APPOINTMENT_REMINDER">Lời nhắc Lịch hẹn</option>
              <option value="APPOINTMENT_NEW">Lịch hẹn mới</option>
              <option value="PATIENT_REGISTERED">Bệnh nhân mới</option>
            </select>
          </div>

          <div>
            <label className="block text-base font-bold text-gray-800 mb-2">
              Tiêu đề thông báo <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Nhập tiêu đề thông báo..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-gray-50/50 text-gray-900 font-medium text-base focus:outline-none focus:border-blue-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-base font-bold text-gray-800 mb-2">
              Nội dung thông báo <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Nhập nội dung chi tiết thông báo gửi đến người dùng..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-gray-50/50 text-gray-900 font-medium text-base focus:outline-none focus:border-blue-500 focus:bg-white transition resize-none leading-relaxed"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3.5 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-200 rounded-2xl text-gray-700 font-bold text-base hover:bg-gray-50 transition cursor-pointer active:scale-95"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2.5 px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-2xl shadow-sm transition cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Send size={20} />
                  <span>Gửi thông báo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
