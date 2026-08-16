import axiosClient from "./axiosClient";

export interface AppointmentFilterParams {
  doctorId?: number;
  date?: string;
  todayOnly?: boolean;
}

export interface CreateAppointmentPayload {
  patientId: number;
  doctorId: number;
  doctorName?: string;
  specialtyName?: string;
  date?: string;
  timeSlot?: string;
  reason?: string;
  fee?: string;
}

export interface UpdateAppointmentPayload {
  patientId?: number;
  doctorId?: number;
  doctorName?: string;
  specialtyName?: string;
  date?: string;
  timeSlot?: string;
  reason?: string;
  fee?: string;
  statusId?: number;
  cancelReason?: string;
  cancelledBy?: string;
  note?: string;
  notes?: string;
  nurseNote?: string;
}

let appointmentsCache: any[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export const appointmentApi = {
  getCachedAppointments: (): any[] | null => {
    const now = Date.now();
    if (appointmentsCache && now - cacheTimestamp < CACHE_TTL_MS) {
      return appointmentsCache;
    }
    return null;
  },

  clearCache: () => {
    appointmentsCache = null;
    cacheTimestamp = 0;
  },

  getAll: async (params?: AppointmentFilterParams, forceRefresh = false) => {
    const now = Date.now();
    if (!params && !forceRefresh && appointmentsCache && now - cacheTimestamp < CACHE_TTL_MS) {
      return appointmentsCache;
    }

    try {
      const response = await axiosClient.get("/appointments", { params });
      const data = Array.isArray(response.data) ? response.data : [];
      if (!params) {
        appointmentsCache = data;
        cacheTimestamp = Date.now();
      }
      return data;
    } catch (error) {
      console.warn("appointmentApi.getAll error:", error);
      if (appointmentsCache && !params) return appointmentsCache;
      return [];
    }
  },
  getById: async (id: number) => {
    try {
      const response = await axiosClient.get(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`appointmentApi.getById(${id}) error:`, error);
      return null;
    }
  },
  getPatientAppointments: async (patientId: number) => {
    try {
      const response = await axiosClient.get(`/appointments/patient/${patientId}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.warn("appointmentApi.getPatientAppointments error:", error);
      return [];
    }
  },
  create: async (payload: CreateAppointmentPayload) => {
    appointmentsCache = null;
    cacheTimestamp = 0;
    const response = await axiosClient.post("/appointments", payload);
    return response.data;
  },
  update: async (id: number, payload: UpdateAppointmentPayload) => {
    appointmentsCache = null;
    cacheTimestamp = 0;
    const response = await axiosClient.put(`/appointments/${id}`, payload);
    return response.data;
  },
  checkIn: async (appointmentId: number) => {
    appointmentsCache = null;
    cacheTimestamp = 0;
    const response = await axiosClient.post(`/appointments/${appointmentId}/checkin`);
    return response.data;
  },
  updateStatus: async (appointmentId: number, status: string | number) => {
    appointmentsCache = null;
    cacheTimestamp = 0;
    const response = await axiosClient.put(`/appointments/${appointmentId}/status`, { status: String(status) });
    return response.data;
  },
  cancel: async (appointmentId: number, cancelReason?: string, cancelledBy?: string) => {
    appointmentsCache = null;
    cacheTimestamp = 0;
    const response = await axiosClient.put(`/appointments/${appointmentId}/cancel`, {
      cancelReason,
      cancelledBy: cancelledBy || "Lễ tân / Quản trị viên Web Admin",
    });
    return response.data;
  },
};

export default appointmentApi;
