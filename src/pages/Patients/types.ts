export type PatientStatus = "Đang hoạt động" | "Ngưng hoạt động" | "Đã khóa";

export interface Patient {
  id: number;
  code: string;
  fullName: string;
  dob: string;
  phone: string;
  specialty: string;
  status: PatientStatus;
}
