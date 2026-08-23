import { useState, useRef, useEffect } from "react";
import { Search, Filter, RotateCcw, ChevronDown, Check } from "lucide-react";

interface FamilyMemberSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedRelationship: string;
  onRelationshipChange: (value: string) => void;
  selectedVerificationStatus: string;
  onVerificationStatusChange: (value: string) => void;
  selectedGender: string;
  onGenderChange: (value: string) => void;
  onReset: () => void;
}

const relationshipOptions = [
  { value: "ALL", label: "Tất cả mối quan hệ" },
  { value: "Bố", label: "Bố" },
  { value: "Mẹ", label: "Mẹ" },
  { value: "Vợ", label: "Vợ" },
  { value: "Chồng", label: "Chồng" },
  { value: "Con", label: "Con" },
  { value: "Anh", label: "Anh" },
  { value: "Chị", label: "Chị" },
  { value: "Em", label: "Em" },
  { value: "Ông", label: "Ông" },
  { value: "Bà", label: "Bà" },
  { value: "Khác", label: "Khác" },
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

export default function FamilyMemberSearch({
  searchTerm,
  onSearchChange,
  selectedRelationship,
  onRelationshipChange,
  selectedVerificationStatus,
  onVerificationStatusChange,
  selectedGender,
  onGenderChange,
  onReset,
}: FamilyMemberSearchProps) {
  const [isRelationshipOpen, setIsRelationshipOpen] = useState(false);
  const [isVerificationStatusOpen, setIsVerificationStatusOpen] = useState(false);
  const [isGenderOpen, setIsGenderOpen] = useState(false);

  const relationshipRef = useRef<HTMLDivElement>(null);
  const verificationStatusRef = useRef<HTMLDivElement>(null);
  const genderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (relationshipRef.current && !relationshipRef.current.contains(e.target as Node)) {
        setIsRelationshipOpen(false);
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

  const currentRelationshipLabel =
    relationshipOptions.find((s) => s.value === selectedRelationship)?.label ||
    "Tất cả mối quan hệ";

  const currentVerificationStatusLabel =
    verificationStatusOptions.find((s) => s.value === selectedVerificationStatus)?.label ||
    "Tất cả trạng thái";

  const currentGenderLabel =
    genderOptions.find((g) => g.value === selectedGender)?.label ||
    "Tất cả giới tính";

  const hasFiltersActive =
    searchTerm ||
    selectedRelationship !== "ALL" ||
    selectedVerificationStatus !== "ALL" ||
    selectedGender !== "ALL";

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
      {/* Search Input chuẩn tròn như các trang khác */}
      <div className="relative w-full md:w-96">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm người thân..."
          className="w-full pl-11 pr-4 py-3 bg-gray-100/80 border-0 rounded-full text-base text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/30 transition-all shadow-2xs font-medium"
        />
      </div>

      {/* Filter Dropdowns đồng bộ thiết kế và kích thước */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        {/* 1. Mối quan hệ */}
        <div className="relative" ref={relationshipRef}>
          <button
            type="button"
            onClick={() => {
              setIsRelationshipOpen(!isRelationshipOpen);
              setIsVerificationStatusOpen(false);
              setIsGenderOpen(false);
            }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-base font-semibold transition-all cursor-pointer select-none ${
              isRelationshipOpen
                ? "bg-white border-blue-500 text-blue-600 ring-2 ring-blue-500/20 shadow-sm"
                : "bg-gray-100/80 hover:bg-gray-200/60 border-gray-200/80 text-gray-800"
            }`}
          >
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-500 hidden sm:inline">Quan hệ:</span>
            <span className="font-bold text-gray-900">{currentRelationshipLabel}</span>
            <ChevronDown
              size={18}
              className={`text-gray-400 transition-transform duration-200 ${
                isRelationshipOpen ? "rotate-180 text-blue-600" : ""
              }`}
            />
          </button>

          {isRelationshipOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-64 overflow-y-auto">
              <div className="text-xs font-bold text-gray-400 px-3 py-1.5 uppercase tracking-wider">
                Lọc theo mối quan hệ
              </div>
              <div className="space-y-1">
                {relationshipOptions.map((opt) => {
                  const isSelected = selectedRelationship === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onRelationshipChange(opt.value);
                        setIsRelationshipOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-base font-semibold transition cursor-pointer ${
                        isSelected
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check size={18} className="text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2. Trạng thái xác thực */}
        <div className="relative" ref={verificationStatusRef}>
          <button
            type="button"
            onClick={() => {
              setIsVerificationStatusOpen(!isVerificationStatusOpen);
              setIsRelationshipOpen(false);
              setIsGenderOpen(false);
            }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-base font-semibold transition-all cursor-pointer select-none ${
              isVerificationStatusOpen
                ? "bg-white border-blue-500 text-blue-600 ring-2 ring-blue-500/20 shadow-sm"
                : "bg-gray-100/80 hover:bg-gray-200/60 border-gray-200/80 text-gray-800"
            }`}
          >
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-500 hidden sm:inline">Xác thực:</span>
            <span className="font-bold text-gray-900">{currentVerificationStatusLabel}</span>
            <ChevronDown
              size={18}
              className={`text-gray-400 transition-transform duration-200 ${
                isVerificationStatusOpen ? "rotate-180 text-blue-600" : ""
              }`}
            />
          </button>

          {isVerificationStatusOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-xs font-bold text-gray-400 px-3 py-1.5 uppercase tracking-wider">
                Lọc theo trạng thái
              </div>
              <div className="space-y-1">
                {verificationStatusOptions.map((opt) => {
                  const isSelected = selectedVerificationStatus === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onVerificationStatusChange(opt.value);
                        setIsVerificationStatusOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-base font-semibold transition cursor-pointer ${
                        isSelected
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${opt.dotColor}`} />
                        <span>{opt.label}</span>
                      </div>
                      {isSelected && <Check size={18} className="text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 3. Giới tính */}
        <div className="relative" ref={genderRef}>
          <button
            type="button"
            onClick={() => {
              setIsGenderOpen(!isGenderOpen);
              setIsRelationshipOpen(false);
              setIsVerificationStatusOpen(false);
            }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-base font-semibold transition-all cursor-pointer select-none ${
              isGenderOpen
                ? "bg-white border-blue-500 text-blue-600 ring-2 ring-blue-500/20 shadow-sm"
                : "bg-gray-100/80 hover:bg-gray-200/60 border-gray-200/80 text-gray-800"
            }`}
          >
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-500 hidden sm:inline">Giới tính:</span>
            <span className="font-bold text-gray-900">{currentGenderLabel}</span>
            <ChevronDown
              size={18}
              className={`text-gray-400 transition-transform duration-200 ${
                isGenderOpen ? "rotate-180 text-blue-600" : ""
              }`}
            />
          </button>

          {isGenderOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-xs font-bold text-gray-400 px-3 py-1.5 uppercase tracking-wider">
                Lọc theo giới tính
              </div>
              <div className="space-y-1">
                {genderOptions.map((opt) => {
                  const isSelected = selectedGender === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onGenderChange(opt.value);
                        setIsGenderOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-base font-semibold transition cursor-pointer ${
                        isSelected
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check size={18} className="text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Nút đặt lại */}
        {hasFiltersActive && (
          <button
            type="button"
            onClick={onReset}
            className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
            title="Đặt lại bộ lọc"
          >
            <RotateCcw size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
