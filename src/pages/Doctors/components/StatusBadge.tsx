import type { DoctorStatus } from "../types";

interface StatusBadgeProps {
  status: DoctorStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyle = (status: DoctorStatus) => {
    switch (status) {
      case "Đang hoạt động":
        return "bg-emerald-100 text-emerald-600 border border-emerald-200/50";
      case "Ngưng hoạt động":
        return "bg-amber-100 text-amber-600 border border-amber-200/50";
      case "Nghỉ phép":
        return "bg-blue-100 text-blue-600 border border-blue-200/50";
      case "Đã khóa":
        return "bg-rose-100 text-rose-600 border border-rose-200/50";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap ${getStatusStyle(
        status
      )}`}
    >
      {status}
    </span>
  );
}
