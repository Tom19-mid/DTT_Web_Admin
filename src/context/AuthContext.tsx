import React, { createContext, useContext, useState } from "react";
import authApi from "../api/authApi";
import type { AuthUser, AdminLoginResponse } from "../types/auth";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<AdminLoginResponse>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return null;
    }
  });

  const login = async (phone: string, password: string): Promise<AdminLoginResponse> => {
    const res = await authApi.loginAdmin({ phone, password });

    const authUser: AuthUser = {
      userId: res.userId,
      roleId: res.roleId,
      roleCode: res.roleCode,
      roleName: res.roleName,
      fullName: res.fullName,
      phone: res.phone,
      email: res.email,
    };

    setToken(res.token);
    setUser(authUser);

    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(authUser));

    return res;
  };

  const logout = () => {
    authApi.logout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        loading: false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được sử dụng trong AuthProvider");
  }
  return context;
};
