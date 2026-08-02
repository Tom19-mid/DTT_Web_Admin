export type UserStatus = "Active" | "Locked" | "Inactive";
export type UserRole =
  | "Admin"
  | "Doctor"
  | "Patient"
  | "Lễ tân tiếp đón"
  | "Điều dưỡng"
  | "Kỹ thuật viên CLS"
  | "Dược sĩ";

export interface User {
  phoneNumber: string;
  email: string;
  roleId: number;
  status?: UserStatus;
  createdAt: string;
  updatedAt: string;
}
