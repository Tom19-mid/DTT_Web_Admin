import { useState, useMemo } from "react";
import type { User } from "../types";
import UserSearch from "./UserSearch";
import UserRow from "./UserRow";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
        user.fullName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.phone.includes(term);

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
        <table className="w-full text-left border-collapse min-w-[850px]">
          <thead>
            <tr className="bg-gray-200/70 text-gray-800 font-bold text-base">
              <th className="py-4 px-4 text-center rounded-l-xl">STT</th>
              <th className="py-4 px-4">Email</th>
              <th className="py-4 px-4">Số điện thoại</th>
              <th className="py-4 px-4">Vai trò</th>
              <th className="py-4 px-4">Ngày tham gia</th>
              <th className="py-4 px-4">Cập nhật lần cuối</th>
              <th className="py-4 px-4">Trạng thái</th>
              <th className="py-4 px-4 text-center rounded-r-xl">Chỉnh sửa</th>
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-100 text-base text-gray-600">
          <div>
            Hiển thị <span className="font-bold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> -{" "}
            <span className="font-bold text-gray-900">
              {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
            </span>{" "}
            trên <span className="font-bold text-gray-900">{filteredUsers.length}</span> tài khoản
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-xl font-bold text-base cursor-pointer transition ${
                  currentPage === page
                    ? "bg-blue-600 text-white shadow-xs"
                    : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
