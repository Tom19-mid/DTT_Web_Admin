import React, { createContext, useContext, useState, useEffect } from "react";
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Khôi phục phiên đăng nhập từ localStorage khi ứng dụng khởi chạy
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

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
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được sử dụng trong AuthProvider");
  }
  return context;
};
