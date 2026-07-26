import type { StatCardProps } from "../types";

export default function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-start">
        {/* Left */}
        <div>
          <p className="text-gray-600 text-base font-semibold">{title}</p>
          <h2 className={`text-4xl font-extrabold mt-2.5 ${color}`}>{value}</h2>
        </div>

        {/* Right */}
        <div className={`${bgColor} p-3.5 rounded-2xl shrink-0`}>
          <Icon className={color} size={28} />
        </div>
      </div>
    </div>
  );
}
