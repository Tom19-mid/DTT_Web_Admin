import axiosClient from "./axiosClient";

export interface CreateDoctorPayload {
  fullName: string;
  degree?: string;
  experienceYears?: number;
  clinicRoom?: string;
  specialtyId?: number;
  phone: string;
  email?: string;
  password?: string;
  status?: string;
  avatar?: string;
  avatarUrl?: string;
  leaveStartDate?: string;
  leaveEndDate?: string;
  leaveReason?: string;
  leaveStatus?: string;
}

export interface UpdateDoctorPayload {
  fullName?: string;
  degree?: string;
  experienceYears?: number;
  clinicRoom?: string;
  specialtyId?: number;
  phone?: string;
  email?: string;
  status?: string;
  avatar?: string;
  avatarUrl?: string;
  leaveStartDate?: string;
  leaveEndDate?: string;
  leaveReason?: string;
  leaveStatus?: string;
}

export const doctorApi = {
  getAll: async (specialtyId?: number) => {
    try {
      const url = specialtyId
        ? `/doctors?specialtyId=${specialtyId}`
        : "/doctors";
      const response = await axiosClient.get(url);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.warn("doctorApi.getAll error:", error);
      return [];
    }
  },

  getSchedules: async (date?: string) => {
    try {
      const url = date
        ? `/doctors/schedules?date=${date}`
        : "/doctors/schedules";
      const response = await axiosClient.get(url);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.warn("doctorApi.getSchedules error:", error);
      return [];
    }
  },

  create: async (payload: CreateDoctorPayload) => {
    try {
      const response = await axiosClient.post("/doctors", payload);
      return response.data?.doctor || response.data;
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Lỗi khi tạo tài khoản bác sĩ";
      console.error("doctorApi.create error:", msg);
      throw new Error(msg, { cause: error });
    }
  },

  update: async (id: number, payload: UpdateDoctorPayload) => {
    try {
      const response = await axiosClient.put(`/doctors/${id}`, payload);
      return response.data?.doctor || response.data;
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Lỗi khi cập nhật bác sĩ";
      console.error(
        `doctorApi.update(${id}) error:`,
        msg,
        error?.response?.data,
      );
      throw new Error(msg, { cause: error });
    }
  },

  updateStatus: async (id: number, status: string) => {
    try {
      const response = await axiosClient.put(`/doctors/${id}/status`, {
        status,
      });
      return response.data;
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Lỗi khi cập nhật trạng thái bác sĩ";
      console.error(`doctorApi.updateStatus(${id}) error:`, msg);
      throw new Error(msg, { cause: error });
    }
  },
};

export default doctorApi;
