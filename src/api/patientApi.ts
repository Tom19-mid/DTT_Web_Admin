import axiosClient from "./axiosClient";
import type { Patient } from "../pages/Patients/types";

export interface CreatePatientData {
  fullName: string;
  email?: string;
  phone?: string;
  gender?: string;
  cccdNumber?: string;
  healthInsuranceNumber?: string;
  address?: string;
  dateOfBirth?: string;
}

export interface UpdatePatientData {
  fullName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  cccdNumber?: string;
  healthInsuranceNumber?: string;
  address?: string;
  verificationStatus?: string;
  dateOfBirth?: string;
  verifiedBy?: string;
  verificationNote?: string;
  verifiedAt?: string;
}

export const formatGenderVi = (rawGender?: string | null): string => {
  if (!rawGender || rawGender === "null" || rawGender === "undefined") return "";
  const g = rawGender.trim().toLowerCase();
  if (g === "male" || g === "nam" || g === "m") return "Nam";
  if (g === "female" || g === "nữ" || g === "nu" || g === "f") return "Nữ";
  if (g === "other" || g === "khác" || g === "khac") return "Khác";
  return rawGender;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extractErrorMessage = (error: any): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  return error?.message || "Thao tác thất bại. Vui lòng kiểm tra lại kết nối API!";
};

