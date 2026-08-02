export type VerificationStatus =
  | "pending"
  | "verified"
  | "rejected"
  | "Chờ duyệt"
  | "Đã duyệt"
  | "Từ chối";
export type Gender = "Male" | "Female" | "Other" | "Nam" | "Nữ" | "Khác";
export type PatientStatus =
  | "Active"
  | "Inactive"
  | "Locked"
  | "Đang hoạt động"
  | "Ngưng hoạt động"
  | "Đã khóa";

export interface Patient {
  patientId?: number;
  patient_id?: number;
  fullName?: string | null;
  dateOfBirth?: string | null;
  gender?: Gender | string | null;
  address?: string;
  healthInsuranceNumber?: string;
  phoneNumber?: string | null;
  verificationStatus?: VerificationStatus | string;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  verificationNote?: string | null;
  cccdNumber?: string;
  status?: PatientStatus | string;
  createdAt?: string;
  updatedAt?: string;

  // Joined / UI fields for backward-compatibility
  id?: number;
  stt?: number;
  code?: string;
  phone?: string;
  dob?: string;
  genderText?: string;
  insuranceCode?: string;
  specialty?: string;
}
