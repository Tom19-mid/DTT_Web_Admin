import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../components/layout/AdminLayout";

// Code-splitting theo route — trước đây toàn bộ 10 trang (kèm form/modal/recharts của Dashboard)
// được import tĩnh, gộp chung vào 1 bundle JS ban đầu mà cả người chỉ ghé màn Login cũng phải tải hết.
// React.lazy trì hoãn tải code của mỗi trang tới khi thực sự điều hướng tới route đó.
const Login = lazy(() => import("../pages/Login/Login"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword/ForgotPassword"));
const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));
const Users = lazy(() => import("../pages/Users/Users"));
const Patients = lazy(() => import("../pages/Patients/Patients"));
const Doctors = lazy(() => import("../pages/Doctors/Doctors"));
const Specialties = lazy(() => import("../pages/Specialties/Specialties"));
const Medicines = lazy(() => import("../pages/Medicines/Medicines"));
const Appointments = lazy(() => import("../pages/Appointments/Appointments"));
const WorkSchedules = lazy(() => import("../pages/WorkSchedules/WorkSchedules"));
const Notifications = lazy(() => import("../pages/Notifications/Notifications"));

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Các Route cần bảo vệ bởi Quyền Đăng nhập Admin */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/users" element={<Users />} />
                <Route path="/patients" element={<Patients />} />
                <Route path="/doctors" element={<Doctors />} />
                <Route path="/doctor-leaves" element={<Doctors defaultTab="leaves" />} />
                <Route path="/specialties" element={<Specialties />} />
                <Route path="/medicines" element={<Medicines />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/work-schedules" element={<WorkSchedules />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