let patientsCache: Patient[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export const patientApi = {
  getCachedPatients: (): Patient[] | null => {
    const now = Date.now();
    if (patientsCache && now - cacheTimestamp < CACHE_TTL_MS) {
      return patientsCache;
    }
    return null;
  },

  clearCache: () => {
    patientsCache = null;
    cacheTimestamp = 0;
  },

  getAll: async (forceRefresh = false): Promise<Patient[]> => {
    const now = Date.now();
    if (!forceRefresh && patientsCache && now - cacheTimestamp < CACHE_TTL_MS) {
      return patientsCache;
    }

    try {
      const response = await axiosClient.get("/patients");
      const data = Array.isArray(response.data?.patients)
        ? response.data.patients
        : Array.isArray(response.data)
        ? response.data
        : [];

      const mappedPatients = data.map((p: Record<string, unknown>, index: number) => {
        const pId = Number(p.id || p.patientId || p.patient_id || index + 1);
        const rawVer = String(p.verificationStatus || p.verification_status || "pending").toLowerCase();
        let displayVer = "Chờ duyệt";
        if (rawVer === "verified" || rawVer === "đã duyệt") {
          displayVer = "Đã duyệt";
        } else if (rawVer === "rejected" || rawVer === "từ chối") {
          displayVer = "Từ chối";
        }

        const rawAccStatus = String(p.status || p.accountStatus || "Active").toLowerCase();
        let displayAccStatus = "Đang hoạt động";
        if (rawAccStatus === "inactive" || rawAccStatus === "ngưng hoạt động") {
          displayAccStatus = "Ngưng hoạt động";
        } else if (rawAccStatus === "locked" || rawAccStatus === "block" || rawAccStatus === "đã khóa") {
          displayAccStatus = "Đã khóa";
        }

        const phone = String(p.phone || p.phoneNumber || p.phone_number || "");
        const fullName = String(p.fullName || p.full_name || "Bệnh nhân");
        const formattedGender = formatGenderVi(p.gender as string);

        const displayVerifiedBy = p.verifiedBy ? "Lễ tân" : null;

        return {
          id: pId,
          patientId: pId,
          patient_id: pId,
          stt: index + 1,
          fullName: fullName,
          dob: String(p.dob || p.dateOfBirth || ""),
          dateOfBirth: String(p.dob || p.dateOfBirth || ""),
          gender: formattedGender,
          genderText: formattedGender,
          phone: phone,
          phoneNumber: phone,
          cccdNumber: String(p.cccd || p.cccdNumber || p.cccd_number || ""),
          healthInsuranceNumber: String(p.bhyt || p.healthInsuranceNumber || p.health_insurance_number || ""),
          address: String(p.address || ""),
          verificationStatus: displayVer,
          verifiedAt: p.verifiedAt ? String(p.verifiedAt) : null,
          verifiedBy: displayVerifiedBy,
          verificationNote: p.verificationNote ? String(p.verificationNote) : null,
          status: displayAccStatus,
          createdAt: String(p.createdAt || p.created_at || ""),
          updatedAt: String(p.updatedAt || p.updated_at || ""),
        } as Patient;
      });

      patientsCache = mappedPatients;
      cacheTimestamp = Date.now();

      return mappedPatients;
    } catch (error) {
      console.warn("patientApi.getAll error:", error);
      if (patientsCache) return patientsCache;
      return [];
    }
  },

  getById: async (id: number | string): Promise<Patient | null> => {
    try {
      const response = await axiosClient.get(`/patients/${id}`);
      const p = response.data?.patient || response.data;
      if (!p) return null;

      const pId = Number(p.id || id);
      const formattedGender = formatGenderVi(p.gender as string);
      const rawAccStatus = String(p.status || p.accountStatus || "Active").toLowerCase();
      let displayAccStatus = "Đang hoạt động";
      if (rawAccStatus === "inactive" || rawAccStatus === "ngưng hoạt động") {
        displayAccStatus = "Ngưng hoạt động";
      } else if (rawAccStatus === "locked" || rawAccStatus === "block" || rawAccStatus === "đã khóa") {
        displayAccStatus = "Đã khóa";
      }

      return {
        id: pId,
        patientId: pId,
        patient_id: pId,
        fullName: String(p.fullName || "Bệnh nhân"),
        dob: String(p.dob || p.dateOfBirth || ""),
        gender: formattedGender,
        phone: String(p.phone || p.phoneNumber || ""),
        phoneNumber: String(p.phone || p.phoneNumber || ""),
        cccdNumber: String(p.cccd || p.cccdNumber || ""),
        healthInsuranceNumber: String(p.bhyt || p.healthInsuranceNumber || ""),
        address: String(p.address || ""),
        verificationStatus: String(p.verificationStatus || "pending"),
        verifiedAt: p.verifiedAt ? String(p.verifiedAt) : null,
        verifiedBy: p.verifiedBy ? String(p.verifiedBy) : null,
        verificationNote: p.verificationNote ? String(p.verificationNote) : null,
        status: displayAccStatus,
        updatedAt: p.updatedAt ? String(p.updatedAt) : null,
      } as Patient;
    } catch (error) {
      console.warn(`patientApi.getById(${id}) error:`, error);
      return null;
    }
  },

  create: async (data: CreatePatientData): Promise<Patient | null> => {
    try {
      patientsCache = null;
      cacheTimestamp = 0;
      const response = await axiosClient.post("/patients", data);
      const p = response.data?.patient || response.data;
      if (!p) return null;

      return {
        id: Number(p.id || p.patientId || 0),
        fullName: String(p.fullName || data.fullName),
        phone: String(p.phone || data.phone || ""),
        phoneNumber: String(p.phone || data.phone || ""),
        gender: formatGenderVi(p.gender as string || data.gender),
        address: String(p.address || data.address || ""),
        cccdNumber: String(p.cccd || data.cccdNumber || ""),
        healthInsuranceNumber: String(p.bhyt || data.healthInsuranceNumber || ""),
        verificationStatus: "Chờ duyệt",
        status: "Đang hoạt động",
      } as Patient;
    } catch (error) {
      const msg = extractErrorMessage(error);
      console.error("patientApi.create error:", msg);
      throw new Error(msg, { cause: error });
    }
  },

  update: async (id: number | string, data: UpdatePatientData): Promise<Patient | null> => {
    try {
      patientsCache = null;
      cacheTimestamp = 0;
      let verStatus = data.verificationStatus;
      if (verStatus === "Chờ duyệt") verStatus = "pending";
      if (verStatus === "Đã duyệt") verStatus = "verified";
      if (verStatus === "Từ chối") verStatus = "rejected";

      // [BUG FIX] Lọc bỏ các key có giá trị undefined/null trước khi gửi lên API.
      // Điều này ngăn backend ghi đè các giá trị hợp lệ trong DB (ví dụ: gender=NULL)
      // bằng giá trị rỗng hoặc mặc định từ frontend.
      const payload: Record<string, unknown> = { verificationStatus: verStatus };
      const keys = Object.keys(data) as (keyof UpdatePatientData)[];
      for (const key of keys) {
        if (key === "verificationStatus") continue; // đã map riêng ở trên
        const val = data[key];
        // Chỉ đưa vào payload khi có giá trị thực sự (không phải undefined hoặc null)
        // [BUG FIX] Bỏ điều kiện val !== "" — vẫn gửi empty string để backend có thể xóa dữ liệu cũ
        // (ví dụ: người dùng muốn xóa địa chỉ/CCCD cũ thì gửi "" là hợp lệ)
        if (val !== undefined && val !== null) {
          payload[key] = val;
        }
      }

      const response = await axiosClient.put(`/patients/${id}`, payload);
      const p = response.data?.patient || response.data;
      if (!p) return null;

      const updateVerifiedBy = "Lễ tân";

      return {
        id: Number(id),
        fullName: String(p.fullName || data.fullName || ""),
        phone: String(p.phone || data.phone || ""),
        phoneNumber: String(p.phone || data.phone || ""),
        gender: formatGenderVi(p.gender as string || data.gender),
        address: String(p.address || data.address || ""),
        cccdNumber: String(p.cccd || data.cccdNumber || ""),
        healthInsuranceNumber: String(p.bhyt || data.healthInsuranceNumber || ""),
        verificationStatus: String(p.verificationStatus || data.verificationStatus || "Chờ duyệt"),
        verifiedAt: p.verifiedAt ? String(p.verifiedAt) : null,
        verifiedBy: updateVerifiedBy,
        verificationNote: p.verificationNote ? String(p.verificationNote) : null,
        status: p.status || "Đang hoạt động",
        updatedAt: p.updatedAt ? String(p.updatedAt) : null,
      } as Patient;
    } catch (error) {
      const msg = extractErrorMessage(error);
      console.error(`patientApi.update(${id}) error:`, msg);
      throw new Error(msg, { cause: error });
    }
  },

  verify: async (id: number | string, cccdNumber: string): Promise<boolean> => {
    try {
      patientsCache = null;
      cacheTimestamp = 0;
      await axiosClient.patch(`/patients/${id}/verify`, { cccdNumber });
      return true;
    } catch (error) {
      const msg = extractErrorMessage(error);
      console.error(`patientApi.verify(${id}) error:`, msg);
      throw new Error(msg, { cause: error });
    }
  },
};

export default patientApi;
