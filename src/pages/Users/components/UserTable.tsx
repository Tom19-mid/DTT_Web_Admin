import { useState, useMemo } from "react";
import type { User } from "../types";
import UserSearch from "./UserSearch";
import UserRow from "./UserRow";
import Pagination from "../../../components/common/Pagination";

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
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const roles = useMemo(() => {
    const roleSet = new Set<string>();
    users.forEach((u) => roleSet.add(u.role));
    return Array.from(roleSet);
  }, [users]);

  const handleReset = () => {
    setSearchTerm("");
    setSelectedStatus("ALL");
    setSelectedRole("ALL");
    setCurrentPage(1);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        (user.fullName || "").toLowerCase().includes(term) ||
        (user.email || "").toLowerCase().includes(term) ||
        (user.phone || user.phoneNumber || "").includes(term);

      const matchesStatus =
        selectedStatus === "ALL" || user.status === selectedStatus;

      const matchesRole =
        selectedRole === "ALL" || user.role === selectedRole;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchTerm, selectedStatus, selectedRole]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-6">
      <UserSearch
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        selectedStatus={selectedStatus}
        onStatusChange={(val) => {
          setSelectedStatus(val);
          setCurrentPage(1);
        }}
        selectedRole={selectedRole}
        onRoleChange={(val) => {
          setSelectedRole(val);
          setCurrentPage(1);
        }}
        roles={roles}
        onReset={handleReset}
      />

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1020px]">
          <thead>
            <tr className="bg-gray-200/70 text-gray-800 font-bold text-base">
              <th className="py-4 px-4 rounded-l-xl">Họ và tên</th>
              <th className="py-4 px-4">Email</th>
              <th className="py-4 px-4">Số điện thoại</th>
              <th className="py-4 px-4 min-w-[120px]">Vai trò</th>
              <th className="py-4 px-4 min-w-[140px]">Ngày tham gia</th>
              <th className="py-4 px-4 min-w-[140px]">Cập nhật lần cuối</th>
              <th className="py-4 px-4 min-w-[125px]">Trạng thái</th>
              <th className="py-4 px-4 text-center rounded-r-xl min-w-[100px]">Chỉnh sửa</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
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
                  colSpan={8}
                  className="text-center py-10 text-gray-500 font-medium text-lg"
                >
                  Không tìm thấy tài khoản nào khớp với từ khóa.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredUsers.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          totalItems={filteredUsers.length}
          itemsPerPage={itemsPerPage}
          itemLabel="tài khoản"
        />
      )}
    </div>
  );
}
