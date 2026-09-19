import StatCard from "./StatCard";
import { Users, Stethoscope, HeartPulse, CalendarDays } from "lucide-react";

interface SummarySectionProps {
  totalPatients?: number;
  totalDoctors?: number;
  totalSpecialties?: number;
  totalAppointments?: number;
}

export default function SummarySection({
  totalPatients = 0,
  totalDoctors = 0,
  totalSpecialties = 0,
  totalAppointments = 0,
}: SummarySectionProps) {
  const summaryStats = [
    {
      id: 1,
      title: "Tổng số bệnh nhân",
      value: totalPatients,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: 2,
      title: "Tổng số bác sĩ",
      value: totalDoctors,
      icon: Stethoscope,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      id: 3,
      title: "Chuyên khoa tổng hợp",
      value: totalSpecialties,
      icon: HeartPulse,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
    {
      id: 4,
      title: "Tổng số cuộc hẹn",
      value: totalAppointments,
      icon: CalendarDays,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {summaryStats.map((item) => (
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