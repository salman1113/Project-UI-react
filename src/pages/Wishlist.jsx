import React, { useContext } from "react";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiEye } from "react-icons/fi";

const Wishlist = () => {
  const { user, isLoading } = useContext(AuthContext);
  const { wishlist, removeFromWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const colors = {
    background: "#001427",
    text: "#f2e8cf",
    accent: "#bf0603",
    secondary: "#708d81",
    highlight: "#f4d58d"
  };

  const getDisplayImage = (product) => {
    if (product?.images && product.images.length > 0) {
      const firstImg = product.images[0];
      if (typeof firstImg === 'object' && firstImg.url) {
        return firstImg.url;
      }
      if (typeof firstImg === 'string') {
        return firstImg;
      }
    }
    if (product?.image) return product.image;

    return "/default-product.png";
  };

  const handleMoveToCart = async (product) => {
    if (isLoading) return;

    if (!user) {
      toast.warn("Please login to add to cart");
      navigate("/login");
      return;
    }

    if (product.count <= 0) {
      toast.error("Sorry, this item is out of stock!");
      return;
    }

    await addToCart(product);
    await removeFromWishlist(product.id);
  };

  if (isLoading) {
    return <div className="text-center py-10 text-[#f2e8cf]">Loading...</div>;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen py-10 px-4"
      style={{ background: colors.background, color: colors.text }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="text-3xl font-bold mb-8"
          style={{ color: colors.highlight }}
        >
          My Wishlist
        </motion.h2>

        {wishlist.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 border border-dashed border-[#708d81] rounded-lg"
          >
            <p className="text-xl text-[#708d81]">Your wishlist is empty.</p>
            <button onClick={() => navigate("/products")} className="mt-4 text-[#f4d58d] underline hover:text-[#bf0603]">
              Browse Products
            </button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {wishlist.map((product) => {
              const isOutOfStock = product.count <= 0;

              return (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="border rounded-xl shadow-lg p-4 relative overflow-hidden group flex flex-col"
                  style={{
                    background: `rgba(0, 20, 39, 0.7)`,
                    borderColor: colors.secondary,
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  {/* Image Section (Clickable) */}
                  <Link to={`/products/${product.id}`} className="relative aspect-square w-full mb-4 rounded-lg overflow-hidden block">
                    <img
                      src={getDisplayImage(product)}
                      alt={product.name}
                      className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-110 ${isOutOfStock ? 'grayscale opacity-50' : ''}`}
                      onError={(e) => { e.target.src = "/default-product.png"; }}
                    />
                    {isOutOfStock && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="bg-[#bf0603] text-white text-xs font-bold px-2 py-1 rounded shadow">OUT OF STOCK</span>
                      </div>
                    )}
                    {/* Hover Overlay for View Details */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white bg-black/50 px-3 py-1 rounded-full text-sm flex items-center gap-1 backdrop-blur-sm">
                        <FiEye /> View
                      </span>
                    </div>
                  </Link>

                  <h3 className="text-lg font-semibold truncate text-[#f2e8cf]">{product.name}</h3>
                  <p className="text-sm opacity-80 mb-2" style={{ color: colors.secondary }}>{product.category}</p>

                  <p className="font-bold text-xl mb-4" style={{ color: colors.highlight }}>
                    ₹{Number(product.price).toLocaleString('en-IN')}
                  </p>

                  {/* Buttons Section - Pushed to bottom */}
                  <div className="mt-auto flex flex-col gap-2">
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => handleMoveToCart(product)}
                        disabled={isOutOfStock}
                        whileTap={{ scale: 0.95 }}
                        className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${isOutOfStock
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-[#bf0603] text-[#f2e8cf] hover:bg-[#8d0801]'
                          }`}
                      >
                        {isOutOfStock ? "Sold Out" : "Move to Cart"}
                      </motion.button>

                      <motion.button
                        onClick={() => removeFromWishlist(product.id)}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-2 rounded text-sm border border-[#bf0603] text-[#bf0603] hover:bg-[#bf0603] hover:text-white transition-colors"
                      >
                        Remove
                      </motion.button>
                    </div>

                    {/* View Details Button (Secondary Option) */}
                    <Link
                      to={`/products/${product.id}`}
                      className="text-center w-full py-2 rounded text-sm border border-[#708d81] text-[#708d81] hover:bg-[#708d81] hover:text-[#001427] transition-all"
                    >
                      View Details
                    </Link>
                  </div>

                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Wishlist;