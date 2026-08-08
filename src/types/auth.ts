export interface AdminLoginRequest {
  phone: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  userId: number;
  roleId: number;
  roleCode: string;
  roleName: string;
  fullName: string;
  phone: string;
  email: string | null;
}

export interface AuthUser {
  userId: number;
  roleId: number;
  roleCode: string;
  roleName: string;
  fullName: string;
  phone: string;
  email: string | null;
}

export interface SendOtpRequest {
  phone: string;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  otpCode?: string;
  expiresInSeconds?: number;
}

export interface VerifyOtpRequest {
  phone: string;
  otpCode: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  phone: string;
  otpCode: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}
