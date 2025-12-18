import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { motion } from "framer-motion";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  
  const authContext = useContext(AuthContext);
  const cartContext = useContext(CartContext);
  const wishlistContext = useContext(WishlistContext);
  
  if (!authContext || !cartContext || !wishlistContext) return null;
  
  const { user, isLoading } = authContext;
  const { addToCart } = cartContext;
  const { addToWishlist, removeFromWishlist, wishlist } = wishlistContext;

  const isInWishlist = wishlist?.some((item) => item.id === product.id);
  
  // ✅ CHECK STOCK STATUS
  const isOutOfStock = product.count <= 0;

  const handleAddToCart = (e) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (!user && !isLoading) {
      toast.warn("Please login to add items to cart");
      navigate("/login");
      return;
    }
    
    // സ്റ്റോക്ക് ഇല്ലെങ്കിൽ ഒന്നും ചെയ്യില്ല
    if (isOutOfStock) return;

    addToCart(product);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user && !isLoading) {
      toast.warn("Please login to manage wishlist");
      navigate("/login");
      return;
    }

    if (isInWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  if (!product) return null;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="relative rounded-xl p-4 overflow-hidden group"
    >
      <div className="absolute inset-0 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 shadow-lg" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#001427]/10 to-[#000000]/20 rounded-xl" />

      {/* Wishlist Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        className="absolute top-3 right-3 cursor-pointer z-10 p-2 rounded-full bg-black/20 backdrop-blur-sm border border-white/10"
        onClick={handleWishlist}
        type="button" 
      >
        {isInWishlist ? (
          <AiFillHeart size={22} className="text-[#bf0603] drop-shadow-lg" />
        ) : (
          <AiOutlineHeart size={22} className="text-[#f4d58d] hover:text-[#bf0603] transition-colors" />
        )}
      </motion.button>

      {/* Image Section */}
      <div className="relative aspect-square w-full mb-4 rounded-lg overflow-hidden">
        <Link to={`/products/${product.id}`}>
            <motion.img
            src={product.images && product.images.length > 0 ? product.images[0] : "/placeholder-image.jpg"} 
            alt={product.name}
            className={`w-full h-full object-cover ${isOutOfStock ? 'grayscale opacity-60' : ''}`} // Stock ഇല്ലെങ്കിൽ മങ്ങിയ കളർ
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            loading="lazy" 
            />
        </Link>
        
        {/* ✅ OUT OF STOCK BADGE */}
        {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="bg-[#bf0603] text-white px-3 py-1 text-sm font-bold rounded shadow-lg">
                    OUT OF STOCK
                </span>
            </div>
        )}
      </div>

      {/* Info */}
      <div className="relative z-10 space-y-2">
        <h3 className="text-lg font-semibold text-[#f4d58d] truncate">{product.name}</h3>
        <p className="text-[#708d81] text-sm font-medium">{product.category}</p>
        <p className="text-[#f2e8cf] font-bold text-lg">
          ₹{Number(product.price).toLocaleString('en-IN')}<span className="text-[#708d81] text-xs ml-1"> INR</span>
        </p>
      </div>

      {/* Buttons */}
      <div className="relative z-10 mt-4 space-y-2">
        <motion.button
          whileHover={!isOutOfStock ? { scale: 1.02 } : {}}
          whileTap={!isOutOfStock ? { scale: 0.98 } : {}}
          onClick={handleAddToCart}
          disabled={isOutOfStock} // ✅ Button Disable ചെയ്യുന്നു
          className={`w-full px-3 py-2 rounded-md transition-all text-sm font-medium shadow-md ${
            isOutOfStock 
                ? "bg-gray-600 text-gray-300 cursor-not-allowed" 
                : "bg-gradient-to-r from-[#8d0801] to-[#bf0603] text-[#f2e8cf] hover:shadow-lg"
          }`}
          type="button" 
        >
          {isOutOfStock ? "Sold Out" : "Add to Cart"}
        </motion.button>

        <Link
          to={`/products/${product.id}`}
          className="block text-center text-sm text-[#708d81] hover:text-[#f4d58d] mt-2 transition-colors group"
        >
          View Details <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </motion.div>
  );
};

export default ProductCard;