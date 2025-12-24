import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";

const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const { addToCart, cart } = useContext(CartContext);
  const { addToWishlist, removeFromWishlist, wishlist } = useContext(WishlistContext);

  const [product, setProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Checks
  const isInWishlist = wishlist?.some((item) => item.id === Number(id));

  // --- FETCH PRODUCT ---
  useEffect(() => {
    axios
      .get(`http://3.26.180.53/api/products/${id}/`)
      .then((res) => setProduct(res.data))
      .catch((err) => {
        console.error("Fetch Details Error:", err);
        toast.error("Product not found");
      });
  }, [id]);

  // ✅ CHECK STOCK STATUS
  const isOutOfStock = product?.count <= 0;

  // ✅ HELPER: Extract Image URLs correctly
  const getGalleryImages = () => {
    if (!product) return [];

    let images = [];

    // 1. Check New Gallery Array (List of Objects {id, url})
    if (product.images && product.images.length > 0) {
      images = product.images.map(img => {
        // If it's an object, take .url, otherwise take the string itself
        return (typeof img === 'object' && img.url) ? img.url : img;
      });
    }
    // 2. Fallback to Legacy Single Image
    else if (product.image) {
      images = [product.image];
    }
    // 3. Fallback Placeholder
    else {
      images = ["https://via.placeholder.com/500?text=No+Image"];
    }

    return images;
  };

  const gallery = getGalleryImages(); // Get the processed list of URLs

  const handleAddToCart = () => {
    if (!user) {
      toast.warn("Please login to add items to cart");
      return;
    }

    if (isOutOfStock) {
      toast.error("Sorry, this item is out of stock");
      return;
    }

    addToCart(product);
  };

  const handleWishlist = () => {
    if (!user) {
      toast.warn("Please login to manage wishlist");
      return;
    }

    if (isInWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  if (!product) {
    return (
      <div className="text-center py-20 text-xl text-[#708d81]">
        Loading product details...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto px-4 sm:px-6 py-8 sm:py-12 bg-gradient-to-br from-[#0a192f] via-[#0f1b32] to-[#020617] min-h-screen"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">

        {/* --- IMAGE GALLERY --- */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col-reverse sm:flex-row gap-4 w-full"
        >
          {/* Thumbnails (Left side on Desktop, Bottom on Mobile) */}
          {gallery.length > 1 && (
            <motion.div
              className="flex sm:flex-col gap-2 sm:gap-3 w-full sm:w-20 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0"
            >
              {gallery.map((imgUrl, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.9, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-white/5 ${selectedImageIndex === index
                    ? "border-[#bf0603]"
                    : "border-transparent hover:border-[#708d81]/40"
                    }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Thumbnail ${index}`}
                    className={`w-full h-full object-contain p-1 ${isOutOfStock ? 'grayscale' : ''}`}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Main Large Image */}
          <div className="flex-1 w-full relative">
            <motion.div
              className="relative overflow-hidden rounded-xl bg-[#001427]/10 border border-[#708d81]/20 shadow-lg w-full aspect-square flex items-center justify-center bg-white/5"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImageIndex}
                  src={gallery[selectedImageIndex]}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`max-w-full max-h-full object-contain p-4 ${isOutOfStock ? 'grayscale opacity-70' : ''}`}
                />
              </AnimatePresence>

              {/* OUT OF STOCK BADGE */}
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="bg-[#bf0603] text-white px-4 py-2 text-lg font-bold rounded shadow-lg transform -rotate-12 border border-white/20">
                    OUT OF STOCK
                  </span>
                </div>
              )}

              <motion.button
                onClick={handleWishlist}
                className="absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm bg-black/30 hover:bg-black/50 transition-all z-10"
              >
                {isInWishlist ? (
                  <AiFillHeart size={24} className="text-[#bf0603]" />
                ) : (
                  <AiOutlineHeart size={24} className="text-[#f4d58d]" />
                )}
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* --- PRODUCT DETAILS --- */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-6 md:space-y-8 w-full"
        >
          <motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#f4d58d] mb-2">
              {product.name}
            </h1>
            <p className="text-[#708d81] uppercase text-xs sm:text-sm font-medium tracking-wider">
              {product.category}
            </p>
          </motion.div>

          <motion.div className="flex items-center gap-4">
            <p className="text-xl sm:text-2xl font-bold text-[#f2e8cf]">
              ₹{Number(product.price).toLocaleString()}
            </p>
          </motion.div>

          <div className="py-4 border-y border-[#708d81]/20">
            <p className="text-[#f2e8cf]/90 leading-relaxed text-sm sm:text-base whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* ADD TO CART BUTTON */}
          <motion.button
            whileHover={!isOutOfStock ? { scale: 1.02 } : {}}
            whileTap={!isOutOfStock ? { scale: 0.98 } : {}}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full px-6 py-3 sm:py-4 rounded-lg font-medium shadow-lg transition-all text-sm sm:text-base ${isOutOfStock
              ? "bg-gray-700 text-gray-400 cursor-not-allowed border border-gray-600"
              : "bg-gradient-to-r from-[#8d0801] to-[#bf0603] text-[#f2e8cf] hover:shadow-xl"
              }`}
          >
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </motion.button>

          <div className="pt-4 sm:pt-6 border-t border-[#708d81]/20">
            <div className="space-y-2 sm:space-y-3">
              <p className="text-[#708d81] text-sm sm:text-base">
                <span className="text-[#f4d58d] font-medium">Availability: </span>
                {isOutOfStock ? (
                  <span className="text-red-500 font-bold">Out of Stock</span>
                ) : (
                  <span className="text-green-400">In Stock</span>
                )}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProductDetails;