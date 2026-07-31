import { useState, useMemo } from "react";
import type { Patient } from "../types";
import PatientSearch from "./PatientSearch";
import PatientRow from "./PatientRow";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PatientTableProps {
  patients: Patient[];
  onViewDetailPatient?: (patient: Patient) => void;
  onEditPatient?: (patient: Patient) => void;
  onLockPatient?: (patient: Patient) => void;
}

export default function PatientTable({
  patients,
  onViewDetailPatient,
  onEditPatient,
  onLockPatient,
}: PatientTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedGender, setSelectedGender] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleReset = () => {
    setSearchTerm("");
    setSelectedStatus("ALL");
    setSelectedGender("ALL");
    setCurrentPage(1);
  };

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        (patient.code && patient.code.toLowerCase().includes(term)) ||
        (patient.fullName && patient.fullName.toLowerCase().includes(term)) ||
        (patient.phone && patient.phone.includes(term)) ||
        (patient.healthInsuranceNumber && patient.healthInsuranceNumber.toLowerCase().includes(term)) ||
        (patient.cccdNumber && patient.cccdNumber.includes(term));

      const currentStatus = patient.verificationStatus || patient.status;
      const matchesStatus =
        selectedStatus === "ALL" || currentStatus === selectedStatus || patient.status === selectedStatus;

      const matchesGender =
        selectedGender === "ALL" || patient.gender === selectedGender;

      return matchesSearch && matchesStatus && matchesGender;
    });
  }, [patients, searchTerm, selectedStatus, selectedGender]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage) || 1;
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPatients.slice(start, start + itemsPerPage);
  }, [filteredPatients, currentPage]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-6">
      <PatientSearch
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        selectedStatus={selectedStatus}
        onStatusChange={(val) => {
          setSelectedStatus(val);
          setCurrentPage(1);
        }}
        selectedGender={selectedGender}
        onGenderChange={(val) => {
          setSelectedGender(val);
          setCurrentPage(1);
        }}
        onReset={handleReset}
      />

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-200/70 text-gray-800 font-bold text-base">
              <th className="py-4 px-4 text-center rounded-l-xl">Mã bệnh nhân</th>
              <th className="py-4 px-4">Họ và tên</th>
              <th className="py-4 px-4 text-center">Ngày sinh</th>
              <th className="py-4 px-4 text-center">Số điện thoại</th>
              <th className="py-4 px-4 text-center">Giới tính</th>
              <th className="py-4 px-4 text-center">Trạng thái xác thực hồ sơ</th>
              <th className="py-4 px-4 text-center rounded-r-xl">Chỉnh sửa</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPatients.length > 0 ? (
              paginatedPatients.map((patient) => (
                <PatientRow
                  key={patient.id}
                  patient={patient}
                  onViewDetail={onViewDetailPatient}
                  onEdit={onEditPatient}
                  onLock={onLockPatient}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-10 text-gray-500 font-medium text-lg"
                >
                  Không tìm thấy bệnh nhân nào khớp với từ khóa.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredPatients.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-100 text-base text-gray-600">
          <div>
            Hiển thị <span className="font-bold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> -{" "}
            <span className="font-bold text-gray-900">
              {Math.min(currentPage * itemsPerPage, filteredPatients.length)}
            </span>{" "}
            trên <span className="font-bold text-gray-900">{filteredPatients.length}</span> bệnh nhân
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
