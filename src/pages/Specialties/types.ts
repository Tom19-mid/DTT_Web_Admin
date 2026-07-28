export type SpecialtyStatus = "Đang hoạt động" | "Ngưng hoạt động" | "Đã khóa";

export interface Specialty {
  id: number;
  stt: number;
  name: string;
  description: string;
  doctorCount: number;
  status: SpecialtyStatus;
}
