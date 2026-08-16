import axiosClient from "./axiosClient";
import type { Notification } from "../pages/Notifications/types";

export interface CreateNotificationPayload {
  userId?: string;
  title: string;
  content: string;
  type?: string;
  relatedId?: number;
  relatedType?: string;
}

export const notificationApi = {
  getAll: async (params?: {
    search?: string;
    status?: string;
    type?: string;
    userId?: string;
  }): Promise<Notification[]> => {
    try {
      const queryParts: string[] = [];
      if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
      if (params?.status) queryParts.push(`status=${encodeURIComponent(params.status)}`);
      if (params?.type) queryParts.push(`type=${encodeURIComponent(params.type)}`);
      if (params?.userId) queryParts.push(`userId=${encodeURIComponent(params.userId)}`);

      const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
      const response = await axiosClient.get(`/notifications${queryString}`);

      if (Array.isArray(response.data)) return response.data;
      if (response.data && Array.isArray(response.data.data)) return response.data.data;
      return [];
    } catch (error) {
      console.warn("notificationApi.getAll error:", error);
      return [];
    }
  },

  markAsRead: async (id: number): Promise<boolean> => {
    try {
      await axiosClient.put(`/notifications/${id}/read`);
      window.dispatchEvent(new Event("notification_updated"));
      return true;
    } catch (error) {
      console.warn(`notificationApi.markAsRead(${id}) error:`, error);
      return false;
    }
  },

  markAllAsRead: async (): Promise<boolean> => {
    try {
      await axiosClient.put("/notifications/read-all");
      window.dispatchEvent(new Event("notification_updated"));
      return true;
    } catch (error) {
      console.warn("notificationApi.markAllAsRead error:", error);
      return false;
    }
  },

  delete: async (id: number): Promise<boolean> => {
    try {
      await axiosClient.delete(`/notifications/${id}`);
      window.dispatchEvent(new Event("notification_updated"));
      return true;
    } catch (error) {
      console.warn(`notificationApi.delete(${id}) error:`, error);
      return false;
    }
  },

  /*
  clearRead: async (): Promise<boolean> => {
    try {
      await axiosClient.delete("/notifications/clear-read");
      return true;
    } catch (error) {
      console.warn("notificationApi.clearRead error:", error);
      return false;
    }
  },
  */

  create: async (payload: CreateNotificationPayload): Promise<Notification | null> => {
    try {
      const response = await axiosClient.post("/notifications", payload);
      window.dispatchEvent(new Event("notification_updated"));
      if (response.data && response.data.data) return response.data.data;
      return response.data;
    } catch (error) {
      console.warn("notificationApi.create error:", error);
      return null;
    }
  }
};
