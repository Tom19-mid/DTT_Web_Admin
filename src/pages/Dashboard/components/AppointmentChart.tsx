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
import type { DoctorChartData } from "../../../types/dashboard";
import { BarChart3 } from "lucide-react";

interface AppointmentChartProps {
  data?: DoctorChartData[];
}

interface TooltipPayloadItem {
  name?: string;
  value?: number | string;
  color?: string;
}

interface LegendPayloadItem {
  value?: string;
  color?: string;
}

// Custom Tick Renderer giúp tên Bác sĩ gọn đẹp, không bị đứt chữ hay tràn mép trái
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomXAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const rawText: string = payload?.value || "";

  // Rút gọn danh xưng học vị dài để nhãn biểu đồ tinh tế, đều đặn
  const shortText = rawText
    .replace(/^BS\.\s*CKII\s*/i, "BS. ")
    .replace(/^BS\.\s*CKI\s*/i, "BS. ")
    .replace(/^ThS\.\s*BS\s*/i, "BS. ")
    .replace(/^TS\.\s*BS\s*/i, "BS. ");

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={14}
        dx={-6}
        textAnchor="end"
        fill="#374151"
        fontSize={12}
        fontWeight={600}
        transform="rotate(-22)"
      >
        {shortText}
      </text>
    </g>
  );
};

export default function AppointmentChart({ data }: AppointmentChartProps) {
  const chartData = data || [];

  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-6 h-full flex flex-col">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Lịch hẹn khám bệnh</h2>

      {chartData.length === 0 ? (
        <div className="flex-1 min-h-[340px] flex flex-col items-center justify-center text-center p-6 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
          <BarChart3 size={48} className="text-gray-300 mb-3" />
          <p className="text-gray-700 font-bold text-base">Không có dữ liệu lịch hẹn</p>
          <p className="text-gray-500 text-sm mt-1">Chưa có lượt đặt khám nào trùng khớp với ngày được chọn.</p>
        </div>
      ) : (
        <div className="flex-1 min-h-[360px] w-full pt-2">
          <ResponsiveContainer width="100%" height={380}>
            <BarChart
              data={chartData}
              accessibilityLayer={false}
              margin={{ top: 10, right: 15, left: 25, bottom: 75 }}
            >
              <CartesianGrid strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="doctor"
                interval={0}
                tick={<CustomXAxisTick />}
              />
              <YAxis
                tickMargin={8}
                tick={{ fontWeight: 700, fontSize: 13, fill: "#374151" }}
              />
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
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 15 }}
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
                    <ul className="flex flex-row items-center justify-end gap-6 mb-2" dir="ltr">
                      {sortedPayload.map((entry, index) => (
                        <li key={`item-${index}`} className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span>{entry.value}</span>
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
      )}
    </div>
  );
}
