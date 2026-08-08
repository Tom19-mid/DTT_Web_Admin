import axiosClient from "./axiosClient";

export interface AppointmentFilterParams {
  doctorId?: number;
  date?: string;
  todayOnly?: boolean;
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
  getPatientAppointments: async (patientId: number) => {
    try {
      const response = await axiosClient.get(`/appointments/patient/${patientId}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.warn("appointmentApi.getPatientAppointments error:", error);
      return [];
    }
  },
  checkIn: async (appointmentId: number) => {
    const response = await axiosClient.post(`/appointments/${appointmentId}/checkin`);
    return response.data;
  },
  updateStatus: async (appointmentId: number, statusId: number) => {
    const response = await axiosClient.put(`/appointments/${appointmentId}/status`, { statusId });
    return response.data;
  },
  cancel: async (appointmentId: number, reason?: string) => {
    const response = await axiosClient.put(`/appointments/${appointmentId}/cancel`, { reason });
    return response.data;
  },
};

export default appointmentApi;
