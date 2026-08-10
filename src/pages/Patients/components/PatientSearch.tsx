import { useState, useRef, useEffect } from "react";
import { Search, Filter, RotateCcw, ChevronDown, Check, UserCheck } from "lucide-react";

interface PatientSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedAccountStatus: string;
  onAccountStatusChange: (value: string) => void;
  selectedVerificationStatus: string;
  onVerificationStatusChange: (value: string) => void;
  selectedGender: string;
  onGenderChange: (value: string) => void;
  onReset: () => void;
}

const accountStatusOptions = [
  { value: "ALL", label: "Tất cả trạng thái", dotColor: "bg-gray-400" },
  { value: "Đang hoạt động", label: "Đang hoạt động", dotColor: "bg-emerald-500" },
  { value: "Ngưng hoạt động", label: "Ngưng hoạt động", dotColor: "bg-amber-500" },
  { value: "Đã khóa", label: "Đã khóa", dotColor: "bg-rose-500" },
];

const verificationStatusOptions = [
  { value: "ALL", label: "Tất cả trạng thái", dotColor: "bg-gray-400" },
  { value: "Đã duyệt", label: "Đã duyệt", dotColor: "bg-emerald-500" },
  { value: "Chờ duyệt", label: "Chờ duyệt", dotColor: "bg-amber-500" },
  { value: "Từ chối", label: "Từ chối", dotColor: "bg-rose-500" },
];

const genderOptions = [
  { value: "ALL", label: "Tất cả giới tính" },
  { value: "Nam", label: "Nam" },
  { value: "Nữ", label: "Nữ" },
  { value: "Khác", label: "Khác" },
];

