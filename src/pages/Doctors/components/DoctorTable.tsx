import { useState, useMemo } from "react";
import type { Doctor } from "../types";
import DoctorSearch from "./DoctorSearch";
import DoctorRow from "./DoctorRow";
import Pagination from "../../../components/common/Pagination";

interface DoctorTableProps {
  doctors: Doctor[];
  onViewDoctorDetail?: (doctor: Doctor) => void;
  onEditDoctor?: (doctor: Doctor) => void;
  onLockDoctor?: (doctor: Doctor) => void;
}

export default function DoctorTable({
  doctors,
  onViewDoctorDetail,
  onEditDoctor,
  onLockDoctor,
}: DoctorTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedSpecialty, setSelectedSpecialty] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const specialties = useMemo(() => {
    const specSet = new Set<string>();
    doctors.forEach((d) => specSet.add(d.specialty));
    return Array.from(specSet);
  }, [doctors]);

  const handleReset = () => {
    setSearchTerm("");
    setSelectedStatus("ALL");
    setSelectedSpecialty("ALL");
    setCurrentPage(1);
  };

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        doctor.fullName.toLowerCase().includes(term) ||
        doctor.email.toLowerCase().includes(term) ||
        doctor.specialty.toLowerCase().includes(term);

      const matchesStatus =
        selectedStatus === "ALL" || doctor.status === selectedStatus;

      const matchesSpecialty =
        selectedSpecialty === "ALL" || doctor.specialty === selectedSpecialty;

      return matchesSearch && matchesStatus && matchesSpecialty;
    });
  }, [doctors, searchTerm, selectedStatus, selectedSpecialty]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage) || 1;
  const paginatedDoctors = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDoctors.slice(start, start + itemsPerPage);
  }, [filteredDoctors, currentPage]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-6">
      <DoctorSearch
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
        selectedSpecialty={selectedSpecialty}
        onSpecialtyChange={(val) => {
          setSelectedSpecialty(val);
          setCurrentPage(1);
        }}
        specialties={specialties}
        onReset={handleReset}
      />

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-200/70 text-gray-800 font-bold text-base">
              <th className="py-4 px-4 text-center rounded-l-xl">Mã BS</th>
              <th className="py-4 px-4">Họ và tên</th>
              <th className="py-4 px-4">Chuyên khoa</th>
              <th className="py-4 px-4">Chức danh / Trình độ</th>
              <th className="py-4 px-4">Kinh nghiệm</th>
              <th className="py-4 px-4">Email</th>
              <th className="py-4 px-4 text-center">Phòng khám</th>
              <th className="py-4 px-4">Trạng thái</th>
              <th className="py-4 px-4 text-center rounded-r-xl">Chỉnh sửa</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDoctors.length > 0 ? (
              paginatedDoctors.map((doctor) => (
                <DoctorRow
                  key={doctor.id}
                  doctor={doctor}
                  onViewDetail={onViewDoctorDetail}
                  onEdit={onEditDoctor}
                  onLock={onLockDoctor}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className="text-center py-10 text-gray-500 font-medium text-lg"
                >
                  Không tìm thấy bác sĩ nào khớp với từ khóa.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredDoctors.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          totalItems={filteredDoctors.length}
          itemsPerPage={itemsPerPage}
          itemLabel="bác sĩ"
        />
      )}
    </div>
  );
}
