export interface SummaryStatItem {
  id: number;
  title: string;
  value: number;
  color: string;
  bgColor: string;
  iconType: "patients" | "doctors" | "specialties" | "appointments";
}

export interface InfoStatItem {
  id: number;
  title: string;
  value: number;
  color: string;
  bgColor: string;
  iconType: "todayAppointments" | "adminAccounts" | "activeAccounts";
}

export interface DoctorChartData {
  doctor: string;
  appointments: number;
  completed: number;
  pending: number;
}

export interface RecentActivityItem {
  id: number;
  name: string;
  description: string;
  time: string;
  color: string;
}

export interface AppointmentRecord {
  appointmentId?: number;
  id?: number;
  patientId?: number;
  patientName?: string;
  patient_name?: string;
  doctorId?: number;
  doctor_id?: number;
  doctorName?: string;
  doctor_name?: string;
  specialtyName?: string;
  specialty_name?: string;
  date?: string;
  reason?: string;
  status?: string;
  status_name?: string;
  statusId?: number;
}

export type DateFilterType = "all" | "today" | "7days" | "30days" | "custom";

export interface DashboardData {
  totalPatients: number;
  totalDoctors: number;
  totalSpecialties: number;
  totalAppointments: number;
  todayAppointments: number;
  chartData: DoctorChartData[];
  recentActivities: RecentActivityItem[];
}
