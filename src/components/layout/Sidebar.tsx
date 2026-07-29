import { NavLink, useNavigate } from "react-router-dom";
import DTT_Healthcare from "../../assets/images/DTT_Healthcare.jpg";
import {
  LayoutDashboard,
  Users,
  UserRound,
  Stethoscope,
  HeartPulse,
  Pill,
  CalendarDays,
  CalendarClock,
  Bell,
  LogOut,
  ChevronRight,
} from "lucide-react";

const menus = [
  {
    title: "Bảng điều khiển",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    title: "Quản lý tài khoản",
    icon: Users,
    path: "/users",
  },
  {
    title: "Quản lý bệnh nhân",
    icon: UserRound,
    path: "/patients",
  },
  {
    title: "Quản lý bác sĩ",
    icon: Stethoscope,
    path: "/doctors",
  },
  {
    title: "Quản lý chuyên khoa",
    icon: HeartPulse,
    path: "/specialties",
  },
  {
    title: "Quản lý thuốc",
    icon: Pill,
    path: "/medicines",
  },
  {
    title: "Quản lý lịch hẹn",
    icon: CalendarDays,
    path: "/appointments",
  },
  {
    title: "Lịch làm việc của bác sĩ",
    icon: CalendarClock,
    path: "/work-schedules",
  },
  {
    title: "Thông báo",
    icon: Bell,
    path: "/notifications",
  },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <aside className="w-72 bg-blue-900 text-white flex flex-col h-screen select-none shrink-0">
      {/* Header */}
      <div className="h-24 flex items-center px-4 border-b border-white">
        <div className="w-18 h-18 rounded-2xl overflow-hidden bg-white flex items-center justify-center shrink-0 border border-white/20">
          <img src={DTT_Healthcare} alt="Logo" className="w-full h-full object-cover" />
        </div>

        <div className="ml-3 min-w-0">
          <h2 className="text-[18px] font-bold text-white leading-tight whitespace-nowrap">Đặt lịch khám bệnh</h2>
          <p className="text-[16px] text-blue-300 mt-0.5 font-medium">Trang quản trị</p>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {menus.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.title}
              to={item.path}
              className={({ isActive }) => `
                w-full
                flex
                items-center
                gap-3
                px-4
                py-3.5
                rounded-2xl
                transition-all
                duration-200
                text-base
                font-semibold
                ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-blue-100 hover:bg-blue-800/60 hover:text-white"
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} className="shrink-0" />
                  <span className="truncate">{item.title}</span>
                  {isActive && <ChevronRight size={18} className="ml-auto shrink-0" />}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-white p-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-red-300 hover:bg-blue-800/60 hover:text-red-200 font-bold rounded-2xl transition cursor-pointer"
        >
          <LogOut size={20} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
