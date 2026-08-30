import { useState, useMemo, useRef, useEffect } from "react";
import Pagination from "../../../components/common/Pagination";
import {
  Search,
  Plus,
  Pencil,
  Lock,
  Unlock,
  Eye,
  Boxes,
  CheckCircle,
  MinusCircle,
  Pill,
  Loader2,
  RotateCcw,
  X,
  Save,
  Filter,
  ChevronDown,
  Check,
  Clock,
} from "lucide-react";
import type { MedicineCategory } from "../types";
import medicineApi from "../../../api/medicineApi";
import StatusBadge from "./StatusBadge";
import type { ToastMessage } from "../../../components/common/ToastNotification";
import { notificationApi } from "../../../api/notificationApi";
import type { Notification } from "../../Notifications/types";

interface CategoryTableViewProps {
  categories: MedicineCategory[];
  loading: boolean;
  onRefreshData: () => void;
  onAddToast?: (toast: Omit<ToastMessage, "id">) => void;
  onViewNotification?: (notification: Notification) => void;
}

const statusOptions = [
  { value: "ALL", label: "Tất cả trạng thái", dotColor: "bg-gray-400" },
  { value: "Đang hoạt động", label: "Đang hoạt động", dotColor: "bg-emerald-500" },
  { value: "Ngưng hoạt động", label: "Ngưng hoạt động", dotColor: "bg-amber-500" },
];

