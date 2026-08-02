export type MedicineStatus = "Active" | "Inactive";
export type MedicinesCategory = "Active" | "Inactive";

export interface MedicineCategory {
  categoryId: number;
  categoryName: string;
  description?: string;
  status?: MedicinesCategory;
}

export interface Medicine {
  medicineId: number;
  categoryId: number;
  medicineName: string;
  unit: string;
  description?: string;
  defaultUsage?: string;
  unitPrice: number;
  status?: MedicineStatus;
  stockQuantity: number;
  expiryDate?: string;
  createdAt?: string;
  updatedAt?: string;
}
