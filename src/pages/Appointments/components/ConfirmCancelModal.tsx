import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import type { Appointment } from "../types";

interface ConfirmCancelModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onConfirmCancel: (appointmentId: number, cancelReason: string, cancelledBy: string) => void;
}

export default function ConfirmCancelModal({
  isOpen,
  appointment,
  onClose,
  onConfirmCancel,
}: ConfirmCancelModalProps) {
  const [prevAppointment, setPrevAppointment] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState("Bệnh nhân yêu cầu hủy lịch");
  const [cancelledBy, setCancelledBy] = useState("Lễ tân");

  if (appointment !== prevAppointment) {
    setPrevAppointment(appointment);
    setCancelReason("Bệnh nhân yêu cầu hủy lịch");
    setCancelledBy("Lễ tân");
  }

  if (!isOpen || !appointment) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmCancel(
      appointment.appointmentId ?? appointment.id,
      cancelReason.trim() || "Lễ tân hủy lịch",
      cancelledBy.trim() || "Lễ tân"
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
        >
          <X size={20} />
        </button>

        <form onSubmit={handleConfirm} className="space-y-4">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-3.5 bg-rose-100 text-rose-600 rounded-full">
              <AlertTriangle size={32} />
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900">Xác nhận hủy lịch hẹn</h3>
              <p className="text-base text-gray-600 mt-1">
                Bạn có chắc chắn muốn hủy lịch hẹn của bệnh nhân{" "}
                <span className="font-bold text-gray-900">"{appointment.patientName}"</span> không?
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Lý do hủy <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Nhập lý do hủy lịch..."
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-2 text-base text-gray-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Người thực hiện hủy <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={cancelledBy}
                onChange={(e) => setCancelledBy(e.target.value)}
                placeholder="Lễ tân, Bác sĩ..."
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-2 text-base text-gray-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 w-full pt-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition cursor-pointer text-base"
            >
              Quay lại
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition cursor-pointer text-base"
            >
              Hủy lịch hẹn
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
