import { useContext, useEffect, useState } from "react";
import { CartContext } from "../context/CartContext";
import { AuthContext, useAxios } from "../context/AuthContext";
import { useNavigate } from "react-router-dom"; // ✅ useNavigate already imported
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaCreditCard, FaMoneyBillWave, FaMapMarkerAlt, FaPlus, FaArrowLeft } from "react-icons/fa"; // ✅ Added FaArrowLeft

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const { cart, clearCart, totalPrice } = useContext(CartContext);
  const api = useAxios();
  const navigate = useNavigate();

  // State Management
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // New Address Form State
  const [newAddress, setNewAddress] = useState({
    name: "", phone: "", street: "", city: "", state: "", zip_code: "", is_default: false
  });

  // 1. PROTECTION: CHECK USER & EMPTY CART
  useEffect(() => {
    if (!user) {
      toast.warn("Please login to checkout");
      navigate("/login");
    } else if (cart.length === 0 && !loading) {
      navigate("/products", { replace: true });
    } else {
      fetchAddresses();
    }
  }, [user, cart, navigate, loading]);

  const fetchAddresses = async () => {
    try {
      const res = await api.get("/addresses/");
      setAddresses(res.data);

      if (res.data.length > 0) {
        const defaultAddr = res.data.find(addr => addr.is_default);
        setSelectedAddressId(defaultAddr ? defaultAddr.id : res.data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch addresses");
    }
  };

  const handleAddressChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const saveAddress = async () => {
    if (!newAddress.name || !newAddress.street || !newAddress.city || !newAddress.zip_code || !newAddress.phone) {
      toast.warn("Please fill all required fields");
      return;
    }
    try {
      const res = await api.post("/addresses/", newAddress);
      setAddresses([...addresses, res.data]);
      setSelectedAddressId(res.data.id);
      setIsAddingNew(false);
      toast.success("Address added successfully!");
    } catch (err) {
      toast.error("Failed to save address");
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // 4. Handle Online Payment (Razorpay Logic)
  const handleOnlinePayment = async (orderId, amount) => {
    const isLoaded = await loadRazorpay();
    if (!isLoaded) {
      toast.error("Razorpay SDK failed to load");
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.post("/payment/create/", {
        amount: amount,
        order_id: orderId
      });

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: "EchoBay",
        description: `Order #${orderId}`,
        order_id: data.id,

        handler: async function (response) {
          try {
            await api.post("/payment/verify/", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderId
            });

            toast.success("Payment Successful!");
            clearCart();

            navigate("/success", {
              state: { fromCheckout: true, orderId: orderId },
              replace: true
            });

          } catch (err) {
            console.error(err);
            toast.error("Payment Verification Failed");
            setLoading(false);
            navigate("/orders");
          }
        },
        prefill: {
          name: user.username || "",
          email: user.email || "",
          contact: addresses.find(a => a.id === selectedAddressId)?.phone || ""
        },
        theme: { color: "#bf0603" },
        modal: {
          ondismiss: function () {
            toast.info("Payment Cancelled");
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        toast.error("Payment Failed: " + response.error.description);
        setLoading(false);
      });
      rzp.open();

    } catch (err) {
      console.error(err);
      toast.error("Failed to initiate payment. Please try again.");
      setLoading(false);
    }
  };

  // 5. Final Submit Logic
  const handleSubmit = async () => {
    if (!selectedAddressId) {
      toast.warn("Please select a shipping address");
      return;
    }

    setLoading(true);

    const selectedAddrObject = addresses.find(a => a.id === selectedAddressId);
    if (!selectedAddrObject) {
      toast.error("Selected address not found!");
      setLoading(false);
      return;
    }

    const finalTotal = paymentMethod === "cod" ? totalPrice + 50 : totalPrice;

    try {
      const res = await api.post("/orders/checkout/", {
        total_amount: finalTotal,
        shipping_details: selectedAddrObject,
        payment_method: paymentMethod,
      });

      if (paymentMethod === "online") {
        await handleOnlinePayment(res.data.order_id, finalTotal);
      } else {
        toast.success("Order placed successfully!");
        clearCart();

        navigate("/success", {
          state: { fromCheckout: true, orderId: res.data.order_id },
          replace: true
        });
      }

    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        toast.error(err.response.data.error || "Order failed.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !selectedAddressId && !isAddingNew) {
      toast.warn("Please select an address");
      return;
    }
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  // ✅ UPDATED PREV STEP LOGIC:
  // Step 1 ആണെങ്കിൽ Cart-ലേക്ക് പോകും. അല്ലെങ്കിൽ പഴയ സ്റ്റെപ്പിലേക്ക്.
  const prevStep = () => {
    if (currentStep === 1) {
      navigate("/cart"); // 🛒 Back to Cart
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a192f] via-[#0f1b32] to-[#020617] text-[#f2e8cf] py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ y: -20 }} animate={{ y: 0 }}
          className="text-3xl font-bold text-[#f4d58d] mb-6 text-center"
        >
          Checkout
        </motion.h2>

        {/* --- STEPS INDICATOR --- */}
        <div className="flex justify-between mb-8 border-b border-[#708d81]/30 pb-4">
          {["Shipping", "Payment", "Review"].map((label, i) => (
            <div key={i} className={`flex flex-col items-center ${currentStep === i + 1 ? "text-[#f4d58d]" : "text-[#708d81]"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 font-bold ${currentStep === i + 1 ? "bg-[#f4d58d] text-black" : "bg-[#0f1b32] border border-[#708d81]"}`}>
                {i + 1}
              </div>
              <span className="text-sm">{label}</span>
            </div>
          ))}
        </div>

        {/* --- STEP 1: SHIPPING ADDRESS --- */}
        {currentStep === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-[#f4d58d]">Select Shipping Address</h3>
              <button
                onClick={() => setIsAddingNew(!isAddingNew)}
                className="flex items-center gap-2 text-[#f4d58d] border border-[#f4d58d] px-3 py-1 rounded hover:bg-[#f4d58d] hover:text-black transition"
              >
                <FaPlus /> {isAddingNew ? "Cancel" : "Add New"}
              </button>
            </div>

            {!isAddingNew && (
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`relative p-4 border rounded-lg cursor-pointer transition-all ${selectedAddressId === addr.id
                      ? "border-[#f4d58d] bg-[#f4d58d]/10 shadow-[0_0_10px_rgba(244,213,141,0.2)]"
                      : "border-[#708d81]/30 hover:border-[#708d81]"
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FaMapMarkerAlt className="text-[#f4d58d]" />
                      <span className="font-bold text-lg">{addr.name}</span>
                    </div>
                    <p className="text-sm text-[#f2e8cf]/80">{addr.street}, {addr.city}</p>
                    <p className="text-sm text-[#f2e8cf]/80">{addr.state} - {addr.zip_code}</p>
                    <p className="text-sm text-[#708d81] mt-2 font-mono">📞 {addr.phone}</p>
                  </div>
                ))}
                {addresses.length === 0 && (
                  <div className="col-span-2 text-center py-10 border border-dashed border-[#708d81] rounded-lg">
                    <p className="text-[#708d81] mb-2">No saved addresses found.</p>
                    <button onClick={() => setIsAddingNew(true)} className="text-[#f4d58d] underline">Add your first address</button>
                  </div>
                )}
              </div>
            )}

            {isAddingNew && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-[#001427]/50 p-6 rounded-lg border border-[#708d81]/30">
                <h4 className="text-lg font-bold text-[#f4d58d] mb-4">Add New Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="name" placeholder="Full Name" onChange={handleAddressChange} className="bg-[#0f1b32] border border-[#708d81]/50 p-3 rounded text-white focus:border-[#f4d58d] outline-none" />
                  <input name="phone" placeholder="Phone Number" onChange={handleAddressChange} className="bg-[#0f1b32] border border-[#708d81]/50 p-3 rounded text-white focus:border-[#f4d58d] outline-none" />
                  <input name="street" placeholder="Street Address / Building" onChange={handleAddressChange} className="md:col-span-2 bg-[#0f1b32] border border-[#708d81]/50 p-3 rounded text-white focus:border-[#f4d58d] outline-none" />
                  <input name="city" placeholder="City" onChange={handleAddressChange} className="bg-[#0f1b32] border border-[#708d81]/50 p-3 rounded text-white focus:border-[#f4d58d] outline-none" />
                  <input name="state" placeholder="State" onChange={handleAddressChange} className="bg-[#0f1b32] border border-[#708d81]/50 p-3 rounded text-white focus:border-[#f4d58d] outline-none" />
                  <input name="zip_code" placeholder="ZIP Code" onChange={handleAddressChange} className="bg-[#0f1b32] border border-[#708d81]/50 p-3 rounded text-white focus:border-[#f4d58d] outline-none" />
                </div>
                <button onClick={saveAddress} className="mt-6 w-full bg-[#f4d58d] text-black px-4 py-3 rounded-lg font-bold hover:bg-[#e0c070] transition">
                  Save Address
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* --- STEP 2: PAYMENT METHOD --- */}
        {currentStep === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="text-xl font-semibold text-[#f4d58d] mb-6">Choose Payment Method</h3>
            <div className="flex flex-col md:flex-row gap-4">
              <button
                onClick={() => setPaymentMethod("online")}
                className={`flex-1 p-8 border rounded-lg flex flex-col items-center gap-3 transition-all ${paymentMethod === "online"
                  ? "border-[#f4d58d] bg-[#f4d58d]/10 text-[#f4d58d] shadow-[0_0_15px_rgba(244,213,141,0.2)]"
                  : "border-[#708d81]/30 text-[#708d81] hover:bg-[#708d81]/10"
                  }`}
              >
                <FaCreditCard size={32} />
                <span className="font-bold text-lg">Pay Online</span>
                <span className="text-xs text-[#708d81]">(Razorpay Secure)</span>
              </button>

              <button
                onClick={() => setPaymentMethod("cod")}
                className={`flex-1 p-8 border rounded-lg flex flex-col items-center gap-3 transition-all ${paymentMethod === "cod"
                  ? "border-[#f4d58d] bg-[#f4d58d]/10 text-[#f4d58d] shadow-[0_0_15px_rgba(244,213,141,0.2)]"
                  : "border-[#708d81]/30 text-[#708d81] hover:bg-[#708d81]/10"
                  }`}
              >
                <FaMoneyBillWave size={32} />
                <span className="font-bold text-lg">Cash on Delivery</span>
                <span className="text-xs text-[#bf0603] font-bold bg-[#bf0603]/10 px-2 py-1 rounded">+ ₹50 Handling Fee</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* --- STEP 3: REVIEW --- */}
        {currentStep === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="text-xl font-semibold text-[#f4d58d] mb-4">Order Summary</h3>
            <div className="bg-[#0f1b32] p-6 rounded-lg border border-[#708d81]/30">

              <div className="space-y-3 mb-4">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-[#708d81]/20">
                    <div className="flex items-center gap-3">
                      <span className="text-[#f4d58d] font-bold">{item.quantity}x</span>
                      <span>{item.name}</span>
                    </div>
                    <span className="font-mono">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="mb-4 p-3 bg-[#001427] rounded text-sm text-[#708d81]">
                <p className="font-bold text-[#f2e8cf] mb-1">Delivering to:</p>
                {addresses.find(a => a.id === selectedAddressId)?.name}, <br />
                {addresses.find(a => a.id === selectedAddressId)?.street}, {addresses.find(a => a.id === selectedAddressId)?.city}
              </div>

              <div className="flex justify-between mt-4 text-[#708d81]">
                <span>Subtotal</span>
                <span>₹{totalPrice}</span>
              </div>
              {paymentMethod === 'cod' && (
                <div className="flex justify-between text-[#708d81]">
                  <span>COD Fee</span>
                  <span>₹50</span>
                </div>
              )}
              <div className="flex justify-between mt-4 pt-4 border-t border-[#708d81]/50 text-xl font-bold text-[#f4d58d]">
                <span>Total Amount</span>
                <span>₹{paymentMethod === 'cod' ? totalPrice + 50 : totalPrice}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- NAVIGATION BUTTONS --- */}
        <div className="flex justify-between mt-8 pt-6 border-t border-[#708d81]/20">
          <button
            onClick={prevStep} // ✅ Updated Logic
            className="flex items-center gap-2 px-6 py-3 rounded-lg border border-[#708d81] font-medium transition hover:bg-[#708d81]/20 text-[#f4d58d]"
          >
            {/* Step 1 ആണെങ്കിൽ "Back to Cart" എന്ന് കാണിക്കും */}
            {currentStep === 1 ? (
              <><FaArrowLeft /> Back to Cart</>
            ) : (
              "Back"
            )}
          </button>

          {currentStep < 3 ? (
            <button
              onClick={nextStep}
              disabled={isAddingNew}
              className="bg-gradient-to-r from-[#8d0801] to-[#bf0603] text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:shadow-red-900/50 transition transform hover:scale-105"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-[#f4d58d] text-black px-10 py-3 rounded-lg font-bold hover:bg-[#e0c070] shadow-[0_0_20px_rgba(244,213,141,0.3)] transition transform hover:scale-105 flex items-center gap-2"
            >
              {loading ? "Processing..." : `Pay ₹${paymentMethod === 'cod' ? totalPrice + 50 : totalPrice}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;