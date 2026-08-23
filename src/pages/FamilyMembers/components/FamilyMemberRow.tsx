import { memo } from "react";
import type { FamilyMember } from "../types";
import StatusBadge from "./StatusBadge";
import { Eye, Pencil, Trash2 } from "lucide-react";

interface FamilyMemberRowProps {
  member: FamilyMember;
  onViewDetail?: (member: FamilyMember) => void;
  onEdit?: (member: FamilyMember) => void;
  onDelete?: (member: FamilyMember) => void;
}

const getRelationshipBadgeStyle = (rel: string) => {
  const r = rel.toLowerCase();
  if (r.includes("bố") || r.includes("cha")) return "bg-blue-50 text-blue-700 border-blue-200/60";
  if (r.includes("mẹ")) return "bg-pink-50 text-pink-700 border-pink-200/60";
  if (r.includes("vợ") || r.includes("chồng")) return "bg-purple-50 text-purple-700 border-purple-200/60";
  if (r.includes("con")) return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
  if (r.includes("anh") || r.includes("chị") || r.includes("em")) return "bg-amber-50 text-amber-700 border-amber-200/60";
  if (r.includes("ông") || r.includes("bà")) return "bg-indigo-50 text-indigo-700 border-indigo-200/60";
  return "bg-gray-100 text-gray-700 border-gray-200";
};

function FamilyMemberRow({
  member,
  onViewDetail,
  onEdit,
  onDelete,
}: FamilyMemberRowProps) {
  const displayRel = member.relationship?.toLowerCase() === "cha" ? "Bố" : member.relationship || "Bố";

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
      {/* 1. Mã người thân */}
      <td className="py-4 px-4 font-medium text-gray-700 text-base text-center">
        <button
          onClick={() => onViewDetail && onViewDetail(member)}
          className="hover:text-blue-600 font-bold transition cursor-pointer"
        >
          {member.id}
        </button>
      </td>

      {/* 2. Họ và tên người thân */}
      <td className="py-4 px-4 font-bold text-gray-900 text-base">
        <button
          onClick={() => onViewDetail && onViewDetail(member)}
          className="hover:text-blue-600 transition-colors text-left cursor-pointer"
        >
          {member.fullName}
        </button>
      </td>

      {/* 3. Bệnh nhân chính (trước Mối quan hệ) */}
      <td className="py-4 px-4 font-bold text-gray-900 text-base">
        {member.ownerFullName || "Bệnh nhân chính"}
      </td>

      {/* 4. Mối quan hệ */}
      <td className="py-4 px-4 text-center">
        <span
          className={`inline-flex items-center justify-center px-3.5 py-1 rounded-xl text-sm font-bold border ${getRelationshipBadgeStyle(
            displayRel
          )}`}
        >
          {displayRel}
        </span>
      </td>

      {/* 5. Ngày sinh */}
      <td className="py-4 px-4 text-gray-700 font-medium text-base text-center">
        {member.dob || "-"}
      </td>

      {/* 6. Giới tính */}
      <td className="py-4 px-4 text-gray-700 font-medium text-base text-center">
        {member.gender || "-"}
      </td>

      {/* 7. Số điện thoại */}
      <td className="py-4 px-4 text-gray-700 font-medium text-base text-center">
        {member.phone || "-"}
      </td>

      {/* 8. Trạng thái xác thực hồ sơ */}
      <td className="py-4 px-4 text-center">
        <StatusBadge status={member.verificationStatus || "Chờ duyệt"} />
      </td>

      {/* 9. Chỉnh sửa */}
      <td className="py-4 px-4 text-center">
        <div className="flex items-center justify-center gap-1.5">
          {/* Xem chi tiết */}
          {onViewDetail && (
            <button
              onClick={() => onViewDetail(member)}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              title="Xem chi tiết"
            >
              <Eye size={20} />
            </button>
          )}

          {/* Chỉnh sửa (cây bút màu xanh nước biển giống các trang khác) */}
          {onEdit && (
            <button
              onClick={() => onEdit(member)}
              className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              title="Chỉnh sửa hồ sơ"
            >
              <Pencil size={20} />
            </button>
          )}

          {/* Xóa hồ sơ */}
          {onDelete && (
            <button
              onClick={() => onDelete(member)}
              className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Xóa hồ sơ người thân"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default memo(FamilyMemberRow);
