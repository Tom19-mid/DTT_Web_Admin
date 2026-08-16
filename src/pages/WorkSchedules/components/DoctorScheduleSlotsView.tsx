import { useState, useMemo, useRef, useEffect } from "react";
import type { WorkSchedule, TimeSlot } from "../types";
import { SlotStatusBadge } from "./ScheduleStatusBadge";
import Pagination from "../../../components/common/Pagination";
import { DateFilterPicker } from "./ScheduleSearch";
import {
  Search,
  Filter,
  ChevronDown,
  Check,
  Clock,
  Calendar as CalendarIcon,
  RotateCcw,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  User,
} from "lucide-react";

interface DoctorScheduleSlotsViewProps {
  schedules: WorkSchedule[];
  isLoading?: boolean;
}

export interface FlattenedSlot extends TimeSlot {
  doctorName?: string;
  workDate?: string;
  scheduleCode?: string;
}

const slotStatusOptions = [
  { value: "ALL", label: "Tất cả trạng thái", dotColor: "bg-gray-400" },
  {
    value: "Chưa đặt lịch",
    label: "Chưa đặt lịch",
    dotColor: "bg-yellow-500",
  },
  {
    value: "Đã đặt lịch",
    label: "Đã đặt lịch",
    dotColor: "bg-green-500",
  },
  {
    value: "Đã đóng",
    label: "Đã đóng",
    dotColor: "bg-rose-500",
  },
];

