import type { FamilyMemberStatus, VerificationStatus } from "../types";

interface StatusBadgeProps {
  status: FamilyMemberStatus | VerificationStatus | string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "verified":
      case "Đã duyệt":
      case "Active":
      case "Đang hoạt động":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200/60";
      case "pending":
      case "Chờ duyệt":
      case "Inactive":
      case "Ngưng hoạt động":
        return "bg-amber-100 text-amber-700 border border-amber-200/60";
      case "rejected":
      case "Từ chối":
      case "Locked":
      case "Đã khóa":
        return "bg-rose-100 text-rose-700 border border-rose-200/60";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "verified":
        return "Đã duyệt";
      case "pending":
        return "Chờ duyệt";
      case "rejected":
        return "Từ chối";
      case "Active":
        return "Đang hoạt động";
      case "Inactive":
        return "Ngưng hoạt động";
      case "Locked":
        return "Đã khóa";
      default:
        return status;
    }
  };

  return (
    <span
      className={`inline-flex items-center justify-center px-3.5 py-1 rounded-full text-sm font-bold whitespace-nowrap ${getStatusStyle(
        status
      )}`}
    >
      {getStatusText(status)}
    </span>
  );
}
