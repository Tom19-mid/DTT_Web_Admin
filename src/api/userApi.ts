import axiosClient from "./axiosClient";
import type { User } from "../pages/Users/types";

export interface UserFilterParams {
  roleId?: number;
  status?: string;
  search?: string;
}

export interface CreateUserData {
  phone: string;
  email: string;
  password?: string;
  roleId: number;
  fullName: string;
  status?: string;
}

export interface UpdateUserData {
  phone?: string;
  email?: string;
  roleId?: number;
  fullName?: string;
  status?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extractErrorMessage = (error: any): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.response?.data?.errors?.Phone?.[0]) {
    return error.response.data.errors.Phone[0];
  }
  if (error?.response?.data?.errors?.phone?.[0]) {
    return error.response.data.errors.phone[0];
  }
  return error?.message || "Thao tác thất bại. Vui lòng kiểm tra lại kết nối API!";
};

const formatRoleName = (roleId?: number, rawName?: unknown): string => {
  const rId = Number(roleId || 0);
  if (rId === 1) return "Quản trị viên";
  if (rId === 2) return "Bác sĩ";
  if (rId === 3) return "Bệnh nhân";
  if (rId === 4) return "Lễ tân tiếp đón";
  if (rId === 5) return "Điều dưỡng";
  if (rId === 6) return "Kỹ thuật viên CLS";
  if (rId === 7) return "Dược sĩ";

  const str = String(rawName || "").trim();
  if (str === "Admin" || str === "Quản trị viên") return "Quản trị viên";
  if (str === "Doctor" || str === "Bác sĩ") return "Bác sĩ";
  if (str === "Patient" || str === "Bệnh nhân") return "Bệnh nhân";
  return str || "Bệnh nhân";
};

