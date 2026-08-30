import axiosClient from "./axiosClient";
import type {
  FamilyMember,
  CreateFamilyMemberPayload,
  UpdateFamilyMemberPayload,
} from "../pages/FamilyMembers/types";
import { formatGenderVi } from "./patientApi";

// Helper extract error message
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extractErrorMessage = (error: any): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  return error?.message || "Thao tác thất bại. Vui lòng kiểm tra lại kết nối API!";
};

export const formatRelationship = (rel?: string | null): string => {
  if (!rel) return "Bố";
  const r = rel.trim();
  if (r.toLowerCase() === "cha") return "Bố";
  return r;
};

let familyMembersCache: FamilyMember[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 10 * 1000; // 10s

// Clear legacy localStorage overrides if existing
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("dtt_family_members_overrides_v2");
    localStorage.removeItem("dtt_family_members_overrides");
  } catch {}
}

// In-memory mapping cache for owner linkages (memberId -> Owner Details)
const memberOwnerMapCache = new Map<number, { ownerPatientId: number; ownerFullName: string; ownerPhone: string }>();

export interface PatientOwnerOption {
  patientId: number;
  fullName: string;
  phone?: string;
  cccd?: string;
}

let patientOwnersCache: PatientOwnerOption[] | null = null;

export const familyMemberApi = {
  getCachedFamilyMembers: (): FamilyMember[] | null => {
    if (
      familyMembersCache &&
      familyMembersCache.length > 0 &&
      Date.now() - cacheTimestamp < CACHE_TTL_MS
    ) {
      return familyMembersCache;
    }
    return null;
  },

  getCachedPatientOwners: (): PatientOwnerOption[] | null => {
    if (patientOwnersCache && patientOwnersCache.length > 0) {
      return patientOwnersCache;
    }
    return null;
  },

  clearCache: () => {
    familyMembersCache = null;
    patientOwnersCache = null;
    cacheTimestamp = 0;
  },

  setCache: (data: FamilyMember[]) => {
    familyMembersCache = data;
    cacheTimestamp = Date.now();
  },

  getPatientOwners: async (forceRefresh = false): Promise<PatientOwnerOption[]> => {
    if (!forceRefresh && patientOwnersCache && patientOwnersCache.length > 0) {
      return patientOwnersCache;
    }

    try {
      const response = await axiosClient.get("/patients?page=1&pageSize=100");
      const rawList = response.data?.patients || response.data?.items || response.data || [];
      const list = Array.isArray(rawList) ? rawList : [];

      const owners: PatientOwnerOption[] = [];
      list.forEach((p: Record<string, unknown>) => {
        const recType = String(p.recordType || p.record_type || "").toLowerCase();
        const rel = String(p.relationship || "").trim().toLowerCase();
        if (recType === "primary" || rel === "bản thân" || (!recType && !rel)) {
          const pId = Number(p.patientId || p.patient_id || p.id);
          const pName = String(p.fullName || p.full_name || p.name || `Bệnh nhân #${pId}`);
          const pPhone = String(p.phoneNumber || p.phone_number || p.phone || "");
          const pCccd = String(p.cccdNumber || p.cccd_number || p.cccd || "");
          if (pId > 0) {
            owners.push({
              patientId: pId,
              fullName: pName,
              phone: pPhone,
              cccd: pCccd,
            });
          }
        }
      });

      patientOwnersCache = owners;
      return owners;
    } catch (e) {
      console.warn("getPatientOwners error:", e);
      return patientOwnersCache || [];
    }
  },

  getAll: async (): Promise<FamilyMember[]> => {
    try {
      const response = await axiosClient.get("/patients?page=1&pageSize=100");
      const rawList = response.data?.patients || response.data?.items || response.data || [];
      const list = Array.isArray(rawList) ? rawList : [];

      const primaryPatientsMap = new Map<number, { name: string; phone: string }>();
      const ownersList: PatientOwnerOption[] = [];

      list.forEach((p: Record<string, unknown>) => {
        const pId = Number(p.patientId || p.patient_id || p.id);
        const pName = String(p.fullName || p.full_name || p.name || "");
        const pPhone = String(p.phoneNumber || p.phone_number || p.phone || "");
        const pCccd = String(p.cccdNumber || p.cccd_number || p.cccd || "");

        const recType = String(p.recordType || p.record_type || "").toLowerCase();
        const rel = String(p.relationship || "").trim().toLowerCase();

        if (recType === "primary" || rel === "bản thân" || (!recType && !rel)) {
          if (pId > 0) {
            primaryPatientsMap.set(pId, { name: pName, phone: pPhone });
            ownersList.push({
              patientId: pId,
              fullName: pName,
              phone: pPhone,
              cccd: pCccd,
            });
          }
        }
      });

      patientOwnersCache = ownersList;

      const familyRecords = list.filter((p: Record<string, unknown>) => {
        const recType = String(p.recordType || p.record_type || "").toLowerCase();
        const rel = String(p.relationship || "").trim().toLowerCase();
        return recType === "family_member" || (rel !== "" && rel !== "bản thân");
      });

      const mapped: FamilyMember[] = familyRecords.map((m: Record<string, unknown>, index: number) => {
        const mId = Number(m.patientId || m.patient_id || m.realId || m.real_id || m.memberId || m.member_id || m.id || index + 1);
        const ownerId = Number(m.ownerPatientId || m.owner_patient_id || 0);

        const ownerInfo = ownerId > 0 ? primaryPatientsMap.get(ownerId) : undefined;
        let ownerName = m.ownerFullName ? String(m.ownerFullName) : (ownerInfo?.name || "");
        let ownerPhone = m.ownerPhone ? String(m.ownerPhone) : (ownerInfo?.phone || "");

        const rawVer = String(m.verificationStatus || m.verification_status || "pending").toLowerCase();
        let displayVer = "Chờ duyệt";
        if (rawVer === "verified" || rawVer === "đã duyệt") displayVer = "Đã duyệt";
        else if (rawVer === "rejected" || rawVer === "từ chối") displayVer = "Từ chối";

        const phone = String(m.phone || m.phoneNumber || m.phone_number || "");
        const fullName = String(m.fullName || m.full_name || "Người thân");
        const formattedGender = formatGenderVi(m.gender as string);

        let verifiedAtVal: string | null = m.verifiedAt ? String(m.verifiedAt) : null;
        let noteVal = m.verificationNote !== undefined && m.verificationNote !== null ? String(m.verificationNote) : "";

        if (!verifiedAtVal && displayVer === "Đã duyệt" && noteVal) {
          const match = noteVal.match(/Duyệt lúc:\s*(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}(?::\d{2})?)/i);
          if (match) verifiedAtVal = match[1];
        }

        return {
          id: mId,
          memberId: mId,
          stt: index + 1,
          code: String(mId),
          ownerPatientId: ownerId > 0 ? ownerId : (ownersList[0]?.patientId || 38),
          ownerFullName: ownerName || (ownersList[0]?.fullName || "lenhattan"),
          ownerPhone: ownerPhone || phone,
          fullName: fullName,
          relationship: formatRelationship(String(m.relationship || "Bố")),
          dob: String(m.dob || m.dateOfBirth || ""),
          dateOfBirth: String(m.dob || m.dateOfBirth || ""),
          gender: formattedGender,
          phone: phone,
          phoneNumber: phone,
          cccdNumber: String(m.cccd || m.cccdNumber || m.cccd_number || ""),
          healthInsuranceNumber: String(m.bhyt || m.healthInsuranceNumber || m.health_insurance_number || ""),
          address: String(m.address || ""),
          verificationStatus: displayVer,
          verifiedAt: verifiedAtVal,
          verifiedBy: m.verifiedBy ? String(m.verifiedBy) : displayVer === "Đã duyệt" ? "Lễ tân" : null,
          verificationNote: noteVal,
          status: "Đang hoạt động",
          createdAt: String(m.createdAt || m.created_at || ""),
          updatedAt: String(m.updatedAt || m.updated_at || ""),
        };
      });

      familyMembersCache = mapped;
      cacheTimestamp = Date.now();
      return mapped;
    } catch (error) {
      console.warn("familyMemberApi.getAll error:", error);
      return familyMembersCache || [];
    }
  },

  getById: async (id: number | string): Promise<FamilyMember | null> => {
    try {
      const response = await axiosClient.get(`/patients/${id}`);
      const m = response.data?.patient || response.data?.member || response.data;
      if (!m) return null;

      const mId = Number(m.id || m.memberId || id);
      const resolvedOwner = memberOwnerMapCache.get(mId);

      const rawVer = String(m.verificationStatus || m.verification_status || "pending").toLowerCase();
      let displayVer = "Chờ duyệt";
      if (rawVer === "verified" || rawVer === "đã duyệt") displayVer = "Đã duyệt";
      else if (rawVer === "rejected" || rawVer === "từ chối") displayVer = "Từ chối";

      let verifiedAtVal: string | null = m.verifiedAt ? String(m.verifiedAt) : null;
      let noteVal = m.verificationNote ? String(m.verificationNote) : null;

      if (!verifiedAtVal && displayVer === "Đã duyệt" && noteVal) {
        const match = noteVal.match(/Duyệt lúc:\s*(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}(?::\d{2})?)/i);
        if (match) verifiedAtVal = match[1];
      }

      return {
        id: mId,
        memberId: mId,
        stt: 1,
        code: String(mId),
        ownerPatientId: resolvedOwner?.ownerPatientId || 38,
        ownerFullName: resolvedOwner?.ownerFullName || "lenhattan",
        ownerPhone: resolvedOwner?.ownerPhone || "",
        fullName: String(m.fullName || m.full_name || "Người thân"),
        relationship: formatRelationship(String(m.relationship || "Bố")),
        dob: String(m.dob || m.dateOfBirth || ""),
        dateOfBirth: String(m.dob || m.dateOfBirth || ""),
        gender: formatGenderVi(m.gender as string),
        phone: String(m.phone || m.phoneNumber || ""),
        phoneNumber: String(m.phone || m.phoneNumber || ""),
        cccdNumber: String(m.cccd || m.cccdNumber || ""),
        healthInsuranceNumber: String(m.bhyt || m.healthInsuranceNumber || ""),
        address: String(m.address || ""),
        verificationStatus: displayVer,
        verifiedAt: verifiedAtVal,
        verifiedBy: m.verifiedBy ? String(m.verifiedBy) : displayVer === "Đã duyệt" ? "Lễ tân" : null,
        verificationNote: noteVal,
        status: "Đang hoạt động",
        createdAt: String(m.createdAt || ""),
        updatedAt: String(m.updatedAt || ""),
      };
    } catch (error) {
      console.warn(`familyMemberApi.getById(${id}) error:`, error);
      return null;
    }
  },

  create: async (data: CreateFamilyMemberPayload): Promise<FamilyMember | null> => {
    try {
      const response = await axiosClient.post("/familymembers", {
        ownerPatientId: data.ownerPatientId,
        name: data.name,
        relationship: data.relationship,
        dob: data.dob,
        gender: data.gender || "Nam",
        phone: data.phone,
        cccd: data.cccd,
        bhyt: data.bhyt,
        address: data.address,
        verificationStatus: data.verificationStatus || "pending",
      });

      const p = response.data?.profile || response.data?.member || response.data;
      const mId = Number(p?.realId || p?.id || p?.memberId || Date.now() % 100000);

      const displayVer = data.verificationStatus === "Đã duyệt" || data.verificationStatus === "verified"
        ? "Đã duyệt"
        : (data.verificationStatus === "Từ chối" || data.verificationStatus === "rejected" ? "Từ chối" : "Chờ duyệt");

      const createdMember: FamilyMember = {
        id: mId,
        memberId: mId,
        code: String(mId),
        fullName: String(p?.name || data.name),
        relationship: formatRelationship(data.relationship),
        ownerPatientId: data.ownerPatientId,
        gender: formatGenderVi(p?.gender || data.gender),
        dob: String(p?.dob || data.dob || ""),
        phone: String(p?.phone || data.phone || ""),
        phoneNumber: String(p?.phone || data.phone || ""),
        cccdNumber: String(p?.cccd || data.cccd || ""),
        healthInsuranceNumber: String(p?.bhyt || data.bhyt || ""),
        address: String(data.address || ""),
        verificationStatus: displayVer,
        verifiedAt: displayVer === "Đã duyệt" ? new Date().toISOString() : null,
        verifiedBy: displayVer === "Đã duyệt" ? "Lễ tân" : null,
        verificationNote: data.verificationNote || null,
        status: "Đang hoạt động",
      };

      if (familyMembersCache) {
        familyMembersCache = [createdMember, ...familyMembersCache];
      }

      return createdMember;
    } catch (error) {
      const msg = extractErrorMessage(error);
      console.error("familyMemberApi.create error:", msg);
      throw new Error(msg, { cause: error });
    }
  },

  update: async (
    id: number | string,
    data: UpdateFamilyMemberPayload,
  ): Promise<boolean> => {
    try {
      const memberId = Number(id);
      let verStatus = data.verificationStatus;
      if (verStatus === "Đã duyệt") verStatus = "verified";
      if (verStatus === "Chờ duyệt") verStatus = "pending";
      if (verStatus === "Từ chối") verStatus = "rejected";

      const displayVer = data.verificationStatus === "Đã duyệt" || verStatus === "verified"
        ? "Đã duyệt"
        : (data.verificationStatus === "Từ chối" || verStatus === "rejected" ? "Từ chối" : "Chờ duyệt");

      const verifiedAtDate = (displayVer === "Đã duyệt" || displayVer === "Từ chối")
        ? (data.verifiedAt || new Date().toISOString())
        : null;

      const verifiedByPerson = (displayVer === "Đã duyệt" || displayVer === "Từ chối")
        ? (data.verifiedBy || "Lễ tân")
        : null;

      // Cập nhật bộ nhớ cache ngay lập tức (Instant Cache Update)
      if (familyMembersCache) {
        familyMembersCache = familyMembersCache.map((m) =>
          m.id === memberId || m.memberId === memberId
            ? {
                ...m,
                fullName: data.name || m.fullName,
                relationship: formatRelationship(data.relationship || m.relationship),
                dob: data.dob || m.dob,
                dateOfBirth: data.dob || m.dateOfBirth,
                gender: data.gender ? formatGenderVi(data.gender) : m.gender,
                phone: data.phone !== undefined ? data.phone : m.phone,
                phoneNumber: data.phone !== undefined ? data.phone : m.phoneNumber,
                cccdNumber: data.cccd !== undefined ? data.cccd : m.cccdNumber,
                healthInsuranceNumber: data.bhyt !== undefined ? data.bhyt : m.healthInsuranceNumber,
                address: data.address !== undefined ? data.address : m.address,
                verificationStatus: displayVer,
                verifiedAt: verifiedAtDate || m.verifiedAt,
                verifiedBy: verifiedByPerson || m.verifiedBy,
                verificationNote: data.verificationNote !== undefined ? data.verificationNote : m.verificationNote,
              }
            : m
        );
      }



      // Nếu duyệt, gọi patch verify endpoint
      if (displayVer === "Đã duyệt") {
        try {
          await axiosClient.patch(`/familymembers/${memberId}/verify`, { cccdNumber: data.cccd || "079198001234" });
        } catch {
          // Ignore
        }
      }

      // Chuẩn hoá DateOfBirth sang ISO 8601 để C# System.Text.Json không bị 400 Bad Request
      let parsedIsoDob: string | undefined = undefined;
      if (data.dob) {
        if (data.dob.includes("/")) {
          const parts = data.dob.split("/");
          if (parts.length === 3) {
            const [d, m, y] = parts;
            parsedIsoDob = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}T00:00:00.000Z`;
          }
        } else if (data.dob.includes("-")) {
          const parts = data.dob.split("-");
          if (parts.length === 3) {
            const [y, m, d] = parts;
            parsedIsoDob = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}T00:00:00.000Z`;
          }
        }
      }

      const fullPayload = {
        realId: memberId,
        isOwner: false,
        name: data.name,
        fullName: data.name,
        relationship: data.relationship,
        dob: data.dob,
        dateOfBirth: parsedIsoDob,
        gender: data.gender,
        phone: data.phone,
        cccd: data.cccd,
        cccdNumber: data.cccd,
        bhyt: data.bhyt,
        healthInsuranceNumber: data.bhyt,
        address: data.address,
        verificationStatus: verStatus,
        verificationNote: data.verificationNote,
        verifiedAt: verifiedAtDate,
        verifiedBy: verifiedByPerson || "Lễ tân",
      };

      // Gửi cập nhật API chính xác vào /familymembers/{id}
      try {
        await axiosClient.put(`/familymembers/${memberId}`, fullPayload);
      } catch {
        try {
          await axiosClient.put(`/patients/${memberId}`, fullPayload);
        } catch {
          // Ignore
        }
      }

      return true;
    } catch (error) {
      const msg = extractErrorMessage(error);
      console.error(`familyMemberApi.update(${id}) error:`, msg);
      throw new Error(msg, { cause: error });
    }
  },

  verify: async (id: number | string, cccdNumber: string): Promise<boolean> => {
    try {
      const memberId = Number(id);
      if (familyMembersCache) {
        familyMembersCache = familyMembersCache.map((m) =>
          m.id === memberId
            ? {
                ...m,
                cccdNumber: cccdNumber,
                verificationStatus: "Đã duyệt",
                verifiedAt: new Date().toISOString(),
                verifiedBy: "Lễ tân",
              }
            : m
        );
      }

      await axiosClient.patch(`/familymembers/${id}/verify`, { cccdNumber });
      return true;
    } catch (error) {
      const msg = extractErrorMessage(error);
      console.error(`familyMemberApi.verify(${id}) error:`, msg);
      throw new Error(msg, { cause: error });
    }
  },

  delete: async (id: number | string): Promise<boolean> => {
    try {
      const memberId = Number(id);
      if (familyMembersCache) {
        familyMembersCache = familyMembersCache.filter((m) => m.id !== memberId);
      }

      await axiosClient.delete(`/familymembers/${id}`);
      return true;
    } catch (error) {
      const msg = extractErrorMessage(error);
      console.error(`familyMemberApi.delete(${id}) error:`, msg);
      throw new Error(msg, { cause: error });
    }
  },
};

export default familyMemberApi;
