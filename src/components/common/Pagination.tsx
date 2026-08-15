import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  itemLabel?: string;
  maxVisiblePages?: number;
}

export function getVisiblePageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible: number = 5
): number[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = start + maxVisible - 1;

  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - maxVisible + 1);
  }

  const pages: number[] = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  itemLabel = "mục",
  maxVisiblePages = 5,
}: PaginationProps) {
  if (totalPages <= 0) return null;

  const visiblePages = getVisiblePageNumbers(
    currentPage,
    totalPages,
    maxVisiblePages
  );

  const startItem =
    totalItems !== undefined && itemsPerPage
      ? (currentPage - 1) * itemsPerPage + 1
      : null;
  const endItem =
    totalItems !== undefined && itemsPerPage
      ? Math.min(currentPage * itemsPerPage, totalItems)
      : null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-100 text-base text-gray-600">
      {totalItems !== undefined && startItem !== null && endItem !== null ? (
        <div>
          Hiển thị <span className="font-bold text-gray-900">{startItem}</span> -{" "}
          <span className="font-bold text-gray-900">{endItem}</span> trên{" "}
          <span className="font-bold text-gray-900">{totalItems}</span> {itemLabel}
        </div>
      ) : (
        <div>
          Trang <span className="font-bold text-gray-900">{currentPage}</span> /{" "}
          <span className="font-bold text-gray-900">{totalPages}</span>
        </div>
      )}

      <div className="flex items-center gap-1.5 select-none">
        {/* Nút trang đầu << */}
        <button
          type="button"
          title="Trang đầu"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition text-gray-600 active:scale-95"
        >
          <ChevronsLeft size={18} />
        </button>

        {/* Nút trang trước < */}
        <button
          type="button"
          title="Trang trước"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition text-gray-600 active:scale-95"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Các nút số trang (Tối đa 5 trang) */}
        {visiblePages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`min-w-[38px] h-[38px] px-3 rounded-xl font-bold text-base cursor-pointer transition flex items-center justify-center ${
              currentPage === page
                ? "bg-blue-600 text-white shadow-xs"
                : "border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-95"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Nút trang sau > */}
        <button
          type="button"
          title="Trang sau"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition text-gray-600 active:scale-95"
        >
          <ChevronRight size={18} />
        </button>

        {/* Nút trang cuối >> */}
        <button
          type="button"
          title="Trang cuối"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition text-gray-600 active:scale-95"
        >
          <ChevronsRight size={18} />
        </button>
      </div>
    </div>
  );
}
