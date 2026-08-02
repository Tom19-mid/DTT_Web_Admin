import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { appointmentData } from "../chartData";

interface TooltipPayloadItem {
  name?: string;
  value?: number | string;
  color?: string;
}

interface LegendPayloadItem {
  value?: string;
  color?: string;
}

export default function AppointmentChart() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-6 h-full">
      <h2 className="text-xl font-bold text-gray-900 mb-5">Lịch hẹn khám bệnh</h2>
      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={appointmentData} accessibilityLayer={false}>
          <CartesianGrid strokeDasharray="4 4" />
          <XAxis dataKey="doctor" tickMargin={10} tick={{ fontWeight: 700, fontSize: 14, fill: "#374151", fontFamily: "Tahoma, sans-serif" }} />
          <YAxis tickMargin={10} tick={{ fontWeight: 700, fontSize: 14, fill: "#374151", fontFamily: "Tahoma, sans-serif" }} />
          <Tooltip
            cursor={{ fill: "rgba(0, 0, 0, 0.04)", stroke: "none" }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const desiredOrder = ["Lịch hẹn", "Hoàn thành", "Chưa giải quyết"];
                const sortedPayload = ([...payload] as unknown as TooltipPayloadItem[]).sort(
                  (a, b) =>
                    desiredOrder.indexOf(a.name || "") - desiredOrder.indexOf(b.name || "")
                );
                return (
                  <div className="bg-white p-3.5 border border-gray-200 shadow-lg rounded-xl text-base">
                    <p className="font-bold text-gray-900 mb-1.5">{label}</p>
                    {sortedPayload.map((entry, index) => (
                      <p key={index} style={{ color: entry.color }} className="font-semibold text-sm py-0.5">
                        {entry.name} : {entry.value}
                      </p>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            content={(props) => {
              const { payload } = props;
              const desiredOrder = ["Lịch hẹn", "Hoàn thành", "Chưa giải quyết"];
              const sortedPayload = payload
                ? ([...payload] as unknown as LegendPayloadItem[]).sort(
                    (a, b) =>
                      desiredOrder.indexOf(a.value || "") - desiredOrder.indexOf(b.value || "")
                  )
                : [];
              return (
                <ul className="flex flex-row items-center justify-center gap-7 mt-5" dir="ltr">
                  {sortedPayload.map((entry, index) => (
                    <li key={`item-${index}`} className="flex items-center gap-2.5 text-base">
                      <span
                        className="w-3 h-3 rounded-full inline-block"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="font-semibold text-gray-800">{entry.value}</span>
                    </li>
                  ))}
                </ul>
              );
            }}
          />
          <Bar
            dataKey="appointments"
            name="Lịch hẹn"
            fill="#2563eb"
            radius={[6, 6, 0, 0]}
          />
          <Bar
            dataKey="completed"
            name="Hoàn thành"
            fill="#16a34a"
            radius={[6, 6, 0, 0]}
          />
          <Bar
            dataKey="pending"
            name="Chưa giải quyết"
            fill="#f97316"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
