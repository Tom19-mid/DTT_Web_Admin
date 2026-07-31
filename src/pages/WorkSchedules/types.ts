export type ScheduleStatus =
  | "Trống lịch"
  | "Còn lịch để đặt"
  | "Đã hết lịch để đặt"
  | "Không hoạt động";

export type SlotStatus = "Chưa đặt lịch" | "Đã đặt lịch" | "Đã đóng";

export interface TimeSlot {
  slotId: number;
  slotCode: string;          // Mã khung giờ, e.g. "TS001-01"
  scheduleCode: string;      // Mã lịch làm việc (lấy từ Mã lịch làm việc ở trên)
  slotOrder: number;         // Số thứ tự khám (slot_order)
  startTime: string;         // Thời gian bắt đầu khung giờ khám (07:30)
  endTime: string;           // Thời gian kết thúc khung giờ khám (08:00)
  status: SlotStatus;        // Trạng thái (Chưa đặt lịch: vàng, Đã đặt lịch: xanh, Đã đóng: đỏ)
  patientName?: string;      // Tên bệnh nhân nếu đã đặt lịch
}

export interface WorkSchedule {
  scheduleId: number;
  scheduleCode: string;      // Mã lịch làm việc, e.g. "WS001"
  doctorId: number;
  doctorName: string;        // Họ và tên bác sĩ, e.g. "BS. Nguyễn Văn Bình"
  specialty?: string;
  workDate: string;          // Ngày làm việc, e.g. "31/07/2026"
  startTime: string;         // Thời gian bắt đầu, e.g. "07:30"
  endTime: string;           // Thời gian kết thúc, e.g. "11:30"
  status: ScheduleStatus;    // Trạng thái (Trống lịch, Còn lịch để đặt, Đã hết lịch để đặt, Không hoạt động)
  timeSlots: TimeSlot[];     // Dãy các khung giờ khám lùi lề bên phải
}
