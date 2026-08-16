import { useState, useEffect, useCallback } from "react";
import { Pill, Boxes, Plus } from "lucide-react";
import type { Medicine, MedicineCategory } from "./types";
import medicineApi from "../../api/medicineApi";
import MedicineToolbar from "./components/MedicineToolbar";
import MedicineTable from "./components/MedicineTable";
import MedicineFormModal from "./components/MedicineFormModal";
import MedicineDetailModal from "./components/MedicineDetailModal";
import ConfirmStatusModal from "./components/ConfirmStatusModal";
import CategoryManagementModal from "./components/CategoryManagementModal";
import CategoryTableView from "./components/CategoryTableView";
import ToastNotification, { type ToastMessage } from "../../components/common/ToastNotification";
import { notificationApi } from "../../api/notificationApi";
import NotificationDetailModal from "../Notifications/components/NotificationDetailModal";
import type { Notification } from "../Notifications/types";

export default function Medicines() {
  const [activeTab, setActiveTab] = useState<"medicines" | "categories">(
    "medicines"
  );
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<MedicineCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  const [viewingMedicine, setViewingMedicine] = useState<Medicine | null>(null);
  const [statusTogglingMedicine, setStatusTogglingMedicine] =
    useState<Medicine | null>(null);
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

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [medsData, catsData] = await Promise.all([
        medicineApi.getAll(),
        medicineApi.getCategories(),
      ]);
      setMedicines(medsData);
      setCategories(catsData);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu thuốc & danh mục:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Statistics
  const totalMedicines = medicines.length;
  const activeCount = medicines.filter(
    (m) => m.status === "Active" || m.status === "Đang hoạt động"
  ).length;
  const inactiveCount = medicines.filter(
    (m) => m.status === "Inactive" || m.status === "Ngưng hoạt động"
  ).length;
  const categoriesCount = categories.length;

  // Open add modal
  const handleOpenAddModal = () => {
    setEditingMedicine(null);
    setIsFormModalOpen(true);
  };

  // Open edit modal
  const handleOpenEditModal = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setIsFormModalOpen(true);
  };

  // Open detail view modal
  const handleOpenDetailModal = (medicine: Medicine) => {
    setViewingMedicine(medicine);
  };

  // Open status change confirmation modal
  const handleOpenStatusModal = (medicine: Medicine) => {
    setStatusTogglingMedicine(medicine);
  };

  // Save medicine (Insert or Update)
  const handleSaveMedicine = async (medicineData: Medicine) => {
    try {
      const targetStatus =
        medicineData.status === "Ngưng hoạt động" ||
        medicineData.status === "Inactive"
          ? "Inactive"
          : "Active";

      const formatExpiryDateForPayload = (dateStr?: string) => {
        if (!dateStr) return undefined;
        const str = dateStr.trim();
        if (str.includes("/")) {
          const parts = str.split("/");
          if (parts.length === 3) {
            const [d, m, y] = parts;
            return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
          }
        }
        return str;
      };

      const payload = {
        categoryId: Number(medicineData.categoryId) || 1,
        medicineName: medicineData.medicineName || medicineData.name || "",
        unit: medicineData.unit || "Viên",
        unitPrice: Number(medicineData.unitPrice ?? medicineData.price) || 0,
        stockQuantity:
          Number(medicineData.stockQuantity ?? medicineData.stock) || 0,
        description: medicineData.description || "",
        defaultUsage: medicineData.defaultUsage || medicineData.usage || "",
        status: targetStatus,
        expiryDate: formatExpiryDateForPayload(medicineData.expiryDate),
      };

      const targetId = medicineData.medicineId || medicineData.id;
      const medName = payload.medicineName || "Thuốc";
      const adminUserId = getLoggedInAdminUserId();

      if (targetId && editingMedicine) {
        await medicineApi.update(targetId, payload);

        const createdNoti = await notificationApi.create({
          title: "Cập nhật thông tin thuốc",
          content: `Hệ thống vừa cập nhật thông tin thuốc "${medName}".`,
          type: "system",
          userId: adminUserId,
        });

        addToast({
          type: "success",
          title: "Cập nhật thuốc",
          message: `Đã cập nhật thông tin thuốc "${medName}" thành công!`,
          onClick: createdNoti ? () => setViewingNotification(createdNoti) : undefined,
        });
      } else {
        await medicineApi.create(payload);

        const createdNoti = await notificationApi.create({
          title: "Thêm thuốc mới",
          content: `Đã tạo mới thành công thuốc "${medName}".`,
          type: "system",
          userId: adminUserId,
        });

        addToast({
          type: "success",
          title: "Thêm thuốc mới",
          message: `Đã thêm mới thuốc "${medName}" thành công!`,
          onClick: createdNoti ? () => setViewingNotification(createdNoti) : undefined,
        });
      }
      await fetchAllData();
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Lỗi thao tác",
        message: err.message || "Lỗi khi lưu thông tin thuốc!",
      });
    }
  };

  // Confirm status toggle action (khóa / mở với hình ổ khóa màu vàng)
  const handleConfirmStatusToggle = async () => {
    if (statusTogglingMedicine) {
      const medName = statusTogglingMedicine.medicineName || statusTogglingMedicine.name || "Thuốc";
      const adminUserId = getLoggedInAdminUserId();

      try {
        const targetId =
          statusTogglingMedicine.medicineId || statusTogglingMedicine.id!;
        const currentActive =
          statusTogglingMedicine.status === "Đang hoạt động" ||
          statusTogglingMedicine.status === "Active";
        const nextStatus = currentActive ? "Inactive" : "Active";

        await medicineApi.toggleStatus(targetId, nextStatus);
        await fetchAllData();

        const createdNoti = await notificationApi.create({
          title: "Khóa / Đổi trạng thái thuốc",
          content: `Thuốc "${medName}" đã được chuyển sang trạng thái ${nextStatus === "Active" ? "Đang hoạt động" : "Đã khóa/Ngưng hoạt động"}.`,
          type: "system",
          userId: adminUserId,
        });

        addToast({
          type: "success",
          title: "Khóa thuốc",
          message: `Đã cập nhật trạng thái thuốc "${medName}" thành công!`,
          onClick: createdNoti ? () => setViewingNotification(createdNoti) : undefined,
        });
      } catch (err: any) {
        addToast({
          type: "error",
          title: "Lỗi thao tác",
          message: err.message || "Lỗi khi đổi trạng thái thuốc!",
        });
      } finally {
        setStatusTogglingMedicine(null);
      }
    }
  };

  const nextMedicineId =
    medicines.length > 0
      ? Math.max(...medicines.map((m) => m.medicineId || m.id || 0)) + 1
      : 1;

  return (
    <div className="p-7 bg-[#f4f6f9] min-h-screen relative">
      {/* Top-Right 3s Stacked Toast Notifications */}
      <ToastNotification toasts={toasts} onClose={removeToast} />

      {/* Navigation Header & Main 2 Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {activeTab === "medicines"
              ? "Quản lý thuốc"
              : "Quản lý danh mục thuốc"}
          </h1>
        </div>

        {/* 2 Tabs */}
        <div className="bg-gray-200/80 p-1.5 rounded-2xl flex items-center gap-1.5 self-start md:self-auto shadow-inner">
          <button
            onClick={() => setActiveTab("medicines")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === "medicines"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
            }`}
          >
            <Pill size={18} />
            <span>Quản lý thuốc</span>
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === "categories"
                ? "bg-white text-purple-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
            }`}
          >
            <Boxes size={18} />
            <span>Quản lý danh mục thuốc</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Medicines View */}
      {activeTab === "medicines" && (
        <>
          <MedicineToolbar
            onAddMedicine={handleOpenAddModal}
            onOpenCategoryManager={() => setActiveTab("categories")}
            totalMedicines={totalMedicines}
            activeCount={activeCount}
            inactiveCount={inactiveCount}
            categoriesCount={categoriesCount}
          />

          <MedicineTable
            medicines={medicines}
            categories={categories}
            loading={loading}
            onViewDetail={handleOpenDetailModal}
            onEditMedicine={handleOpenEditModal}
            onToggleStatus={handleOpenStatusModal}
          />
        </>
      )}

      {/* Tab 2: Categories View */}
      {activeTab === "categories" && (
        <CategoryTableView
          categories={categories}
          loading={loading}
          onRefreshData={fetchAllData}
          onAddToast={addToast}
          onViewNotification={setViewingNotification}
        />
      )}

      {/* Add / Edit Form Modal */}
      <MedicineFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveMedicine}
        initialData={editingMedicine}
        categories={categories}
        nextMedicineId={nextMedicineId}
      />

      {/* Detail Modal */}
      <MedicineDetailModal
        isOpen={!!viewingMedicine}
        medicine={viewingMedicine}
        categories={categories}
        onClose={() => setViewingMedicine(null)}
        onEdit={(med) => {
          setViewingMedicine(null);
          handleOpenEditModal(med);
        }}
      />

      {/* Status Lock/Toggle Modal */}
      <ConfirmStatusModal
        isOpen={!!statusTogglingMedicine}
        medicine={statusTogglingMedicine}
        onClose={() => setStatusTogglingMedicine(null)}
        onConfirm={handleConfirmStatusToggle}
      />

      {/* Dedicated Category Management Modal (Fallback) */}
      <CategoryManagementModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategoriesUpdated={fetchAllData}
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
