import React, { useContext } from "react";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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

  const handleMoveToCart = async (product) => {
    if (isLoading) return; 

    if (!user) {
      toast.warn("Please login to add to cart");
      navigate("/login");
      return;
    }

    // 1. Add to Cart (Context handles API and state)
    await addToCart(product);
    
    // 2. Remove from Wishlist (Context handles API and state)
    await removeFromWishlist(product.id);
  };

  if (isLoading) {
    return <div className="text-center py-10" style={{ color: colors.text }}>Loading...</div>; 
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ 
        background: colors.background,
        color: colors.text
      }}
      className="min-h-screen"
    >
      <div className="max-w-6xl mx-auto px-4 py-10">
        <motion.h2 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold mb-6"
          style={{ color: colors.highlight }}
        >
          My Wishlist
        </motion.h2>

        {wishlist.length === 0 ? (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ color: colors.secondary }}
          >
            Your wishlist is empty.
          </motion.p>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
          >
            {wishlist.map((product) => (
              <motion.div 
                key={product.id}
                variants={itemVariants}
                whileHover={{ scale: 1.03 }}
                className="border rounded-lg shadow-lg p-4"
                style={{
                  background: `rgba(0, 20, 39, 0.7)`,
                  borderColor: colors.secondary,
                  backdropFilter: 'blur(10px)'
                }}
              >
                {/* --- IMAGE FIX --- */}
                <motion.img
                  src={product.images && product.images.length > 0 ? product.images[0] : '/default-product.png'}
                  alt={product.name}
                  className="relative aspect-square w-full mb-4 rounded-lg overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  style={{ border: `1px solid ${colors.secondary}` }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-product.png";
                  }}
                />
                
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p style={{ color: colors.secondary }}>{product.category}</p>
                
                {/* --- PRICE FIX (Convert String to Number) --- */}
                <p className="font-bold mb-3" style={{ color: colors.highlight }}>
                  ₹{Number(product.price).toLocaleString('en-IN')}
                </p>

                <div className="flex gap-3">
                  <motion.button
                    onClick={() => handleMoveToCart(product)}
                    className="px-3 py-1 rounded text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      background: colors.accent,
                      color: colors.text
                    }}
                  >
                    Move to Cart
                  </motion.button>
                  <motion.button
                    onClick={() => removeFromWishlist(product.id)}
                    className="px-3 py-1 rounded text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      border: `1px solid ${colors.accent}`,
                      color: colors.accent,
                      background: 'transparent'
                    }}
                  >
                    Remove
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Wishlist;