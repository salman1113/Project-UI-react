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

  const handleAddToCart = (e) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (!user && !isLoading) {
      toast.warn("Please login to add items to cart");
      navigate("/login");
      return;
    }
    
    // Single Source of Truth: This calls the Context ONCE
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

  const formatPrice = (price) => {
    const numPrice = Number(price);
    return isNaN(numPrice) ? "0.00" : numPrice.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="relative rounded-xl p-4 overflow-hidden"
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

      {/* Image */}
      <div className="relative aspect-square w-full mb-4 rounded-lg overflow-hidden">
        <Link to={`/product/${product.id}`}>
            <motion.img
            src={product.images && product.images.length > 0 ? product.images[0] : "/placeholder-image.jpg"} 
            alt={product.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            loading="lazy" 
            />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-70" />
      </div>

      {/* Info */}
      <div className="relative z-10 space-y-2">
        <h3 className="text-lg font-semibold text-[#f4d58d] truncate">{product.name}</h3>
        <p className="text-[#708d81] text-sm font-medium">{product.category}</p>
        <p className="text-[#f2e8cf] font-bold text-lg">
          ₹{formatPrice(product.price)}<span className="text-[#708d81] text-xs ml-1"> INR</span>
        </p>
      </div>

      {/* Buttons */}
      <div className="relative z-10 mt-4 space-y-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddToCart}
          style={{ background: "linear-gradient(135deg, #8d0801 0%, #bf0603 100%)" }}
          className="w-full text-[#f2e8cf] px-3 py-2 rounded-md hover:shadow-lg transition-all text-sm font-medium shadow-md"
          type="button" 
        >
          Add to Cart
        </motion.button>

        <Link
          to={`/product/${product.id}`}
          className="block text-center text-sm text-[#708d81] hover:text-[#f4d58d] mt-2 transition-colors group"
        >
          View Details <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </motion.div>
  );
};

export default ProductCard;