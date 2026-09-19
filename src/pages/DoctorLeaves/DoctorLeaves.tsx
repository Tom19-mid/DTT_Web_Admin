import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Pagination from "../../components/common/Pagination";
import ToastNotification, { type ToastMessage } from "../../components/common/ToastNotification";
import { notificationApi } from "../../api/notificationApi";
import NotificationDetailModal from "../Notifications/components/NotificationDetailModal";
import type { Notification } from "../Notifications/types";
import {
  CalendarX,
  CheckCircle2,
  XCircle,
  Clock,
  CheckCheck,
  Ban,
  Search,
  RotateCcw,
  Eye,
  Calendar,
  User,
  Stethoscope,
  Phone,
  FileText,
  Filter,
  ChevronDown,
  Check,
  Loader2,
} from "lucide-react";
import { doctorLeaveApi, type DoctorLeaveItem } from "../../api/doctorLeaveApi";
import doctorApi from "../../api/doctorApi";
import type { Doctor } from "../Doctors/types";

const statusOptions = [
  { value: "Tất cả", label: "Tất cả trạng thái", dotColor: "bg-gray-400" },
  { value: "Chờ duyệt", label: "Chờ duyệt", dotColor: "bg-amber-500" },
  { value: "Đã duyệt", label: "Đã duyệt", dotColor: "bg-emerald-500" },
  { value: "Từ chối", label: "Từ chối", dotColor: "bg-rose-500" },
  { value: "Đã hủy", label: "Đã hủy", dotColor: "bg-gray-400" },
];

interface DoctorLeavesProps {
  onLeaveUpdated?: () => void;
}

