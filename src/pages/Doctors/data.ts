import type { Doctor } from "./types";

export const initialDoctors: Doctor[] = [
  {
    id: 1,
    stt: 1,
    fullName: "Dr. Nguyen Van Binh",
    specialty: "Tim mạch",
    qualifications: "MD, PhD",
    experience: "12 năm",
    email: "dr.binh@clinic.com",
    clinicRoom: "P01",
    status: "Đang hoạt động",
  },
  {
    id: 2,
    stt: 2,
    fullName: "Dr. Tran Thi Lan",
    specialty: "Thần kinh học",
    qualifications: "MD",
    experience: "8 năm",
    email: "dr.lan@clinic.com",
    clinicRoom: "P02",
    status: "Đang hoạt động",
  },
  {
    id: 3,
    stt: 3,
    fullName: "Dr. Le Van Phuc",
    specialty: "Nội khoa",
    qualifications: "MD, FCPS",
    experience: "15 năm",
    email: "dr.phuc@clinic.com",
    clinicRoom: "P03",
    status: "Nghỉ phép",
  },
];
