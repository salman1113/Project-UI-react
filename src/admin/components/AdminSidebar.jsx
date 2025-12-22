import { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext"; // Ensure path is correct
import { FiBox, FiUsers, FiShoppingBag, FiPieChart, FiX, FiLogOut, FiHome } from "react-icons/fi";

const AdminSidebar = ({ closeMobileMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext); // Get logout function

  const menuItems = [
    { path: "/admin", name: "Dashboard", icon: <FiPieChart /> },
    { path: "/admin/products", name: "Products", icon: <FiBox /> },
    { path: "/admin/orders", name: "Orders", icon: <FiShoppingBag /> },
    { path: "/admin/users", name: "Users", icon: <FiUsers /> },
  ];

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/login");
      closeMobileMenu();
    }
  };

  return (
    <aside className="flex flex-col w-64 bg-[#001427] border-r border-[#708d81]/20 h-full shadow-2xl">
      
      {/* 1. LOGO AREA */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-[#708d81]/20">
        <h1 className="text-xl font-bold text-[#f4d58d] tracking-wider">
          ECHO<span className="text-[#bf0603]">BAY</span>
        </h1>
        {/* Mobile Close Button */}
        <button onClick={closeMobileMenu} className="md:hidden text-[#708d81] hover:text-white">
          <FiX size={24} />
        </button>
      </div>

      {/* 2. MAIN NAVIGATION */}
      <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = item.path === "/admin"
              ? location.pathname === "/admin"
              : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                isActive
                  ? "bg-[#bf0603] text-white shadow-lg shadow-red-900/20"
                  : "text-[#708d81] hover:bg-[#001c3d] hover:text-[#f4d58d]"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* 3. BOTTOM ACTIONS (Home & Logout) */}
      <div className="p-4 border-t border-[#708d81]/20 space-y-2">
        
        {/* Go to Store Link */}
        <Link 
          to="/" 
          className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-[#f4d58d] hover:bg-[#f4d58d]/10 rounded-lg transition-colors"
        >
          <FiHome size={18} />
          <span>Go to Store</span>
        </Link>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left"
        >
          <FiLogOut size={18} />
          <span>Logout</span>
        </button>

        <p className="text-[10px] text-[#708d81] opacity-40 text-center pt-4">
          © 2025 EchoBay Admin
        </p>
      </div>

    </aside>
  );
};

export default AdminSidebar;