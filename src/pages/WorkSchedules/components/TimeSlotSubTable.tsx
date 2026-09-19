import type { TimeSlot } from "../types";
import { SlotStatusBadge } from "./ScheduleStatusBadge";
import { Clock } from "lucide-react";

interface TimeSlotSubTableProps {
  scheduleCode: string;
  timeSlots: TimeSlot[];
  isModal?: boolean;
}

export default function TimeSlotSubTable({
  scheduleCode,
  timeSlots,
  isModal = false,
}: TimeSlotSubTableProps) {
  const safeTimeSlots = Array.isArray(timeSlots) ? timeSlots : [];

  return (
    <div
      className={`${
        isModal ? "p-4" : "pl-6 sm:pl-12 pr-4 py-4"
      } bg-slate-50/90 border border-slate-200/90 my-2 rounded-2xl shadow-xs`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
          <Clock size={16} />
        </div>
        <h4 className="font-bold text-gray-800 text-base">
          Danh sách khung giờ khám chi tiết (Mã lịch: <span className="text-blue-600 font-bold">{scheduleCode}</span>)
        </h4>
        <span className="text-xs bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-semibold">
          {safeTimeSlots.length} khung giờ
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left border-collapse min-w-[750px]">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-bold text-sm border-b border-slate-200">
              <th className="py-3.5 px-4 text-center">Mã khung giờ</th>
              <th className="py-3.5 px-4 text-center">Số thứ tự</th>
              <th className="py-3.5 px-4 text-center">Mã lịch làm việc</th>
              <th className="py-3.5 px-4 text-center">Thời gian bắt đầu</th>
              <th className="py-3.5 px-4 text-center">Thời gian kết thúc</th>
              <th className="py-3.5 px-4 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {safeTimeSlots.length > 0 ? (
              safeTimeSlots.map((slot) => {
                const slotScheduleCode = slot.scheduleCode || scheduleCode;

                return (
                  <tr
                    key={slot.slotId}
                    className="border-b border-slate-100 hover:bg-blue-50/40 transition-colors text-base font-medium"
                  >
                    {/* Mã khung giờ (lấy từ slot_id của bảng doctor_schedule_slots) */}
                    <td className="py-3.5 px-4 text-center font-normal text-gray-700 text-base">
                      {slot.slotId || slot.slotCode || slotScheduleCode}
                    </td>

                    {/* Số thứ tự (Dạng chữ xanh lam in đậm theo ảnh mẫu) */}
                    <td className="py-3.5 px-4 text-center font-bold text-blue-600 text-base">
                      {slot.slotOrder}
                    </td>

                    {/* Mã lịch làm việc (Huy hiệu tròn màu xanh nước biển) */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100/90 text-blue-600 font-bold text-sm shadow-2xs">
                        {slotScheduleCode}
                      </div>
                    </td>

                    {/* Thời gian bắt đầu */}
                    <td className="py-3.5 px-4 text-center font-medium text-gray-700 text-base">
                      {slot.startTime}
                    </td>

                    {/* Thời gian kết thúc */}
                    <td className="py-3.5 px-4 text-center font-medium text-gray-700 text-base">
                      {slot.endTime}
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3.5 px-4 text-center">
                      <SlotStatusBadge status={slot.status || "Chưa đặt lịch"} />
                      {slot.patientName && (
                        <span className="block text-xs text-emerald-700 font-semibold mt-0.5">
                          (BN: {slot.patientName})
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-6 text-slate-500 font-medium text-base"
                >
                  Chưa có khung giờ khám nào được tạo cho lịch làm việc này.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
