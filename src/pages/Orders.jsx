import { useContext, useEffect, useState } from "react";
import { AuthContext, useAxios } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPackage, FiCheckCircle, FiTruck, FiClock, FiChevronLeft, FiChevronRight, FiXCircle, FiCreditCard, FiChevronDown, FiChevronUp, FiMapPin, FiActivity
} from "react-icons/fi";

// --- SUB COMPONENT: INDIVIDUAL ORDER CARD ---
const OrderCard = ({ order, onRetryPayment, onCancelOrder }) => {
  const [showTracking, setShowTracking] = useState(false);
  const [showShipping, setShowShipping] = useState(false);

  // Helper: Status Colors
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": case "pending_payment": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "processing": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "shipped": return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      case "delivered": return "text-green-400 bg-green-500/10 border-green-500/20";
      default: return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  // Helper: Tracking Steps
  const getTrackingSteps = (status) => {
    const steps = [
      { label: 'Ordered', icon: <FiClock /> },
      { label: 'Processing', icon: <FiPackage /> },
      { label: 'Shipped', icon: <FiTruck /> },
      { label: 'Delivered', icon: <FiCheckCircle /> }
    ];
    let activeStep = 0;
    switch (status?.toLowerCase()) {
      case 'pending': case 'pending_payment': activeStep = 0; break;
      case 'processing': activeStep = 1; break;
      case 'shipped': activeStep = 2; break;
      case 'delivered': activeStep = 3; break;
      default: activeStep = 0;
    }
    return { steps, activeStep };
  };

  const { steps, activeStep } = getTrackingSteps(order.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#001c3d] rounded-xl shadow-xl overflow-hidden border border-[#708d81]/20 mb-6"
    >
      {/* 1. HEADER (Always Visible) */}
      <div className="p-6 border-b border-[#708d81]/20 bg-[#001427]/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#f4d58d] flex items-center gap-2">
            Order #{order.trackingNumber}
          </h3>
          <p className="text-[#708d81] text-sm mt-1">
            Placed on {new Date(order.date).toLocaleDateString("en-IN")}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-4 py-1 rounded-full text-xs font-bold border capitalize ${getStatusColor(order.status)}`}>
            {order.status.replace('_', ' ')}
          </span>
          <span className="text-[#f2e8cf] font-bold text-xl">₹{Number(order.total).toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* 2. ORDER ITEMS (Always Visible) */}
      <div className="p-6 space-y-4">
        {order.items?.map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 bg-[#001427] p-3 rounded-lg border border-[#708d81]/10">
            <div className="w-16 h-16 bg-black rounded-md overflow-hidden flex-shrink-0">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = "/default-product.png"; }} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-[#f2e8cf]">{item.name}</h4>
              <p className="text-xs text-[#708d81]">{item.category}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#f2e8cf] font-bold">₹{Number(item.price).toLocaleString("en-IN")}</p>
              <p className="text-xs text-[#708d81]">Qty: {item.quantity}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 3. DROPDOWN TOGGLES */}
      <div className="px-6 pb-4 flex flex-wrap gap-4">
        {/* Toggle Tracking */}
        <button
          onClick={() => setShowTracking(!showTracking)}
          className="flex items-center gap-2 text-sm text-[#f4d58d] hover:text-white transition-colors"
        >
          <FiActivity /> {showTracking ? "Hide Tracking" : "Track Order"} {showTracking ? <FiChevronUp /> : <FiChevronDown />}
        </button>

        {/* Toggle Shipping */}
        <button
          onClick={() => setShowShipping(!showShipping)}
          className="flex items-center gap-2 text-sm text-[#708d81] hover:text-white transition-colors"
        >
          <FiMapPin /> {showShipping ? "Hide Shipping Details" : "View Shipping Details"} {showShipping ? <FiChevronUp /> : <FiChevronDown />}
        </button>
      </div>

      {/* 4. EXPANDABLE SECTIONS */}
      <AnimatePresence>
        {/* A. Tracking Timeline Dropdown */}
        {showTracking && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-[#001830] border-t border-[#708d81]/10"
          >
            <div className="p-6">
              <div className="relative flex items-center justify-between w-full max-w-3xl mx-auto mt-2 mb-2">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-700 -z-0"></div>
                <div
                  className="absolute top-1/2 left-0 h-1 bg-[#bf0603] -z-0 transition-all duration-500"
                  style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
                ></div>
                {steps.map((step, i) => (
                  <div key={i} className="flex flex-col items-center z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-[#001830] ${i <= activeStep ? 'border-[#bf0603] text-[#bf0603] scale-110' : 'border-gray-600 text-gray-500'}`}>
                      {step.icon}
                    </div>
                    <span className={`text-[10px] sm:text-xs mt-2 font-medium ${i <= activeStep ? 'text-[#f4d58d]' : 'text-gray-500'}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* B. Shipping Details Dropdown */}
        {showShipping && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-[#001427]/30 border-t border-[#708d81]/10"
          >
            <div className="p-6 text-sm text-[#f2e8cf]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-[#708d81] font-bold mb-1 uppercase text-xs">Delivery Address</h5>
                  <p>{order.shipping?.name}</p>
                  <p>{order.shipping?.address || order.shipping?.street}</p>
                  <p>{order.shipping?.city}, {order.shipping?.state} - {order.shipping?.zip_code}</p>
                </div>
                <div>
                  <h5 className="text-[#708d81] font-bold mb-1 uppercase text-xs">Payment Info</h5>
                  <p>Method: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                  <p>Status: <span className="capitalize">{order.status.replace('_', ' ')}</span></p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. FOOTER ACTIONS (Always Visible) */}
      <div className="p-6 border-t border-[#708d81]/20 flex justify-end gap-3 bg-[#001427]/30">
        {order.status === 'pending_payment' && (
          <button onClick={() => onRetryPayment(order.id)} className="flex items-center gap-2 px-4 py-2 bg-[#bf0603] text-white rounded-lg hover:bg-[#8d0801] transition-all text-sm font-medium">
            <FiCreditCard /> Pay Now
          </button>
        )}
        {order.status !== 'delivered' && (
          <button onClick={() => onCancelOrder(order.id)} className="flex items-center gap-2 px-4 py-2 border border-[#bf0603] text-[#bf0603] rounded-lg hover:bg-[#bf0603] hover:text-white transition-all text-sm font-medium">
            <FiXCircle /> Cancel Order
          </button>
        )}
      </div>
    </motion.div>
  );
};


// --- MAIN COMPONENT ---
const Orders = () => {
  // ✅ FIX: Extract 'tokens' from AuthContext
  const { user, tokens } = useContext(AuthContext);
  const api = useAxios();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false); // Default false, wait for tokens

  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [currentUrl, setCurrentUrl] = useState("/orders/");

  const navigate = useNavigate();

  // --- FETCH ORDERS ---
  const fetchOrders = async (url) => {
    try {
      setLoading(true);
      const res = await api.get(url);
      const data = res.data;
      const ordersData = data.results || [];

      setNextPage(data.next);
      setPrevPage(data.previous);

      const activeOrders = ordersData.filter(order => order.status !== 'cancelled');

      const transformedOrders = activeOrders.map(order => ({
        id: order.id,
        trackingNumber: `TRK-${order.id}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: order.status,
        date: order.created_at,
        total: order.total_amount,
        shipping: order.shipping_details,
        paymentMethod: order.payment_method,
        items: order.items.map(item => ({
          name: item.product.name,
          category: item.product.category,
          price: item.price,
          quantity: item.quantity,
          image: item.product.images && item.product.images.length > 0
            ? item.product.images[0]
            : "/default-product.png"
        }))
      }));

      setOrders(transformedOrders);
    } catch (err) {
      console.error("Order Fetch Error:", err);
      // Don't show generic error on 401, handled globally
      if (err.response?.status !== 401) {
        toast.error("Failed to fetch orders");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: UseEffect waits for 'tokens' to be ready
  useEffect(() => {
    if (!user) {
      toast.warn("Please login to view your orders");
      navigate("/login");
      return;
    }

    // 🔥 Only fetch if tokens exist
    if (tokens) {
      fetchOrders(currentUrl);
    }
  }, [user, tokens, navigate, api, currentUrl]);

  // --- HELPERS ---
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRetryPayment = async (orderId) => {
    const isLoaded = await loadRazorpay();
    if (!isLoaded) { toast.error("Razorpay SDK failed to load"); return; }
    try {
      const { data } = await api.post(`/orders/${orderId}/retry-payment/`);
      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: "EchoBay",
        description: `Retry Payment for Order #${orderId}`,
        order_id: data.razorpay_order_id,
        handler: async function (response) {
          try {
            await api.post("/payment/verify/", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderId
            });
            toast.success("Payment Successful!");
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'processing' } : o));
          } catch (err) { toast.error("Payment Verification Failed"); }
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#bf0603" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) { toast.error(err.response?.data?.error || "Failed to initiate payment"); }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await api.post(`/orders/${orderId}/cancel/`);
      toast.success("Order cancelled successfully");
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    } catch (err) { toast.error(err.response?.data?.error || "Failed to cancel order"); }
  };

  const handleNext = () => {
    if (nextPage) {
      const url = new URL(nextPage);
      setCurrentUrl(url.pathname + url.search);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (prevPage) {
      const url = new URL(prevPage);
      setCurrentUrl(url.pathname + url.search);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading && orders.length === 0) {
    return <div className="flex justify-center items-center min-h-screen bg-[#001427] text-[#f2e8cf]">Loading...</div>;
  }

  return (
    <div className="mx-auto px-4 py-12 bg-[#001427] min-h-screen">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-[#f4d58d] mb-2">Order History</h2>
        <div className="w-20 h-1 bg-[#708d81] rounded"></div>
      </motion.div>

      {orders.length === 0 && !loading ? (
        <div className="text-center py-20 max-w-5xl mx-auto border border-dashed border-[#708d81]/30 rounded-2xl">
          <p className="text-[#f2e8cf]">No active orders found.</p>
          <Link to="/products" className="text-[#bf0603] underline mt-2 block">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-8 max-w-5xl mx-auto">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onRetryPayment={handleRetryPayment}
              onCancelOrder={handleCancelOrder}
            />
          ))}

          {(prevPage || nextPage) && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button onClick={handlePrev} disabled={!prevPage} className={`flex items-center px-5 py-2.5 rounded-lg border font-medium ${!prevPage ? 'border-gray-700 text-gray-600 cursor-not-allowed' : 'border-[#708d81] text-[#f2e8cf] hover:bg-[#708d81] hover:text-[#001427]'}`}>
                <FiChevronLeft className="mr-2" /> Previous
              </button>
              <button onClick={handleNext} disabled={!nextPage} className={`flex items-center px-5 py-2.5 rounded-lg border font-medium ${!nextPage ? 'border-gray-700 text-gray-600 cursor-not-allowed' : 'border-[#708d81] text-[#f2e8cf] hover:bg-[#708d81] hover:text-[#001427]'}`}>
                Next <FiChevronRight className="ml-2" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;