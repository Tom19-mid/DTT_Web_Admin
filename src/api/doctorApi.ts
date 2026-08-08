import axiosClient from "./axiosClient";

export const doctorApi = {
  getAll: async (specialtyId?: number) => {
    try {
      const url = specialtyId ? `/doctors?specialtyId=${specialtyId}` : "/doctors";
      const response = await axiosClient.get(url);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.warn("doctorApi.getAll error:", error);
      return [];
    }
  },
  getSchedules: async (date?: string) => {
    try {
      const url = date ? `/doctors/schedules?date=${date}` : "/doctors/schedules";
      const response = await axiosClient.get(url);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.warn("doctorApi.getSchedules error:", error);
      return [];
    }
  },
};

export default doctorApi;
