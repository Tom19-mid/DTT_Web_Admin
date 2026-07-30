export type AppointmentStatusName =
  | "Scheduled"
  | "Waiting"
  | "InProgress"
  | "Completed"
  | "Cancelled"
  | "NoShow"
  | "Đã đặt lịch"
  | "Đang chờ khám"
  | "Đang khám"
  | "Đã hoàn thành"
  | "Đã hủy"
  | "Không đến khám";

export interface Appointment {
  id: number;                   // Mã lịch hẹn
  patientName: string;          // Bệnh nhân
  doctorName: string;           // Bác sĩ
  appointmentDate: string;      // Ngày khám (DD/MM/YYYY)
  appointmentTime: string;      // Giờ khám (e.g. 08:00 - 08:30)
  reason: string;               // Lý do khám
  queueNumber: number;          // Số thứ tự khám
  status: AppointmentStatusName;// Trạng thái
  cancelReason?: string | null; // Lý do hủy (nếu có)
  cancelTime?: string | null;   // Thời gian hủy (nếu có)
  cancelledBy?: string | null;  // Người hủy (nếu có)
  notes?: string | null;        // Ghi chú
}
