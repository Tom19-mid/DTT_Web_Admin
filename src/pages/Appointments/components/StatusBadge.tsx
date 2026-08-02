import type { AppointmentStatusName } from "../types";

interface StatusBadgeProps {
  status: AppointmentStatusName;
}

function formatStatusText(status: AppointmentStatusName): string {
  switch (status) {
    case "Scheduled":
    case "Đã đặt lịch":
      return "Đã đặt lịch";
    case "CheckedIn":
    case "Đã check in":
      return "Đã check in";
    case "Waiting":
    case "Đang chờ khám":
      return "Đang chờ khám";
    case "WaitingDoctor":
    case "Đang chờ bác sĩ":
      return "Đang chờ bác sĩ";
    case "InProgress":
    case "Đang khám":
      return "Đang khám";
    case "WaitingTestResults":
    case "Đang chờ kết quả xét nghiệm":
      return "Đang chờ kết quả xét nghiệm";
    case "Completed":
    case "Đã hoàn thành":
      return "Đã hoàn thành";
    case "Cancelled":
    case "Đã hủy":
      return "Đã hủy";
    case "NoShow":
    case "Không đến khám":
      return "Không đến khám";
    default:
      return status;
  }
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyle = (st: AppointmentStatusName) => {
    switch (st) {
      case "Scheduled":
      case "Đã đặt lịch":
        return "bg-blue-100 text-blue-700 border border-blue-200/50";
      case "CheckedIn":
      case "Đã check in":
        return "bg-teal-100 text-teal-700 border border-teal-200/50";
      case "Waiting":
      case "Đang chờ khám":
        return "bg-amber-100 text-amber-700 border border-amber-200/50";
      case "WaitingDoctor":
      case "Đang chờ bác sĩ":
        return "bg-sky-100 text-sky-700 border border-sky-200/50";
      case "InProgress":
      case "Đang khám":
        return "bg-indigo-100 text-indigo-700 border border-indigo-200/50";
      case "WaitingTestResults":
      case "Đang chờ kết quả xét nghiệm":
        return "bg-purple-100 text-purple-700 border border-purple-200/50";
      case "Completed":
      case "Đã hoàn thành":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200/50";
      case "Cancelled":
      case "Đã hủy":
        return "bg-rose-100 text-rose-700 border border-rose-200/50";
      case "NoShow":
      case "Không đến khám":
        return "bg-gray-100 text-gray-700 border border-gray-200/50";
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
      {formatStatusText(status)}
    </span>
  );
}
