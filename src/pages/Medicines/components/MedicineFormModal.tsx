import { useState } from "react";
import { X, Save } from "lucide-react";
import type { Medicine, MedicineCategory } from "../types";

interface MedicineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medicineData: Medicine) => void;
  initialData?: Medicine | null;
  categories: MedicineCategory[];
  nextMedicineId: number;
}

export default function MedicineFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories,
  nextMedicineId,
}: MedicineFormModalProps) {
  const [categoryId, setCategoryId] = useState<number>(1);
  const [medicineName, setMedicineName] = useState<string>("");
  const [unit, setUnit] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [defaultUsage, setDefaultUsage] = useState<string>("");
  const [unitPrice, setUnitPrice] = useState<number | "">("");
  const [expiryDate, setExpiryDate] = useState<string>("");

  // Track props changes for initial form state reset
  const [prevInitialData, setPrevInitialData] = useState<Medicine | null | undefined>(undefined);
  const [prevIsOpen, setPrevIsOpen] = useState(false);

  if (initialData !== prevInitialData || isOpen !== prevIsOpen) {
    setPrevInitialData(initialData);
    setPrevIsOpen(isOpen);
    if (initialData) {
      setCategoryId(initialData.categoryId);
      setMedicineName(initialData.medicineName);
      setUnit(initialData.unit);
      setDescription(initialData.description);
      setDefaultUsage(initialData.defaultUsage);
      setUnitPrice(initialData.unitPrice);
      setExpiryDate(initialData.expiryDate);
    } else {
      setCategoryId(1);
      setMedicineName("");
      setUnit("");
      setDescription("");
      setDefaultUsage("");
      setUnitPrice("");
      setExpiryDate("");
    }
  }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineName.trim()) {
      alert("Vui lòng nhập Tên thuốc!");
      return;
    }

    onSave({
      medicineId: initialData?.medicineId ?? nextMedicineId,
      categoryId: Number(categoryId),
      medicineName: medicineName.trim(),
      unit: unit.trim(),
      description: description.trim(),
      defaultUsage: defaultUsage.trim(),
      unitPrice: Number(unitPrice) || 0,
      stockQuantity: initialData ? initialData.stockQuantity : 0,
      expiryDate: initialData ? initialData.expiryDate : expiryDate,
      status: initialData?.status || "Đang hoạt động",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {initialData ? "Chỉnh sửa thông tin thuốc" : "Thêm thuốc mới"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Nhập đầy đủ thông tin thuốc vào hệ thống
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mã nhóm thuốc */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Mã nhóm thuốc <span className="text-rose-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white transition-all cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  ID: {cat.categoryId} ({cat.categoryName})
                </option>
              ))}
            </select>
          </div>

          {/* Tên thuốc */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tên thuốc <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              placeholder="VD: Paracetamol 500mg, Amoxicillin..."
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Đơn vị tính */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Đơn vị tính <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Nhập đơn vị tính (Viên, Gói, Chai...)"
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            {/* Đơn giá */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Đơn giá (VNĐ) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Nhập đơn giá (VD: 5000)"
                min={0}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả công dụng chính của thuốc..."
              rows={2}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
            />
          </div>

          {/* Hướng dẫn sử dụng */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Hướng dẫn sử dụng
            </label>
            <textarea
              value={defaultUsage}
              onChange={(e) => setDefaultUsage(e.target.value)}
              placeholder="VD: Uống 1 viên khi sốt hoặc đau, Uống sau bữa ăn..."
              rows={2}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
            />
          </div>

          {/* Hạn sử dụng (chỉ hiển thị khi Thêm thuốc mới) */}
          {!initialData && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Hạn sử dụng <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition cursor-pointer text-base"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition cursor-pointer text-base"
            >
              <Save size={18} />
              <span>{initialData ? "Cập nhật" : "Lưu thuốc"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
