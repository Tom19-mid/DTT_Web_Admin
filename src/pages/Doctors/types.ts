export type DoctorStatus = "Active" | "Inactive" | "OnLeave" | "Locked";
export type LeaveStatus = "Pending" | "Approved" | "Rejected" | "Cancelled";

export interface Doctor {
  doctorId: number;
  specialtyId?: number | null;
  fullName?: string | null;
  degree?: string | null;
  experienceYears: number;
  clinicRoom?: string | null;
  status: DoctorStatus;
  avatarUrl?: string | null;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
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
