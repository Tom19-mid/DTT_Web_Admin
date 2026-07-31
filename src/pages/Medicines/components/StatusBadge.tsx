import type { MedicineStatus } from "../types";

interface StatusBadgeProps {
  status: MedicineStatus | string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const isOperating = status === "Đang hoạt động" || status === "Active";

  if (isOperating) {
    return (
      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-600 border border-emerald-200/50 whitespace-nowrap">
        Đang hoạt động
      </span>
    );
  }

  return (
    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-600 border border-amber-200/50 whitespace-nowrap">
      Ngưng hoạt động
    </span>
  );
}
