import axiosClient from "./axiosClient";

export interface CreateMedicinePayload {
  categoryId: number;
  medicineName: string;
  unit: string;
  unitPrice: number;
  stockQuantity: number;
  description?: string;
  defaultUsage?: string;
  status?: string;
  expiryDate?: string;
}

export interface UpdateMedicinePayload {
  categoryId: number;
  medicineName: string;
  unit: string;
  unitPrice: number;
  stockQuantity: number;
  description?: string;
  defaultUsage?: string;
  status?: string;
  expiryDate?: string;
}

export interface CreateCategoryPayload {
  categoryName: string;
  description?: string;
  status?: string;
}

export interface UpdateCategoryPayload {
  categoryName: string;
  description?: string;
  status?: string;
}

export const medicineApi = {
  // ── MEDICINES API ─────────────────────────────────────────────────────────
  getAll: async () => {
    try {
      const response = await axiosClient.get("/medicines");
      const list = Array.isArray(response.data) ? response.data : [];
      return list.map((item: any) => ({
        ...item,
        id: item.medicineId || item.id,
        name: item.medicineName || item.name || "",
        category: item.categoryName || item.category || "Chưa phân loại",
        price: item.unitPrice ?? item.price ?? 0,
        stock: item.stockQuantity ?? item.stock ?? 0,
        usage: item.defaultUsage ?? item.usage ?? "Theo chỉ định bác sĩ",
        status:
          item.status === "Active" || item.status === "Đang hoạt động"
            ? "Đang hoạt động"
            : "Ngưng hoạt động",
      }));
    } catch (error) {
      console.warn("medicineApi.getAll error:", error);
      return [];
    }
  },

  getById: async (id: number) => {
    try {
      const response = await axiosClient.get(`/medicines/${id}`);
      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Lỗi khi lấy thông tin thuốc";
      console.error(`medicineApi.getById(${id}) error:`, msg);
      throw new Error(msg);
    }
  },

  create: async (payload: CreateMedicinePayload) => {
    try {
      const response = await axiosClient.post("/medicines", payload);
      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Lỗi khi tạo thuốc mới";
      console.error("medicineApi.create error:", msg);
      throw new Error(msg);
    }
  },

  update: async (id: number, payload: UpdateMedicinePayload) => {
    try {
      const response = await axiosClient.put(`/medicines/${id}`, payload);
      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Lỗi khi cập nhật thuốc";
      console.error(`medicineApi.update(${id}) error:`, msg);
      throw new Error(msg);
    }
  },

  toggleStatus: async (id: number, status: string) => {
    try {
      const response = await axiosClient.put(`/medicines/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Lỗi khi đổi trạng thái thuốc";
      console.error(`medicineApi.toggleStatus(${id}) error:`, msg);
      throw new Error(msg);
    }
  },

  delete: async (id: number) => {
    try {
      const response = await axiosClient.delete(`/medicines/${id}`);
      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Lỗi khi ngưng hoạt động thuốc";
      console.error(`medicineApi.delete(${id}) error:`, msg);
      throw new Error(msg);
    }
  },

  // ── MEDICINE CATEGORIES API ────────────────────────────────────────────────
  getCategories: async () => {
    try {
      const response = await axiosClient.get("/medicines/categories");
      const list = Array.isArray(response.data) ? response.data : [];
      return list.map((item: any) => ({
        ...item,
        id: item.categoryId || item.id,
        categoryName: item.categoryName || item.name || "",
        name: item.categoryName || item.name || "",
        status:
          item.status === "Active" || item.status === "Đang hoạt động"
            ? "Đang hoạt động"
            : "Ngưng hoạt động",
      }));
    } catch (error) {
      console.warn("medicineApi.getCategories error:", error);
      return [];
    }
  },

  getCategoryById: async (id: number) => {
    try {
      const response = await axiosClient.get(`/medicines/categories/${id}`);
      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Lỗi khi lấy chi tiết danh mục thuốc";
      console.error(`medicineApi.getCategoryById(${id}) error:`, msg);
      throw new Error(msg);
    }
  },

  createCategory: async (payload: CreateCategoryPayload) => {
    try {
      const response = await axiosClient.post("/medicines/categories", payload);
      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Lỗi khi tạo danh mục thuốc";
      console.error("medicineApi.createCategory error:", msg);
      throw new Error(msg);
    }
  },

  updateCategory: async (id: number, payload: UpdateCategoryPayload) => {
    try {
      const response = await axiosClient.put(`/medicines/categories/${id}`, payload);
      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Lỗi khi cập nhật danh mục thuốc";
      console.error(`medicineApi.updateCategory(${id}) error:`, msg);
      throw new Error(msg);
    }
  },

  toggleCategoryStatus: async (id: number, status: string) => {
    try {
      const response = await axiosClient.put(`/medicines/categories/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Lỗi khi đổi trạng thái danh mục thuốc";
      console.error(`medicineApi.toggleCategoryStatus(${id}) error:`, msg);
      throw new Error(msg);
    }
  },

  deleteCategory: async (id: number) => {
    try {
      const response = await axiosClient.delete(`/medicines/categories/${id}`);
      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Lỗi khi ngưng hoạt động danh mục thuốc";
      console.error(`medicineApi.deleteCategory(${id}) error:`, msg);
      throw new Error(msg);
    }
  },
};

export default medicineApi;
