import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaShoppingCart } from "react-icons/fa";

const Cart = () => {
  const {
    cart,
    totalPrice,
    removeFromCart,
    clearCart,
    incrementQty,
    decrementQty,
    loading,
  } = useContext(CartContext);

  const navigate = useNavigate();

  const handleClearCart = (e) => {
    e.preventDefault(); 
    clearCart();
    toast.success(
      <div className="flex items-center text-[#f4d58d]">
        <span className="mr-2">✓</span> Cart cleared successfully
      </div>
    );
  };

  const handleContinueShopping = (e) => {
    e.preventDefault(); 
    navigate("/products");
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    navigate("/checkout");
  };

  const handleDecrement = (e, id) => {
    e.preventDefault();
    decrementQty(id);
  };

  const handleIncrement = (e, id) => {
    e.preventDefault();
    incrementQty(id);
  };

  const handleRemove = (e, id) => {
    e.preventDefault();
    removeFromCart(id);
  };

  if (loading) return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-20 text-xl text-[#708d81]"
    >
      Loading your cart...
    </motion.p>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto px-4 py-12 bg-gradient-to-br from-[#0a192f] via-[#0f1b32] to-[#020617] min-h-screen"
    >
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-3xl font-bold text-[#f4d58d] mb-8"
        >
          Your Cart
        </motion.h2>

        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="flex flex-col items-center justify-center">
              <FaShoppingCart className="text-[#708d81] text-6xl mb-6 opacity-50" />
              <p className="text-[#708d81] text-xl mb-6">Your cart is empty</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/");
                }}
                className="bg-gradient-to-r from-[#8d0801] to-[#bf0603] text-[#f2e8cf] px-6 py-3 rounded-lg font-medium shadow-lg"
              >
                Continue Shopping
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <>
            <motion.div
              layout
              className="space-y-6 mb-8"
            >
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col sm:flex-row justify-between items-center p-4 rounded-xl bg-[#001427]/20 border border-[#708d81]/20 gap-4"
                >
                  <div className="flex items-center gap-4 w-full sm:w-2/3">
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      // Updated Image handling for Django Arrays
                      src={item.images && item.images.length > 0 ? item.images[0] : '/default-product.png'}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-product.png';
                      }}
                    />
                    <div>
                      <p className="font-semibold text-[#f2e8cf]">{item.name}</p>
                      <p className="text-[#708d81] text-sm">{item.category}</p>
                      <p className="font-bold text-[#f4d58d]">
                        ₹{(Number(item.price) * item.quantity).toLocaleString()}
                        {item.quantity > 1 && (
                          <span className="text-[#708d81] text-sm font-normal ml-2">
                             (₹{Number(item.price).toLocaleString()} each)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleDecrement(e, item.id)}
                      className="px-3 py-1 bg-[#001427]/30 text-[#f4d58d] hover:bg-[#001427]/50 rounded-lg"
                    >
                      −
                    </motion.button>
                    <span className="text-md font-medium text-[#f2e8cf] w-6 text-center">
                      {item.quantity}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleIncrement(e, item.id)}
                      className="px-3 py-1 bg-[#001427]/30 text-[#f4d58d] hover:bg-[#001427]/50 rounded-lg"
                    >
                      +
                    </motion.button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleRemove(e, item.id)}
                    className="text-[#bf0603] hover:text-[#8d0801] text-sm"
                  >
                    Remove
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              layout
              className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8 p-6 bg-[#001427]/20 rounded-xl border border-[#708d81]/20"
            >
              <p className="text-xl font-bold text-[#f2e8cf]">
                Total: <span className="text-[#f4d58d]">₹{totalPrice.toLocaleString()}</span>
              </p>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClearCart}
                  className="bg-gradient-to-r from-[#8d0801] to-[#bf0603] text-[#f2e8cf] px-4 py-2 rounded-lg font-medium shadow-lg"
                >
                  Clear Cart
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleContinueShopping}
                  className="bg-gradient-to-r from-[#8d0801] to-[#bf0603] text-[#f2e8cf] px-6 py-3 rounded-lg font-medium shadow-lg"
                >
                  Continue Shopping
                </motion.button>
              </div>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-[#8d0801] to-[#bf0603] text-[#f2e8cf] px-6 py-4 rounded-lg font-medium shadow-lg hover:shadow-xl text-lg"
            >
              Proceed to Checkout
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default Cart;