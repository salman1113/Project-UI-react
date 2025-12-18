import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaShoppingCart, FaTrash, FaArrowLeft } from "react-icons/fa";

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

  // --- HANDLERS ---

  const handleClearCart = (e) => {
    e.preventDefault(); 
    if(window.confirm("Are you sure you want to remove all items?")){
        clearCart();
        toast.info("Cart cleared");
    }
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    navigate("/checkout");
  };

  const handleDecrement = (e, id) => {
    e.preventDefault();
    decrementQty(id);
  };

  const handleRemove = (e, id) => {
    e.preventDefault();
    removeFromCart(id);
  };

  // ✅ INCREMENT WITH VALIDATION
  const handleIncrement = (e, item) => {
    e.preventDefault();
    const MAX_LIMIT_PER_USER = 5; // Global Limit

    // 1. Check User Limit
    if (item.quantity >= MAX_LIMIT_PER_USER) {
        toast.warn(`Limit Reached: You can only buy ${MAX_LIMIT_PER_USER} units.`);
        return;
    }

    // 2. Check Available Stock
    // item.count എന്നത് ബാക്കെൻഡിൽ നിന്നുള്ള സ്റ്റോക്ക് ആണ്
    if (item.quantity >= item.count) {
        toast.error(`Only ${item.count} items left in stock!`);
        return;
    }

    incrementQty(item.id);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#001427]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#bf0603]"></div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto px-4 py-12 bg-gradient-to-br from-[#0a192f] via-[#0f1b32] to-[#020617] min-h-screen text-[#f2e8cf]"
    >
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-[#f4d58d] mb-8 flex items-center gap-3">
            <FaShoppingCart /> Your Cart
        </h2>

        {cart.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-20 bg-[#001427]/50 rounded-xl border border-[#708d81]/30"
          >
            <FaShoppingCart className="text-[#708d81] text-7xl mx-auto mb-6 opacity-30" />
            <p className="text-[#708d81] text-xl mb-6">Your cart looks a bit empty.</p>
            <button
              onClick={() => navigate("/products")}
              className="bg-[#bf0603] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-[#8d0801] transition-all"
            >
              Start Shopping
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* --- LEFT: CART ITEMS LIST --- */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => {
                 // Check constraints for button styling
                 const isMaxLimit = item.quantity >= 5;
                 const isOutOfStock = item.quantity >= item.count;

                 return (
                    <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-[#001427]/40 border border-[#708d81]/20 shadow-sm"
                    >
                        {/* Image */}
                        <img
                        src={item.images && item.images.length > 0 ? item.images[0] : '/default-product.png'}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg border border-[#708d81]/30"
                        />

                        {/* Details */}
                        <div className="flex-1 text-center sm:text-left">
                            <h3 className="font-bold text-lg text-[#f2e8cf]">{item.name}</h3>
                            <p className="text-sm text-[#708d81]">{item.category}</p>
                            <p className="font-bold text-[#f4d58d] mt-1">
                                ₹{Number(item.price).toLocaleString()}
                            </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 bg-[#001427] p-2 rounded-lg border border-[#708d81]/30">
                            <button
                                onClick={(e) => handleDecrement(e, item.id)}
                                className="w-8 h-8 flex items-center justify-center text-[#f4d58d] hover:bg-white/10 rounded transition"
                            >
                                −
                            </button>
                            <span className="font-bold text-white w-6 text-center">{item.quantity}</span>
                            <button
                                onClick={(e) => handleIncrement(e, item)}
                                disabled={isMaxLimit || isOutOfStock}
                                className={`w-8 h-8 flex items-center justify-center rounded transition ${
                                    isMaxLimit || isOutOfStock 
                                    ? "text-gray-600 cursor-not-allowed" 
                                    : "text-[#f4d58d] hover:bg-white/10"
                                }`}
                            >
                                +
                            </button>
                        </div>

                        {/* Total & Remove */}
                        <div className="text-right flex flex-col items-end gap-2">
                            <span className="font-bold text-lg">₹{(item.price * item.quantity).toLocaleString()}</span>
                            <button
                                onClick={(e) => handleRemove(e, item.id)}
                                className="text-[#bf0603] hover:text-red-400 text-sm flex items-center gap-1 transition-colors"
                            >
                                <FaTrash size={12} /> Remove
                            </button>
                        </div>
                    </motion.div>
                 );
              })}

              <div className="flex justify-between mt-4">
                  <button onClick={() => navigate("/products")} className="text-[#708d81] hover:text-[#f4d58d] flex items-center gap-2">
                      <FaArrowLeft /> Continue Shopping
                  </button>
                  <button onClick={handleClearCart} className="text-[#bf0603] hover:underline text-sm">
                      Clear Cart
                  </button>
              </div>
            </div>

            {/* --- RIGHT: ORDER SUMMARY --- */}
            <div className="lg:col-span-1">
                <div className="bg-[#001427]/60 p-6 rounded-xl border border-[#708d81]/30 sticky top-24">
                    <h3 className="text-xl font-bold text-[#f4d58d] mb-4 border-b border-[#708d81]/30 pb-2">Order Summary</h3>
                    
                    <div className="flex justify-between mb-2 text-[#f2e8cf]/80">
                        <span>Items ({cart.reduce((acc, item) => acc + item.quantity, 0)})</span>
                        <span>₹{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-4 text-[#f2e8cf]/80">
                        <span>Shipping</span>
                        <span className="text-[#708d81] text-sm">(Calculated at checkout)</span>
                    </div>

                    <div className="flex justify-between text-xl font-bold text-[#f4d58d] pt-4 border-t border-[#708d81]/30 mb-6">
                        <span>Subtotal</span>
                        <span>₹{totalPrice.toLocaleString()}</span>
                    </div>

                    <button
                        onClick={handleCheckout}
                        className="w-full bg-gradient-to-r from-[#8d0801] to-[#bf0603] text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-red-900/50 hover:scale-[1.02] transition-transform"
                    >
                        Proceed to Checkout
                    </button>
                </div>
            </div>

          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Cart;