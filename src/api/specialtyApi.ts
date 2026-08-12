import axiosClient from "./axiosClient";

export interface CreateSpecialtyPayload {
  specialtyName: string;
  description?: string;
  status?: boolean;
}

export interface UpdateSpecialtyPayload {
  specialtyName?: string;
  description?: string;
  status?: boolean;
}

export const specialtyApi = {
  getAll: async () => {
    try {
      const response = await axiosClient.get("/specialties");
      const list = Array.isArray(response.data) ? response.data : [];
      return list.map((item: any, idx: number) => ({
        ...item,
        id: item.specialtyId || item.id,
        stt: idx + 1,
        name: item.specialtyName || item.name || "",
        status:
          typeof item.status === "boolean"
            ? item.status
              ? "Đang hoạt động"
              : "Ngưng hoạt động"
            : item.status || "Đang hoạt động",
      }));
    } catch (error) {
      console.warn("specialtyApi.getAll error:", error);
      return [];
    }
  },

  getById: async (id: number) => {
    try {
      const response = await axiosClient.get(`/specialties/${id}`);
      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Lỗi khi lấy thông tin chuyên khoa";
      console.error(`specialtyApi.getById(${id}) error:`, msg);
      throw new Error(msg);
    }
  },

  create: async (payload: CreateSpecialtyPayload) => {
    try {
      const response = await axiosClient.post("/specialties", payload);
      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Lỗi khi tạo chuyên khoa mới";
      console.error("specialtyApi.create error:", msg);
      throw new Error(msg);
    }
  },

  update: async (id: number, payload: UpdateSpecialtyPayload) => {
    try {
      const response = await axiosClient.put(`/specialties/${id}`, payload);
      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Lỗi khi cập nhật chuyên khoa";
      console.error(`specialtyApi.update(${id}) error:`, msg);
      throw new Error(msg);
    }
  },

  toggleStatus: async (id: number, status: boolean) => {
    try {
      const response = await axiosClient.put(`/specialties/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Lỗi khi cập nhật trạng thái chuyên khoa";
      console.error(`specialtyApi.toggleStatus(${id}) error:`, msg);
      throw new Error(msg);
    }
  },

  delete: async (id: number) => {
    try {
      const response = await axiosClient.delete(`/specialties/${id}`);
      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Lỗi khi xóa chuyên khoa";
      console.error(`specialtyApi.delete(${id}) error:`, msg);
      throw new Error(msg);
    }
  },

  getWithDoctors: async () => {
    try {
      const response = await axiosClient.get("/specialties/with-doctors");
      return Array.isArray(response.data?.specialties)
        ? response.data.specialties
        : Array.isArray(response.data)
        ? response.data
        : [];
    } catch (error) {
      console.warn("specialtyApi.getWithDoctors error:", error);
      return [];
    }
  },
};

export default specialtyApi;

