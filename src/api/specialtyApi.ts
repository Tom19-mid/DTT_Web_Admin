import axiosClient from "./axiosClient";

export const specialtyApi = {
  getAll: async () => {
    try {
      const response = await axiosClient.get("/specialties");
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.warn("specialtyApi.getAll error:", error);
      return [];
    }
  },
  getWithDoctors: async () => {
    try {
      const response = await axiosClient.get("/specialties/with-doctors");
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.warn("specialtyApi.getWithDoctors error:", error);
      return [];
    }
  },
};

export default specialtyApi;
