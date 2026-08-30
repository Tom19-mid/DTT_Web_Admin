import { X, Star, Calendar, Mail, Building, Award, Clock, FileText, CheckCircle2, Clock3, XCircle, AlertCircle, Pencil } from "lucide-react";
import type { Doctor, LeaveStatus } from "../types";
import StatusBadge from "./StatusBadge";

interface DoctorDetailModalProps {
  isOpen: boolean;
  doctor: Doctor | null;
  onClose: () => void;
  onEdit?: (doctor: Doctor) => void;
}

export default function DoctorDetailModal({
  isOpen,
  doctor,
  onClose,
  onEdit,
}: DoctorDetailModalProps) {
  if (!isOpen || !doctor) return null;

  const renderLeaveStatusBadge = (status?: LeaveStatus | string) => {
    switch (status) {
      case "Chờ duyệt":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock3 size={15} />
            <span>Chờ duyệt</span>
          </span>
        );
      case "Đã duyệt":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 size={15} />
            <span>Đã duyệt</span>
          </span>
        );
      case "Từ chối":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle size={15} />
            <span>Từ chối</span>
          </span>
        );
      case "Đã hủy":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-700 border border-gray-200">
            <AlertCircle size={15} />
            <span>Đã hủy</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200 border border-gray-100">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div className="relative group shrink-0">
              {doctor.avatar ? (
                <img
                  src={doctor.avatar}
                  alt={doctor.fullName || "Bác sĩ"}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white/30 shadow-md bg-white"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-white/20 border-4 border-white/30 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                  {(doctor.fullName || "?").charAt(0)}
                </div>
              )}
            </div>

            {/* Doctor Basic Info */}
            <div className="text-center sm:text-left space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  {doctor.fullName}
                </h2>
                <StatusBadge status={doctor.status} />
              </div>

              <p className="text-blue-100 font-medium text-base">
                Chuyên khoa: <span className="font-bold text-white">{doctor.specialty}</span>
              </p>

              {/* Rating & Reviews */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
                <div className="inline-flex items-center gap-1.5 bg-amber-400/20 backdrop-blur-sm px-3 py-1 rounded-full border border-amber-300/40 text-amber-200 text-sm font-bold">
                  <Star size={16} className="fill-amber-300 text-amber-300" />
                  <span>
                    {(doctor.ratingAverage ?? doctor.rating ?? 5.0).toFixed(1)} / 5.0
                  </span>
                </div>
                <span className="text-xs text-blue-100 font-medium">
                  ({doctor.totalReviews ?? doctor.reviewCount ?? 0} lượt đánh giá từ bệnh nhân)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Thông tin chung */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
              Thông tin hồ sơ bác sĩ
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 flex items-start gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500">Email liên hệ</p>
                  <p className="text-base font-bold text-gray-900 mt-0.5 break-all">
                    {doctor.email}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 flex items-start gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                  <Building size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500">Phòng khám</p>
                  <p className="text-base font-bold text-gray-900 mt-0.5">
                    {doctor.clinicRoom || "Chưa xếp phòng"}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 flex items-start gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                  <Award size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500">Trình độ chuyên môn</p>
                  <p className="text-base font-bold text-gray-900 mt-0.5">
                    {doctor.qualifications || "Chưa cập nhật"}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 flex items-start gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500">Kinh nghiệm làm việc</p>
                  <p className="text-base font-bold text-gray-900 mt-0.5">
                    {doctor.experience || "Chưa cập nhật"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Thông tin Nghỉ phép (Hiển thị chi tiết nếu có dữ liệu nghỉ phép) */}
          {(doctor.status === "Nghỉ phép" || doctor.leaveStartDate) && (
            <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/60 to-purple-50/40 p-5 rounded-2xl border border-blue-100 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-blue-200/60">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
                    <Calendar size={18} />
                  </div>
                  <h4 className="text-base font-bold text-gray-900">
                    Chi tiết đơn nghỉ phép
                  </h4>
                </div>
                {renderLeaveStatusBadge(doctor.leaveStatus || "Chờ duyệt")}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-white/80">
                  <p className="text-xs font-semibold text-gray-500">Ngày bắt đầu nghỉ</p>
                  <p className="text-base font-bold text-blue-700 mt-0.5">
                    {doctor.leaveStartDate || "Chưa xác định"}
                  </p>
                </div>

                <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-white/80">
                  <p className="text-xs font-semibold text-gray-500">Ngày kết thúc nghỉ</p>
                  <p className="text-base font-bold text-rose-600 mt-0.5">
                    {doctor.leaveEndDate || "Chưa xác định"}
                  </p>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-xs p-4 rounded-xl border border-white/80">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
                  <FileText size={15} className="text-gray-400" />
                  <span>Lý do xin nghỉ phép</span>
                </div>
                <p className="text-base font-medium text-gray-800 leading-relaxed">
                  {doctor.leaveReason || "Không có lý do cụ thể"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 p-4 px-6 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-white transition cursor-pointer text-base"
          >
            Đóng
          </button>

          {onEdit && (
            <button
              onClick={() => {
                onClose();
                onEdit(doctor);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition cursor-pointer text-base"
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
