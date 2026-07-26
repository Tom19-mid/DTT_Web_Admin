import AppointmentChart from "./AppointmentChart";
import RecentActivity from "./RecentActivity";

export default function ContentSection() {
  return (
    <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">

      <div className="xl:col-span-2">
        <AppointmentChart />
      </div>

      <RecentActivity />

    </section>
  );
}