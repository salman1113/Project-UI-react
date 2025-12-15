import { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import { toast } from "react-toastify";
import { 
  FiUser, 
  FiShoppingCart, 
  FiHeart, 
  FiLogIn, 
  FiMenu, 
  FiX, 
  FiSettings, 
  FiLogOut, 
  FiBox 
} from "react-icons/fi";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State hooks
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [activePage, setActivePage] = useState("");
  
  // Refs
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  
  // Contexts
  const authContext = useContext(AuthContext);
  const cartContext = useContext(CartContext);
  const wishlistContext = useContext(WishlistContext);
  
  if (!authContext || !cartContext || !wishlistContext) return null;
  
  const { user, logoutUser } = authContext;
  const { cart } = cartContext;
  const { wishlist } = wishlistContext;

  const cartCount = cart?.length || 0;
  const wishlistCount = wishlist?.length || 0;

  // --- 🌟 PROFILE IMAGE LOGIC 🌟 ---
  // 1. Get Name: Use 'name' if available, otherwise 'username'
  const displayName = user?.name || user?.username || "User";
  
  // 2. Generate Image URL:
  // - If user has a Google image (user.image), show it.
  // - Else, generate an avatar using the first letter of their name.
  const userImage = user?.image 
    ? user.image 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=f4d58d&color=001427&bold=true&length=1`;

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && 
          !event.target.closest('button[aria-label="Mobile menu"]')) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setActivePage(location.pathname);
  }, [location]);

  const handleLogout = (e) => {
    e.preventDefault();
    logoutUser();
    toast.info("Logged out successfully!");
    navigate("/login");
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const getNavLinkClass = (path) => {
    return activePage === path ? "text-[#f4d58d] font-bold" : "text-[#708d81] hover:text-[#f4d58d]";
  };

  return (
    <nav className="bg-[#001427] text-[#708d81] py-4 px-6 relative border-b border-[#708d81]/20">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        
        {/* LOGO */}
        <Link to="/" className="text-[#f4d58d] font-bold text-xl tracking-wide" onClick={() => setActivePage("/")}>
          EchoBay
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center space-x-6 absolute left-1/2 transform -translate-x-1/2">
          <Link to="/" className={getNavLinkClass("/")} onClick={() => setActivePage("/")}>Home</Link>
          <Link to="/products" className={getNavLinkClass("/products")} onClick={() => setActivePage("/products")}>Products</Link>
          <Link to="/about" className={getNavLinkClass("/about")} onClick={() => setActivePage("/about")}>About</Link>
        </div>

        {/* RIGHT ICONS */}
        <div className="flex items-center space-x-4">
          
          {/* Wishlist & Cart */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/wishlist" className={`flex items-center relative ${getNavLinkClass("/wishlist")}`} onClick={() => setActivePage("/wishlist")}>
              <FiHeart size={20} className="mr-1" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#bf0603] text-[#f4d58d] text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            
            <Link to="/cart" className={`flex items-center relative ${getNavLinkClass("/cart")}`} onClick={() => setActivePage("/cart")}>
              <FiShoppingCart size={20} className="mr-1" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#bf0603] text-[#f4d58d] text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* --- USER PROFILE SECTION --- */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              
              {/* 1. Circle Avatar Button */}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  setIsUserDropdownOpen(!isUserDropdownOpen);
                }}
                className="flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#f4d58d] rounded-full p-0.5 border border-[#708d81]/50 transition-all hover:shadow-lg"
              >
                <img 
                  src={userImage} 
                  alt="Profile" 
                  className="h-9 w-9 rounded-full object-cover" 
                />
              </button>
              
              {/* 2. Dropdown Menu (Google Style) */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-[#001427] border border-[#708d81]/20 rounded-2xl shadow-2xl z-50 overflow-hidden text-sm">
                  
                  {/* User Info Header */}
                  <div className="px-6 py-5 flex flex-col items-center border-b border-[#708d81]/20 bg-[#001c3d]/50">
                    <img src={userImage} alt="User" className="h-16 w-16 rounded-full mb-3 border-2 border-[#f4d58d]" />
                    <p className="text-[#f4d58d] font-semibold text-lg">{displayName}</p>
                    <p className="text-[#708d81] text-xs mt-1">{user.email}</p>
                  </div>

                  {/* Menu Links */}
                  <div className="py-2">
                    <Link 
                      to="/orders" 
                      className="flex items-center px-6 py-3 text-[#708d81] hover:bg-[#708d81]/10 hover:text-[#f4d58d] transition-colors"
                      onClick={() => { setActivePage("/orders"); setIsUserDropdownOpen(false); }}
                    >
                      <FiBox className="mr-3 text-lg" /> My Orders
                    </Link>
                    <Link 
                      to="/settings" 
                      className="flex items-center px-6 py-3 text-[#708d81] hover:bg-[#708d81]/10 hover:text-[#f4d58d] transition-colors"
                      onClick={() => { setActivePage("/settings"); setIsUserDropdownOpen(false); }}
                    >
                      <FiSettings className="mr-3 text-lg" /> Settings
                    </Link>
                    
                    <div className="border-t border-[#708d81]/20 my-1"></div>
                    
                    <button onClick={handleLogout} className="w-full flex items-center px-6 py-3 text-[#bf0603] hover:bg-[#bf0603]/10 transition-colors text-left">
                      <FiLogOut className="mr-3 text-lg" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="bg-[#f4d58d] hover:bg-[#d4b56a] text-[#001427] px-4 py-2 rounded-lg font-bold flex items-center transition-colors shadow-md" onClick={() => setActivePage("/login")}>
              <FiLogIn className="mr-2" />
              <span className="hidden md:inline">Login</span>
            </Link>
          )}

          {/* MOBILE MENU TOGGLE */}
          <button 
            className="md:hidden text-[#708d81] hover:text-[#f4d58d] focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU CONTENT */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#001427] border-t border-[#708d81]/20 absolute top-full left-0 right-0 z-40 py-4 px-6 shadow-xl" ref={mobileMenuRef}>
          <div className="flex flex-col space-y-4">
            <Link to="/" className={getNavLinkClass("/")} onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link to="/products" className={getNavLinkClass("/products")} onClick={() => setIsMobileMenuOpen(false)}>Products</Link>
            <Link to="/about" className={getNavLinkClass("/about")} onClick={() => setIsMobileMenuOpen(false)}>About</Link>
            
            <Link to="/wishlist" className={getNavLinkClass("/wishlist")} onClick={() => setIsMobileMenuOpen(false)}>
              <div className="flex items-center"><FiHeart className="mr-2" /> Wishlist ({wishlistCount})</div>
            </Link>
            <Link to="/cart" className={getNavLinkClass("/cart")} onClick={() => setIsMobileMenuOpen(false)}>
              <div className="flex items-center"><FiShoppingCart className="mr-2" /> Cart ({cartCount})</div>
            </Link>

            {user && (
              <>
                <div className="border-t border-[#708d81]/20 my-2 pt-2">
                  <div className="flex items-center space-x-3 mb-3 px-2">
                     <img src={userImage} alt="User" className="h-8 w-8 rounded-full" />
                     <div>
                        <p className="text-[#f4d58d] text-sm font-bold">{displayName}</p>
                        <p className="text-[#708d81] text-xs">{user.email}</p>
                     </div>
                  </div>
                </div>
                <Link to="/orders" className={getNavLinkClass("/orders")} onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="flex items-center"> <FiBox className="mr-2" /> My Orders </div>
                </Link>
                <button onClick={handleLogout} className="text-[#bf0603] text-left flex items-center">
                   <FiLogOut className="mr-2" /> Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;