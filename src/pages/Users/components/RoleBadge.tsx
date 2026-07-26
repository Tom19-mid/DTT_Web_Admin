import type { UserRole } from "../types";

interface RoleBadgeProps {
  role: UserRole;
}

export default function RoleBadge({ role }: RoleBadgeProps) {
  const getRoleStyle = (role: UserRole) => {
    switch (role) {
      case "Admin":
        return "bg-fuchsia-100 text-fuchsia-600 border border-fuchsia-200/50";
      case "Bệnh nhân":
        return "bg-emerald-100 text-emerald-600 border border-emerald-200/50";
      case "Bác sĩ":
        return "bg-blue-100 text-blue-600 border border-blue-200/50";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap ${getRoleStyle(
        role
      )}`}
    >
      {role}
    </span>
  );
}
