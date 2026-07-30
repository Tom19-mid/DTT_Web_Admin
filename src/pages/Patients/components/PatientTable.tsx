import { useState, useMemo } from "react";
import type { Patient } from "../types";
import PatientSearch from "./PatientSearch";
import PatientRow from "./PatientRow";

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

  const handleReset = () => {
    setSearchTerm("");
    setSelectedStatus("ALL");
    setSelectedGender("ALL");
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

  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-6">
      <PatientSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedGender={selectedGender}
        onGenderChange={setSelectedGender}
        onReset={handleReset}
      />

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[850px]">
          <thead>
            <tr className="bg-gray-200/70 text-gray-800 font-bold text-base">
              <th className="py-4 px-4 text-center rounded-l-xl">Mã bệnh nhân</th>
              <th className="py-4 px-4">Họ và tên</th>
              <th className="py-4 px-4 text-center">Ngày sinh</th>
              <th className="py-4 px-4">Số điện thoại</th>
              <th className="py-4 px-4 text-center">Giới tính</th>
              <th className="py-4 px-4">Trạng thái</th>
              <th className="py-4 px-4 text-center rounded-r-xl">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
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
    </div>
  );
}
