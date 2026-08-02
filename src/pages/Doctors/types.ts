export type DoctorStatus =
  | "Active"
  | "Inactive"
  | "OnLeave"
  | "Locked"
  | "Đang hoạt động"
  | "Ngưng hoạt động"
  | "Nghỉ phép"
  | "Đã khóa";

export type LeaveStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Cancelled"
  | "Chờ duyệt"
  | "Đã duyệt"
  | "Từ chối"
  | "Đã hủy";

export interface Doctor {
  doctorId?: number;
  userId?: string;
  specialtyId?: number | null;
  fullName?: string | null;
  degree?: string | null;
  experienceYears?: number | string;
  clinicRoom?: string | null;
  status: DoctorStatus;
  userEmail?: string;
  email?: string;
  avatarUrl?: string | null;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;

  // Joined / UI fields for backward-compatibility
  id?: number;
  stt?: number;
  avatar?: string;
  specialty?: string;
  specialtyName?: string;
  qualifications?: string;
  experience?: number | string;
  ratingAverage?: number;
  totalReviews?: number;
  leaveStartDate?: string | null;
  leaveEndDate?: string | null;
  leaveReason?: string | null;
  leaveStatus?: LeaveStatus | string;
}

export interface DoctorLeave {
  leaveId: number;
  doctorId: number;
  leaveStartDate: string;
  leaveEndDate: string;
  reason: string | null;
  status: LeaveStatus;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string | null;
  approvedBy?: string | null;
}
