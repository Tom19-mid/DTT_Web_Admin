export type VerificationStatus = "pending" | "verified" | "rejected";
export type Gender = "Male" | "Female" | "Other";

export interface Patient {
  patientId: number;
  fullName?: string | null;
  dateOfBirth: string | null;
  gender?: Gender | null;
  address?: string;
  healthInsuranceNumber?: string;
  phoneNumber?: string | null;
  verificationStatus: VerificationStatus;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  cccdNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}
