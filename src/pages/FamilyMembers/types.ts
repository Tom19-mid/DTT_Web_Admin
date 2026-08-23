export type VerificationStatus =
  | "pending"
  | "verified"
  | "rejected"
  | "Chờ duyệt"
  | "Đã duyệt"
  | "Từ chối";

export type Gender = "Male" | "Female" | "Other" | "Nam" | "Nữ" | "Khác";

export type FamilyMemberStatus =
  | "Active"
  | "Inactive"
  | "Locked"
  | "Đang hoạt động"
  | "Ngưng hoạt động"
  | "Đã khóa";

export interface FamilyMember {
  id: number;
  memberId: number;
  ownerPatientId?: number;
  ownerFullName?: string;
  ownerPhone?: string;
  fullName: string;
  relationship: string;
  dob?: string;
  dateOfBirth?: string | null;
  gender?: Gender | string;
  phone?: string;
  phoneNumber?: string;
  cccdNumber?: string;
  healthInsuranceNumber?: string;
  address?: string;
  verificationStatus: VerificationStatus | string;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  verificationNote?: string | null;
  status: FamilyMemberStatus | string;
  createdAt?: string;
  updatedAt?: string;

  // Joined / UI fields
  stt?: number;
  code?: string;
}

export interface CreateFamilyMemberPayload {
  ownerPatientId: number;
  name: string;
  relationship: string;
  dob?: string;
  gender?: string;
  phone?: string;
  cccd?: string;
  bhyt?: string;
  address?: string;
  verificationStatus?: string;
}

export interface UpdateFamilyMemberPayload {
  realId: number;
  isOwner?: boolean;
  name?: string;
  relationship?: string;
  dob?: string;
  gender?: string;
  phone?: string;
  cccd?: string;
  bhyt?: string;
  address?: string;
  verificationStatus?: string;
}
