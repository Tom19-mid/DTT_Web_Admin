import type { DateFilterType } from "../../types/dashboard";
import { RotateCcw, Filter } from "lucide-react";
import CustomDatePicker from "../../../components/common/CustomDatePicker";

interface DashboardTitleProps {
  filterType: DateFilterType;
  onFilterTypeChange: (type: DateFilterType) => void;
  customDate: string;
  onCustomDateChange: (date: string) => void;
  onResetFilter: () => void;
}

export default function DashboardTitle({
  filterType,
  onFilterTypeChange,
  customDate,
  onCustomDateChange,
  onResetFilter,
}: DashboardTitleProps) {
  const handleDateChange = (val: string) => {
    onCustomDateChange(val);
    if (val) {
      onFilterTypeChange("custom");
    } else {
      onFilterTypeChange("all");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Bảng điều khiển
        </h1>
      </div>

      {/* Date Filter Bar */}
      <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-2xl border border-gray-200 shadow-sm shrink-0">
        <div className="flex items-center gap-1.5 text-gray-600 font-semibold text-sm mr-1">
          <Filter size={16} className="text-blue-600" />
          <span>Lọc ngày:</span>
        </div>

        {/* Custom Date Picker Dropdown Popover */}
        <CustomDatePicker
          value={customDate}
          onChange={handleDateChange}
          placeholder="dd/mm/yyyy"
          className="font-bold"
        />

        {/* Nút Xem Tất Cả */}
        <button
          type="button"
          onClick={() => {
            onCustomDateChange("");
            onFilterTypeChange("all");
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
            filterType === "all" && !customDate
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
          }`}
        >
          Tất cả ngày
        </button>

        {/* Nút Đặt Lại về ngày hôm nay */}
        {customDate && (
          <button
            type="button"
            onClick={onResetFilter}
            title="Quay về ngày hôm nay"
            className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs py-2 px-3 rounded-xl transition cursor-pointer border border-gray-200"
          >
            <RotateCcw size={14} />
            <span>Hôm nay</span>
          </button>
        )}
      </div>
    </div>
  );
}
