import axiosClient from "./axiosClient";

export const patientApi = {
  getAll: async () => {
    try {
      const response = await axiosClient.get("/patients");
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data && Array.isArray(response.data.patients)) {
        return response.data.patients;
      }
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.warn("patientApi.getAll error:", error);
      return [];
    }
  },
  getPending: async () => {
    try {
      const response = await axiosClient.get("/patients/pending");
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data && Array.isArray(response.data.patients)) {
        return response.data.patients;
      }
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.warn("patientApi.getPending error:", error);
      return [];
    }
  },
};

export default patientApi;
