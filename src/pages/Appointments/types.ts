export type AppointmentStatusName =
  | "Đã đặt lịch"
  | "Đã check in"
  | "Đang chờ khám"
  | "Đang chờ bác sĩ"
  | "Đang khám"
  | "Đang chờ kết quả xét nghiệm"
  | "Đang chờ phát thuốc"
  | "Đã hoàn thành"
  | "Đã hủy"
  | "Không đến khám"
  | string;

export interface Appointment {
  id?: number;
  appointmentId?: number;
  patientId?: number;
  doctorId?: number;
  memberId?: number | null;
  member_id?: number | null;
  reason?: string;
  status_id?: number;
  status?: AppointmentStatusName;
  is_active?: boolean;
  queue_number?: number;
  queueNumber?: number;
  cancelReason?: string | null;
  cancel_reason?: string | null;
  cancelAt?: string | null;
  cancelledAt?: string | null;
  cancelled_at?: string | null;
  cancelTime?: string | null;
  cancelledBy?: string | null;
  cancelled_by?: string | null;
  note?: string | null;
  notes?: string | null;
  nurseNote?: string | null;
  nurse_note?: string | null;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  patientName?: string;
  doctorName?: string;
  specialtyName?: string;
  fee?: string;
}
