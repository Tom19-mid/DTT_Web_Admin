import type { User } from "../types";
import RoleBadge from "./RoleBadge";
import StatusBadge from "./StatusBadge";
import ActionButtons from "./ActionButtons";

interface UserRowProps {
  user: User;
  onEdit?: (user: User) => void;
  onLock?: (user: User) => void;
}

export default function UserRow({ user, onEdit, onLock }: UserRowProps) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
      <td className="py-4 px-4 text-center font-medium text-gray-500 text-base">
        {user.stt}
      </td>
      <td className="py-4 px-4 text-base text-gray-900 font-bold">
        {user.email}
      </td>
      <td className="py-4 px-4 text-gray-700 font-medium text-base">
        {user.phone}
      </td>
      <td className="py-4 px-4">
        <RoleBadge role={user.role} />
      </td>
      <td className="py-4 px-4 text-gray-600 font-medium text-base">
        {user.createdAt}
      </td>
      <td className="py-4 px-4 text-gray-600 font-medium text-base">
        {user.lastLogin}
      </td>
      <td className="py-4 px-4">
        <StatusBadge status={user.status} />
      </td>
      <td className="py-4 px-4 text-center">
        <ActionButtons
          onEdit={() => onEdit && onEdit(user)}
          onLock={() => onLock && onLock(user)}
        />
      </td>
    </tr>
  );
}
