export type SpecialtyStatus =
  | "Active"
  | "Inactive"
  | "Đang hoạt động"
  | "Ngưng hoạt động"
  | "Đã khóa"
  | boolean;

export interface Specialty {
  specialtyId?: number;
  specialtyName?: string;
  description?: string | null;
  status?: SpecialtyStatus;
  createdAt?: string;
  updatedAt?: string;

  // Joined / UI fields for backward-compatibility
  id?: number;
  stt?: number;
  name?: string;
  doctorCount?: number;
}
