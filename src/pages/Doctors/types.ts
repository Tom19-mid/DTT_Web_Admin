export type DoctorStatus =
  | "Đang hoạt động"
  | "Ngưng hoạt động"
  | "Nghỉ phép"
  | "Đã khóa";

export interface Doctor {
  id: number;
  stt: number;
  fullName: string;
  specialty: string;
  qualifications: string;
  experience: string;
  email: string;
  clinicRoom: string;
  status: DoctorStatus;
}
