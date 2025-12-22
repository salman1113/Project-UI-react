import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import { FiMenu } from "react-icons/fi";

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    // 1. Parent: Full Screen Height, No Body Scroll
    <div className="flex h-screen w-full bg-[#001427] overflow-hidden relative">

      {/* 2. Sidebar Section */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-[#001427] border-r border-[#708d81]/20 
          transition-transform duration-300 ease-in-out transform 
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:relative md:translate-x-0 md:flex-shrink-0
        `}
      >
        <AdminSidebar closeMobileMenu={() => setSidebarOpen(false)} />
      </div>

      {/* Mobile Overlay (Dark Background when Sidebar is open) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* 3. Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        
        {/* Navbar (Fixed at Top of Content Area) */}
        <div className="flex-shrink-0">
          <AdminNavbar onMenuClick={() => setSidebarOpen(!isSidebarOpen)} />
        </div>

        {/* 4. Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-[#708d81]/30 scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto pb-20">
            <Outlet />
          </div>
        </main>

      </div>

      {/* Mobile Toggle Button (Floating) */}
      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed bottom-6 right-6 z-50 p-4 bg-[#f4d58d] text-[#001427] rounded-full shadow-2xl hover:scale-110 transition-transform"
      >
        <FiMenu size={24} />
      </button>

    </div>
  );
};

export default AdminLayout;