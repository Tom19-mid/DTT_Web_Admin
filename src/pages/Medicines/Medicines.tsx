import { useState, useEffect } from "react";
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
      if (targetId && editingMedicine) {
        await medicineApi.update(targetId, payload);
      } else {
        await medicineApi.create(payload);
      }
      await fetchAllData();
    } catch (err: any) {
      alert(err.message || "Lỗi khi lưu thông tin thuốc!");
    }
  };

  // Confirm status toggle action (khóa / mở với hình ổ khóa màu vàng)
  const handleConfirmStatusToggle = async () => {
    if (statusTogglingMedicine) {
      try {
        const targetId =
          statusTogglingMedicine.medicineId || statusTogglingMedicine.id!;
        const currentActive =
          statusTogglingMedicine.status === "Đang hoạt động" ||
          statusTogglingMedicine.status === "Active";
        const nextStatus = currentActive ? "Inactive" : "Active";

        await medicineApi.toggleStatus(targetId, nextStatus);
        await fetchAllData();
      } catch (err: any) {
        alert(err.message || "Lỗi khi đổi trạng thái thuốc!");
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
    <div className="p-7 bg-[#f4f6f9] min-h-screen">
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
    </div>
  );
}
