import { useContext, useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext, useAxios } from "../context/AuthContext"; 
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
  FiBox,
  FiChevronRight,
  FiLoader,
  FiBell,
  FiInbox,
  FiLayout // ✅ 1. Added FiLayout icon
} from "react-icons/fi";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const api = useAxios();

  // --- STATE HOOKS ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [activePage, setActivePage] = useState("");

  // Product Data States
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Notification State
  const [notifications, setNotifications] = useState([]);

  // --- REFS ---
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // --- CONTEXTS ---
  const authContext = useContext(AuthContext);
  const cartContext = useContext(CartContext);
  const wishlistContext = useContext(WishlistContext);

  const getProductImage = (product) => {
    if (product?.images && product.images.length > 0) {
      const firstImg = product.images[0];
      if (typeof firstImg === 'object' && firstImg.url) return firstImg.url;
      if (typeof firstImg === 'string') return firstImg;
    }
    if (product?.image) return product.image;
    return "https://via.placeholder.com/150?text=No+Image";
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://3.26.180.53/api/products/");
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        if (Array.isArray(data)) setProducts(data);
        else if (data.results && Array.isArray(data.results)) setProducts(data.results);
        else if (data.products && Array.isArray(data.products)) setProducts(data.products);
        else setProducts([]);
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // 🔔 Fetch Notifications
  useEffect(() => {
    if (authContext?.user) {
      api.get("/notifications/").then((res) => {
        setNotifications(res.data);
      }).catch(() => {});
    }
  }, [authContext?.user, location.pathname]);

  // --- DATA PROCESSING ---
  const categories = useMemo(() => {
    if (!products.length) return [];
    const cats = products.map(item => item.category).filter(Boolean);
    return [...new Set(cats)];
  }, [products]);

  const featuredProducts = useMemo(() => {
    if (!products.length) return [];
    return [...products].sort((a, b) => (b.count || 0) - (a.count || 0)).slice(0, 3);
  }, [products]);

  if (!authContext || !cartContext || !wishlistContext) return null;

  const { user, logoutUser } = authContext;
  const { cart } = cartContext;
  const { wishlist } = wishlistContext;

  const cartCount = cart?.length || 0;
  const wishlistCount = wishlist?.length || 0;
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const displayName = user?.name || user?.username || "User";
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=f4d58d&color=001427&bold=true&length=1`;
  const userImage = user?.image ? user.image : defaultAvatar;

  // Click Outside Listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsUserDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotifDropdownOpen(false);
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('button[aria-label="Mobile menu"]')) {
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

  const getNavLinkClass = (path) => activePage === path ? "text-[#f4d58d] font-bold" : "text-[#708d81] hover:text-[#f4d58d]";

  return (
    <nav className="bg-[#001427] text-[#708d81] py-4 px-6 relative border-b border-[#708d81]/20 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">

        {/* LOGO */}
        <Link to="/" className="text-[#f4d58d] font-bold text-xl tracking-wide z-50" onClick={() => setActivePage("/")}>
          EchoBay
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2 h-full">
          <Link to="/" className={getNavLinkClass("/")} onClick={() => setActivePage("/")}>Home</Link>
          <div
            className="relative h-full flex items-center group"
            onMouseEnter={() => setIsProductDropdownOpen(true)}
            onMouseLeave={() => setIsProductDropdownOpen(false)}
          >
            <div className="py-4 cursor-pointer">
              <Link to="/products" className={getNavLinkClass("/products")} onClick={() => setActivePage("/products")}>
                Products
              </Link>
            </div>
            {isProductDropdownOpen && (
              <div className="absolute top-full -left-40 w-[600px] bg-[#001427] border border-[#708d81]/30 rounded-xl shadow-2xl p-6 z-[100] transition-all duration-200 ease-in-out mt-1">
                {isLoading ? (
                  <div className="flex items-center justify-center h-40 text-[#f4d58d]">
                    <FiLoader className="animate-spin text-2xl mr-2" /> Loading Products...
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-8 text-[#708d81]">No products found.</div>
                ) : (
                  <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-4 border-r border-[#708d81]/20 pr-4">
                      <h3 className="text-[#f4d58d] font-bold mb-4 uppercase text-xs tracking-wider">Categories</h3>
                      <ul className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                        {categories.map((cat, index) => (
                          <li key={index}>
                            <Link to={`/products?category=${encodeURIComponent(cat)}`} className="block text-sm text-[#708d81] hover:text-[#f4d58d] flex items-center justify-between group/item" onClick={() => setIsProductDropdownOpen(false)}>
                              {cat} <FiChevronRight className="opacity-0 group-hover/item:opacity-100 transition-opacity text-xs" />
                            </Link>
                          </li>
                        ))}
                        <li className="mt-4 pt-2 border-t border-[#708d81]/20">
                          <Link to="/products" className="text-[#f4d58d] text-sm font-semibold hover:underline">View All Products</Link>
                        </li>
                      </ul>
                    </div>
                    <div className="col-span-8 pl-2">
                      <h3 className="text-[#f4d58d] font-bold mb-4 uppercase text-xs tracking-wider">Top Selling</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {featuredProducts.map((product) => (
                          <Link key={product.id} to={`/products/${product.id}`} className="group/card block bg-[#001c3d]/50 p-2 rounded-lg hover:bg-[#708d81]/10 transition-colors border border-transparent hover:border-[#708d81]/20" onClick={() => setIsProductDropdownOpen(false)}>
                            <div className="h-24 w-full bg-white rounded-md mb-2 overflow-hidden flex items-center justify-center p-1 relative">
                              <img src={getProductImage(product)} alt={product.name} className="h-full w-auto object-contain group-hover/card:scale-110 transition-transform duration-300" onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=Error"; }} />
                            </div>
                            <p className="text-white text-xs font-medium truncate" title={product.name}>{product.name}</p>
                            <p className="text-[#f4d58d] text-xs font-bold">₹{Number(product.price).toLocaleString()}</p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <Link to="/about" className={getNavLinkClass("/about")} onClick={() => setActivePage("/about")}>About</Link>
          
          {/* ✅ 2. ADMIN PANEL BUTTON (Visible only to Admin) */}
          {user?.is_superuser && (
              <Link 
                to="/admin" 
                className="flex items-center gap-2 bg-[#bf0603] text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-red-700 transition-all shadow-md border border-red-500/50"
              >
                <FiLayout /> Admin
              </Link>
          )}

        </div>

        {/* RIGHT ICONS */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/wishlist" className={`flex items-center relative ${getNavLinkClass("/wishlist")}`} onClick={() => setActivePage("/wishlist")}>
              <FiHeart size={20} className="mr-1" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#bf0603] text-[#f4d58d] text-xs rounded-full h-5 w-5 flex items-center justify-center">{wishlistCount}</span>
              )}
            </Link>

            <Link to="/cart" className={`flex items-center relative ${getNavLinkClass("/cart")}`} onClick={() => setActivePage("/cart")}>
              <FiShoppingCart size={20} className="mr-1" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#bf0603] text-[#f4d58d] text-xs rounded-full h-5 w-5 flex items-center justify-center">{cartCount}</span>
              )}
            </Link>
          </div>
          
          {/* 🔔 NOTIFICATION BELL - PROFESSIONAL LOOK */}
          {user && (
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                className="relative text-[#708d81] hover:text-[#f4d58d] focus:outline-none mt-1 transition-colors"
              >
                <FiBell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#bf0603] text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-md animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifDropdownOpen && (
                <div className="absolute right-0 mt-4 w-80 bg-[#001c3d] border border-[#708d81]/20 rounded-xl shadow-2xl z-50 overflow-hidden ring-1 ring-black/5 transform origin-top-right transition-all">
                  
                  {/* Header */}
                  <div className="px-5 py-4 border-b border-[#708d81]/20 bg-[#001427] flex justify-between items-center">
                    <h3 className="text-[#f4d58d] font-bold text-sm tracking-wide">Notifications</h3>
                    <Link 
                      to="/notifications" 
                      onClick={() => setIsNotifDropdownOpen(false)} 
                      className="text-xs text-[#708d81] hover:text-[#f4d58d] transition-colors font-medium"
                    >
                      View All
                    </Link>
                  </div>

                  {/* List */}
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar bg-[#001c3d]">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 5).map((n) => (
                        <div 
                          key={n.id} 
                          onClick={() => {
                            navigate('/notifications');
                            setIsNotifDropdownOpen(false);
                          }}
                          className={`px-5 py-4 border-b border-[#708d81]/10 cursor-pointer transition-colors group ${
                            n.is_read ? 'bg-transparent' : 'bg-[#001427]/50'
                          } hover:bg-[#001427]`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <p className={`text-sm font-semibold truncate pr-2 ${n.is_read ? 'text-[#708d81]' : 'text-[#f2e8cf]'}`}>
                              {n.title}
                            </p>
                            {!n.is_read && (
                              <span className="h-2 w-2 rounded-full bg-[#bf0603] flex-shrink-0 mt-1.5 shadow-[0_0_4px_#bf0603]"></span>
                            )}
                          </div>
                          <p className={`text-xs line-clamp-2 leading-relaxed ${n.is_read ? 'text-gray-600' : 'text-[#708d81] group-hover:text-[#f2e8cf]/80'}`}>
                            {n.message}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                        <div className="bg-[#001427] p-3 rounded-full mb-3">
                           <FiInbox className="text-[#708d81] text-xl" />
                        </div>
                        <p className="text-[#f2e8cf] text-sm font-medium">No new notifications</p>
                        <p className="text-[#708d81] text-xs mt-1">You're all caught up!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* USER DROPDOWN */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button onClick={(e) => { e.preventDefault(); setIsUserDropdownOpen(!isUserDropdownOpen); }} className="flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#f4d58d] rounded-full p-0.5 border border-[#708d81]/50 transition-all hover:shadow-lg">
                <img src={userImage} alt="Profile" className="h-9 w-9 rounded-full object-cover" referrerPolicy="no-referrer" onError={(e) => { if (e.target.src !== defaultAvatar) { e.target.onerror = null; e.target.src = defaultAvatar; } }} />
              </button>
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-[#001427] border border-[#708d81]/20 rounded-2xl shadow-2xl z-50 overflow-hidden text-sm">
                  <div className="px-6 py-5 flex flex-col items-center border-b border-[#708d81]/20 bg-[#001c3d]/50">
                    <img src={userImage} alt="User" className="h-16 w-16 rounded-full mb-3 border-2 border-[#f4d58d]" onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }} />
                    <p className="text-[#f4d58d] font-semibold text-lg">{displayName}</p>
                    <p className="text-[#708d81] text-xs mt-1">{user.email}</p>
                  </div>
                  <div className="py-2">
                    <Link to="/orders" className="flex items-center px-6 py-3 text-[#708d81] hover:bg-[#708d81]/10 hover:text-[#f4d58d] transition-colors" onClick={() => { setActivePage("/orders"); setIsUserDropdownOpen(false); }}>
                      <FiBox className="mr-3 text-lg" /> My Orders
                    </Link>
                    <Link to="/notifications" className="flex items-center px-6 py-3 text-[#708d81] hover:bg-[#708d81]/10 hover:text-[#f4d58d] transition-colors" onClick={() => { setActivePage("/notifications"); setIsUserDropdownOpen(false); }}>
                      <FiBell className="mr-3 text-lg" /> Notifications
                    </Link>
                    <Link to="/settings" className="flex items-center px-6 py-3 text-[#708d81] hover:bg-[#708d81]/10 hover:text-[#f4d58d] transition-colors" onClick={() => { setActivePage("/settings"); setIsUserDropdownOpen(false); }}>
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
              <FiLogIn className="mr-2" /> <span className="hidden md:inline">Login</span>
            </Link>
          )}

          {/* MOBILE MENU TOGGLE */}
          <button className="md:hidden text-[#708d81] hover:text-[#f4d58d] focus:outline-none" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU CONTENT */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#001427] border-t border-[#708d81]/20 absolute top-full left-0 right-0 z-40 py-4 px-6 shadow-xl" ref={mobileMenuRef}>
          <div className="flex flex-col space-y-4">
            <Link to="/" className={getNavLinkClass("/")} onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            
            {/* ✅ 3. MOBILE ADMIN BUTTON */}
            {user?.is_superuser && (
              <Link to="/admin" className="text-[#bf0603] font-bold block flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                 <FiLayout /> Admin Panel
              </Link>
            )}

            <div className="border-l-2 border-[#f4d58d] pl-3 ml-1 space-y-2">
              <Link to="/products" className="text-[#f4d58d] font-bold block" onClick={() => setIsMobileMenuOpen(false)}>All Products</Link>
              {categories.slice(0, 4).map(cat => (
                <Link key={cat} to={`/products?category=${encodeURIComponent(cat)}`} className="block text-sm text-[#708d81]" onClick={() => setIsMobileMenuOpen(false)}>{cat}</Link>
              ))}
            </div>
            <Link to="/about" className={getNavLinkClass("/about")} onClick={() => setIsMobileMenuOpen(false)}>About</Link>
            <div className="h-px bg-[#708d81]/20 my-2"></div>
            <Link to="/wishlist" className={getNavLinkClass("/wishlist")} onClick={() => setIsMobileMenuOpen(false)}>
              <div className="flex items-center"><FiHeart className="mr-2" /> Wishlist ({wishlistCount})</div>
            </Link>
            <Link to="/cart" className={getNavLinkClass("/cart")} onClick={() => setIsMobileMenuOpen(false)}>
              <div className="flex items-center"><FiShoppingCart className="mr-2" /> Cart ({cartCount})</div>
            </Link>
            {user && (
              <>
                <Link to="/orders" className={getNavLinkClass("/orders")} onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="flex items-center"> <FiBox className="mr-2" /> My Orders </div>
                </Link>
                <Link to="/notifications" className={getNavLinkClass("/notifications")} onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="flex items-center"> <FiBell className="mr-2" /> Notifications ({unreadCount}) </div>
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