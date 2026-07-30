import { useState, useRef, useEffect } from "react";
import { Search, Filter, RotateCcw, ChevronDown, Check, UserCheck } from "lucide-react";
import type { AppointmentStatusName } from "../types";

interface AppointmentSearchProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  selectedDoctor: string;
  onDoctorChange: (val: string) => void;
  doctors: string[];
  onReset: () => void;
}

const statusOptions: { value: string; label: string; dotColor: string }[] = [
  { value: "ALL", label: "Tất cả trạng thái", dotColor: "bg-gray-400" },
  { value: "Scheduled", label: "Đã đặt lịch", dotColor: "bg-blue-500" },
  { value: "Waiting", label: "Đang chờ khám", dotColor: "bg-amber-500" },
  { value: "InProgress", label: "Đang khám", dotColor: "bg-indigo-500" },
  { value: "Completed", label: "Đã hoàn thành", dotColor: "bg-emerald-500" },
  { value: "Cancelled", label: "Đã hủy", dotColor: "bg-rose-500" },
  { value: "NoShow", label: "Không đến khám", dotColor: "bg-gray-500" },
];

export default function AppointmentSearch({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedDoctor,
  onDoctorChange,
  doctors,
  onReset,
}: AppointmentSearchProps) {
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isDoctorOpen, setIsDoctorOpen] = useState(false);

  const statusRef = useRef<HTMLDivElement>(null);
  const doctorRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
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

  const currentStatusObj =
    statusOptions.find(
      (s) =>
        s.value === selectedStatus ||
        (s.value === "Scheduled" && selectedStatus === "Đã đặt lịch") ||
        (s.value === "Waiting" && selectedStatus === "Đang chờ khám") ||
        (s.value === "InProgress" && selectedStatus === "Đang khám") ||
        (s.value === "Completed" && selectedStatus === "Đã hoàn thành") ||
        (s.value === "Cancelled" && selectedStatus === "Đã hủy") ||
        (s.value === "NoShow" && selectedStatus === "Không đến khám")
    ) || statusOptions[0];

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
      {/* Search Input pill style */}
      <div className="relative w-full md:w-96">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm lịch hẹn..."
          className="w-full pl-11 pr-4 py-3 bg-gray-100/80 border-0 rounded-full text-base text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/30 transition-all shadow-2xs"
        />
      </div>

      {/* Filter Custom Dropdowns & Reset Button */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        {/* 1. Custom Status Filter Dropdown */}
        <div className="relative" ref={statusRef}>
          <button
            type="button"
            onClick={() => {
              setIsStatusOpen(!isStatusOpen);
              setIsDoctorOpen(false);
            }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-base font-semibold transition-all cursor-pointer select-none ${
              isStatusOpen
                ? "bg-white border-blue-500 text-blue-600 ring-2 ring-blue-500/20 shadow-sm"
                : "bg-gray-100/80 hover:bg-gray-200/60 border-gray-200/80 text-gray-800"
            }`}
          >
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-500 hidden sm:inline">Trạng thái:</span>
            <span className="font-bold text-gray-900">{currentStatusObj.label}</span>
            <ChevronDown
              size={18}
              className={`text-gray-400 transition-transform duration-200 ${
                isStatusOpen ? "rotate-180 text-blue-600" : ""
              }`}
            />
          </button>

          {/* Status Popup */}
          {isStatusOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-xs font-bold text-gray-400 px-3 py-1.5 uppercase tracking-wider">
                Lọc theo trạng thái
              </div>
              <div className="space-y-1">
                {statusOptions.map((option) => {
                  const isSelected =
                    selectedStatus === option.value ||
                    (selectedStatus === "Đã đặt lịch" && option.value === "Scheduled") ||
                    (selectedStatus === "Đang chờ khám" && option.value === "Waiting") ||
                    (selectedStatus === "Đang khám" && option.value === "InProgress") ||
                    (selectedStatus === "Đã hoàn thành" && option.value === "Completed") ||
                    (selectedStatus === "Đã hủy" && option.value === "Cancelled") ||
                    (selectedStatus === "Không đến khám" && option.value === "NoShow");

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onStatusChange(option.value);
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

        {/* 2. Custom Doctor Filter Dropdown */}
        <div className="relative" ref={doctorRef}>
          <button
            type="button"
            onClick={() => {
              setIsDoctorOpen(!isDoctorOpen);
              setIsStatusOpen(false);
            }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-base font-semibold transition-all cursor-pointer select-none ${
              isDoctorOpen
                ? "bg-white border-blue-500 text-blue-600 ring-2 ring-blue-500/20 shadow-sm"
                : "bg-gray-100/80 hover:bg-gray-200/60 border-gray-200/80 text-gray-800"
            }`}
          >
            <UserCheck size={18} className="text-gray-500" />
            <span className="font-bold text-gray-900">
              {selectedDoctor === "ALL" ? "Tất cả bác sĩ" : selectedDoctor}
            </span>
            <ChevronDown
              size={18}
              className={`text-gray-400 transition-transform duration-200 ${
                isDoctorOpen ? "rotate-180 text-blue-600" : ""
              }`}
            />
          </button>

          {/* Doctor Popup */}
          {isDoctorOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-xs font-bold text-gray-400 px-3 py-1.5 uppercase tracking-wider">
                Lọc theo bác sĩ
              </div>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {/* Option All */}
                <button
                  type="button"
                  onClick={() => {
                    onDoctorChange("ALL");
                    setIsDoctorOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-base font-semibold transition cursor-pointer ${
                    selectedDoctor === "ALL"
                      ? "bg-blue-50 text-blue-700 font-bold"
                      : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900"
                  }`}
                >
                  <span>Tất cả bác sĩ</span>
                  {selectedDoctor === "ALL" && <Check size={18} className="text-blue-600" />}
                </button>

                {/* Doctors List */}
                {doctors.map((doc) => {
                  const isSelected = selectedDoctor === doc;
                  return (
                    <button
                      key={doc}
                      type="button"
                      onClick={() => {
                        onDoctorChange(doc);
                        setIsDoctorOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-base font-semibold transition cursor-pointer ${
                        isSelected
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900"
                      }`}
                    >
                      <span>{doc}</span>
                      {isSelected && <Check size={18} className="text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Reset Button */}
        {(searchTerm || selectedStatus !== "ALL" || selectedDoctor !== "ALL") && (
          <button
            onClick={() => {
              onReset();
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
  );
}
