import type { DoctorStatus } from "../types";

interface StatusBadgeProps {
  status: DoctorStatus | string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const formatStatusDisplay = (s?: string) => {
    if (!s) return "Đang hoạt động";
    const lower = s.trim().toLowerCase();
    if (lower === "active" || lower === "đang hoạt động") return "Đang hoạt động";
    if (lower === "inactive" || lower === "ngưng hoạt động") return "Ngưng hoạt động";
    if (lower === "onleave" || lower === "nghỉ phép") return "Nghỉ phép";
    if (lower === "locked" || lower === "đã khóa") return "Đã khóa";
    return s;
  };

  const displayStatus = formatStatusDisplay(status);

  const getStatusStyle = (disp: string) => {
    switch (disp) {
      case "Đang hoạt động":
        return "bg-emerald-100 text-emerald-600 border border-emerald-200/50";
      case "Ngưng hoạt động":
        return "bg-amber-100 text-amber-600 border border-amber-200/50";
      case "Nghỉ phép":
        return "bg-blue-100 text-blue-600 border border-blue-200/50";
      case "Đã khóa":
        return "bg-rose-100 text-rose-600 border border-rose-200/50";
      default:
        return "bg-emerald-100 text-emerald-600 border border-emerald-200/50";
    }
  };

  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap ${getStatusStyle(
        displayStatus
      )}`}
    >
      {displayStatus}
    </span>
  );
}
