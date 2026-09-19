import { useState, useEffect, useMemo } from "react";
import DashboardTitle from "./components/DashboardTitle";
import SummarySection from "./components/SummarySection";
import ContentSection from "./components/ContentSection";
import dashboardApi, { type RawDashboardCache } from "../../api/dashboardApi";
import type { DashboardData, DateFilterType } from "../../types/dashboard";
import { Loader2 } from "lucide-react";

// Hàm lấy chuỗi ngày hôm nay theo format dd/MM/yyyy cho CustomDatePicker
const getTodayString = (): string => {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export default function Dashboard() {
  const [rawData, setRawData] = useState<RawDashboardCache | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Mặc định hiển thị ngày hôm nay trên ô input ngày tháng năm
  const [filterType, setFilterType] = useState<DateFilterType>("custom");
  const [customDate, setCustomDate] = useState<string>(getTodayString());

  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      const cached = await dashboardApi.getRawData(false);
      if (isMounted) {
        setRawData(cached);
        setLoading(false);
      }
    };

    fetchDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  // Tính toán dữ liệu bảng điều khiển tức thì (0ms) khi thay đổi filter ngày mà không cần gọi lại API
  const data: DashboardData | null = useMemo(() => {
    if (!rawData) return null;
    return dashboardApi.computeDashboardMetrics(rawData, filterType, customDate);
  }, [rawData, filterType, customDate]);

  const handleResetFilter = () => {
    const today = getTodayString();
    setCustomDate(today);
    setFilterType("custom");
  };

  return (
    <div className="p-7 bg-[#f4f6f9] min-h-screen space-y-6">
      <DashboardTitle
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        customDate={customDate}
        onCustomDateChange={setCustomDate}
        onResetFilter={handleResetFilter}
      />

      {loading && !rawData ? (
        <div className="py-24 flex flex-col justify-center items-center">
          <Loader2 className="animate-spin text-blue-700 mb-3" size={36} />
          <p className="text-gray-600 font-medium text-base">Đang tải dữ liệu bảng điều khiển...</p>
        </div>
      ) : (
        <>
          <SummarySection
            totalPatients={data?.totalPatients}
            totalDoctors={data?.totalDoctors}
            totalSpecialties={data?.totalSpecialties}
            totalAppointments={data?.totalAppointments}
          />
          <ContentSection
            chartData={data?.chartData}
            recentActivities={data?.recentActivities}
          />
        </>
      )}
    </div>
  );
}