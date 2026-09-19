export type UserStatus =
  | "Active"
  | "Locked"
  | "Inactive"
  | "OnLeave"
  | "Đang hoạt động"
  | "Đã khóa"
  | "Ngưng hoạt động"
  | "Nghỉ phép"
  | string;

export type UserRole =
  | "Admin"
  | "Doctor"
  | "Patient"
  | "Bệnh nhân"
  | "Bác sĩ"
  | "Lễ tân tiếp đón"
  | "Điều dưỡng"
  | "Kỹ thuật viên CLS"
  | "Dược sĩ"
  | string;

export interface User {
  userId?: string;
  phoneNumber?: string;
  email?: string;
  roleId?: number;
  status?: UserStatus;
  createdAt?: string;
  updatedAt?: string;

  // Joined / UI fields for backward-compatibility
  id?: string | number;
  fullName?: string;
  stt?: number;
  phone?: string;
  role?: UserRole;
  lastLogin?: string;
}
