import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import familyMemberApi, { type PatientOwnerOption } from "../../api/familyMemberApi";
import type { FamilyMember } from "./types";
import FamilyMemberToolbar from "./components/FamilyMemberToolbar";
import FamilyMemberTable from "./components/FamilyMemberTable";
import FamilyMemberFormModal from "./components/FamilyMemberFormModal";
import FamilyMemberDetailModal from "./components/FamilyMemberDetailModal";
import VerifyFamilyMemberModal from "./components/VerifyFamilyMemberModal";
import ConfirmDeleteModal from "./components/ConfirmDeleteModal";
import ToastNotification, { type ToastMessage } from "../../components/common/ToastNotification";
import { notificationApi } from "../../api/notificationApi";
import NotificationDetailModal from "../Notifications/components/NotificationDetailModal";
import type { Notification } from "../Notifications/types";
import { Loader2 } from "lucide-react";

export default function FamilyMembers() {
  const location = useLocation();
  const [members, setMembers] = useState<FamilyMember[]>(
    () => familyMemberApi.getCachedFamilyMembers() || []
  );
  const [patientOwners, setPatientOwners] = useState<PatientOwnerOption[]>(
    () => familyMemberApi.getCachedPatientOwners() || []
  );
  const [loading, setLoading] = useState<boolean>(
    () => !familyMemberApi.getCachedFamilyMembers()
  );

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [viewingMember, setViewingMember] = useState<FamilyMember | null>(null);
  const [verifyingMember, setVerifyingMember] = useState<FamilyMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<FamilyMember | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [viewingNotification, setViewingNotification] = useState<Notification | null>(null);

  const addToast = useCallback((item: Omit<ToastMessage, "id">) => {
    const id = Date.now().toString() + "_" + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [{ ...item, id }, ...prev]);
  }, []);

  const removeToast = useCallback((id?: string) => {
    if (id) {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    } else {
      setToasts([]);
    }
  }, []);

  const getLoggedInAdminUserId = (): string | undefined => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        return parsed?.userId || parsed?.id;
      }
    } catch (e) {}
    return undefined;
  };

  const reloadData = useCallback(async (forceRefresh = true) => {
    try {
      const [membersData, ownersData] = await Promise.all([
        familyMemberApi.getAll(forceRefresh),
        familyMemberApi.getPatientOwners(),
      ]);
      setMembers(membersData);
      setPatientOwners(ownersData);
    } catch (err) {
      console.warn("Lỗi khi tải danh sách người thân:", err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      const cached = familyMemberApi.getCachedFamilyMembers();
      if (!cached && members.length === 0) {
        setLoading(true);
      }
      try {
        const [membersData, ownersData] = await Promise.all([
          familyMemberApi.getAll(),
          familyMemberApi.getPatientOwners(),
        ]);
        if (isMounted) {
          setMembers(membersData);
          setPatientOwners(ownersData);
          setLoading(false);
        }
      } catch (err) {
        console.warn("Lỗi khi tải danh sách người thân:", err);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Statistics calculation
  const { totalMembers, verifiedCount, pendingCount, rejectedCount } = useMemo(() => {
    let verified = 0;
    let pending = 0;
    let rejected = 0;

    members.forEach((m) => {
      const ver = (m.verificationStatus || "pending").toLowerCase();
      if (ver === "verified" || ver === "đã duyệt") {
        verified++;
      } else if (ver === "rejected" || ver === "từ chối" || m.status === "Locked" || m.status === "Đã khóa") {
        rejected++;
      } else {
        pending++;
      }
    });

    return {
      totalMembers: members.length,
      verifiedCount: verified,
      pendingCount: pending,
      rejectedCount: rejected,
    };
  }, [members]);

  // Modal Handlers
  const handleOpenAddModal = () => {
    setEditingMember(null);
    setIsFormModalOpen(true);
  };

  const handleOpenDetailModal = useCallback((member: FamilyMember) => {
    setViewingMember(member);
  }, []);

  const handleOpenEditModal = useCallback((member: FamilyMember) => {
    setViewingMember(null);
    setEditingMember(member);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenVerifyModal = useCallback((member: FamilyMember) => {
    setVerifyingMember(member);
  }, []);

  const handleOpenDeleteModal = useCallback((member: FamilyMember) => {
    setDeletingMember(member);
  }, []);

  // Save (Create or Update)
  const handleSaveMember = async (formData: any): Promise<void> => {
    const adminUserId = getLoggedInAdminUserId();
    const isEdit = !!formData.id;
    const memberName = formData.fullName || "Người thân";

    // 1. Cập nhật giao diện ngay lập tức (Optimistic Update - 0ms delay)
    if (isEdit) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === formData.id
            ? {
                ...m,
                fullName: formData.fullName,
                relationship: formData.relationship,
                dob: formData.dob,
                dateOfBirth: formData.dob,
                gender: formData.gender,
                phone: formData.phone,
                phoneNumber: formData.phone,
                cccdNumber: formData.cccd,
                healthInsuranceNumber: formData.bhyt,
                address: formData.address,
                verificationStatus: formData.verificationStatus,
                verifiedAt:
                  formData.verificationStatus === "Đã duyệt" || formData.verificationStatus === "Từ chối"
                    ? (formData.verifiedAt || new Date().toISOString())
                    : null,
                verifiedBy:
                  formData.verificationStatus === "Đã duyệt" || formData.verificationStatus === "Từ chối"
                    ? (formData.verifiedBy || "Lễ tân")
                    : null,
                verificationNote:
                  formData.verificationNote !== undefined
                    ? formData.verificationNote
                    : m.verificationNote,
              }
            : m
        )
      );

      const notiData: Notification = {
        notificationId: Date.now(),
        title: "Cập nhật hồ sơ người thân",
        content: `Hệ thống vừa cập nhật thông tin hồ sơ người thân "${memberName}" (${formData.relationship}).`,
        type: "system",
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: adminUserId,
      };

      addToast({
        type: "success",
        title: "Cập nhật hồ sơ người thân",
        message: `Đã cập nhật thông tin hồ sơ người thân "${memberName}" thành công!`,
        onClick: () => setViewingNotification(notiData),
      });

      notificationApi.create(notiData).catch((e) => console.warn("Lỗi tạo thông báo:", e));
    }

    try {
      if (isEdit) {
        await familyMemberApi.update(formData.id, {
          realId: formData.id,
          name: formData.fullName,
          relationship: formData.relationship,
          dob: formData.dob,
          gender: formData.gender,
          phone: formData.phone,
          cccd: formData.cccd,
          bhyt: formData.bhyt,
          address: formData.address,
          verificationStatus: formData.verificationStatus,
          verifiedAt: formData.verifiedAt,
          verifiedBy: formData.verifiedBy,
          verificationNote: formData.verificationNote,
        });
      } else {
        const created = await familyMemberApi.create({
          ownerPatientId: formData.ownerPatientId,
          name: formData.fullName,
          relationship: formData.relationship,
          dob: formData.dob,
          gender: formData.gender,
          phone: formData.phone,
          cccd: formData.cccd,
          bhyt: formData.bhyt,
          address: formData.address,
          verificationStatus: formData.verificationStatus,
        });

        if (created) {
          const ownerObj = patientOwners.find((p) => p.patientId === Number(formData.ownerPatientId));
          const fullCreated: FamilyMember = {
            ...created,
            ownerFullName: ownerObj?.fullName || "Bệnh nhân chính",
            ownerPhone: ownerObj?.phone || "",
          };
          setMembers((prev) => [fullCreated, ...prev]);
        }

        const notiData: Notification = {
          notificationId: Date.now(),
          title: "Thêm hồ sơ người thân mới",
          content: `Đã khởi tạo thành công hồ sơ người thân "${memberName}" (${formData.relationship}).`,
          type: "PATIENT_REGISTERED",
          isRead: false,
          createdAt: new Date().toISOString(),
          userId: adminUserId,
        };

        addToast({
          type: "success",
          title: "Thêm hồ sơ người thân mới",
          message: `Đã thêm mới hồ sơ người thân "${memberName}" thành công!`,
          onClick: () => setViewingNotification(notiData),
        });

        notificationApi.create(notiData).catch((e) => console.warn("Lỗi tạo thông báo:", e));
      }

      // Tải lại nền trong background để đồng bộ dữ liệu ngầm
      reloadData(true);
    } catch (err: any) {
      console.error("handleSaveMember error:", err);
      reloadData(true);
      addToast({
        type: "error",
        title: "Lỗi thao tác",
        message: err?.message || "Không thể lưu thông tin hồ sơ người thân. Vui lòng thử lại.",
      });
      throw err;
    }
  };

  // Verify CCCD
  const handleVerifyMember = async (memberId: number, cccdNumber: string): Promise<void> => {
    const adminUserId = getLoggedInAdminUserId();
    const memberName = verifyingMember?.fullName || "Người thân";

    // Optimistic update
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? {
              ...m,
              cccdNumber: cccdNumber,
              verificationStatus: "Đã duyệt",
              verifiedAt: new Date().toISOString(),
              verifiedBy: "Lễ tân",
            }
          : m
      )
    );

    try {
      await familyMemberApi.verify(memberId, cccdNumber);

      const notiData: Notification = {
        notificationId: Date.now(),
        title: "Xác thực CCCD người thân",
        content: `Đã xác thực thẻ CCCD (${cccdNumber}) cho hồ sơ người thân "${memberName}".`,
        type: "system",
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: adminUserId,
      };

      addToast({
        type: "success",
        title: "Xác thực CCCD thành công",
        message: `Đã xác thực thẻ CCCD cho hồ sơ người thân "${memberName}"!`,
        onClick: () => setViewingNotification(notiData),
      });

      notificationApi.create(notiData).catch((e) => console.warn("Lỗi tạo thông báo:", e));
      reloadData(true);
    } catch (err: any) {
      console.error("handleVerifyMember error:", err);
      reloadData(true);
      addToast({
        type: "error",
        title: "Lỗi xác thực",
        message: err?.message || "Không thể xác thực CCCD. Vui lòng thử lại.",
      });
      throw err;
    }
  };

  // Delete
  const handleDeleteMember = async (): Promise<void> => {
    if (!deletingMember) return;
    const memberId = deletingMember.id;
    const memberName = deletingMember.fullName;
    setDeleteLoading(true);

    // Optimistic delete
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    setDeletingMember(null);

    try {
      await familyMemberApi.delete(memberId);

      addToast({
        type: "success",
        title: "Xóa hồ sơ người thân",
        message: `Đã xóa hồ sơ người thân "${memberName}" thành công!`,
      });

      reloadData(true);
    } catch (err: any) {
      console.error("handleDeleteMember error:", err);
      reloadData(true);
      addToast({
        type: "error",
        title: "Lỗi xóa hồ sơ",
        message: err?.message || "Không thể xóa hồ sơ người thân. Vui lòng thử lại.",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-7 bg-[#f4f6f9] min-h-screen relative">
      {/* Toast Notifications */}
      <ToastNotification toasts={toasts} onClose={removeToast} />

      {/* Toolbar & Stat Cards */}
      <FamilyMemberToolbar
        onAddMember={handleOpenAddModal}
        totalMembers={totalMembers}
        verifiedCount={verifiedCount}
        pendingCount={pendingCount}
        rejectedCount={rejectedCount}
      />

      {/* Main Table */}
      {loading && members.length === 0 ? (
        <div className="py-24 flex flex-col justify-center items-center">
          <Loader2 className="animate-spin text-blue-700 mb-3" size={36} />
          <p className="text-gray-600 font-medium text-base">
            Đang tải danh sách hồ sơ người thân...
          </p>
        </div>
      ) : (
        <FamilyMemberTable
          members={members}
          onViewDetailMember={handleOpenDetailModal}
          onEditMember={handleOpenEditModal}
          onVerifyMember={handleOpenVerifyModal}
          onDeleteMember={handleOpenDeleteModal}
        />
      )}

      {/* Detail Modal */}
      <FamilyMemberDetailModal
        isOpen={!!viewingMember}
        member={viewingMember ? (members.find((m) => m.id === viewingMember.id) || viewingMember) : null!}
        onClose={() => setViewingMember(null)}
        onEdit={handleOpenEditModal}
        onVerify={handleOpenVerifyModal}
      />

      {/* Form Modal (Add / Edit) */}
      <FamilyMemberFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveMember}
        initialData={editingMember}
        patientOwners={patientOwners}
      />

      {/* Verify CCCD Modal */}
      <VerifyFamilyMemberModal
        isOpen={!!verifyingMember}
        member={verifyingMember}
        onClose={() => setVerifyingMember(null)}
        onConfirm={handleVerifyMember}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingMember}
        member={deletingMember}
        onClose={() => setDeletingMember(null)}
        onConfirm={handleDeleteMember}
        loading={deleteLoading}
      />

      {/* Notification Detail Modal triggered on Toast click */}
      <NotificationDetailModal
        notification={viewingNotification}
        onClose={() => setViewingNotification(null)}
        onDelete={async (id) => {
          await notificationApi.delete(id);
          setViewingNotification(null);
        }}
      />
    </div>
  );
}