export default function DoctorLeaves({ onLeaveUpdated }: DoctorLeavesProps = {}) {
  const [leaves, setLeaves] = useState<DoctorLeaveItem[]>(() => doctorLeaveApi.getCachedLeaves() || []);
  const [loading, setLoading] = useState(() => !doctorLeaveApi.getCachedLeaves());
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Tất cả");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState("ALL");
  const [isDoctorOpen, setIsDoctorOpen] = useState(false);

  const statusRef = useRef<HTMLDivElement>(null);
  const doctorRef = useRef<HTMLDivElement>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [viewingNotification, setViewingNotification] = useState<Notification | null>(null);

  const addToast = useCallback((item: Omit<ToastMessage, "id">) => {
    const id = Date.now().toString() + "_" + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [{ ...item, id }, ...prev]);
  }, []);

  const removeToast = useCallback((id?: string) => {
    if (id) {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    } else {
      setToasts([]);
    }
  }, []);

  const getLoggedInAdminUserId = (): string | undefined => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        return parsed?.userId || parsed?.id;
      }
    } catch (e) {}
    return undefined;
  };

  // Modal states
  const [actionLeave, setActionLeave] = useState<DoctorLeaveItem | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | "cancel" | "view" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Extract unique doctor names from doctors list and leaves list
  const doctorOptions = useMemo(() => {
    const docSet = new Set<string>();
    if (Array.isArray(doctors) && doctors.length > 0) {
      doctors.forEach((d) => {
        if (d?.fullName) docSet.add(d.fullName);
      });
    }
    if (Array.isArray(leaves) && leaves.length > 0) {
      leaves.forEach((l) => {
        if (l.doctorName) docSet.add(l.doctorName);
      });
    }
    return Array.from(docSet).sort((a, b) => a.localeCompare(b, "vi"));
  }, [leaves, doctors]);

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedDoctor]);

  const fetchLeaves = async (showLoading = true) => {
    if (showLoading && !doctorLeaveApi.getCachedLeaves()) setLoading(true);
    try {
      const data = await doctorLeaveApi.getAll();
      setLeaves(data);
    } catch (err) {
      console.error("Lỗi lấy danh sách đơn nghỉ phép:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves(leaves.length === 0);
    doctorApi.getAll().then((docList) => {
      if (Array.isArray(docList)) setDoctors(docList);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setIsStatusOpen(false);
      }
      if (doctorRef.current && !doctorRef.current.contains(e.target as Node)) {
        setIsDoctorOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute stat counts
  const totalCount = leaves.length;
  const pendingCount = leaves.filter((l) => l.status === "Chờ duyệt").length;
  const approvedCount = leaves.filter((l) => l.status === "Đã duyệt").length;
  const rejectedCount = leaves.filter((l) => l.status === "Từ chối").length;

  // Filter leaves list
  const filteredLeaves = useMemo(() => {
    return leaves.filter((item) => {
      const matchesSearch =
        item.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.specialtyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.phone.includes(searchQuery) ||
        item.leaveId.toString().includes(searchQuery);

      const matchesStatus =
        selectedStatus === "Tất cả" || item.status === selectedStatus;

      const matchesDoctor =
        selectedDoctor === "ALL" || item.doctorName === selectedDoctor;

      return matchesSearch && matchesStatus && matchesDoctor;
    });
  }, [leaves, searchQuery, selectedStatus, selectedDoctor]);

  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage) || 1;
  const paginatedLeaves = filteredLeaves.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleUpdateStatus = async (newStatus: "Approved" | "Rejected" | "Cancelled") => {
    if (!actionLeave) return;
    const docName = actionLeave.doctorName || "bác sĩ";
    const adminUserId = getLoggedInAdminUserId();
    const targetLeaveId = actionLeave.leaveId;

    // Optimistic UI status string
    const newViStatus =
      newStatus === "Approved" ? "Đã duyệt" : newStatus === "Rejected" ? "Từ chối" : "Đã hủy";

    // 1. Close modal immediately
    setActionLeave(null);
    setActionType(null);

    // 2. Optimistically update local state immediately
    setLeaves((prev) =>
      prev.map((item) => (item.leaveId === targetLeaveId ? { ...item, status: newViStatus } : item))
    );

    const notiTitle =
      newStatus === "Approved"
        ? "Duyệt đơn nghỉ phép bác sĩ"
        : newStatus === "Rejected"
        ? "Từ chối đơn nghỉ phép bác sĩ"
        : "Hủy lịch nghỉ bác sĩ";

    const notiContent =
      newStatus === "Approved"
        ? `Đơn xin nghỉ phép của bác sĩ ${docName} (Mã đơn: #${targetLeaveId}) đã được duyệt.`
        : newStatus === "Rejected"
        ? `Đơn xin nghỉ phép của bác sĩ ${docName} (Mã đơn: #${targetLeaveId}) đã bị từ chối.`
        : `Lịch nghỉ phép của bác sĩ ${docName} (Mã đơn: #${targetLeaveId}) đã bị hủy.`;

    const notiData: Notification = {
      notificationId: Date.now(),
      title: notiTitle,
      content: notiContent,
      type: "system",
      isRead: false,
      createdAt: new Date().toISOString(),
      userId: adminUserId,
    };

    // 3. Show toast immediately with onClick to open modal
    if (newStatus === "Approved") {
      addToast({
        type: "success",
        title: "Duyệt đơn nghỉ phép",
        message: `Đã phê duyệt đơn nghỉ phép của bác sĩ "${docName}"!`,
        onClick: () => setViewingNotification(notiData),
      });
    } else if (newStatus === "Rejected") {
      addToast({
        type: "error",
        title: "Từ chối đơn nghỉ phép",
        message: `Đã từ chối đơn nghỉ phép của bác sĩ "${docName}"!`,
        onClick: () => setViewingNotification(notiData),
      });
    } else if (newStatus === "Cancelled") {
      addToast({
        type: "info",
        title: "Hủy lịch nghỉ",
        message: `Đã hủy lịch nghỉ của bác sĩ "${docName}"!`,
        onClick: () => setViewingNotification(notiData),
      });
    }

    // 4. Trigger Notification immediately (updates bell badge in 0ms)
    notificationApi.create(notiData).catch((e) => console.warn("Lỗi tạo thông báo:", e));

    // 5. Background execution
    setIsSubmitting(true);
    try {
      await doctorLeaveApi.updateStatus(targetLeaveId, newStatus);
      fetchLeaves(false);
      if (onLeaveUpdated) onLeaveUpdated();
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Lỗi thao tác",
        message: err.message || "Lỗi khi cập nhật trạng thái đơn!",
      });
      // Rollback on error
      fetchLeaves(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStatusLabel =
    statusOptions.find((s) => s.value === selectedStatus)?.label || "Tất cả trạng thái";

  const formatApprovedAt = (approvedAtStr?: string) => {
    if (!approvedAtStr) return "Chưa duyệt";
    try {
      const dt = new Date(approvedAtStr);
      if (isNaN(dt.getTime())) return approvedAtStr;
      const day = String(dt.getDate()).padStart(2, "0");
      const month = String(dt.getMonth() + 1).padStart(2, "0");
      const year = dt.getFullYear();
      const hours = String(dt.getHours()).padStart(2, "0");
      const mins = String(dt.getMinutes()).padStart(2, "0");
      return `${day}/${month}/${year} ${hours}:${mins}`;
    } catch {
      return approvedAtStr;
    }
  };

  return (
    <div className="space-y-6 select-none relative">
      {/* Top-Right 3s Stacked Toast Notifications */}
      <ToastNotification toasts={toasts} onClose={removeToast} />
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">TỔNG ĐƠN NGHỈ PHÉP</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalCount}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <CalendarX size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">CHỜ DUYỆT</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">ĐÃ DUYỆT</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{approvedCount}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCheck size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">TỪ CHỐI</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{rejectedCount}</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <Ban size={24} />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-6">
        {/* Toolbar Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên bác sĩ, chuyên khoa, sđt, mã đơn..."
              className="w-full pl-11 pr-4 py-3 bg-gray-100/80 border-0 rounded-full text-base text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/30 transition-all shadow-2xs"
            />
          </div>

          {/* Custom Status Dropdown & Reset */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {/* Doctor Dropdown */}
            <div className="relative" ref={doctorRef}>
              <button
                type="button"
                onClick={() => {
                  setIsDoctorOpen(!isDoctorOpen);
                  setIsStatusOpen(false);
                }}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-base font-semibold transition-all cursor-pointer select-none ${
                  isDoctorOpen || (selectedDoctor && selectedDoctor !== "ALL")
                    ? "bg-white border-blue-500 text-blue-600 ring-2 ring-blue-500/20 shadow-sm"
                    : "bg-gray-100/80 hover:bg-gray-200/60 border-gray-200/80 text-gray-800"
                }`}
              >
                <User size={18} className={selectedDoctor && selectedDoctor !== "ALL" ? "text-blue-600" : "text-gray-500"} />
                <span className="text-sm font-medium text-gray-500 hidden sm:inline">Bác sĩ:</span>
                <span className="font-bold text-gray-900 whitespace-nowrap">
                  {selectedDoctor && selectedDoctor !== "ALL" ? selectedDoctor : "Tất cả bác sĩ"}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform duration-200 ${
                    isDoctorOpen ? "rotate-180 text-blue-600" : ""
                  }`}
                />
              </button>

              {isDoctorOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 max-h-80 overflow-y-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-xs font-bold text-gray-400 px-3 py-1.5 uppercase tracking-wider">
                    Lọc theo bác sĩ
                  </div>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDoctor("ALL");
                        setIsDoctorOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-base font-semibold transition cursor-pointer ${
                        selectedDoctor === "ALL" || !selectedDoctor
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900"
                      }`}
                    >
                      <span>Tất cả bác sĩ</span>
                      {(selectedDoctor === "ALL" || !selectedDoctor) && (
                        <Check size={18} className="text-blue-600" />
                      )}
                    </button>

                    {doctorOptions.map((docName) => {
                      const isSelected = selectedDoctor === docName;
                      return (
                        <button
                          key={docName}
                          type="button"
                          onClick={() => {
                            setSelectedDoctor(docName);
                            setIsDoctorOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-base font-semibold transition cursor-pointer ${
                            isSelected
                              ? "bg-blue-50 text-blue-700 font-bold"
                              : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900"
                          }`}
                        >
                          <span className="truncate">{docName}</span>
                          {isSelected && <Check size={18} className="text-blue-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={statusRef}>
              <button
                type="button"
                onClick={() => {
                  setIsStatusOpen(!isStatusOpen);
                  setIsDoctorOpen(false);
                }}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-base font-semibold transition-all cursor-pointer select-none ${
                  isStatusOpen || (selectedStatus && selectedStatus !== "Tất cả")
                    ? "bg-white border-blue-500 text-blue-600 ring-2 ring-blue-500/20 shadow-sm"
                    : "bg-gray-100/80 hover:bg-gray-200/60 border-gray-200/80 text-gray-800"
                }`}
              >
                <Filter size={18} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-500 hidden sm:inline">Trạng thái:</span>
                <span className="font-bold text-gray-900">{currentStatusLabel}</span>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform duration-200 ${
                    isStatusOpen ? "rotate-180 text-blue-600" : ""
                  }`}
                />
              </button>

              {isStatusOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-xs font-bold text-gray-400 px-3 py-1.5 uppercase tracking-wider">
                    Lọc theo trạng thái
                  </div>
                  <div className="space-y-1">
                    {statusOptions.map((option) => {
                      const isSelected = selectedStatus === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setSelectedStatus(option.value);
                            setIsStatusOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-base font-semibold transition cursor-pointer ${
                            isSelected
                              ? "bg-blue-50 text-blue-700 font-bold"
                              : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${option.dotColor}`} />
                            <span>{option.label}</span>
                          </div>
                          {isSelected && <Check size={18} className="text-blue-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {(searchQuery || selectedStatus !== "Tất cả" || (selectedDoctor && selectedDoctor !== "ALL")) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStatus("Tất cả");
                  setSelectedDoctor("ALL");
                  setIsStatusOpen(false);
                  setIsDoctorOpen(false);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-base font-semibold text-gray-600 bg-gray-200/80 hover:bg-gray-300 rounded-xl transition cursor-pointer active:scale-95"
                title="Đặt lại bộ lọc"
              >
                <RotateCcw size={16} />
                <span>Đặt lại</span>
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-100/70 text-gray-700 text-sm font-bold tracking-wider uppercase">
                <th className="py-4 px-6">MÃ ĐƠN</th>
                <th className="py-4 px-6">BÁC SĨ</th>
                <th className="py-4 px-6">CHUYÊN KHOA</th>
                <th className="py-4 px-6">THỜI GIAN NGHỈ</th>
                <th className="py-4 px-6">LÝ DO XIN NGHỈ</th>
                <th className="py-4 px-6">TRẠNG THÁI</th>
                <th className="py-4 px-6 text-center">HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-base font-medium text-gray-800">
              {loading && leaves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500 font-medium">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                      <span className="text-gray-600 font-medium text-base">Đang tải danh sách đơn nghỉ phép...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500 font-medium">
                    Không tìm thấy đơn nghỉ phép nào phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedLeaves.map((item) => (
                  <tr key={item.leaveId} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-blue-700">{item.leaveId}</td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900">{item.doctorName}</div>
                      <div className="text-sm text-gray-500 font-normal">{item.phone}</div>
                    </td>
                    <td className="py-4 px-6 text-gray-700 font-semibold">{item.specialtyName}</td>
                    <td className="py-4 px-6 text-gray-900 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>{item.leaveStartDate}</span>
                        <span className="text-gray-400">→</span>
                        <span>{item.leaveEndDate}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600 max-w-xs truncate" title={item.reason}>
                      {item.reason}
                    </td>
                    <td className="py-4 px-6">
                      {item.status === "Chờ duyệt" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-4 h-4" />
                          Chờ duyệt
                        </span>
                      )}
                      {item.status === "Đã duyệt" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4" />
                          Đã duyệt
                        </span>
                      )}
                      {item.status === "Từ chối" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-4 h-4" />
                          Từ chối
                        </span>
                      )}
                      {item.status === "Đã hủy" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-gray-50 text-gray-600 border border-gray-200">
                          <Ban className="w-4 h-4" />
                          Đã hủy
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        {item.status === "Chờ duyệt" && (
                          <>
                            <button
                              onClick={() => {
                                setActionLeave(item);
                                setActionType("approve");
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer shadow-sm"
                              title="Duyệt đơn nghỉ phép"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Duyệt
                            </button>

                            <button
                              onClick={() => {
                                setActionLeave(item);
                                setActionType("reject");
                              }}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer shadow-sm"
                              title="Từ chối đơn"
                            >
                              <XCircle className="w-4 h-4" />
                              Từ chối
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => {
                            setActionLeave(item);
                            setActionType("view");
                          }}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-5 h-5" />
                        </button>

                        {item.status === "Đã duyệt" && (
                          <button
                            onClick={() => {
                              setActionLeave(item);
                              setActionType("cancel");
                            }}
                            className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Hủy lịch nghỉ"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredLeaves.length > 0 && !loading && (
          <div className="px-6 py-2 border-t border-gray-100 bg-gray-50/50">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
              totalItems={filteredLeaves.length}
              itemsPerPage={itemsPerPage}
              itemLabel="đơn nghỉ phép"
            />
          </div>
        )}
      </div>

      {/* Confirmation / Detail Modals */}
      {actionLeave && actionType === "approve" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
              <h3 className="text-xl font-bold text-gray-900">Duyệt đơn nghỉ phép</h3>
            </div>
            <p className="text-gray-600 font-medium leading-relaxed">
              Bạn có chắc chắn muốn duyệt đơn nghỉ phép cho bác sĩ{" "}
              <strong className="text-gray-900">{actionLeave.doctorName}</strong> từ ngày{" "}
              <strong className="text-blue-600">{actionLeave.leaveStartDate}</strong> đến{" "}
              <strong className="text-blue-600">{actionLeave.leaveEndDate}</strong>?
            </p>
            <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-200">
              Lưu ý: Bác sĩ sẽ tự động được chuyển sang trạng thái <strong>"Nghỉ phép"</strong> trong suốt thời gian này.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={isSubmitting}
                onClick={() => setActionLeave(null)}
                className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                disabled={isSubmitting}
                onClick={() => handleUpdateStatus("Approved")}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition cursor-pointer shadow-md disabled:opacity-50"
              >
                {isSubmitting ? "Đang xử lý..." : "Xác nhận duyệt"}
              </button>
            </div>
          </div>
        </div>
      )}

      {actionLeave && actionType === "reject" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <XCircle className="w-8 h-8" />
              <h3 className="text-xl font-bold text-gray-900">Từ chối đơn nghỉ phép</h3>
            </div>
            <p className="text-gray-600 font-medium leading-relaxed">
              Bạn có chắc chắn muốn từ chối đơn nghỉ phép của bác sĩ{" "}
              <strong className="text-gray-900">{actionLeave.doctorName}</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={isSubmitting}
                onClick={() => setActionLeave(null)}
                className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                disabled={isSubmitting}
                onClick={() => handleUpdateStatus("Rejected")}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition cursor-pointer shadow-md disabled:opacity-50"
              >
                {isSubmitting ? "Đang xử lý..." : "Xác nhận từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}

      {actionLeave && actionType === "cancel" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <XCircle className="w-8 h-8" />
              <h3 className="text-xl font-bold text-gray-900">Hủy lịch nghỉ bác sĩ</h3>
            </div>
            <p className="text-gray-600 font-medium leading-relaxed">
              Bạn có chắc chắn muốn hủy lịch nghỉ của bác sĩ{" "}
              <strong className="text-gray-900">{actionLeave.doctorName}</strong> không?
            </p>
            <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-200">
              Lưu ý: Sau khi hủy, trạng thái bác sĩ sẽ được khôi phục về <strong>"Đang hoạt động"</strong> và các ca khám sẽ được mở lại.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={isSubmitting}
                onClick={() => setActionLeave(null)}
                className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                disabled={isSubmitting}
                onClick={() => handleUpdateStatus("Cancelled")}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition cursor-pointer shadow-md disabled:opacity-50"
              >
                {isSubmitting ? "Đang xử lý..." : "Xác nhận hủy lịch"}
              </button>
            </div>
          </div>
        </div>
      )}

      {actionLeave && actionType === "view" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                Chi tiết đơn nghỉ phép {actionLeave.leaveId}
              </h3>
              <button
                onClick={() => setActionLeave(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-base font-medium">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <span className="text-gray-500 font-normal">Họ và tên: </span>
                  <strong className="text-gray-900">{actionLeave.doctorName}</strong>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Stethoscope className="w-5 h-5 text-gray-400" />
                <div>
                  <span className="text-gray-500 font-normal">Chuyên khoa: </span>
                  <strong className="text-gray-900">{actionLeave.specialtyName}</strong>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <span className="text-gray-500 font-normal">Số điện thoại: </span>
                  <strong className="text-gray-900">{actionLeave.phone}</strong>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <span className="text-gray-500 font-normal">Thời gian xin nghỉ: </span>
                  <strong className="text-blue-700">{actionLeave.leaveStartDate} → {actionLeave.leaveEndDate}</strong>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <span className="text-gray-500 font-normal block mb-1">Lý do xin nghỉ:</span>
                <p className="text-gray-900 font-semibold">{actionLeave.reason}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-gray-500 font-normal">Trạng thái:</span>
                {actionLeave.status === "Chờ duyệt" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <Clock className="w-4 h-4" />
                    Chờ duyệt
                  </span>
                )}
                {actionLeave.status === "Đã duyệt" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" />
                    Đã duyệt
                  </span>
                )}
                {actionLeave.status === "Từ chối" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                    <XCircle className="w-4 h-4" />
                    Từ chối
                  </span>
                )}
                {actionLeave.status === "Đã hủy" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-gray-50 text-gray-600 border border-gray-200">
                    <Ban className="w-4 h-4" />
                    Đã hủy
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-gray-500 font-normal">Được chấp thuận vào lúc:</span>
                <span className="font-bold text-gray-900">
                  {formatApprovedAt(actionLeave.approvedAt)}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActionLeave(null)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Detail Modal triggered on Toast click */}
      <NotificationDetailModal
        notification={viewingNotification}
        onClose={() => setViewingNotification(null)}
        onDelete={async (id) => {
          await notificationApi.delete(id);
          setViewingNotification(null);
        }}
      />
    </div>
  );
}
