import type { PatientStatus } from "../types";

interface StatusBadgeProps {
  status: PatientStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyle = (status: PatientStatus) => {
    switch (status) {
      case "Đã duyệt":
      case "Đang hoạt động":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200/60";
      case "Chờ duyệt":
      case "Ngưng hoạt động":
        return "bg-amber-100 text-amber-700 border border-amber-200/60";
      case "Từ chối":
      case "Đã khóa":
        return "bg-rose-100 text-rose-700 border border-rose-200/60";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  return (
    <span
      className={`inline-flex items-center justify-center px-3.5 py-1 rounded-full text-sm font-bold whitespace-nowrap ${getStatusStyle(
        status
      )}`}
    >
      {status}
    </span>
  );
}
