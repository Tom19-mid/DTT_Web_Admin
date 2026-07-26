import DashboardTitle from "./components/DashboardTitle";
import SummarySection from "./components/SummarySection";
import InfoSection from "./components/InfoSection";
import ContentSection from "./components/ContentSection";

export default function Dashboard() {
  return (
    <div className="p-7 bg-[#f4f6f9] min-h-screen space-y-6">
      <DashboardTitle />
      <SummarySection />
      <InfoSection />
      <ContentSection />
    </div>
  );
}