let usersCache: User[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export const userApi = {
  getCachedUsers: (): User[] | null => {
    const now = Date.now();
    if (usersCache && now - cacheTimestamp < CACHE_TTL_MS) {
      return usersCache;
    }
    return null;
  },

  clearCache: () => {
    usersCache = null;
    cacheTimestamp = 0;
  },

  getAll: async (params?: UserFilterParams, forceRefresh = false): Promise<User[]> => {
    const now = Date.now();
    if (!params && !forceRefresh && usersCache && now - cacheTimestamp < CACHE_TTL_MS) {
      return usersCache;
    }

    try {
      const response = await axiosClient.get("/users", { params });
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.users || response.data?.data || [];

      // Maps backend DTO format (UserDto) to frontend User interface cleanly
      const mappedUsers = data.map((u: Record<string, unknown>, index: number) => {
        const rawStatus = String(u.status || "Active");
        let displayStatus = "Đang hoạt động";
        if (rawStatus.toLowerCase() === "locked" || rawStatus === "Đã khóa") {
          displayStatus = "Đã khóa";
        } else if (rawStatus.toLowerCase() === "inactive" || rawStatus === "Ngưng hoạt động") {
          displayStatus = "Ngưng hoạt động";
        } else if (rawStatus.toLowerCase() === "onleave" || rawStatus === "Nghỉ phép") {
          displayStatus = "Nghỉ phép";
        }

        const roleId = Number(u.roleId || u.role_id || 3);
        const roleName = formatRoleName(roleId, u.roleName || u.role_name || u.role);

        return {
          userId: String(u.userId || u.id || ""),
          id: String(u.userId || u.id || index + 1),
          stt: index + 1,
          phone: String(u.phone || u.phoneNumber || u.phone_number || ""),
          phoneNumber: String(u.phone || u.phoneNumber || u.phone_number || ""),
          email: String(u.email || ""),
          roleId: roleId,
          role: roleName,
          status: displayStatus,
          createdAt: String(u.createdAt || u.created_at || ""),
          updatedAt: String(u.updatedAt || u.updated_at || ""),
          fullName: String(u.fullName || u.full_name || u.name || ""),
        } as User;
      });

      if (!params) {
        usersCache = mappedUsers;
        cacheTimestamp = Date.now();
      }

      return mappedUsers;
    } catch (error) {
      console.warn("userApi.getAll error:", error);
      if (usersCache && !params) return usersCache;
      return [];
    }
  },

  getById: async (id: string | number): Promise<User | null> => {
    try {
      const response = await axiosClient.get(`/users/${id}`);
      const u = response.data;
      if (!u) return null;

      const rawStatus = String(u.status || "Active");
      let displayStatus = "Đang hoạt động";
      if (rawStatus.toLowerCase() === "locked" || rawStatus === "Đã khóa") {
        displayStatus = "Đã khóa";
      } else if (rawStatus.toLowerCase() === "inactive" || rawStatus === "Ngưng hoạt động") {
        displayStatus = "Ngưng hoạt động";
      }

      const roleId = Number(u.roleId || 3);
      const roleName = formatRoleName(roleId, u.roleName || u.role);

      return {
        userId: String(u.userId || u.id || id),
        id: String(u.userId || u.id || id),
        phone: String(u.phone || u.phoneNumber || ""),
        phoneNumber: String(u.phone || u.phoneNumber || ""),
        email: String(u.email || ""),
        roleId: roleId,
        role: roleName,
        status: displayStatus,
        createdAt: String(u.createdAt || ""),
        updatedAt: String(u.updatedAt || ""),
        fullName: String(u.fullName || ""),
      } as User;
    } catch (error) {
      console.warn(`userApi.getById(${id}) error:`, error);
      return null;
    }
  },

  create: async (data: CreateUserData): Promise<User | null> => {
    try {
      usersCache = null;
      cacheTimestamp = 0;
      let backendStatus = "Active";
      if (data.status === "Đã khóa" || data.status?.toLowerCase() === "locked") {
        backendStatus = "Locked";
      } else if (data.status === "Ngưng hoạt động" || data.status?.toLowerCase() === "inactive") {
        backendStatus = "Inactive";
      }

      const response = await axiosClient.post("/users", {
        ...data,
        status: backendStatus,
      });
      const u = response.data;
      if (!u) return null;

      return {
        userId: String(u.userId || u.id || ""),
        id: String(u.userId || u.id || ""),
        phone: String(u.phone || data.phone),
        phoneNumber: String(u.phone || data.phone),
        email: String(u.email || data.email),
        roleId: Number(u.roleId || data.roleId),
        role: String(u.roleName || u.role || "Người dùng"),
        status: String(u.status || "Đang hoạt động"),
        fullName: String(u.fullName || data.fullName),
      } as User;
    } catch (error) {
      const msg = extractErrorMessage(error);
      console.error("userApi.create error:", msg);
      throw new Error(msg, { cause: error });
    }
  },

  update: async (id: string | number, data: UpdateUserData): Promise<User | null> => {
    try {
      usersCache = null;
      cacheTimestamp = 0;
      let backendStatus = data.status;
      if (data.status === "Đã khóa" || data.status?.toLowerCase() === "locked") {
        backendStatus = "Locked";
      } else if (data.status === "Ngưng hoạt động" || data.status?.toLowerCase() === "inactive") {
        backendStatus = "Inactive";
      } else if (data.status === "Đang hoạt động" || data.status?.toLowerCase() === "active") {
        backendStatus = "Active";
      }

      const response = await axiosClient.put(`/users/${id}`, {
        ...data,
        status: backendStatus,
      });
      const u = response.data;
      if (!u) return null;

      const rawStatus = String(u.status || "Active");
      let displayStatus = "Đang hoạt động";
      if (rawStatus.toLowerCase() === "locked" || rawStatus === "Đã khóa") {
        displayStatus = "Đã khóa";
      } else if (rawStatus.toLowerCase() === "inactive" || rawStatus === "Ngưng hoạt động") {
        displayStatus = "Ngưng hoạt động";
      }

      return {
        userId: String(u.userId || id),
        id: String(u.userId || id),
        phone: String(u.phone || data.phone || ""),
        phoneNumber: String(u.phone || data.phone || ""),
        email: String(u.email || data.email || ""),
        roleId: Number(u.roleId || data.roleId || 3),
        role: String(u.roleName || u.role || ""),
        status: displayStatus,
        fullName: String(u.fullName || data.fullName || ""),
      } as User;
    } catch (error) {
      const msg = extractErrorMessage(error);
      console.error(`userApi.update(${id}) error:`, msg);
      throw new Error(msg, { cause: error });
    }
  },

  updateStatus: async (id: string | number, status: string): Promise<boolean> => {
    try {
      usersCache = null;
      cacheTimestamp = 0;
      let backendStatus = "Active";
      if (status === "Đã khóa" || status.toLowerCase() === "locked") {
        backendStatus = "Locked";
      } else if (status === "Ngưng hoạt động" || status.toLowerCase() === "inactive") {
        backendStatus = "Inactive";
      }
      await axiosClient.put(`/users/${id}/status`, { status: backendStatus });
      return true;
    } catch (error) {
      const msg = extractErrorMessage(error);
      console.error(`userApi.updateStatus(${id}) error:`, msg);
      throw new Error(msg, { cause: error });
    }
  },

  deleteUser: async (id: string | number): Promise<boolean> => {
    try {
      usersCache = null;
      cacheTimestamp = 0;
      await axiosClient.delete(`/users/${id}`);
      return true;
    } catch (error) {
      const msg = extractErrorMessage(error);
      console.error(`userApi.deleteUser(${id}) error:`, msg);
      throw new Error(msg, { cause: error });
    }
  },
};

export default userApi;
