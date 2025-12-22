import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";   // ✅ Assumes in same folder
import AdminSidebar from "./AdminSidebar"; // ✅ Assumes in same folder
import { FiMenu } from "react-icons/fi";

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#001427] relative">

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed bottom-6 right-6 z-50 p-4 bg-[#f4d58d] text-[#001427] rounded-full shadow-2xl"
      >
        <FiMenu size={24} />
      </button>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 transition-transform duration-300 transform
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:static md:w-64
      `}>
        <AdminSidebar closeMobileMenu={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <AdminNavbar onMenuClick={() => setSidebarOpen(!isSidebarOpen)} />

        {/* Page Content (Outlet) */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden min-w-0 bg-[#001427]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;