export default function DoctorScheduleSlotsView({
  schedules,
  isLoading = false,
}: DoctorScheduleSlotsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedDoctor, setSelectedDoctor] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  const [isDoctorOpen, setIsDoctorOpen] = useState(false);
  const doctorRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = 15;

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

  // Flatten all slots from schedules
  const allSlots = useMemo(() => {
    const safeSchedules = Array.isArray(schedules) ? schedules : [];
    const result: FlattenedSlot[] = [];

    safeSchedules.forEach((sch) => {
      const schCode = sch.scheduleCode || String(sch.scheduleId || "");
      const slots = Array.isArray(sch.timeSlots) ? sch.timeSlots : [];

      slots.forEach((slot) => {
        result.push({
          ...slot,
          doctorName: sch.doctorName || "Bác sĩ",
          workDate: sch.workDate || "",
          scheduleCode: schCode,
        });
      });
    });

    return result;
  }, [schedules]);

  // Dynamic doctor options list from all slots
  const doctorOptions = useMemo(() => {
    const names = new Set<string>();
    allSlots.forEach((s) => {
      if (s.doctorName) names.add(s.doctorName);
    });
    return Array.from(names).sort();
  }, [allSlots]);

  // Statistics
  const totalSlots = allSlots.length;
  const availableSlotsCount = allSlots.filter(
    (s) => s.status === "Chưa đặt lịch",
  ).length;
  const bookedSlotsCount = allSlots.filter(
    (s) => s.status === "Đã đặt lịch",
  ).length;
  const closedSlotsCount = allSlots.filter(
    (s) => s.status === "Đã đóng",
  ).length;

  // Filtered Slots
  const filteredSlots = useMemo(() => {
    return allSlots.filter((slot) => {
      const term = searchTerm.toLowerCase().trim();
      const docName = (slot.doctorName || "").toLowerCase();
      const slotCode = String(slot.slotId || "").toLowerCase();
      const schCode = (slot.scheduleCode || "").toLowerCase();
      const wDate = (slot.workDate || "").toLowerCase();

      const matchesSearch =
        !term ||
        docName.includes(term) ||
        slotCode.includes(term) ||
        schCode.includes(term) ||
        wDate.includes(term);

      const matchesDate = !selectedDate || slot.workDate === selectedDate;
      const matchesStatus =
        selectedStatus === "ALL" || slot.status === selectedStatus;
      const matchesDoctor =
        selectedDoctor === "ALL" || slot.doctorName === selectedDoctor;

      return matchesSearch && matchesDate && matchesStatus && matchesDoctor;
    });
  }, [allSlots, searchTerm, selectedDate, selectedStatus, selectedDoctor]);

  // Pagination
  const totalPages = Math.ceil(filteredSlots.length / itemsPerPage) || 1;
  const paginatedSlots = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSlots.slice(start, start + itemsPerPage);
  }, [filteredSlots, currentPage]);

  const handleShowAll = () => {
    setSearchTerm("");
    setSelectedDate("");
    setSelectedStatus("ALL");
    setSelectedDoctor("ALL");
    setCurrentPage(1);
  };

  const currentStatusLabel =
    slotStatusOptions.find((s) => s.value === selectedStatus)?.label ||
    "Tất cả trạng thái";

  const hasFiltersActive =
    searchTerm ||
    selectedDate ||
    selectedStatus !== "ALL" ||
    (selectedDoctor && selectedDoctor !== "ALL");

  return (
    <div className="space-y-6">
      {/* Top Cards for Doctor Schedule Slots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Tổng khung giờ khám
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {totalSlots}
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Clock size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Khung giờ chưa đặt lịch
            </p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {availableSlotsCount}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Clock size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Khung giờ đã đặt lịch
            </p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {bookedSlotsCount}
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Clock size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Khung giờ đã đóng
            </p>
            <p className="text-2xl font-bold text-rose-600 mt-1">
              {closedSlotsCount}
            </p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      {isLoading ? (
        <div className="p-12 text-center text-gray-500 font-normal bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span>Đang tải dữ liệu lịch làm việc của bác sĩ...</span>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-6">
          {/* Search & Filter Controls */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
            <div className="relative w-full lg:w-80">
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
                placeholder="Tìm theo bác sĩ, mã slot..."
                className="w-full pl-11 pr-4 py-3 bg-gray-100/80 border-0 rounded-full text-base text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/30 transition-all shadow-2xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
              {/* Doctor Dropdown Filter */}
              <div className="relative" ref={doctorRef}>
                <button
                  type="button"
                  onClick={() => setIsDoctorOpen(!isDoctorOpen)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-base font-semibold transition-all cursor-pointer select-none ${
                    isDoctorOpen || (selectedDoctor && selectedDoctor !== "ALL")
                      ? "bg-white border-blue-500 text-blue-600 ring-2 ring-blue-500/20 shadow-sm"
                      : "bg-gray-100/80 hover:bg-gray-200/60 border-gray-200/80 text-gray-800"
                  }`}
                >
                  <User
                    size={18}
                    className={
                      selectedDoctor && selectedDoctor !== "ALL"
                        ? "text-blue-600"
                        : "text-gray-500"
                    }
                  />
                  <span className="text-sm font-medium text-gray-500 hidden sm:inline">
                    Bác sĩ:
                  </span>
                  <span className="font-bold text-gray-900 truncate max-w-[140px] sm:max-w-[180px]">
                    {selectedDoctor && selectedDoctor !== "ALL"
                      ? selectedDoctor
                      : "Tất cả bác sĩ"}
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
                          setCurrentPage(1);
                          setIsDoctorOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
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
                              setCurrentPage(1);
                              setIsDoctorOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                              isSelected
                                ? "bg-blue-50 text-blue-700 font-bold"
                                : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900"
                            }`}
                          >
                            <span className="truncate pr-2">{docName}</span>
                            {isSelected && (
                              <Check
                                size={18}
                                className="text-blue-600 shrink-0"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Date Filter Picker */}
              <DateFilterPicker
                value={selectedDate}
                onChange={(val) => {
                  setSelectedDate(val);
                  setCurrentPage(1);
                }}
              />

              {/* Status Dropdown Filter */}
              <div className="relative" ref={statusRef}>
                <button
                  type="button"
                  onClick={() => setIsStatusOpen(!isStatusOpen)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-base font-semibold transition-all cursor-pointer select-none ${
                    isStatusOpen || selectedStatus !== "ALL"
                      ? "bg-white border-blue-500 text-blue-600 ring-2 ring-blue-500/20 shadow-sm"
                      : "bg-gray-100/80 hover:bg-gray-200/60 border-gray-200/80 text-gray-800"
                  }`}
                >
                  <Filter size={18} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-500 hidden sm:inline">
                    Trạng thái lịch:
                  </span>
                  <span className="font-bold text-gray-900">
                    {currentStatusLabel}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-gray-400 transition-transform duration-200 ${
                      isStatusOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>

                {isStatusOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-xs font-bold text-gray-400 px-3 py-1.5 uppercase tracking-wider">
                      Lọc theo trạng thái slot
                    </div>
                    <div className="space-y-1">
                      {slotStatusOptions.map((option) => {
                        const isSelected = selectedStatus === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setSelectedStatus(option.value);
                              setCurrentPage(1);
                              setIsStatusOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                              isSelected
                                ? "bg-blue-50 text-blue-700 font-bold"
                                : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`w-2.5 h-2.5 rounded-full ${option.dotColor}`}
                              />
                              <span>{option.label}</span>
                            </div>
                            {isSelected && (
                              <Check size={18} className="text-blue-600" />
                            )}
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
                onClick={handleShowAll}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-base font-bold rounded-xl transition cursor-pointer shadow-2xs active:scale-95 ${
                  hasFiltersActive
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                title="Hiển thị toàn bộ tất cả khung giờ"
              >
                <RotateCcw size={17} />
                <span>Hiển thị tất cả</span>
              </button>
            </div>
          </div>

          {/* Table of Slots */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-200/70 text-gray-800 font-bold text-base">
                  <th className="py-4 px-4 text-center rounded-l-xl">
                    Mã khung giờ
                  </th>
                  <th className="py-4 px-4 text-center">Số thứ tự khám</th>
                  <th className="py-4 px-4">Bác sĩ phụ trách</th>
                  <th className="py-4 px-4 text-center">Mã ca làm việc</th>
                  <th className="py-4 px-4 text-center">Ngày khám</th>
                  <th className="py-4 px-4 text-center">Khung giờ khám</th>
                  <th className="py-4 px-4 text-center rounded-r-xl">
                    Trạng thái slot
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading && allSlots.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-12 text-gray-500 font-medium"
                    >
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        <span className="text-gray-600 font-medium text-base">
                          Đang tải danh sách khung giờ khám...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedSlots.length > 0 ? (
                  paginatedSlots.map((slot, index) => (
                    <tr
                      key={slot.slotId || index}
                      className="border-b border-gray-100 hover:bg-gray-50/70 transition-colors"
                    >
                      <td className="py-4 px-4 text-center font-normal text-gray-700 text-base">
                        #{slot.slotId}
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-blue-600 text-base">
                        {slot.slotOrder}
                      </td>
                      <td className="py-4 px-4 font-bold text-gray-900 text-base">
                        {slot.doctorName}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100/90 text-blue-600 font-bold text-sm shadow-2xs">
                          {slot.scheduleCode}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center font-medium text-gray-700 text-base">
                        <div className="inline-flex items-center gap-1.5 bg-gray-100/80 px-3 py-1 rounded-xl">
                          <CalendarIcon size={15} className="text-gray-500" />
                          <span className="font-bold text-gray-900">
                            {slot.workDate}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-emerald-700 text-base">
                        {slot.startTime} - {slot.endTime}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <SlotStatusBadge
                          status={slot.status || "Chưa đặt lịch"}
                        />
                        {slot.patientName && (
                          <span className="block text-xs text-blue-700 font-bold mt-1">
                            (BN: {slot.patientName})
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-10 text-gray-500 font-medium text-lg"
                    >
                      Không tìm thấy khung giờ khám nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {filteredSlots.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
              totalItems={filteredSlots.length}
              itemsPerPage={itemsPerPage}
              itemLabel="khung giờ"
            />
          )}
        </div>
      )}
    </div>
  );
}
