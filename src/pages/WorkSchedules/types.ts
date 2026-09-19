export type ScheduleStatus =
  | "Trống lịch"
  | "Còn lịch để đặt"
  | "Đã hết lịch để đặt"
  | "Không hoạt động"
  | string;

export type SlotStatus = "Chưa đặt lịch" | "Đã đặt lịch" | "Đã đóng" | string;

export interface TimeSlot {
  slotId?: number;
  scheduleId?: number;
  scheduleCode?: string;
  slotCode?: string;
  slotOrder?: number;
  startTime?: string;
  endTime?: string;
  status?: SlotStatus;
  patientName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkSchedule {
  scheduleId?: number;
  doctorId?: number;
  doctorName?: string;
  specialty?: string;
  specialtyName?: string;
  workDate?: string;
  startTime?: string;
  endTime?: string;
  status?: ScheduleStatus;
  scheduleCode?: string;
  isAvailable?: boolean;
  createdAt?: string;
  updatedAt?: string;
  timeSlots?: TimeSlot[];
}

export interface DoctorItem {
  doctorId: number;
  fullName: string;
  degree?: string;
  experienceYears?: number;
  clinicRoom?: string;
  specialtyId?: number;
  specialtyName?: string;
  phone?: string;
  email?: string;
  status?: string;
  avatarUrl?: string;
}
