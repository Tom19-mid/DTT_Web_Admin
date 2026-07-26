import { Bell, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Avarta from "../../assets/images/Avarta.png";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <header className="h-20 bg-white flex items-center justify-between px-8 shadow-sm border-b border-gray-200/80 sticky top-0 z-10">
      {/* Search */}
      <div className="relative">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="w-96 bg-gray-100/80 hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 rounded-full py-2.5 pl-12 pr-4 text-base text-gray-800 outline-none transition-all placeholder:text-gray-400"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => navigate("/notifications")}
          title="Thông báo"
          className="relative p-2.5 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full transition cursor-pointer"
        >
          <Bell size={22} />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div className="h-8 border-l border-gray-200" />

        <div className="flex items-center gap-3.5 cursor-pointer select-none">
          <div className="w-12 h-12 rounded-full bg-white overflow-hidden shrink-0 border-2 border-gray-200/80 shadow-sm flex items-center justify-center">
            <img src={Avarta} alt="Avatar" className="w-full h-full object-cover object-center" />
          </div>

          <div>
            <p className="font-bold text-base text-gray-900 leading-tight">Quản trị</p>
            <p className="text-sm text-gray-500 mt-0.5 font-medium">Quản trị viên</p>
          </div>
        </div>
      </div>
    </header>
  );
}
