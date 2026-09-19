export type MedicineStatus =
  | "Active"
  | "Inactive"
  | "Đang hoạt động"
  | "Ngưng hoạt động";

export type MedicinesCategory =
  | "Active"
  | "Inactive"
  | "Đang hoạt động"
  | "Ngưng hoạt động";

export interface MedicineCategory {
  categoryId?: number;
  id?: number;
  categoryName: string;
  name?: string;
  description?: string;
  status?: MedicinesCategory;
  medicineCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Medicine {
  medicineId?: number;
  categoryId?: number;
  medicineName?: string;
  unit?: string;
  description?: string;
  defaultUsage?: string;
  unitPrice?: number;
  status?: MedicineStatus;
  stockQuantity?: number;
  expiryDate?: string;
  createdAt?: string;
  updatedAt?: string;

  // Joined / UI fields for backward-compatibility
  id?: number;
  stt?: number;
  name?: string;
  category?: string;
  categoryName?: string;
  price?: number;
  usage?: string;
  stock?: number;
}
