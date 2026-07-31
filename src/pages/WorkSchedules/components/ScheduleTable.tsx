import { useState, useMemo } from "react";
import type { WorkSchedule } from "../types";
import ScheduleSearch from "./ScheduleSearch";
import ScheduleRow from "./ScheduleRow";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ScheduleTableProps {
  schedules: WorkSchedule[];
  onView: (schedule: WorkSchedule) => void;
  onEdit: (schedule: WorkSchedule) => void;
  onToggleLock: (schedule: WorkSchedule) => void;
}

export default function ScheduleTable({
  schedules,
  onView,
  onEdit,
  onToggleLock,
}: ScheduleTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleShowAll = () => {
    setSearchTerm("");
    setSelectedDate("");
    setSelectedStatus("ALL");
    setCurrentPage(1);
  };

  const filteredSchedules = useMemo(() => {
    return schedules.filter((sch) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        sch.scheduleCode.toLowerCase().includes(term) ||
        sch.doctorName.toLowerCase().includes(term) ||
        sch.workDate.includes(term);

      const matchesDate = !selectedDate || sch.workDate === selectedDate;

      const matchesStatus =
        selectedStatus === "ALL" || sch.status === selectedStatus;

      return matchesSearch && matchesDate && matchesStatus;
    });
  }, [schedules, searchTerm, selectedDate, selectedStatus]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage) || 1;
  const paginatedSchedules = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSchedules.slice(start, start + itemsPerPage);
  }, [filteredSchedules, currentPage]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-6">
      <ScheduleSearch
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        selectedDate={selectedDate}
        onDateChange={(val) => {
          setSelectedDate(val);
          setCurrentPage(1);
        }}
        selectedStatus={selectedStatus}
        onStatusChange={(val) => {
          setSelectedStatus(val);
          setCurrentPage(1);
        }}
        onShowAll={handleShowAll}
      />

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-200/70 text-gray-800 font-bold text-base">
              <th className="py-4 px-4 text-center rounded-l-xl">Mã lịch làm việc</th>
              <th className="py-4 px-4">Họ và tên</th>
              <th className="py-4 px-4 text-center">Ngày làm việc</th>
              <th className="py-4 px-4 text-center">Thời gian bắt đầu</th>
              <th className="py-4 px-4 text-center">Thời gian kết thúc</th>
              <th className="py-4 px-4 text-center">Trạng thái</th>
              <th className="py-4 px-4 text-center rounded-r-xl">Chỉnh sửa</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSchedules.length > 0 ? (
              paginatedSchedules.map((schedule) => (
                <ScheduleRow
                  key={schedule.scheduleId}
                  schedule={schedule}
                  defaultExpanded={false}
                  onView={onView}
                  onEdit={onEdit}
                  onToggleLock={onToggleLock}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-10 text-gray-500 font-medium text-lg"
                >
                  Không tìm thấy lịch làm việc nào khớp với điều kiện lọc.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredSchedules.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-100 text-base text-gray-600">
          <div>
            Hiển thị <span className="font-bold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> -{" "}
            <span className="font-bold text-gray-900">
              {Math.min(currentPage * itemsPerPage, filteredSchedules.length)}
            </span>{" "}
            trên <span className="font-bold text-gray-900">{filteredSchedules.length}</span> lịch làm việc
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
