import StatCard from "./StatCard";
import { summaryStats } from "../data";

export default function SummarySection() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
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