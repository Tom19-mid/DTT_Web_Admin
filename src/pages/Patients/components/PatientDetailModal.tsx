import { X, Pencil, User, FileText, Clock, ShieldCheck, MapPin, Phone, CreditCard, Calendar } from "lucide-react";
import type { Patient } from "../types";
import StatusBadge from "./StatusBadge";

interface PatientDetailModalProps {
  isOpen: boolean;
  patient: Patient | null;
  onClose: () => void;
  onEdit?: (patient: Patient) => void;
}

export default function PatientDetailModal({
  isOpen,
  patient,
  onClose,
  onEdit,
}: PatientDetailModalProps) {
  if (!isOpen || !patient) return null;

  // Format YYYY-MM-DD or string
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    if (dateStr.includes("-") && dateStr.length === 10) {
      const parts = dateStr.split("-");
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-2xl shadow-xs">
              <User size={26} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  {patient.fullName}
                </h2>
                <StatusBadge status={patient.verificationStatus || patient.status} />
              </div>
              <p className="text-base text-gray-500 mt-0.5">
                Mã bệnh nhân: <span className="font-bold text-gray-800">{patient.code || `#${patient.id}`}</span>
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
              Thông tin cá nhân & Hành chính
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
              <div>
                <span className="text-gray-500 font-semibold text-sm">Họ và tên:</span>
                <p className="font-bold text-gray-900 text-lg">{patient.fullName}</p>
              </div>

              <div>
                <span className="text-gray-500 font-semibold text-sm flex items-center gap-1">
                  <Calendar size={15} /> Ngày sinh & Giới tính:
                </span>
                <p className="font-bold text-gray-900 text-base">
                  {formatDate(patient.dob)} ({patient.gender || "Chưa cập nhật"})
                </p>
              </div>

              <div>
                <span className="text-gray-500 font-semibold text-sm flex items-center gap-1">
                  <Phone size={15} /> Số điện thoại:
                </span>
                <p className="font-bold text-gray-900 text-base">{patient.phone || "-"}</p>
              </div>

              <div>
                <span className="text-gray-500 font-semibold text-sm flex items-center gap-1">
                  <CreditCard size={15} /> Số CCCD / CMND:
                </span>
                <p className="font-bold text-gray-900 text-base">{patient.cccdNumber || "-"}</p>
              </div>

              <div>
                <span className="text-gray-500 font-semibold text-sm flex items-center gap-1">
                  <ShieldCheck size={15} /> Số thẻ BHYT:
                </span>
                <p className="font-bold text-blue-600 text-base">{patient.healthInsuranceNumber || "-"}</p>
              </div>

              <div className="sm:col-span-2">
                <span className="text-gray-500 font-semibold text-sm flex items-center gap-1">
                  <MapPin size={15} /> Địa chỉ thường trú:
                </span>
                <p className="font-bold text-gray-900 text-base">{patient.address || "-"}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Trạng thái xác thực hồ sơ */}
          <div className="bg-blue-50/40 p-5 rounded-2xl border border-blue-100/70 space-y-4">
            <h3 className="text-xs font-extrabold text-blue-600 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={17} />
              Thông tin xác thực hồ sơ
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
              <div>
                <span className="text-gray-500 font-semibold text-sm block mb-1">Trạng thái xác thực:</span>
                <div className="flex items-center justify-start">
                  <StatusBadge status={patient.verificationStatus || patient.status} />
                </div>
              </div>

              <div>
                <span className="text-gray-500 font-semibold text-sm flex items-center gap-1">
                  <Clock size={15} /> Thời điểm xác thực:
                </span>
                <p className="font-bold text-gray-900 text-base mt-1">{patient.verifiedAt || "-"}</p>
              </div>

              <div>
                <span className="text-gray-500 font-semibold text-sm">Người thực hiện xác thực:</span>
                <p className="font-bold text-gray-900 text-base">{patient.verifiedBy || "-"}</p>
              </div>

              <div>
                <span className="text-gray-500 font-semibold text-sm">Ghi chú xác thực:</span>
                <p className="font-bold text-gray-900 text-base">{patient.verificationNote || "-"}</p>
              </div>
            </div>
          </div>

          {/* Section 3: Thông tin nhật ký hệ thống */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500 pt-3 border-t border-gray-100">
            <div>
              <span>Ngày tạo hồ sơ: </span>
              <span className="font-bold text-gray-800">{patient.createdAt || "-"}</span>
            </div>
            <div>
              <span>Cập nhật lần cuối: </span>
              <span className="font-bold text-gray-800">{patient.updatedAt || "-"}</span>
            </div>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-100 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition cursor-pointer text-base"
          >
            Đóng
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(patient)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition cursor-pointer text-base"
            >
              <Pencil size={18} />
              <span>Chỉnh sửa hồ sơ</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
