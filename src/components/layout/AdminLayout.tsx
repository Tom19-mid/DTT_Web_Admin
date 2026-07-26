import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-100">

      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">

        <Navbar />

        <div className="flex-1 overflow-y-auto">

          <Outlet />

        </div>

      </main>

    </div>
  );
}