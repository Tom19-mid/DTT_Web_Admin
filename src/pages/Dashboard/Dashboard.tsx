import { useState, useEffect } from "react";
import DashboardTitle from "./components/DashboardTitle";
import SummarySection from "./components/SummarySection";
import ContentSection from "./components/ContentSection";
import dashboardApi from "../../api/dashboardApi";
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
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Mặc định hiển thị ngày hôm nay trên ô input ngày tháng năm
  const [filterType, setFilterType] = useState<DateFilterType>("custom");
  const [customDate, setCustomDate] = useState<string>(getTodayString());

  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      setLoading(true);
      const res = await dashboardApi.getDashboardData(filterType, customDate);
      if (isMounted) {
        setData(res);
        setLoading(false);
      }
    };

    fetchDashboard();
    return () => {
      isMounted = false;
    };
  }, [filterType, customDate]);

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

      {loading ? (
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