export default function CategoryTableView({
  categories,
  loading,
  onRefreshData,
  onAddToast,
  onViewNotification,
}: CategoryTableViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal / Form state for Add / Edit / View / Toggle Status Category
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MedicineCategory | null>(null);
  const [viewingCategory, setViewingCategory] = useState<MedicineCategory | null>(null);
  const [statusTogglingCategory, setStatusTogglingCategory] = useState<MedicineCategory | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Đang hoạt động");
  const [submitting, setSubmitting] = useState(false);

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "Chưa cập nhật";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return dateStr;
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setIsStatusOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Statistics
  const totalCategories = categories.length;
  const activeCount = categories.filter(
    (c) => c.status === "Active" || c.status === "Đang hoạt động"
  ).length;
  const inactiveCount = categories.filter(
    (c) => c.status === "Inactive" || c.status === "Ngưng hoạt động"
  ).length;
  const totalMedicinesCount = categories.reduce(
    (sum, c) => sum + (c.medicineCount || 0),
    0
  );

  const currentStatusLabel =
    statusOptions.find((s) => s.value === selectedStatus)?.label || "Tất cả trạng thái";

  const handleReset = () => {
    setSearchTerm("");
    setSelectedStatus("ALL");
    setCurrentPage(1);
  };

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const term = searchTerm.toLowerCase().trim();
      const catName = (cat.categoryName || cat.name || "").toLowerCase();
      const catDesc = (cat.description || "").toLowerCase();

      const matchesSearch = !term || catName.includes(term) || catDesc.includes(term);

      const matchesStatus =
        selectedStatus === "ALL" || cat.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [categories, searchTerm, selectedStatus]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1;
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCategories.slice(start, start + itemsPerPage);
  }, [filteredCategories, currentPage]);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setStatus("Đang hoạt động");
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (category: MedicineCategory) => {
    setEditingCategory(category);
    setName(category.categoryName || category.name || "");
    setDescription(category.description || "");
    setStatus(category.status || "Đang hoạt động");
    setIsFormModalOpen(true);
  };

  const handleSubmitCategoryForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      if (onAddToast) {
        onAddToast({
          type: "error",
          title: "Thiếu thông tin",
          message: "Vui lòng nhập Tên danh mục thuốc!",
        });
      } else {
        alert("Vui lòng nhập Tên danh mục thuốc!");
      }
      return;
    }

    const catName = name.trim();
    const adminUserId = getLoggedInAdminUserId();
    const targetStatus = status === "Ngưng hoạt động" ? "Inactive" : "Active";

    setIsFormModalOpen(false);
    setSubmitting(true);

    try {
      if (editingCategory) {
        const id = editingCategory.categoryId || editingCategory.id!;
        setEditingCategory(null);

        const notiData: Notification = {
          notificationId: Date.now(),
          title: "Cập nhật danh mục thuốc",
          content: `Hệ thống vừa cập nhật thông tin danh mục thuốc "${catName}".`,
          type: "system",
          isRead: false,
          createdAt: new Date().toISOString(),
          userId: adminUserId,
        };

        onAddToast?.({
          type: "success",
          title: "Cập nhật danh mục thuốc",
          message: `Đã cập nhật thông tin danh mục "${catName}" thành công!`,
          onClick: () => onViewNotification?.(notiData),
        });

        // Trigger notification immediately for instant bell badge update
        notificationApi.create(notiData).catch((e) => console.warn("Lỗi tạo thông báo:", e));

        await medicineApi.updateCategory(id, {
          categoryName: catName,
          description: description.trim(),
          status: targetStatus,
        });
      } else {
        setEditingCategory(null);

        const notiData: Notification = {
          notificationId: Date.now(),
          title: "Thêm danh mục thuốc mới",
          content: `Đã tạo mới thành công danh mục thuốc "${catName}".`,
          type: "system",
          isRead: false,
          createdAt: new Date().toISOString(),
          userId: adminUserId,
        };

        onAddToast?.({
          type: "success",
          title: "Thêm danh mục mới",
          message: `Đã thêm mới danh mục "${catName}" thành công!`,
          onClick: () => onViewNotification?.(notiData),
        });

        // Trigger notification immediately for instant bell badge update
        notificationApi.create(notiData).catch((e) => console.warn("Lỗi tạo thông báo:", e));

        await medicineApi.createCategory({
          categoryName: catName,
          description: description.trim(),
          status: targetStatus,
        });
      }
      onRefreshData();
    } catch (err: any) {
      onRefreshData();
      onAddToast?.({
        type: "error",
        title: "Lỗi thao tác",
        message: err.message || "Lỗi khi lưu thông tin danh mục thuốc!",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleCategoryStatus = (category: MedicineCategory) => {
    setStatusTogglingCategory(category);
  };

  const handleConfirmCategoryStatusToggle = async () => {
    if (statusTogglingCategory) {
      const catName =
        statusTogglingCategory.categoryName ||
        statusTogglingCategory.name ||
        "Danh mục";
      const isCurrentlyLocked =
        statusTogglingCategory.status === "Ngưng hoạt động" ||
        statusTogglingCategory.status === "Inactive";
      const nextStatus = isCurrentlyLocked ? "Active" : "Inactive";
      const actionTitle = isCurrentlyLocked
        ? "Mở lại danh mục thuốc"
        : "Ngưng hoạt động danh mục";
      const actionMessage = isCurrentlyLocked
        ? `Đã mở lại danh mục "${catName}" thành công!`
        : `Đã chuyển danh mục "${catName}" sang trạng thái Ngưng hoạt động!`;
      const notiContent = isCurrentlyLocked
        ? `Danh mục thuốc "${catName}" đã được kích hoạt và chuyển sang trạng thái Đang hoạt động.`
        : `Danh mục thuốc "${catName}" đã được chuyển sang trạng thái Ngưng hoạt động.`;
      const adminUserId = getLoggedInAdminUserId();
      const id = statusTogglingCategory.categoryId || statusTogglingCategory.id!;

      const notiData: Notification = {
        notificationId: Date.now(),
        title: actionTitle,
        content: notiContent,
        type: "system",
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: adminUserId,
      };

      // 1. Close modal immediately
      setStatusTogglingCategory(null);

      // 2. Show Toast immediately with onClick
      onAddToast?.({
        type: "success",
        title: actionTitle,
        message: actionMessage,
        onClick: () => onViewNotification?.(notiData),
      });

      // 3. Background execution
      try {
        await medicineApi.toggleCategoryStatus(id, nextStatus);
        notificationApi.create(notiData).catch((e) => console.warn("Lỗi tạo thông báo:", e));

        onRefreshData();
      } catch (err: any) {
        onRefreshData();
        onAddToast?.({
          type: "error",
          title: "Lỗi thao tác",
          message:
            err.message ||
            `Lỗi khi ${isCurrentlyLocked ? "mở lại" : "ngưng hoạt động"} danh mục!`,
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar below Tabs */}
      <div className="flex items-center justify-end">
        <button
          onClick={handleOpenAddModal}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer active:scale-95 text-base"
        >
          <Plus size={20} />
          <span>Thêm danh mục mới</span>
        </button>
      </div>

      {/* 1. Summary Cards for Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Tổng số danh mục
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {totalCategories}
            </p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Boxes size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Đang hoạt động
            </p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {activeCount}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Ngưng hoạt động
            </p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {inactiveCount}
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <MinusCircle size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Tổng số thuốc liên kết
            </p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {totalMedicinesCount}
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Pill size={24} />
          </div>
        </div>
      </div>

      {/* 2. Toolbar & Table Container */}
      <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-6 space-y-5">
        {/* Search & Filter Header (Styled identical to MedicineSearch) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm danh mục..."
              className="w-full pl-11 pr-4 py-3 bg-gray-100/80 border-0 rounded-full text-base text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/30 transition-all shadow-2xs"
            />
          </div>

          {/* Status Dropdown & Reset */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <div className="relative" ref={statusRef}>
              <button
                type="button"
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-base font-semibold transition-all cursor-pointer select-none ${
                  isStatusOpen
                    ? "bg-white border-purple-500 text-purple-600 ring-2 ring-purple-500/20 shadow-sm"
                    : "bg-gray-100/80 hover:bg-gray-200/60 border-gray-200/80 text-gray-800"
                }`}
              >
                <Filter size={18} className="text-gray-500 shrink-0" />
                <span className="text-gray-600">Trạng thái:</span>
                <span className="font-bold text-gray-900">{currentStatusLabel}</span>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 shrink-0 transition-transform duration-200 ${
                    isStatusOpen ? "rotate-180 text-purple-600" : ""
                  }`}
                />
              </button>

              {isStatusOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-30 py-2 animate-in fade-in duration-150">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSelectedStatus(opt.value);
                        setCurrentPage(1);
                        setIsStatusOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-base hover:bg-gray-50 transition cursor-pointer ${
                        selectedStatus === opt.value
                          ? "text-purple-600 font-bold bg-purple-50/50"
                          : "text-gray-700 font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full ${opt.dotColor}`} />
                        <span>{opt.label}</span>
                      </div>
                      {selectedStatus === opt.value && (
                        <Check size={18} className="text-purple-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {(searchTerm || selectedStatus !== "ALL") && (
              <button
                onClick={handleReset}
                className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                title="Đặt lại bộ lọc"
              >
                <RotateCcw size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-200/70 text-gray-800 font-bold text-base">
                <th className="py-4 px-4 text-center rounded-l-xl">Mã danh mục</th>
                <th className="py-4 px-4">Tên danh mục</th>
                <th className="py-4 px-4">Mô tả</th>
                <th className="py-4 px-4 text-center">Số loại thuốc</th>
                <th className="py-4 px-4">Trạng thái</th>
                <th className="py-4 px-4 text-center rounded-r-xl">Chỉnh sửa</th>
              </tr>
            </thead>
            <tbody>
              {loading && categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500 font-medium">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                      <span className="text-gray-600 font-medium text-base">
                        Đang tải danh sách danh mục thuốc...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : paginatedCategories.length > 0 ? (
                paginatedCategories.map((cat) => {
                  const isActive =
                    cat.status === "Đang hoạt động" || cat.status === "Active";
                  return (
                    <tr
                      key={cat.categoryId || cat.id}
                      className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors text-base text-gray-700"
                    >
                      {/* Mã danh mục */}
                      <td className="py-4 px-4 text-base text-center font-medium text-gray-700">
                        ID: {cat.categoryId || cat.id}
                      </td>

                      {/* Tên danh mục */}
                      <td className="py-4 px-4 font-bold text-gray-900 text-base">
                        <button
                          onClick={() => setViewingCategory(cat)}
                          className="hover:text-purple-600 transition text-left cursor-pointer"
                        >
                          {cat.categoryName || cat.name}
                        </button>
                      </td>

                      {/* Mô tả */}
                      <td
                        className="py-4 px-4 text-base text-gray-600 font-normal max-w-[200px] truncate"
                        title={cat.description}
                      >
                        {cat.description || "-"}
                      </td>

                      {/* Số loại thuốc */}
                      <td className="py-4 px-4 text-center font-bold text-purple-700 text-base">
                        {cat.medicineCount ?? 0}
                      </td>

                      {/* Trạng thái */}
                      <td className="py-4 px-4">
                        <StatusBadge status={cat.status || "Đang hoạt động"} />
                      </td>

                      {/* Chỉnh sửa (Actions: Eye, Pencil, Lock/Unlock) */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setViewingCategory(cat)}
                            title="Xem chi tiết danh mục"
                            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye size={20} />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(cat)}
                            title="Chỉnh sửa danh mục"
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Pencil size={20} />
                          </button>
                          <button
                            onClick={() => handleToggleCategoryStatus(cat)}
                            type="button"
                            title={
                              !isActive
                                ? "Mở lại danh mục"
                                : "Ngưng hoạt động danh mục"
                            }
                            className={`p-2 rounded-lg transition-colors cursor-pointer ${
                              !isActive
                                ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                : "text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            }`}
                          >
                            {!isActive ? <Unlock size={20} /> : <Lock size={20} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-10 text-gray-500 font-medium text-lg"
                  >
                    Không tìm thấy danh mục thuốc nào khớp với từ khóa.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredCategories.length > 0 && !loading && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            totalItems={filteredCategories.length}
            itemsPerPage={itemsPerPage}
            itemLabel="loại thuốc"
          />
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingCategory ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Nhập thông tin phân loại danh mục thuốc trong hệ thống
                </p>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitCategoryForm} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Tên danh mục <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Thuốc Kháng sinh & Kháng viêm"
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Mô tả danh mục
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập mô tả chuyên sâu cho nhóm danh mục này..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                />
              </div>

              {editingCategory && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-white transition-all cursor-pointer font-medium"
                  >
                    <option value="Đang hoạt động">Đang hoạt động</option>
                    <option value="Ngưng hoạt động">Ngưng hoạt động</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition cursor-pointer text-base"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm transition cursor-pointer text-base disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  <span>{editingCategory ? "Cập nhật" : "Tạo danh mục"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Category Modal */}
      {viewingCategory && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-7 relative animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-5 border-b border-gray-100 mb-6">
              <div className="flex items-center gap-3.5">
                <div className="p-3.5 bg-purple-50 text-purple-600 rounded-2xl">
                  <Boxes size={26} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Chi tiết danh mục</h2>
                  <p className="text-sm font-semibold text-gray-500 mt-0.5">
                    Mã danh mục: ID #{viewingCategory.categoryId || viewingCategory.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingCategory(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-5 text-base text-gray-700">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Tên danh mục thuốc
                </label>
                <p className="text-xl font-bold text-gray-900">
                  {viewingCategory.categoryName || viewingCategory.name}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Mô tả danh mục
                </label>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/90 text-base text-gray-800 leading-relaxed font-medium">
                  {viewingCategory.description || "Không có mô tả cho danh mục này."}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100/90">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Trạng thái
                  </label>
                  <div className="mt-1">
                    <StatusBadge status={viewingCategory.status || "Đang hoạt động"} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Số loại thuốc liên kết
                  </label>
                  <span className="inline-block mt-0.5 text-xl font-bold text-purple-600">
                    {viewingCategory.medicineCount ?? 0} loại
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100/90">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Clock size={16} className="text-gray-400" />
                    Ngày tạo
                  </label>
                  <p className="text-base font-bold text-gray-900">
                    {formatDateTime(viewingCategory.createdAt)}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Clock size={16} className="text-gray-400" />
                    Ngày cập nhật
                  </label>
                  <p className="text-base font-bold text-gray-900">
                    {formatDateTime(viewingCategory.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 mt-7 pt-5 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  const catToEdit = viewingCategory;
                  setViewingCategory(null);
                  handleOpenEditModal(catToEdit);
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-sm transition cursor-pointer flex items-center gap-2 text-base active:scale-95"
              >
                <Pencil size={20} />
                <span>Chỉnh sửa</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingCategory(null)}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition cursor-pointer text-base active:scale-95"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Status Toggle Confirmation Modal */}
      {statusTogglingCategory && (() => {
        const isCurrentlyLocked =
          statusTogglingCategory.status === "Ngưng hoạt động" ||
          statusTogglingCategory.status === "Inactive";
        const catName =
          statusTogglingCategory.categoryName ||
          statusTogglingCategory.name ||
          "Danh mục";

        return (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => setStatusTogglingCategory(null)}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center py-2">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 shrink-0 shadow-2xs ${
                    isCurrentlyLocked
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-rose-100 text-rose-600"
                  }`}
                >
                  {isCurrentlyLocked ? <Unlock size={28} /> : <Lock size={28} />}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {isCurrentlyLocked
                    ? "Mở lại danh mục thuốc"
                    : "Xác nhận ngưng hoạt động danh mục"}
                </h3>

                <p className="text-base text-gray-600 mb-6 leading-relaxed">
                  {isCurrentlyLocked ? (
                    <>
                      Bạn có chắc chắn muốn mở lại danh mục thuốc{" "}
                      <span className="font-bold text-gray-900">"{catName}"</span>{" "}
                      không?
                    </>
                  ) : (
                    <>
                      Bạn có chắc chắn muốn ngưng hoạt động danh mục thuốc{" "}
                      <span className="font-bold text-gray-900">"{catName}"</span>{" "}
                      không?
                    </>
                  )}
                </p>

                <div className="flex items-center justify-center gap-3 w-full">
                  <button
                    onClick={() => setStatusTogglingCategory(null)}
                    className="w-1/2 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition cursor-pointer text-base"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleConfirmCategoryStatusToggle}
                    className={`w-1/2 py-2.5 text-white font-bold rounded-xl shadow-sm transition cursor-pointer text-base ${
                      isCurrentlyLocked
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-rose-600 hover:bg-rose-700"
                    }`}
                  >
                    {isCurrentlyLocked ? "Mở danh mục" : "Ngưng hoạt động"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
