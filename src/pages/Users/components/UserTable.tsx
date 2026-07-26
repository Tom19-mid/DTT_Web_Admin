import { useState } from "react";
import type { User } from "../types";
import UserSearch from "./UserSearch";
import UserRow from "./UserRow";

interface UserTableProps {
  users: User[];
  onEditUser?: (user: User) => void;
  onLockUser?: (user: User) => void;
}

export default function UserTable({
  users,
  onEditUser,
  onLockUser,
}: UserTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      user.fullName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.phone.includes(term) ||
      user.role.toLowerCase().includes(term) ||
      user.status.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-6">
      <UserSearch value={searchTerm} onChange={setSearchTerm} />

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="bg-gray-200/70 text-gray-800 font-bold text-base">
              <th className="py-4 px-4 text-center rounded-l-xl">STT</th>
              <th className="py-4 px-4">Họ và tên</th>
              <th className="py-4 px-4">Email</th>
              <th className="py-4 px-4">Số điện thoại</th>
              <th className="py-4 px-4">Vai trò</th>
              <th className="py-4 px-4">Ngày tham gia</th>
              <th className="py-4 px-4">Lần đăng nhập cuối</th>
              <th className="py-4 px-4">Trạng thái</th>
              <th className="py-4 px-4 rounded-r-xl">Chỉnh sửa</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onEdit={onEditUser}
                  onLock={onLockUser}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className="text-center py-10 text-gray-500 font-medium text-lg"
                >
                  Không tìm thấy tài khoản nào khớp với từ khóa.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
