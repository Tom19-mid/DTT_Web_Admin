import { useState, useRef, useEffect } from "react";
import { Search, Filter, ChevronDown, Check, RotateCcw, CheckCheck, Trash2, Bell, BellOff } from "lucide-react";

interface NotificationToolbarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  totalCount: number;
  unreadCount: number;
  onMarkAllAsRead: () => void;
  onClearReadNotifications: () => void;
  onShowAll: () => void;
}

const statusOptions = [
  { value: "ALL", label: "Tất cả trạng thái", dotColor: "bg-gray-400" },
  { value: "UNREAD", label: "Chưa đọc", dotColor: "bg-rose-500" },
  { value: "READ", label: "Đã đọc", dotColor: "bg-emerald-500" },
];

export default function NotificationToolbar({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  totalCount,
  unreadCount,
  onMarkAllAsRead,
  onClearReadNotifications,
  onShowAll,
}: NotificationToolbarProps) {
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setIsStatusOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentStatusLabel =
    statusOptions.find((s) => s.value === selectedStatus)?.label ||
    "Tất cả trạng thái";

  const hasFiltersActive = searchTerm || selectedStatus !== "ALL";

  return (
    <div className="mb-6 space-y-5">
      {/* Page Title & Main Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý thông báo</h1>
        </div>

        <div className="flex items-center gap-2.5">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer text-base active:scale-95"
            >
              <CheckCheck size={18} />
              <span>Đánh dấu tất cả đã đọc</span>
            </button>
          )}

          <button
            onClick={onClearReadNotifications}
            className="inline-flex items-center gap-2 border border-gray-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-gray-700 font-bold px-4 py-2.5 rounded-xl shadow-2xs transition cursor-pointer text-base active:scale-95"
          >
            <Trash2 size={18} />
            <span>Xóa thông báo đã đọc</span>
          </button>
        </div>
      </div>

      {/* Summary Cards Grid - 2 Cards: Tổng thông báo, Chưa đọc */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tổng thông báo</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalCount}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Bell size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Chưa đọc</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{unreadCount}</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <BellOff size={24} />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100/80 shadow-xs">
        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tiêu đề, nội dung..."
            className="w-full pl-11 pr-4 py-3 bg-gray-100/80 border-0 rounded-full text-base text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/30 transition-all shadow-2xs"
          />
        </div>

        {/* Filter Options & Reset Button */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          {/* Status Dropdown Filter */}
          <div className="relative" ref={statusRef}>
            <button
              type="button"
              onClick={() => {
                setIsStatusOpen(!isStatusOpen);
              }}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-base font-semibold transition-all cursor-pointer select-none ${
                isStatusOpen || selectedStatus !== "ALL"
                  ? "bg-white border-blue-500 text-blue-600 ring-2 ring-blue-500/20 shadow-sm"
                  : "bg-gray-100/80 hover:bg-gray-200/60 border-gray-200/80 text-gray-800"
              }`}
            >
              <Filter size={18} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-500 hidden sm:inline">
                Trạng thái:
              </span>
              <span className="font-bold text-gray-900">{currentStatusLabel}</span>
              <ChevronDown
                size={18}
                className={`text-gray-400 transition-transform duration-200 ${
                  isStatusOpen ? "rotate-180 text-blue-600" : ""
                }`}
              />
            </button>

            {isStatusOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
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
                          onStatusChange(option.value);
                          setIsStatusOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
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

          {/* Reset / Show All Button */}
          <button
            type="button"
            onClick={onShowAll}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-base font-bold rounded-xl transition cursor-pointer shadow-2xs active:scale-95 ${
              hasFiltersActive
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            title="Hiển thị toàn bộ tất cả thông báo"
          >
            <RotateCcw size={17} />
            <span>Hiển thị tất cả thông báo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
