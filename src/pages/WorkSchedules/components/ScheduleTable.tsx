import { useState, useMemo } from "react";
import type { WorkSchedule, DoctorItem } from "../types";
import ScheduleSearch from "./ScheduleSearch";
import ScheduleRow from "./ScheduleRow";
import Pagination from "../../../components/common/Pagination";

interface ScheduleTableProps {
  schedules: WorkSchedule[];
  doctors?: DoctorItem[];
  onView: (schedule: WorkSchedule) => void;
  onEdit: (schedule: WorkSchedule) => void;
  onToggleLock: (schedule: WorkSchedule) => void;
}

export default function ScheduleTable({
  schedules,
  doctors,
  onView,
  onEdit,
  onToggleLock,
}: ScheduleTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedDoctor, setSelectedDoctor] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const doctorOptions = useMemo(() => {
    const names = new Set<string>();
    if (Array.isArray(doctors) && doctors.length > 0) {
      doctors.forEach((d) => {
        if (d?.fullName) names.add(d.fullName);
      });
    }
    if (Array.isArray(schedules) && schedules.length > 0) {
      schedules.forEach((s) => {
        if (s?.doctorName) names.add(s.doctorName);
      });
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b, "vi"));
  }, [schedules, doctors]);

  const handleShowAll = () => {
    setSearchTerm("");
    setSelectedDate("");
    setSelectedStatus("ALL");
    setSelectedDoctor("ALL");
    setCurrentPage(1);
  };

  const filteredSchedules = useMemo(() => {
    if (!Array.isArray(schedules)) return [];
    return schedules.filter((sch) => {
      if (!sch) return false;
      const term = searchTerm.toLowerCase().trim();
      const schCode = (sch.scheduleCode || String(sch.scheduleId || "")).toLowerCase();
      const docName = (sch.doctorName || "").toLowerCase();
      const wDate = (sch.workDate || "").toLowerCase();

      const matchesSearch =
        !term ||
        schCode.includes(term) ||
        docName.includes(term) ||
        wDate.includes(term);

      const matchesDate = !selectedDate || sch.workDate === selectedDate;

      const matchesStatus =
        selectedStatus === "ALL" || sch.status === selectedStatus;

      const matchesDoctor =
        selectedDoctor === "ALL" || sch.doctorName === selectedDoctor;

      return matchesSearch && matchesDate && matchesStatus && matchesDoctor;
    }).sort((a, b) => (Number(a.scheduleId) || 0) - (Number(b.scheduleId) || 0));
  }, [schedules, searchTerm, selectedDate, selectedStatus, selectedDoctor]);

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
        selectedDoctor={selectedDoctor}
        onDoctorChange={(val) => {
          setSelectedDoctor(val);
          setCurrentPage(1);
        }}
        doctorOptions={doctorOptions}
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
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          totalItems={filteredSchedules.length}
          itemsPerPage={itemsPerPage}
          itemLabel="lịch làm việc"
        />
      )}
    </div>
  );
}
