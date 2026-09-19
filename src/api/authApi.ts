import axiosClient from "./axiosClient";
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "../types/auth";

export const authApi = {
  loginAdmin: async (data: AdminLoginRequest): Promise<AdminLoginResponse> => {
    const response = await axiosClient.post<AdminLoginResponse>("/auth/admin-login", data);
    return response.data;
  },

  sendOtp: async (data: SendOtpRequest): Promise<SendOtpResponse> => {
    const response = await axiosClient.post<SendOtpResponse>("/auth/send-otp", data);
    return response.data;
  },

  verifyOtp: async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    const response = await axiosClient.post<VerifyOtpResponse>("/auth/verify-otp", data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
    const response = await axiosClient.post<ResetPasswordResponse>("/auth/reset-password", data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

export default authApi;
