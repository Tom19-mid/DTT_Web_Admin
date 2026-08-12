import { useState, useEffect } from "react";
import { X, Plus, Edit2, Lock, Unlock, Boxes, Save, Loader2 } from "lucide-react";
import type { MedicineCategory } from "../types";
import medicineApi from "../../../api/medicineApi";

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoriesUpdated: () => void;
}

export default function CategoryManagementModal({
  isOpen,
  onClose,
  onCategoriesUpdated,
}: CategoryManagementModalProps) {
  const [categories, setCategories] = useState<MedicineCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form mode state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MedicineCategory | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<string>("Đang hoạt động");

  const fetchCategoriesList = async () => {
    setLoading(true);
    try {
      const data = await medicineApi.getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Lỗi lấy danh mục thuốc:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategoriesList();
      setIsFormOpen(false);
      setEditingCategory(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOpenAddForm = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setStatus("Đang hoạt động");
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (category: MedicineCategory) => {
    setEditingCategory(category);
    setName(category.categoryName || category.name || "");
    setDescription(category.description || "");
    setStatus(category.status || "Đang hoạt động");
    setIsFormOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Vui lòng nhập Tên danh mục thuốc!");
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        const id = editingCategory.categoryId || editingCategory.id!;
        await medicineApi.updateCategory(id, {
          categoryName: name.trim(),
          description: description.trim(),
          status: status === "Ngưng hoạt động" ? "Inactive" : "Active",
        });
      } else {
        await medicineApi.createCategory({
          categoryName: name.trim(),
          description: description.trim(),
          status: status === "Ngưng hoạt động" ? "Inactive" : "Active",
        });
      }
      setIsFormOpen(false);
      await fetchCategoriesList();
      onCategoriesUpdated();
    } catch (err: any) {
      alert(err.message || "Lỗi khi lưu danh mục thuốc!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (category: MedicineCategory) => {
    const id = category.categoryId || category.id!;
    const isCurrentActive = category.status === "Đang hoạt động" || category.status === "Active";
    const nextStatus = isCurrentActive ? "Inactive" : "Active";
    const confirmMsg = isCurrentActive
      ? `Bạn có chắc chắn muốn ngưng hoạt động danh mục "${category.categoryName || category.name}" không?`
      : `Mở lại hoạt động cho danh mục "${category.categoryName || category.name}"?`;

    if (window.confirm(confirmMsg)) {
      try {
        await medicineApi.toggleCategoryStatus(id, nextStatus);
        await fetchCategoriesList();
        onCategoriesUpdated();
      } catch (err: any) {
        alert(err.message || "Lỗi khi đổi trạng thái danh mục!");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative animate-in fade-in zoom-in duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl">
              <Boxes size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Quản lý danh mục thuốc</h2>
              <p className="text-xs text-gray-500">
                Thêm, sửa, ngưng hoạt động các nhóm danh mục thuốc phân loại trong hệ thống
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Add Category Trigger / Sub-form Header */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-600">
              Tổng số danh mục: <strong className="text-purple-600">{categories.length}</strong>
            </span>
            {!isFormOpen && (
              <button
                onClick={handleOpenAddForm}
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition cursor-pointer shadow-xs active:scale-95"
              >
                <Plus size={16} />
                <span>Thêm danh mục mới</span>
              </button>
            )}
          </div>

          {/* Inline Form Add/Edit */}
          {isFormOpen && (
            <form onSubmit={handleSubmitForm} className="bg-purple-50/60 p-5 rounded-2xl border border-purple-100 space-y-4">
              <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                <h3 className="font-bold text-purple-900 text-base">
                  {editingCategory ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer font-medium"
                >
                  Đóng form
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Tên danh mục <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Thuốc Kháng sinh & Kháng viêm"
                    required
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm bg-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm bg-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 cursor-pointer font-medium"
                  >
                    <option value="Đang hoạt động">Đang hoạt động</option>
                    <option value="Ngưng hoạt động">Ngưng hoạt động</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Mô tả danh mục
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="VD: Nhóm thuốc dùng trong điều trị tai mũi họng, hô hấp..."
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm bg-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-gray-600 font-bold hover:bg-white text-xs transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  <span>{editingCategory ? "Cập nhật" : "Lưu danh mục"}</span>
                </button>
              </div>
            </form>
          )}

          {/* Categories Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100/80 text-gray-700 font-bold">
                  <th className="py-3 px-4 text-center w-14">STT</th>
                  <th className="py-3 px-4">Tên danh mục</th>
                  <th className="py-3 px-4">Mô tả</th>
                  <th className="py-3 px-4 text-center">Số loại thuốc</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-center w-28">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                        <span>Đang tải danh mục...</span>
                      </div>
                    </td>
                  </tr>
                ) : categories.length > 0 ? (
                  categories.map((cat, idx) => {
                    const isActive = cat.status === "Đang hoạt động" || cat.status === "Active";
                    return (
                      <tr key={cat.categoryId || cat.id} className="hover:bg-gray-50/80 transition">
                        <td className="py-3 px-4 text-center font-semibold text-gray-500">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-gray-900">{cat.categoryName || cat.name}</td>
                        <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{cat.description || "—"}</td>
                        <td className="py-3 px-4 text-center font-bold text-purple-700">
                          {cat.medicineCount ?? 0}
                        </td>
                        <td className="py-3 px-4">
                          {isActive ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                              Đang hoạt động
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">
                              Ngưng hoạt động
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Nút Sửa */}
                            <button
                              onClick={() => handleOpenEditForm(cat)}
                              title="Chỉnh sửa danh mục"
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            >
                              <Edit2 size={16} />
                            </button>

                            {/* Nút Ổ Khóa Màu Vàng đổi trạng thái (Inactive) theo yêu cầu người dùng */}
                            <button
                              onClick={() => handleToggleStatus(cat)}
                              title={isActive ? "Khóa / Ngưng hoạt động danh mục" : "Kích hoạt lại danh mục"}
                              className={`p-1.5 rounded-lg transition cursor-pointer ${
                                isActive
                                  ? "text-amber-500 hover:bg-amber-50"
                                  : "text-emerald-600 hover:bg-emerald-50"
                              }`}
                            >
                              {isActive ? <Lock size={16} /> : <Unlock size={16} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500 font-medium">
                      Chưa có danh mục thuốc nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-sm transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
