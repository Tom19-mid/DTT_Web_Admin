import StatCard from "./StatCard";
import { infoStats } from "../data";

export default function InfoSection() {
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