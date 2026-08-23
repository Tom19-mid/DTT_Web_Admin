import type { User } from "../types";
import RoleBadge from "./RoleBadge";
import StatusBadge from "./StatusBadge";
import ActionButtons from "./ActionButtons";

interface UserRowProps {
  user: User;
  onEdit?: (user: User) => void;
  onLock?: (user: User) => void;
}

const formatDisplayDate = (val?: string) => {
  if (!val || val === "—") return "—";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return val;
  }
};

export default function UserRow({ user, onEdit, onLock }: UserRowProps) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
      <td className="py-4 px-4 text-base text-gray-900 font-bold">
        {user.fullName || "—"}
      </td>
      <td className="py-4 px-4 text-base text-gray-700 font-medium">
        {user.email}
      </td>
      <td className="py-4 px-4 text-gray-700 font-medium text-base">
        {user.phoneNumber || user.phone}
      </td>
      <td className="py-4 px-4">
        <RoleBadge role={user.role || "Bệnh nhân"} />
      </td>
      <td className="py-4 px-4 text-gray-600 font-medium text-base">
        {formatDisplayDate(user.createdAt)}
      </td>
      <td className="py-4 px-4 text-gray-600 font-medium text-base">
        {formatDisplayDate(user.updatedAt || user.lastLogin)}
      </td>
      <td className="py-4 px-4">
        <StatusBadge status={user.status || "Active"} />
      </td>
      <td className="py-4 px-4 text-center">
        <ActionButtons
          onEdit={() => onEdit && onEdit(user)}
          onLock={() => onLock && onLock(user)}
          isLocked={user.status === "Đã khóa" || user.status === "Locked"}
        />
      </td>
    </tr>
  );
}
