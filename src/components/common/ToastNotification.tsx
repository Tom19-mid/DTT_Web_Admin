import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  title?: string;
  message: string;
  onClick?: () => void;
}

interface ToastItemProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Mount animation trigger
  useEffect(() => {
    const mountTimer = setTimeout(() => setIsMounted(true), 20);
    return () => clearTimeout(mountTimer);
  }, []);

  // Isolated independent 3000ms timer per toast that never resets on parent re-renders
  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 3000);

    const removeTimer = setTimeout(() => {
      onCloseRef.current(toast.id);
    }, 3400); // 3000ms display + 400ms smooth fade/slide out

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [toast.id]);

  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";

  const handleDismiss = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      onCloseRef.current(toast.id);
    }, 350);
  };

  const handleCardClick = () => {
    if (toast.onClick) {
      toast.onClick();
      handleDismiss();
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white border rounded-2xl shadow-xl p-4 pr-10 flex items-center gap-3.5 max-w-md w-full relative border-l-4 overflow-hidden transform transition-all duration-400 ease-out select-none ${
        isMounted && !isExiting
          ? "opacity-100 translate-x-0 scale-100 max-h-40"
          : "opacity-0 translate-x-12 scale-95 max-h-0 py-0 overflow-hidden pointer-events-none"
      } ${
        toast.onClick ? "cursor-pointer hover:shadow-2xl hover:scale-[1.02] group" : ""
      } ${
        isSuccess
          ? "border-emerald-200 border-l-emerald-500"
          : isError
          ? "border-rose-200 border-l-rose-500"
          : "border-blue-200 border-l-blue-500"
      }`}
    >
      {/* Icon */}
      {isSuccess && <CheckCircle2 className="text-emerald-500 shrink-0 group-hover:scale-110 transition duration-200" size={24} />}
      {isError && <AlertCircle className="text-rose-500 shrink-0 group-hover:scale-110 transition duration-200" size={24} />}
      {!isSuccess && !isError && <Info className="text-blue-500 shrink-0 group-hover:scale-110 transition duration-200" size={24} />}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className="font-bold text-sm text-gray-900 leading-tight flex items-center gap-1.5 flex-wrap">
            <span>{toast.title}</span>
            {toast.onClick && (
              <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                (Xem chi tiết)
              </span>
            )}
          </h4>
        )}
        <p className="text-sm font-medium text-gray-700 mt-0.5 break-words">{toast.message}</p>
      </div>

      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDismiss();
        }}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 rounded-xl p-1 hover:bg-gray-100 transition cursor-pointer"
        title="Đóng"
      >
        <X size={16} />
      </button>

      {/* Animated 3s progress bar indicator */}
      <div
        className={`absolute bottom-0 left-0 h-[3px] rounded-full transition-all ease-linear ${
          isSuccess ? "bg-emerald-500/30" : isError ? "bg-rose-500/30" : "bg-blue-500/30"
        } ${isMounted && !isExiting ? "w-0 duration-[3000ms]" : "w-full duration-0"}`}
      />
    </div>
  );
}

interface ToastNotificationProps {
  toasts?: ToastMessage[];
  toast?: ToastMessage | null;
  onClose: (id?: string) => void;
}

export default function ToastNotification({ toasts, toast, onClose }: ToastNotificationProps) {
  const activeToasts = toasts || (toast ? [toast] : []);

  if (activeToasts.length === 0) return null;

  return (
    <div className="fixed top-24 right-7 z-50 flex flex-col gap-3 pointer-events-auto max-w-md w-full">
      {activeToasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={(id) => onClose(id)} />
      ))}
    </div>
  );
}
