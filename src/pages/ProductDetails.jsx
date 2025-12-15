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
  
  // NOTE: Changed 'cartItems' to 'cart' to match your Context definition
  const { addToCart, cart } = useContext(CartContext); 
  const { addToWishlist, removeFromWishlist, wishlist } = useContext(WishlistContext);

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  // Checks
  const isInWishlist = wishlist?.some((item) => item.id === Number(id));

  // --- FETCH PRODUCT ---
  useEffect(() => {
    // Updated to Django API endpoint
    axios
      .get(`http://localhost:8000/api/products/${id}/`)
      .then((res) => setProduct(res.data))
      .catch((err) => {
        console.error("Fetch Details Error:", err);
        toast.error("Product not found");
      });
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
      toast.warn(
        <div className="flex items-center text-[#f4d58d]">
          <span className="mr-2">⚠️</span> Please login to add items to cart
        </div>
      );
      return;
    }
    
    // Call Context directly - it handles the API and Duplication checks
    addToCart(product);
  };

  const handleWishlist = () => {
    if (!user) {
      toast.warn(
        <div className="flex items-center text-[#f4d58d]">
          <span className="mr-2">⚠️</span> Please login to manage wishlist
        </div>
      );
      return;
    }

    if (isInWishlist) {
      removeFromWishlist(product.id);
      // Removed generic toast here as context usually handles it, 
      // but if you want specific custom toast you can keep it.
    } else {
      addToWishlist(product);
    }
  };

  if (!product) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-20 text-xl text-[#708d81]"
      >
        Loading product details...
      </motion.div>
    );
  }

  // Safe image handling (if images array is empty)
  const images = product.images && product.images.length > 0 
                 ? product.images 
                 : ["https://via.placeholder.com/500"];

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
          className="flex flex-col sm:flex-row gap-4 w-full"
        >
          {images.length > 1 && (
            <motion.div 
              className="flex sm:flex-row lg:flex-col gap-2 sm:gap-3 w-full sm:w-20 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0"
            >
              {images.map((img, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.9, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 10px rgba(191, 6, 3, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedImage(index)}
                  className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedImage === index
                      ? "border-[#bf0603]"
                      : "border-transparent hover:border-[#708d81]/40"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} thumbnail ${index}`}
                    className="w-16 sm:w-full h-16 sm:h-20 object-cover"
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="flex-1 w-full">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden rounded-xl bg-[#001427]/10 border border-[#708d81]/20 shadow-lg w-full"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={images[selectedImage]}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-64 sm:h-80 md:h-96 object-contain p-4"
                />
              </AnimatePresence>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleWishlist}
                className="absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm bg-black/30 hover:bg-black/50 transition-all"
              >
                {isInWishlist ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    <AiFillHeart size={24} className="text-[#bf0603]" />
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <AiOutlineHeart size={24} className="text-[#f4d58d]" />
                  </motion.div>
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
          <motion.div
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-[#f4d58d] mb-2">
              {product.name}
            </h1>
            <motion.p 
              whileHover={{ scale: 1.02 }}
              className="text-[#708d81] uppercase text-xs sm:text-sm font-medium tracking-wider"
            >
              {product.category}
            </motion.p>
          </motion.div>

          <motion.div 
            className="flex items-center gap-4"
            whileHover={{ scale: 1.01 }}
          >
            <motion.p 
              className="text-xl sm:text-2xl font-bold text-[#f2e8cf]"
              whileHover={{ scale: 1.05 }}
            >
              ₹{Number(product.price).toLocaleString()}
            </motion.p>
            {product.originalPrice && (
              <motion.p 
                className="text-base sm:text-lg text-[#708d81] line-through"
                whileHover={{ scale: 1.05 }}
              >
                ₹{Number(product.originalPrice).toLocaleString()}
              </motion.p>
            )}
          </motion.div>

          <motion.div 
            className="py-4 border-y border-[#708d81]/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-[#f2e8cf]/90 leading-relaxed text-sm sm:text-base">
              {product.description}
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 0 15px rgba(191, 6, 3, 0.7)"
            }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-[#8d0801] to-[#bf0603] text-[#f2e8cf] px-6 py-3 sm:py-4 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
          >
            Add to Cart
          </motion.button>

          <motion.div 
            className="pt-4 sm:pt-6 border-t border-[#708d81]/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="space-y-2 sm:space-y-3">
              <motion.p 
                className="text-[#708d81] text-sm sm:text-base"
                whileHover={{ x: 3 }}
              >
                <span className="text-[#f4d58d] font-medium">Availability:</span> In Stock
              </motion.p>
              
              {/* If you store specifications in your Django JSONField, this will work. 
                  If not, you can remove this block. */}
              {product.specifications && (
                <motion.div 
                  className="mt-3 sm:mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <h3 className="text-[#f4d58d] font-medium mb-2 text-sm sm:text-base">Specifications:</h3>
                  <ul className="text-[#f2e8cf]/80 space-y-1 text-xs sm:text-sm">
                    {Object.entries(product.specifications).map(([key, value], index) => (
                      <motion.li 
                        key={key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + index * 0.05 }}
                        whileHover={{ x: 3 }}
                      >
                        <span className="text-[#708d81]">{key}:</span> {value}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProductDetails;