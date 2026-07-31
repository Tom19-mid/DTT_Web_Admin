export type DoctorStatus =
  | "Đang hoạt động"
  | "Ngưng hoạt động"
  | "Nghỉ phép"
  | "Đã khóa";

export type LeaveStatus = "Chờ duyệt" | "Đã duyệt" | "Từ chối" | "Đã hủy";

export interface Doctor {
  id: number;
  stt: number;
  fullName: string;
  avatar?: string;
  specialty: string;
  qualifications: string;
  experience: string;
  email: string;
  clinicRoom: string;
  status: DoctorStatus;
  ratingAverage?: number;
  totalReviews?: number;
  
  // Leave request info (when on leave or submitting leave)
  leaveStartDate?: string;
  leaveEndDate?: string;
  leaveReason?: string;
  leaveStatus?: LeaveStatus;
}
