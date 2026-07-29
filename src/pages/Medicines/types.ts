export type MedicineStatus = "Đang hoạt động" | "Ngưng hoạt động";

export interface MedicineCategory {
  categoryId: number;
  categoryName: string;
}

export interface Medicine {
  medicineId: number;       // Mã thuốc
  categoryId: number;       // Mã nhóm thuốc
  medicineName: string;     // Tên thuốc
  unit: string;             // Đơn vị tính
  description: string;      // Mô tả
  defaultUsage: string;     // Hướng dẫn sử dụng
  unitPrice: number;        // Đơn giá
  stockQuantity: number;    // Số lượng tồn kho
  expiryDate: string;       // Hạn sử dụng (YYYY-MM-DD)
  status: MedicineStatus;   // Trạng thái ("Đang hoạt động" | "Ngưng hoạt động")
}
