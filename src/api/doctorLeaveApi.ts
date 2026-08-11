import axiosClient from "./axiosClient";

export interface DoctorLeaveItem {
  leaveId: number;
  id: number;
  doctorId: number;
  doctorName: string;
  specialtyName: string;
  phone: string;
  leaveStartDate: string;
  leaveEndDate: string;
  reason: string;
  status: string;
  rawStatus: string;
  createdAt: string;
  approvedAt?: string;
  approvedByName?: string;
}

export interface CreateDoctorLeavePayload {
  doctorId: number;
  leaveStartDate: string;
  leaveEndDate?: string;
  reason?: string;
  status?: string;
}

export const doctorLeaveApi = {
  getAll: async (status?: string): Promise<DoctorLeaveItem[]> => {
    try {
      const url = status ? `/doctors/leaves?status=${encodeURIComponent(status)}` : "/doctors/leaves";
      const response = await axiosClient.get(url);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.warn("doctorLeaveApi.getAll error:", error);
      return [];
    }
  },

  updateStatus: async (id: number, status: string) => {
    try {
      const response = await axiosClient.put(`/doctors/leaves/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Lỗi khi cập nhật trạng thái đơn nghỉ phép";
      console.error(`doctorLeaveApi.updateStatus(${id}) error:`, msg);
      throw new Error(msg, { cause: error });
    }
  },

  create: async (payload: CreateDoctorLeavePayload) => {
    try {
      const response = await axiosClient.post("/doctors/leaves", payload);
      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Lỗi khi tạo đơn nghỉ phép";
      console.error("doctorLeaveApi.create error:", msg);
      throw new Error(msg, { cause: error });
    }
  },
};

export default doctorLeaveApi;
