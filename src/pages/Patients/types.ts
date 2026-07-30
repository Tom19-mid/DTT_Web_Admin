export type VerificationStatus = "Chờ duyệt" | "Đã duyệt" | "Từ chối";
export type PatientStatus = VerificationStatus | "Đang hoạt động" | "Ngưng hoạt động" | "Đã khóa";
export type Gender = "Nam" | "Nữ";

export interface Patient {
  id: number;
  patient_id?: number;
  code: string;
  fullName: string;
  dob: string;
  gender: Gender;
  address: string;
  healthInsuranceNumber: string;
  cccdNumber: string;
  phone: string;
  specialty: string;
  status: PatientStatus;
  verificationStatus: VerificationStatus;
  verifiedAt: string | null;
  verifiedBy: string | null;
  verificationNote: string | null;
  createdAt: string;
  updatedAt: string;
}
