import {
  X,
  Pencil,
  User,
  FileText,
  Clock,
  ShieldCheck,
  MapPin,
  Phone,
  CreditCard,
  Calendar,
  HeartHandshake,
  UserCheck,
} from "lucide-react";
import type { FamilyMember } from "../types";
import StatusBadge from "./StatusBadge";

interface FamilyMemberDetailModalProps {
  isOpen: boolean;
  member: FamilyMember | null;
  onClose: () => void;
  onEdit?: (member: FamilyMember) => void;
  onVerify?: (member: FamilyMember) => void;
}

export default function FamilyMemberDetailModal({
  isOpen,
  member,
  onClose,
  onEdit,
  onVerify,
}: FamilyMemberDetailModalProps) {
  if (!isOpen || !member) return null;

  const isPending =
    member.verificationStatus === "pending" ||
    member.verificationStatus === "Chờ duyệt";

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr || dateStr === "-" || dateStr === "null") return "-";
    if (dateStr.includes("/") && !dateStr.includes("T")) return dateStr;

    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    const vnDate = new Date(
      d.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }),
    );
    const day = String(vnDate.getDate()).padStart(2, "0");
    const month = String(vnDate.getMonth() + 1).padStart(2, "0");
    const year = vnDate.getFullYear();
    const hours = String(vnDate.getHours()).padStart(2, "0");
    const minutes = String(vnDate.getMinutes()).padStart(2, "0");
    const seconds = String(vnDate.getSeconds()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const getVerificationDateTime = () => {
    if (
      member.verifiedAt &&
      member.verifiedAt !== "-" &&
      member.verifiedAt !== "null"
    ) {
      return formatDateTime(member.verifiedAt);
    }
    // Nếu trạng thái Đã duyệt nhưng verifiedAt bị rỗng, trích xuất ngày giờ từ ghi chú
    if (member.verificationNote) {
      const match = member.verificationNote.match(
        /(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}(?::\d{2})?)/,
      );
      if (match) return match[1];
    }
    if (
      (member.verificationStatus === "Đã duyệt" ||
        member.verificationStatus === "verified") &&
      member.updatedAt
    ) {
      return formatDateTime(member.updatedAt);
    }
    return "-";
  };

  const getCleanVerificationNote = () => {
    if (!member.verificationNote) return "-";
    return member.verificationNote;
  };

  const displayRel =
    member.relationship?.toLowerCase() === "cha"
      ? "Bố"
      : member.relationship || "Bố";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-2xl shadow-xs">
              <HeartHandshake size={26} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  {member.fullName}
                </h2>
                <StatusBadge
                  status={member.verificationStatus || "Chờ duyệt"}
                />
              </div>
              <p className="text-base text-gray-500 mt-0.5">
                Mã người thân:{" "}
                <span className="font-bold text-gray-800">{member.id}</span>
                {" • "}
                Quan hệ:{" "}
                <span className="font-bold text-blue-600">{displayRel}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-6">
          {/* Section 1: Thông tin cá nhân & Hành chính */}
          <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100 space-y-4">
            <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <FileText size={17} className="text-blue-600" />
              Thông tin người thân & Hành chính
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
              <div>
                <span className="text-gray-500 font-semibold text-sm">
                  Họ và tên:
                </span>
                <p className="font-bold text-gray-900 text-lg">
                  {member.fullName}
                </p>
              </div>

              <div>
                <span className="text-gray-500 font-semibold text-sm flex items-center gap-1">
                  <HeartHandshake size={15} /> Mối quan hệ:
                </span>
                <p className="font-bold text-blue-600 text-base">
                  {displayRel}
                </p>
              </div>

              <div>
                <span className="text-gray-500 font-semibold text-sm flex items-center gap-1">
                  <Calendar size={15} /> Ngày sinh:
                </span>
                <p className="font-normal text-gray-900 text-base">
                  {member.dob || "-"}
                </p>
              </div>

              <div>
                <span className="text-gray-500 font-semibold text-sm flex items-center gap-1">
                  <User size={15} /> Giới tính:
                </span>
                <p className="font-normal text-gray-900 text-base">
                  {member.gender || "-"}
                </p>
              </div>

              <div>
                <span className="text-gray-500 font-semibold text-sm flex items-center gap-1">
                  <Phone size={15} /> Số điện thoại riêng:
                </span>
                <p className="font-bold text-gray-900 text-base">
                  {member.phone || "Không có (dùng SĐT bệnh nhân chính)"}
                </p>
              </div>

              <div>
                <span className="text-gray-500 font-semibold text-sm flex items-center gap-1">
                  <CreditCard size={15} /> Số CCCD / CMND:
                </span>
                <p className="font-bold text-gray-900 text-base">
                  {member.cccdNumber || "-"}
                </p>
              </div>

              <div>
                <span className="text-gray-500 font-semibold text-sm flex items-center gap-1">
                  <ShieldCheck size={15} /> Số thẻ BHYT:
                </span>
                <p className="font-bold text-blue-600 text-base">
                  {member.healthInsuranceNumber || "-"}
                </p>
              </div>

              <div className="sm:col-span-2">
                <span className="text-gray-500 font-semibold text-sm flex items-center gap-1">
                  <MapPin size={15} /> Địa chỉ thường trú:
                </span>
                <p className="font-normal text-gray-900 text-base">
                  {member.address && member.address !== "Chưa cập nhật"
                    ? member.address
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Thông tin Bệnh nhân chính (Chủ tài khoản liên kết) */}
          <div className="bg-indigo-50/40 p-5 rounded-2xl border border-indigo-100/70 space-y-4">
            <h3 className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
              <UserCheck size={17} />
              Bệnh nhân chính (Chủ tài khoản liên kết)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
              <div>
                <span className="text-gray-500 font-semibold text-sm">
                  Họ tên bệnh nhân chính:
                </span>
                <p className="font-bold text-gray-900 text-lg">
                  {member.ownerFullName || "Bệnh nhân"}
                </p>
              </div>

              <div>
                <span className="text-gray-500 font-semibold text-sm flex items-center gap-1">
                  <Phone size={15} /> SĐT chủ tài khoản:
                </span>
                <p className="font-bold text-gray-900 text-base">
                  {member.ownerPhone || "-"}
                </p>
              </div>

              <div>
                <span className="text-gray-500 font-semibold text-sm">
                  Mã bệnh nhân chính:
                </span>
                <p className="font-bold text-gray-900 text-base">
                  {member.ownerPatientId ? member.ownerPatientId : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Trạng thái xác thực hồ sơ */}
          <div className="bg-blue-50/40 p-5 rounded-2xl border border-blue-100/70 space-y-4">
            <h3 className="text-xs font-extrabold text-blue-600 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={17} />
              Thông tin xác thực hồ sơ
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
              <div>
                <span className="text-gray-500 font-semibold text-sm block mb-1">
                  Trạng thái xác thực:
                </span>
                <StatusBadge status={member.verificationStatus} />
              </div>

              <div>
                <span className="text-gray-500 font-semibold text-sm flex items-center gap-1">
                  <Clock size={15} /> Thời điểm xác thực:
                </span>
                <p className="font-normal text-gray-900 text-base mt-1">
                  {getVerificationDateTime()}
                </p>
              </div>

              <div>
                <span className="text-gray-500 font-semibold text-sm">
                  Nhân viên xác thực:
                </span>
                <p className="font-bold text-gray-900 text-base">
                  {member.verifiedBy || "-"}
                </p>
              </div>

              <div className="sm:col-span-2">
                <span className="text-gray-500 font-semibold text-sm">
                  Ghi chú xác thực:
                </span>
                <p className="font-medium text-gray-800 text-base mt-0.5">
                  {getCleanVerificationNote()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-7 pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-100 transition cursor-pointer text-base"
          >
            Đóng
          </button>

          {onVerify && isPending && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onVerify(member);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-sm transition cursor-pointer text-base"
            >
              <ShieldCheck size={18} />
              <span>Xác thực CCCD</span>
            </button>
          )}

          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(member);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-sm transition cursor-pointer text-base"
            >
              <Pencil size={18} />
              <span>Chỉnh sửa</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
