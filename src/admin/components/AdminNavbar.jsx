import { useContext, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext, useAxios } from "../../context/AuthContext";
import { FiSearch, FiLogOut, FiUser, FiMenu, FiSend } from "react-icons/fi";
import SendNotificationModal from "./SendNotificationModal";

const AdminNavbar = ({ onMenuClick }) => {
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/admin/products?search=${searchQuery}`);
    }
  };

  return (
    <>
      <nav className="h-16 bg-[#001427]/90 backdrop-blur-md border-b border-[#708d81]/20 flex justify-between items-center px-6 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="md:hidden text-[#f4d58d] text-2xl hover:bg-[#001c3d] p-1 rounded">
            <FiMenu />
          </button>

          <div className="hidden md:flex items-center bg-[#001c3d] rounded-lg px-4 py-2 border border-[#708d81]/20 w-64 focus-within:border-[#f4d58d] transition-all duration-300">
            <FiSearch className="text-[#708d81]" />
            <input
              type="text"
              placeholder="Search products..."
              className="bg-transparent border-none outline-none text-[#f2e8cf] text-sm ml-3 w-full placeholder-gray-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-3 group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-[#f2e8cf]">{user?.username || "Admin"}</p>
                <p className="text-xs text-[#708d81]">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#bf0603] to-[#f4d58d] p-[2px]">
                <div className="w-full h-full rounded-full bg-[#001427] flex items-center justify-center overflow-hidden">
                  {user?.image ? <img src={user.image} alt="Admin" className="w-full h-full object-cover" /> : <span className="text-[#f4d58d] font-bold">A</span>}
                </div>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-[#001c3d] border border-[#708d81]/20 rounded-xl shadow-2xl py-2 z-50">
                <div className="px-4 py-2 border-b border-[#708d81]/20">
                  <p className="text-[#708d81] text-xs truncate">{user?.email}</p>
                </div>
                
                <button className="w-full text-left px-4 py-2 text-[#708d81] hover:bg-[#001427] hover:text-[#f4d58d] flex items-center gap-3 text-sm transition-colors">
                  <FiUser /> My Profile
                </button>
                
                <button 
                  onClick={() => { setIsModalOpen(true); setShowProfileMenu(false); }}
                  className="w-full text-left px-4 py-2 text-[#708d81] hover:bg-[#001427] hover:text-[#f4d58d] flex items-center gap-3 text-sm transition-colors"
                >
                  <FiSend /> Send Notification
                </button>

                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-400 hover:bg-[#001427] flex items-center gap-3 text-sm transition-colors">
                  <FiLogOut /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <SendNotificationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default AdminNavbar;