import StatCard from "./StatCard";
import { Clock, Shield, UserCheck } from "lucide-react";

interface InfoSectionProps {
  todayAppointments?: number;
  adminAccounts?: number;
  activeAccounts?: number;
}

export default function InfoSection({
  todayAppointments = 22,
  adminAccounts = 3,
  activeAccounts = 0,
}: InfoSectionProps) {
  const infoStats = [
    {
      id: 1,
      title: "Lịch hẹn hôm nay",
      value: todayAppointments,
      icon: Clock,
      color: "text-cyan-500",
      bgColor: "bg-cyan-50",
    },
    {
      id: 2,
      title: "Tài khoản quản trị",
      value: adminAccounts,
      icon: Shield,
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      id: 3,
      title: "Tài khoản đang hoạt động",
      value: activeAccounts,
      icon: UserCheck,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      {infoStats.map((item) => (
        <StatCard
          key={item.id}
          title={item.title}
          value={item.value}
          icon={item.icon}
          color={item.color}
          bgColor={item.bgColor}
        />
      ))}
    </section>
  );
}