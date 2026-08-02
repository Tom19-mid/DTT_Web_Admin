export type AppointmentStatusName =
  | "Đã đặt lịch"
  | "Đã check in"
  | "Đang chờ khám"
  | "Đang chờ bác sĩ"
  | "Đang khám"
  | "Đang chờ kết quả xét nghiệm"
  | "Đã hoàn thành"
  | "Đã hủy"
  | "Không đến khám"
  | string;

export interface Appointment {
  appointmentId: number;
  patientId: number;
  doctorId: number;
  reason?: string;
  status_id?: number;
  status?: AppointmentStatusName;
  is_active?: boolean;
  queue_number?: number;
  cancelReason?: string | null;
  cancelAt?: string | null;
  cancelledBy?: string | null;
  notes?: string | null;
  member_id?: number;
  nurse_note?: string | null;
  createdAt?: string;
  updatedAt?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  patientName?: string;
  doctorName?: string;
  specialtyName?: string;
  queueNumber?: number;
  cancelTime?: string | null;
  id?: number;
}