export default function PatientSearch({
  searchTerm,
  onSearchChange,
  selectedAccountStatus,
  onAccountStatusChange,
  selectedVerificationStatus,
  onVerificationStatusChange,
  selectedGender,
  onGenderChange,
  onReset,
}: PatientSearchProps) {
  const [isAccountStatusOpen, setIsAccountStatusOpen] = useState(false);
  const [isVerificationStatusOpen, setIsVerificationStatusOpen] = useState(false);
  const [isGenderOpen, setIsGenderOpen] = useState(false);

  const accountStatusRef = useRef<HTMLDivElement>(null);
  const verificationStatusRef = useRef<HTMLDivElement>(null);
  const genderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountStatusRef.current && !accountStatusRef.current.contains(e.target as Node)) {
        setIsAccountStatusOpen(false);
      }
      if (verificationStatusRef.current && !verificationStatusRef.current.contains(e.target as Node)) {
        setIsVerificationStatusOpen(false);
      }
      if (genderRef.current && !genderRef.current.contains(e.target as Node)) {
        setIsGenderOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentAccountStatusLabel =
    accountStatusOptions.find((s) => s.value === selectedAccountStatus)?.label ||
    "Tất cả trạng thái";

  const currentVerificationStatusLabel =
    verificationStatusOptions.find((s) => s.value === selectedVerificationStatus)?.label ||
    "Tất cả trạng thái";

  const currentGenderLabel =
    genderOptions.find((g) => g.value === selectedGender)?.label || "Tất cả giới tính";

  const closeAllDropdowns = () => {
    setIsAccountStatusOpen(false);
    setIsVerificationStatusOpen(false);
    setIsGenderOpen(false);
  };

  const hasFiltersActive =
    searchTerm ||
    selectedAccountStatus !== "ALL" ||
    selectedVerificationStatus !== "ALL" ||
    selectedGender !== "ALL";

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
      {/* Search Input */}
      <div className="relative w-full md:w-96">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm bệnh nhân..."
          className="w-full pl-11 pr-4 py-3 bg-gray-100/80 border-0 rounded-full text-base text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/30 transition-all shadow-2xs"
        />
      </div>

      {/* Custom Dropdowns */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        {/* Account Status Dropdown */}
        <div className="relative" ref={accountStatusRef}>
          <button
            type="button"
            onClick={() => {
              setIsAccountStatusOpen(!isAccountStatusOpen);
              setIsVerificationStatusOpen(false);
              setIsGenderOpen(false);
            }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-base font-semibold transition-all cursor-pointer select-none ${
              isAccountStatusOpen
                ? "bg-white border-blue-500 text-blue-600 ring-2 ring-blue-500/20 shadow-sm"
                : "bg-gray-100/80 hover:bg-gray-200/60 border-gray-200/80 text-gray-800"
            }`}
          >
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-500 hidden sm:inline">Trạng thái:</span>
            <span className="font-bold text-gray-900">{currentAccountStatusLabel}</span>
            <ChevronDown
              size={18}
              className={`text-gray-400 transition-transform duration-200 ${
                isAccountStatusOpen ? "rotate-180 text-blue-600" : ""
              }`}
            />
          </button>

          {isAccountStatusOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-xs font-bold text-gray-400 px-3 py-1.5 uppercase tracking-wider">
                Lọc theo trạng thái
              </div>
              <div className="space-y-1">
                {accountStatusOptions.map((option) => {
                  const isSelected = selectedAccountStatus === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onAccountStatusChange(option.value);
                        setIsAccountStatusOpen(false);
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

        {/* Verification Status Dropdown */}
        <div className="relative" ref={verificationStatusRef}>
          <button
            type="button"
            onClick={() => {
              setIsVerificationStatusOpen(!isVerificationStatusOpen);
              setIsAccountStatusOpen(false);
              setIsGenderOpen(false);
            }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-base font-semibold transition-all cursor-pointer select-none ${
              isVerificationStatusOpen
                ? "bg-white border-blue-500 text-blue-600 ring-2 ring-blue-500/20 shadow-sm"
                : "bg-gray-100/80 hover:bg-gray-200/60 border-gray-200/80 text-gray-800"
            }`}
          >
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-500 hidden sm:inline">
              Trạng thái xác thực hồ sơ:
            </span>
            <span className="font-bold text-gray-900">{currentVerificationStatusLabel}</span>
            <ChevronDown
              size={18}
              className={`text-gray-400 transition-transform duration-200 ${
                isVerificationStatusOpen ? "rotate-180 text-blue-600" : ""
              }`}
            />
          </button>

          {isVerificationStatusOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-xs font-bold text-gray-400 px-3 py-1.5 uppercase tracking-wider">
                Lọc theo trạng thái xác thực hồ sơ
              </div>
              <div className="space-y-1">
                {verificationStatusOptions.map((option) => {
                  const isSelected = selectedVerificationStatus === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onVerificationStatusChange(option.value);
                        setIsVerificationStatusOpen(false);
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

        {/* Gender Dropdown */}
        <div className="relative" ref={genderRef}>
          <button
            type="button"
            onClick={() => {
              setIsGenderOpen(!isGenderOpen);
              setIsAccountStatusOpen(false);
              setIsVerificationStatusOpen(false);
            }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-base font-semibold transition-all cursor-pointer select-none ${
              isGenderOpen
                ? "bg-white border-blue-500 text-blue-600 ring-2 ring-blue-500/20 shadow-sm"
                : "bg-gray-100/80 hover:bg-gray-200/60 border-gray-200/80 text-gray-800"
            }`}
          >
            <UserCheck size={18} className="text-gray-500" />
            <span className="font-bold text-gray-900">{currentGenderLabel}</span>
            <ChevronDown
              size={18}
              className={`text-gray-400 transition-transform duration-200 ${
                isGenderOpen ? "rotate-180 text-blue-600" : ""
              }`}
            />
          </button>

          {isGenderOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-xs font-bold text-gray-400 px-3 py-1.5 uppercase tracking-wider">
                Lọc theo giới tính
              </div>
              <div className="space-y-1">
                {genderOptions.map((option) => {
                  const isSelected = selectedGender === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onGenderChange(option.value);
                        setIsGenderOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-base font-semibold transition cursor-pointer ${
                        isSelected
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900"
                      }`}
                    >
                      <span>{option.label}</span>
                      {isSelected && <Check size={18} className="text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Reset Button */}
        {hasFiltersActive && (
          <button
            onClick={() => {
              onReset();
              closeAllDropdowns();
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
