import type { UserStatus } from "../types";

interface StatusBadgeProps {
  status: UserStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyle = (status: UserStatus) => {
    switch (status) {
      case "Đang hoạt động":
      case "Active":
        return "bg-emerald-100 text-emerald-600 border border-emerald-200/50";
      case "Ngưng hoạt động":
      case "Inactive":
        return "bg-amber-100 text-amber-600 border border-amber-200/50";
      case "Nghỉ phép":
      case "OnLeave":
        return "bg-blue-100 text-blue-600 border border-blue-200/50";
      case "Đã khóa":
      case "Locked":
        return "bg-rose-100 text-rose-600 border border-rose-200/50";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <span
      className={`inline-flex items-center justify-center px-3.5 py-1 rounded-full text-sm font-bold whitespace-nowrap min-w-[100px] text-center ${getStatusStyle(
        status
      )}`}
    >
      {status}
    </span>
  );
}
