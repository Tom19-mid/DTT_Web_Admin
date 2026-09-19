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

let leavesCache: DoctorLeaveItem[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export const doctorLeaveApi = {
  getCachedLeaves: (): DoctorLeaveItem[] | null => {
    const now = Date.now();
    if (leavesCache && now - cacheTimestamp < CACHE_TTL_MS) {
      return leavesCache;
    }
    return null;
  },

  clearCache: () => {
    leavesCache = null;
    cacheTimestamp = 0;
  },

  getAll: async (status?: string, forceRefresh = false): Promise<DoctorLeaveItem[]> => {
    const now = Date.now();
    if (!status && !forceRefresh && leavesCache && now - cacheTimestamp < CACHE_TTL_MS) {
      return leavesCache;
    }

    try {
      const url = status ? `/doctors/leaves?status=${encodeURIComponent(status)}` : "/doctors/leaves";
      const response = await axiosClient.get(url);
      const data = Array.isArray(response.data) ? response.data : [];
      if (!status) {
        leavesCache = data;
        cacheTimestamp = Date.now();
      }
      return data;
    } catch (error) {
      console.warn("doctorLeaveApi.getAll error:", error);
      if (leavesCache && !status) return leavesCache;
      return [];
    }
  },

  updateStatus: async (id: number, status: string) => {
    try {
      leavesCache = null;
      cacheTimestamp = 0;
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
      leavesCache = null;
      cacheTimestamp = 0;
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
