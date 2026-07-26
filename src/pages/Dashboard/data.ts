import {
  Users,
  Stethoscope,
  HeartPulse,
  CalendarDays,
  Clock,
  Shield,
  UserCheck,
} from "lucide-react";

export const summaryStats = [
  {
    id: 1,
    title: "Tổng số bệnh nhân",
    value: 133,
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: 2,
    title: "Tổng số bác sĩ",
    value: 3,
    icon: Stethoscope,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    id: 3,
    title: "Chuyên khoa tổng hợp",
    value: 18,
    icon: HeartPulse,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
  },
  {
    id: 4,
    title: "Tổng số cuộc hẹn",
    value: 23,
    icon: CalendarDays,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
];

export const infoStats = [
  {
    id: 1,
    title: "Lịch hẹn hôm nay",
    value: 22,
    icon: Clock,
    color: "text-cyan-500",
    bgColor: "bg-cyan-50",
  },
  {
    id: 2,
    title: "Tài khoản quản trị",
    value: 3,
    icon: Shield,
    color: "text-red-500",
    bgColor: "bg-red-50",
  },
  {
    id: 3,
    title: "Tài khoản đang hoạt động",
    value: 0,
    icon: UserCheck,
    color: "text-gray-400",
    bgColor: "bg-gray-100",
  },
];