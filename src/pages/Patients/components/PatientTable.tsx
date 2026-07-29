import { useState } from "react";
import type { Patient } from "../types";
import PatientSearch from "./PatientSearch";
import PatientRow from "./PatientRow";

interface PatientTableProps {
  patients: Patient[];
  onEditPatient?: (patient: Patient) => void;
  onLockPatient?: (patient: Patient) => void;
}

export default function PatientTable({
  patients,
  onEditPatient,
  onLockPatient,
}: PatientTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPatients = patients.filter((patient) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      patient.code.toLowerCase().includes(term) ||
      patient.fullName.toLowerCase().includes(term) ||
      patient.phone.includes(term) ||
      patient.dob.includes(term) ||
      patient.specialty.toLowerCase().includes(term) ||
      patient.status.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-6">
      <PatientSearch value={searchTerm} onChange={setSearchTerm} />

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="bg-gray-200/70 text-gray-800 font-bold text-base">
              <th className="py-4 px-4 rounded-l-xl">Mã bệnh nhân</th>
              <th className="py-4 px-4">Họ và tên</th>
              <th className="py-4 px-4">Ngày sinh</th>
              <th className="py-4 px-4">Số điện thoại</th>
              <th className="py-4 px-4">Chuyên khoa</th>
              <th className="py-4 px-4">Trạng thái</th>
              <th className="py-4 px-4 rounded-r-xl">Chỉnh sửa</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <PatientRow
                  key={patient.id}
                  patient={patient}
                  onEdit={onEditPatient}
                  onLock={onLockPatient}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-10 text-gray-500 font-medium text-base"
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
