import { useState, useMemo } from "react";
import type { FamilyMember } from "../types";
import FamilyMemberSearch from "./FamilyMemberSearch";
import FamilyMemberRow from "./FamilyMemberRow";
import Pagination from "../../../components/common/Pagination";

interface FamilyMemberTableProps {
  members: FamilyMember[];
  onViewDetailMember?: (member: FamilyMember) => void;
  onEditMember?: (member: FamilyMember) => void;
  onVerifyMember?: (member: FamilyMember) => void;
  onDeleteMember?: (member: FamilyMember) => void;
}

export default function FamilyMemberTable({
  members,
  onViewDetailMember,
  onEditMember,
  onVerifyMember,
  onDeleteMember,
}: FamilyMemberTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRelationship, setSelectedRelationship] = useState("ALL");
  const [selectedVerificationStatus, setSelectedVerificationStatus] = useState("ALL");
  const [selectedGender, setSelectedGender] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleReset = () => {
    setSearchTerm("");
    setSelectedRelationship("ALL");
    setSelectedVerificationStatus("ALL");
    setSelectedGender("ALL");
    setCurrentPage(1);
  };

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        String(m.id).includes(term) ||
        (m.fullName && m.fullName.toLowerCase().includes(term)) ||
        (m.ownerFullName && m.ownerFullName.toLowerCase().includes(term)) ||
        (m.phone && m.phone.includes(term)) ||
        (m.ownerPhone && m.ownerPhone.includes(term)) ||
        (m.healthInsuranceNumber && m.healthInsuranceNumber.toLowerCase().includes(term)) ||
        (m.cccdNumber && m.cccdNumber.includes(term));

      let rel = m.relationship || "";
      if (rel.toLowerCase() === "cha") rel = "Bố";
      const matchesRelationship =
        selectedRelationship === "ALL" ||
        rel.toLowerCase().includes(selectedRelationship.toLowerCase());

      const matchesVerificationStatus =
        selectedVerificationStatus === "ALL" ||
        (m.verificationStatus || "Chờ duyệt") === selectedVerificationStatus;

      const matchesGender =
        selectedGender === "ALL" || m.gender === selectedGender;

      return matchesSearch && matchesRelationship && matchesVerificationStatus && matchesGender;
    });
  }, [members, searchTerm, selectedRelationship, selectedVerificationStatus, selectedGender]);

  // Phân trang
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage) || 1;
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMembers.slice(start, start + itemsPerPage);
  }, [filteredMembers, currentPage]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-6">
      <FamilyMemberSearch
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        selectedRelationship={selectedRelationship}
        onRelationshipChange={(val) => {
          setSelectedRelationship(val);
          setCurrentPage(1);
        }}
        selectedVerificationStatus={selectedVerificationStatus}
        onVerificationStatusChange={(val) => {
          setSelectedVerificationStatus(val);
          setCurrentPage(1);
        }}
        selectedGender={selectedGender}
        onGenderChange={(val) => {
          setSelectedGender(val);
          setCurrentPage(1);
        }}
        onReset={handleReset}
      />

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-200/70 text-gray-800 font-bold text-base">
              <th className="py-4 px-4 text-center rounded-l-xl">Mã người thân</th>
              <th className="py-4 px-4">Họ và tên</th>
              <th className="py-4 px-4">Bệnh nhân chính</th>
              <th className="py-4 px-4 text-center">Mối quan hệ</th>
              <th className="py-4 px-4 text-center">Ngày sinh</th>
              <th className="py-4 px-4 text-center">Giới tính</th>
              <th className="py-4 px-4 text-center">Số điện thoại</th>
              <th className="py-4 px-4 text-center">Trạng thái xác thực hồ sơ</th>
              <th className="py-4 px-4 text-center rounded-r-xl">Chỉnh sửa</th>
            </tr>
          </thead>
          <tbody>
            {paginatedMembers.length > 0 ? (
              paginatedMembers.map((member) => (
                <FamilyMemberRow
                  key={member.id}
                  member={member}
                  onViewDetail={onViewDetailMember}
                  onEdit={onEditMember}
                  onVerify={onVerifyMember}
                  onDelete={onDeleteMember}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className="text-center py-12 text-gray-500 font-medium text-lg"
                >
                  Không tìm thấy hồ sơ người thân nào khớp với tiêu chí tìm kiếm.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredMembers.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          totalItems={filteredMembers.length}
          itemsPerPage={itemsPerPage}
          itemLabel="người thân"
        />
      )}
    </div>
  );
}
