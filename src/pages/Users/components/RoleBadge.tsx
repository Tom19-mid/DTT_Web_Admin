import type { UserRole } from "../types";

interface RoleBadgeProps {
  role: UserRole;
}

export default function RoleBadge({ role }: RoleBadgeProps) {
  const getRoleText = (r: UserRole): string => {
    if (r === "Admin" || r === "Quản trị viên") return "Quản trị viên";
    if (r === "Doctor" || r === "Bác sĩ") return "Bác sĩ";
    if (r === "Patient" || r === "Bệnh nhân") return "Bệnh nhân";
    return String(r);
  };

  const getRoleStyle = (r: UserRole) => {
    const text = getRoleText(r);
    switch (text) {
      case "Quản trị viên":
        return "bg-fuchsia-100 text-fuchsia-600 border border-fuchsia-200/50";
      case "Bệnh nhân":
        return "bg-emerald-100 text-emerald-600 border border-emerald-200/50";
      case "Bác sĩ":
        return "bg-blue-100 text-blue-600 border border-blue-200/50";
      case "Lễ tân tiếp đón":
      case "Điều dưỡng":
      case "Kỹ thuật viên CLS":
      case "Dược sĩ":
        return "bg-purple-100 text-purple-600 border border-purple-200/50";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-200/50";
    }
  };

  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap ${getRoleStyle(
        role
      )}`}
    >
      {getRoleText(role)}
    </span>
  );
}
