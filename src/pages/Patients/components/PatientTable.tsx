import { useState, useMemo } from "react";
import type { Patient } from "../types";
import PatientSearch from "./PatientSearch";
import PatientRow, { getPatientAccountStatus } from "./PatientRow";
import Pagination from "../../../components/common/Pagination";

interface PatientTableProps {
  patients: Patient[];
  onViewDetailPatient?: (patient: Patient) => void;
  onEditPatient?: (patient: Patient) => void;
}

export default function PatientTable({
  patients,
  onViewDetailPatient,
  onEditPatient,
}: PatientTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccountStatus, setSelectedAccountStatus] = useState("ALL");
  const [selectedVerificationStatus, setSelectedVerificationStatus] = useState("ALL");
  const [selectedGender, setSelectedGender] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleReset = () => {
    setSearchTerm("");
    setSelectedAccountStatus("ALL");
    setSelectedVerificationStatus("ALL");
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

      const matchesAccountStatus =
        selectedAccountStatus === "ALL" ||
        getPatientAccountStatus(patient) === selectedAccountStatus;

      const matchesVerificationStatus =
        selectedVerificationStatus === "ALL" ||
        (patient.verificationStatus || "Chờ duyệt") === selectedVerificationStatus;

      const matchesGender =
        selectedGender === "ALL" || patient.gender === selectedGender;

      return matchesSearch && matchesAccountStatus && matchesVerificationStatus && matchesGender;
    });
  }, [patients, searchTerm, selectedAccountStatus, selectedVerificationStatus, selectedGender]);

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
        selectedAccountStatus={selectedAccountStatus}
        onAccountStatusChange={(val) => {
          setSelectedAccountStatus(val);
          setCurrentPage(1);
        }}
        selectedVerificationStatus={selectedVerificationStatus}
        onVerificationStatusChange={(val) => {
          setSelectedVerificationStatus(val);
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
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-200/70 text-gray-800 font-bold text-base">
              <th className="py-4 px-4 text-center rounded-l-xl">Mã bệnh nhân</th>
              <th className="py-4 px-4">Họ và tên</th>
              <th className="py-4 px-4 text-center">Ngày sinh</th>
              <th className="py-4 px-4 text-center">Số điện thoại</th>
              <th className="py-4 px-4 text-center">Giới tính</th>
              <th className="py-4 px-4 text-center">Trạng thái</th>
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
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={8}
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
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          totalItems={filteredPatients.length}
          itemsPerPage={itemsPerPage}
          itemLabel="bệnh nhân"
        />
      )}
    </div>
  );
}
