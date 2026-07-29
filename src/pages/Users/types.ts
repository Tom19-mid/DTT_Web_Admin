export type UserRole = "Admin" | "Bệnh nhân" | "Bác sĩ";

export type UserStatus = "Đang hoạt động" | "Ngưng hoạt động" | "Đã khóa";

export interface User {
  id: number;
  stt: number;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  lastLogin: string;
  status: UserStatus;
}
