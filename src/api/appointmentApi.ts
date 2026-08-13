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

export const appointmentApi = {
  getAll: async (params?: AppointmentFilterParams) => {
    try {
      const response = await axiosClient.get("/appointments", { params });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.warn("appointmentApi.getAll error:", error);
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
    const response = await axiosClient.post("/appointments", payload);
    return response.data;
  },
  update: async (id: number, payload: UpdateAppointmentPayload) => {
    const response = await axiosClient.put(`/appointments/${id}`, payload);
    return response.data;
  },
  checkIn: async (appointmentId: number) => {
    const response = await axiosClient.post(`/appointments/${appointmentId}/checkin`);
    return response.data;
  },
  updateStatus: async (appointmentId: number, status: string | number) => {
    const response = await axiosClient.put(`/appointments/${appointmentId}/status`, { status: String(status) });
    return response.data;
  },
  cancel: async (appointmentId: number, cancelReason?: string, cancelledBy?: string) => {
    const response = await axiosClient.put(`/appointments/${appointmentId}/cancel`, {
      cancelReason,
      cancelledBy: cancelledBy || "Lễ tân / Quản trị viên Web Admin",
    });
    return response.data;
  },
};

export default appointmentApi;
