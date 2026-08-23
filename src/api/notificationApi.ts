import axiosClient from "./axiosClient";
import type { Notification } from "../pages/Notifications/types";

export interface CreateNotificationPayload {
  userId?: string | null;
  title: string;
  content: string;
  type?: string | null;
  relatedId?: number | null;
  relatedType?: string | null;
}

let notificationsCache: Notification[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

const tempToRealIdMap = new Map<number, number>();

export const notificationApi = {
  getCachedNotifications: (): Notification[] | null => {
    const now = Date.now();
    if (notificationsCache && now - cacheTimestamp < CACHE_TTL_MS) {
      return notificationsCache;
    }
    return null;
  },

  resolveNotificationId: (id: number): number => {
    return tempToRealIdMap.get(id) || id;
  },

  clearCache: () => {
    notificationsCache = null;
    cacheTimestamp = 0;
  },

  getAll: async (
    params?: {
      search?: string;
      status?: string;
      type?: string;
      userId?: string;
    },
    forceRefresh = false
  ): Promise<Notification[]> => {
    const now = Date.now();
    if (!params?.search && !params?.status && !params?.type && !forceRefresh && notificationsCache && now - cacheTimestamp < CACHE_TTL_MS) {
      return notificationsCache;
    }

    try {
      const queryParts: string[] = [];
      if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
      if (params?.status) queryParts.push(`status=${encodeURIComponent(params.status)}`);
      if (params?.type) queryParts.push(`type=${encodeURIComponent(params.type)}`);
      if (params?.userId) queryParts.push(`userId=${encodeURIComponent(params.userId)}`);

      const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
      const response = await axiosClient.get(`/notifications${queryString}`);

      let list: Notification[] = [];
      if (Array.isArray(response.data)) list = response.data;
      else if (response.data && Array.isArray(response.data.data)) list = response.data.data;

      if (!params?.search && !params?.status && !params?.type) {
        notificationsCache = list;
        cacheTimestamp = Date.now();
      }

      return list;
    } catch (error) {
      console.warn("notificationApi.getAll error:", error);
      if (notificationsCache && !params?.search && !params?.status && !params?.type) return notificationsCache;
      return [];
    }
  },

  markAsRead: async (id: number): Promise<boolean> => {
    const realId = tempToRealIdMap.get(id) || id;

    // 1. Optimistic cache update
    if (notificationsCache) {
      notificationsCache = notificationsCache.map((n) =>
        n.notificationId === id || n.notificationId === realId ? { ...n, isRead: true } : n
      );
    }
    // 2. Optimistic event dispatch immediately (0ms)
    window.dispatchEvent(new CustomEvent("notification_read", { detail: { id, realId } }));
    window.dispatchEvent(new Event("notification_updated"));

    try {
      await axiosClient.put(`/notifications/${realId}/read`);
      return true;
    } catch (error) {
      console.warn(`notificationApi.markAsRead(${realId}) error:`, error);
      return false;
    }
  },

  markAllAsRead: async (): Promise<boolean> => {
    // 1. Optimistic cache update
    if (notificationsCache) {
      notificationsCache = notificationsCache.map((n) => ({ ...n, isRead: true }));
    }
    // 2. Optimistic event dispatch immediately (0ms)
    window.dispatchEvent(new Event("notification_all_read"));
    window.dispatchEvent(new Event("notification_updated"));

    try {
      await axiosClient.put("/notifications/read-all");
      return true;
    } catch (error) {
      console.warn("notificationApi.markAllAsRead error:", error);
      return false;
    }
  },

  delete: async (id: number): Promise<boolean> => {
    const realId = tempToRealIdMap.get(id) || id;
    if (notificationsCache) {
      notificationsCache = notificationsCache.filter(
        (n) => n.notificationId !== id && n.notificationId !== realId
      );
    }
    window.dispatchEvent(new CustomEvent("notification_deleted", { detail: { id, realId } }));
    window.dispatchEvent(new Event("notification_updated"));

    try {
      await axiosClient.delete(`/notifications/${realId}`);
      return true;
    } catch (error) {
      console.warn(`notificationApi.delete(${realId}) error:`, error);
      return false;
    }
  },

  create: async (payload: CreateNotificationPayload & { notificationId?: number }): Promise<Notification | null> => {
    // 1. Create optimistic notification item
    const tempId = payload.notificationId || Date.now();
    const tempNoti: Notification = {
      notificationId: tempId,
      title: payload.title,
      content: payload.content,
      type: payload.type || "system",
      isRead: false,
      createdAt: new Date().toISOString(),
      userId: payload.userId,
      relatedId: payload.relatedId,
      relatedType: payload.relatedType,
    };

    // Update memory cache optimistically
    if (notificationsCache) {
      notificationsCache = [tempNoti, ...notificationsCache.filter((n) => n.notificationId !== tempNoti.notificationId)];
    }

    // Immediately dispatch custom event so Bell in Navbar & Notifications page update in 0ms!
    window.dispatchEvent(new CustomEvent("new_notification_created", { detail: tempNoti }));

    try {
      const response = await axiosClient.post("/notifications", {
        title: payload.title,
        content: payload.content,
        type: payload.type,
        userId: payload.userId,
        relatedId: payload.relatedId,
        relatedType: payload.relatedType,
      });
      const serverNoti = response.data?.data || response.data;
      if (serverNoti && serverNoti.notificationId) {
        const realId = serverNoti.notificationId;
        tempToRealIdMap.set(tempId, realId);
        // Mutate original payload so any component holding notiData gets the real ID!
        payload.notificationId = realId;

        if (notificationsCache) {
          notificationsCache = notificationsCache.map((n) =>
            n.notificationId === tempId ? { ...n, ...serverNoti, notificationId: realId } : n
          );
        }
      }
      window.dispatchEvent(new Event("notification_updated"));
      return serverNoti || tempNoti;
    } catch (error) {
      console.warn("notificationApi.create error:", error);
      return tempNoti;
    }
  }
};
