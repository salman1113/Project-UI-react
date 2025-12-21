import { Link, useLocation } from "react-router-dom";
import { FiBox, FiUsers, FiShoppingBag, FiPieChart, FiX } from "react-icons/fi";

const AdminSidebar = ({ closeMobileMenu }) => { // 👈 closeMobileMenu prop ചേർത്തു
  const location = useLocation();

  const menuItems = [
    { path: "/admin", name: "Dashboard", icon: <FiPieChart /> },
    { path: "/admin/products", name: "Products", icon: <FiBox /> },
    { path: "/admin/orders", name: "Orders", icon: <FiShoppingBag /> },
    { path: "/admin/users", name: "Users", icon: <FiUsers /> },
  ];

  return (
    <aside className="flex flex-col w-64 bg-[#001427] border-r border-[#708d81]/20 h-full shadow-2xl">
      {/* LOGO AREA */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-[#708d81]/20">
        <h1 className="text-xl font-bold text-[#f4d58d] tracking-wider">
          ECHO<span className="text-[#bf0603]">BAY</span>
        </h1>
        {/* 📱 Mobile Close Button */}
        <button onClick={closeMobileMenu} className="md:hidden text-[#708d81]">
            <FiX size={24} />
        </button>
      </div>

      {/* NAVIGATION LINKS */}
      <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = 
            item.path === "/admin" 
              ? location.pathname === "/admin" 
              : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMobileMenu} // 👈 ക്ലിക്ക് ചെയ്താൽ മൊബൈലിൽ മെനു താനേ അടയും
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                isActive
                  ? "bg-[#bf0603] text-white shadow-lg"
                  : "text-[#708d81] hover:bg-[#001c3d] hover:text-[#f4d58d]"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-[#708d81]/20 text-center">
        <p className="text-[10px] text-[#708d81] opacity-60">© 2025 EchoBay Admin</p>
      </div>
    </aside>
  );
};

export default AdminSidebar;