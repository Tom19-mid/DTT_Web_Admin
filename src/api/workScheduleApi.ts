import axiosClient from "./axiosClient";
import type { WorkSchedule, TimeSlot } from "../pages/WorkSchedules/types";

export interface CreateWorkSchedulePayload {
  doctorId: number;
  doctorName?: string;
  workDate: string;
  startTime?: string;
  endTime?: string;
  status?: string;
}

export interface UpdateWorkSchedulePayload {
  doctorId?: number;
  doctorName?: string;
  workDate?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
  timeSlots?: TimeSlot[];
}

let schedulesCache: WorkSchedule[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export const workScheduleApi = {
  getCachedSchedules: (): WorkSchedule[] | null => {
    const now = Date.now();
    if (schedulesCache && now - cacheTimestamp < CACHE_TTL_MS) {
      return schedulesCache;
    }
    return null;
  },

  clearCache: () => {
    schedulesCache = null;
    cacheTimestamp = 0;
  },

  getAll: async (
    params?: {
      doctorId?: number;
      specialtyId?: number;
      workDate?: string;
      status?: string;
      search?: string;
    },
    forceRefresh = false
  ): Promise<WorkSchedule[]> => {
    const now = Date.now();
    if (!params && !forceRefresh && schedulesCache && now - cacheTimestamp < CACHE_TTL_MS) {
      return schedulesCache;
    }

    try {
      const queryParts: string[] = [];
      if (params?.doctorId) queryParts.push(`doctorId=${params.doctorId}`);
      if (params?.specialtyId) queryParts.push(`specialtyId=${params.specialtyId}`);
      if (params?.workDate) queryParts.push(`workDate=${encodeURIComponent(params.workDate)}`);
      if (params?.status) queryParts.push(`status=${encodeURIComponent(params.status)}`);
      if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);

      const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
      const response = await axiosClient.get(`/work-schedules${queryString}`);
      let result: WorkSchedule[] = [];
      if (Array.isArray(response.data)) result = response.data;
      else if (response.data && Array.isArray(response.data.data)) result = response.data.data;

      if (!params) {
        schedulesCache = result;
        cacheTimestamp = Date.now();
      }
      return result;
    } catch (error) {
      console.warn("workScheduleApi.getAll error:", error);
      if (schedulesCache && !params) return schedulesCache;
      return [];
    }
  },

  getById: async (id: number): Promise<WorkSchedule | null> => {
    try {
      const response = await axiosClient.get(`/work-schedules/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`workScheduleApi.getById(${id}) error:`, error);
      return null;
    }
  },

  create: async (payload: CreateWorkSchedulePayload): Promise<WorkSchedule> => {
    try {
      schedulesCache = null;
      cacheTimestamp = 0;
      const response = await axiosClient.post("/work-schedules", payload);
      return response.data.data || response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Lỗi khi tạo lịch làm việc mới";
      console.error("workScheduleApi.create error:", msg);
      throw new Error(msg, { cause: error });
    }
  },

  update: async (id: number, payload: UpdateWorkSchedulePayload): Promise<WorkSchedule> => {
    try {
      schedulesCache = null;
      cacheTimestamp = 0;
      const response = await axiosClient.put(`/work-schedules/${id}`, payload);
      return response.data.data || response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Lỗi khi cập nhật lịch làm việc";
      console.error(`workScheduleApi.update(${id}) error:`, msg);
      throw new Error(msg, { cause: error });
    }
  },

  toggleLock: async (id: number, isLocked?: boolean, status?: string): Promise<WorkSchedule> => {
    try {
      schedulesCache = null;
      cacheTimestamp = 0;
      const response = await axiosClient.put(`/work-schedules/${id}/toggle-lock`, { isLocked, status });
      return response.data.data || response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Lỗi khi thay đổi trạng thái khóa ca làm việc";
      console.error(`workScheduleApi.toggleLock(${id}) error:`, msg);
      throw new Error(msg, { cause: error });
    }
  },

  cancel: async (id: number): Promise<WorkSchedule> => {
    try {
      schedulesCache = null;
      cacheTimestamp = 0;
      const response = await axiosClient.put(`/work-schedules/${id}/cancel`);
      return response.data.data || response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Lỗi khi hủy lịch làm việc";
      console.error(`workScheduleApi.cancel(${id}) error:`, msg);
      throw new Error(msg, { cause: error });
    }
  },
};

export default workScheduleApi;
