import { useContext, useEffect, useState } from "react";
import { CartContext } from "../context/CartContext";
import { AuthContext, useAxios } from "../context/AuthContext"; // Use authenticated axios
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaCreditCard, FaMoneyBillWave } from "react-icons/fa";

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const { cart, clearCart, totalPrice } = useContext(CartContext);
  const api = useAxios(); // Authenticated API instance
  const [paymentMethod, setPaymentMethod] = useState("card");
  
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    nameOnCard: "",
  });
  
  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    city: "",
    state: "",
    zip: "",
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      toast.warn(
        <div className="flex items-center text-[#f4d58d]">
          <span className="mr-2">⚠️</span> Please login to checkout
        </div>
      );
      navigate("/login");
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name in paymentInfo) {
      setPaymentInfo({ ...paymentInfo, [name]: value });
    } else {
      setShippingInfo({ ...shippingInfo, [name]: value });
    }
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.replace(/(\d{4})/g, "$1 ").trim();
    setPaymentInfo({ ...paymentInfo, cardNumber: value.slice(0, 19) });
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 2) {
      value = value.slice(0, 2) + "/" + value.slice(2, 4);
    }
    setPaymentInfo({ ...paymentInfo, expiry: value.slice(0, 5) });
  };

  const handleCVVChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setPaymentInfo({ ...paymentInfo, cvv: value.slice(0, 4) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (paymentMethod === "card") {
      if (
        !paymentInfo.cardNumber ||
        !paymentInfo.expiry ||
        !paymentInfo.cvv ||
        !paymentInfo.nameOnCard
      ) {
        toast.warn("Please fill all payment fields");
        return;
      }
    }

    if (
      !shippingInfo.address ||
      !shippingInfo.city ||
      !shippingInfo.state ||
      !shippingInfo.zip
    ) {
      toast.warn("Please fill all shipping fields");
      return;
    }

    setLoading(true);
    
    // Calculate final total (including COD fee if applicable)
    const finalTotal = paymentMethod === "cod" ? totalPrice + 50 : totalPrice;

    try {
      // --- UPDATED API CALL ---
      // We send the order details to the new Django endpoint.
      // The backend will automatically:
      // 1. Create the Order
      // 2. Move items from Cart to OrderItems
      // 3. Empty the Cart on the server side
      await api.post("/orders/", {
        total: finalTotal,
        shipping: shippingInfo,
        payment_method: paymentMethod, // Matches Django field name
        status: "processing"
      });

      // Clear Frontend Cart State
      clearCart(); // This just clears the UI state now
      
      toast.success(
        <div className="flex items-center text-[#f4d58d]">
          <span className="mr-2">✓</span> Order placed successfully!
        </div>
      );
      navigate("/success");
    } catch (err) {
      toast.error(
        <div className="flex items-center text-[#f4d58d]">
          <span className="mr-2">⚠️</span> Order failed. Please try again.
        </div>
      );
      console.error("Checkout Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto px-4 py-12 bg-gradient-to-br from-[#0a192f] via-[#0f1b32] to-[#020617] min-h-screen"
    >
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-3xl font-bold text-[#f4d58d] mb-8"
        >
          Checkout
        </motion.h2>

        <div className="flex justify-between mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= step
                    ? "bg-[#f4d58d] text-[#001427]"
                    : "bg-[#001427] text-[#708d81] border border-[#708d81]"
                } font-bold`}
              >
                {step}
              </div>
              <span
                className={`mt-2 text-sm ${
                  currentStep >= step ? "text-[#f4d58d]" : "text-[#708d81]"
                }`}
              >
                {step === 1 ? "Shipping" : step === 2 ? "Payment" : "Review"}
              </span>
            </div>
          ))}
        </div>

        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-[#708d81] text-xl mb-6">Your cart is empty</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-[#8d0801] to-[#bf0603] text-[#f2e8cf] px-6 py-3 rounded-lg font-medium shadow-lg"
            >
              Continue Shopping
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Order Summary (Visual Only) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#001427]/20 p-6 rounded-xl border border-[#708d81]/20"
            >
              <h3 className="text-xl font-semibold text-[#f4d58d] mb-4">
                Order Summary
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    className="flex items-center gap-4 p-3 rounded-lg bg-[#001427]/10"
                  >
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      // Updated Image handling for arrays
                      src={item.images && item.images.length > 0 ? item.images[0] : "/default-product.png"}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/default-product.png";
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-[#f2e8cf]">{item.name}</p>
                      <p className="text-sm text-[#708d81]">{item.category}</p>
                      <p className="text-sm text-[#708d81]">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-[#f4d58d]">
                      ₹{(Number(item.price) * item.quantity).toLocaleString()}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 text-right border-t border-[#708d81]/20 pt-4">
                <p className="text-lg font-bold text-[#f2e8cf]">
                  Total:{" "}
                  <span className="text-[#f4d58d]">
                    ₹{totalPrice.toLocaleString()}
                  </span>
                </p>
              </div>
            </motion.div>

            {/* Right Column: Steps */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#001427]/20 p-6 rounded-xl border border-[#708d81]/20"
            >
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-semibold text-[#f4d58d] mb-4">
                    Shipping Information
                  </h3>
                  <input
                    type="text"
                    name="address"
                    placeholder="Street Address"
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-[#001427]/30 border border-[#708d81]/40 rounded-lg text-[#f2e8cf] placeholder-[#708d81] focus:border-[#f4d58d] focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#001427]/30 border border-[#708d81]/40 rounded-lg text-[#f2e8cf] placeholder-[#708d81] focus:border-[#f4d58d] focus:outline-none"
                    />
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={shippingInfo.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#001427]/30 border border-[#708d81]/40 rounded-lg text-[#f2e8cf] placeholder-[#708d81] focus:border-[#f4d58d] focus:outline-none"
                    />
                  </div>
                  <input
                    type="text"
                    name="zip"
                    placeholder="ZIP Code"
                    value={shippingInfo.zip}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-[#001427]/30 border border-[#708d81]/40 rounded-lg text-[#f2e8cf] placeholder-[#708d81] focus:border-[#f4d58d] focus:outline-none"
                  />
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-semibold text-[#f4d58d] mb-4">
                    Payment Method
                  </h3>
                  <div className="flex gap-4 mb-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border ${
                        paymentMethod === "card"
                          ? "border-[#f4d58d] bg-[#f4d58d]/10 text-[#f4d58d]"
                          : "border-[#708d81]/40 text-[#708d81]"
                      }`}
                    >
                      <FaCreditCard />
                      Card
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border ${
                        paymentMethod === "cod"
                          ? "border-[#f4d58d] bg-[#f4d58d]/10 text-[#f4d58d]"
                          : "border-[#708d81]/40 text-[#708d81]"
                      }`}
                    >
                      <FaMoneyBillWave />
                      Cash on Delivery
                    </motion.button>
                  </div>

                  {paymentMethod === "card" && (
                    <div className="space-y-4">
                      <input
                        type="text"
                        name="nameOnCard"
                        placeholder="Name on Card"
                        value={paymentInfo.nameOnCard}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-[#001427]/30 border border-[#708d81]/40 rounded-lg text-[#f2e8cf] placeholder-[#708d81] focus:border-[#f4d58d] focus:outline-none"
                      />
                      <input
                        type="text"
                        name="cardNumber"
                        placeholder="Card Number"
                        value={paymentInfo.cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full px-4 py-2 bg-[#001427]/30 border border-[#708d81]/40 rounded-lg text-[#f2e8cf] placeholder-[#708d81] focus:border-[#f4d58d] focus:outline-none"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          name="expiry"
                          placeholder="MM/YY"
                          value={paymentInfo.expiry}
                          onChange={handleExpiryChange}
                          className="w-full px-4 py-2 bg-[#001427]/30 border border-[#708d81]/40 rounded-lg text-[#f2e8cf] placeholder-[#708d81] focus:border-[#f4d58d] focus:outline-none"
                        />
                        <input
                          type="text"
                          name="cvv"
                          placeholder="CVV"
                          value={paymentInfo.cvv}
                          onChange={handleCVVChange}
                          className="w-full px-4 py-2 bg-[#001427]/30 border border-[#708d81]/40 rounded-lg text-[#f2e8cf] placeholder-[#708d81] focus:border-[#f4d58d] focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === "cod" && (
                    <div className="p-4 bg-[#001427]/30 rounded-lg border border-[#708d81]/40 text-[#f2e8cf]">
                      <p>Pay with cash when your order is delivered.</p>
                      <p className="text-[#f4d58d] font-medium mt-2">
                        An additional ₹50 will be charged for COD orders.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-semibold text-[#f4d58d] mb-4">
                    Review Your Order
                  </h3>

                  <div>
                    <h4 className="text-lg font-medium text-[#f4d58d] mb-2">
                      Shipping Information
                    </h4>
                    <div className="bg-[#001427]/30 p-4 rounded-lg border border-[#708d81]/40 text-[#f2e8cf]">
                      <p>{shippingInfo.address}</p>
                      <p>
                        {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-[#f4d58d] mb-2">
                      Payment Method
                    </h4>
                    <div className="bg-[#001427]/30 p-4 rounded-lg border border-[#708d81]/40 text-[#f2e8cf]">
                      {paymentMethod === "card" ? (
                        <>
                          <p>Credit/Debit Card</p>
                          <p className="text-sm text-[#708d81] mt-1">
                            **** **** **** {paymentInfo.cardNumber.slice(-4)}
                          </p>
                        </>
                      ) : (
                        <p>Cash on Delivery</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-[#f4d58d] mb-2">
                      Order Total
                    </h4>
                    <div className="bg-[#001427]/30 p-4 rounded-lg border border-[#708d81]/40">
                      <div className="flex justify-between mb-2">
                        <span className="text-[#f2e8cf]">Subtotal:</span>
                        <span className="text-[#f2e8cf]">
                          ₹{totalPrice.toLocaleString()}
                        </span>
                      </div>
                      {paymentMethod === "cod" && (
                        <div className="flex justify-between mb-2">
                          <span className="text-[#f2e8cf]">COD Fee:</span>
                          <span className="text-[#f2e8cf]">₹50</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-[#708d81]/40 pt-2">
                        <span className="text-[#f4d58d] font-bold">Total:</span>
                        <span className="text-[#f4d58d] font-bold">
                          ₹{(paymentMethod === "cod" ? totalPrice + 50 : totalPrice).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex justify-between mt-8">
                {currentStep > 1 ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={prevStep}
                    className="border border-[#708d81]/40 text-[#f4d58d] px-6 py-2 rounded-lg font-medium hover:border-[#bf0603] hover:text-[#bf0603] transition-colors"
                  >
                    Back
                  </motion.button>
                ) : (
                  <div></div>
                )}

                {currentStep < 3 ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={nextStep}
                    className="bg-gradient-to-r from-[#8d0801] to-[#bf0603] text-[#f2e8cf] px-6 py-2 rounded-lg font-medium shadow-lg"
                  >
                    Continue
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-gradient-to-r from-[#8d0801] to-[#bf0603] text-[#f2e8cf] px-6 py-2 rounded-lg font-medium shadow-lg disabled:opacity-70"
                  >
                    {loading ? (
                      "Processing..."
                    ) : (
                      <>
                        Place Order - ₹
                        {paymentMethod === "cod" ? totalPrice + 50 : totalPrice}
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Checkout;