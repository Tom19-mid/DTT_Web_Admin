import AppointmentChart from "./AppointmentChart";
import RecentActivity from "./RecentActivity";
import type { DoctorChartData, RecentActivityItem } from "../../../types/dashboard";

interface ContentSectionProps {
  chartData?: DoctorChartData[];
  recentActivities?: RecentActivityItem[];
}

export default function ContentSection({ chartData, recentActivities }: ContentSectionProps) {
  return (
    <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
      <div className="xl:col-span-2">
        <AppointmentChart data={chartData} />
      </div>

      <RecentActivity activities={recentActivities} />
    </section>
  );
}