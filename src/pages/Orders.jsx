import { useContext, useEffect, useState } from "react";
import { AuthContext, useAxios } from "../context/AuthContext"; 
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiPackage, FiCheckCircle, FiTruck, FiClock, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const Orders = () => {
  const { user } = useContext(AuthContext);
  const api = useAxios(); 
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [currentUrl, setCurrentUrl] = useState("/orders/"); // Start with default URL

  const navigate = useNavigate();

  const fetchOrders = async (url) => {
    try {
      setLoading(true);
      const res = await api.get(url);
      
      // Django Pagination Response: { count: 10, next: "...", previous: "...", results: [...] }
      const data = res.data;
      const ordersData = data.results || []; // Get the array from 'results'
      
      setNextPage(data.next);
      setPrevPage(data.previous);

      const transformedOrders = ordersData.map(order => ({
        id: order.id,
        trackingNumber: `TRK${order.id}${Math.floor(1000 + Math.random() * 9000)}`,
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
                 : "/placeholder.jpg"
        }))
      }));

      setOrders(transformedOrders);
    } catch (err) {
      toast.error(
        <div className="flex items-center text-[#f2e8cf]">
          <span className="mr-2">✕</span> Failed to fetch orders
        </div>
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      toast.warn(
        <div className="flex items-center text-[#f2e8cf]">
          <span className="mr-2">⚠️</span> Please login to view your orders
        </div>
      );
      navigate("/login");
      return;
    }

    fetchOrders(currentUrl);
  }, [user, navigate, api, currentUrl]); 

  // Pagination Handlers
  const handleNext = () => {
    if (nextPage) {
        // Extract relative path from full URL provided by Django
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
      case "processing":
        return "bg-[#f4d58d] text-[#001427]";
      case "shipped":
        return "bg-[#6a994e] text-[#f2e8cf]";
      case "delivered":
        return "bg-[#386641] text-[#f2e8cf]";
      case "cancelled":
        return "bg-[#bf0603] text-white";
      default:
        return "bg-gray-300 text-black";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
      case "processing":
        return <FiClock className="mr-2" />;
      case "shipped":
        return <FiTruck className="mr-2" />;
      case "delivered":
        return <FiCheckCircle className="mr-2" />;
      default:
        return <FiPackage className="mr-2" />;
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] bg-[#001427]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#bf0603]"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-12 bg-[#001427] min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 flex justify-between items-center max-w-5xl mx-auto"
      >
        <div>
          <h2 className="text-3xl font-bold text-[#f4d58d] mb-2">Order History</h2>
          <div className="w-20 h-1 bg-[#708d81]"></div>
        </div>
      </motion.div>

      {orders.length === 0 && !loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 max-w-5xl mx-auto"
        >
          <div className="inline-block p-6 bg-[#001c3d] rounded-full mb-6">
            <FiPackage className="h-12 w-12 text-[#708d81]" />
          </div>
          <h3 className="text-xl font-medium text-[#f2e8cf] mb-2">
            No orders yet
          </h3>
          <p className="text-[#708d81] mb-6">
            Your order history will appear here
          </p>
          <Link
            to="/products"
            className="inline-block px-6 py-3 bg-[#bf0603] hover:bg-[#8d0801] text-[#f2e8cf] rounded-lg font-medium transition-colors"
          >
            Browse Products
          </Link>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8 max-w-5xl mx-auto"
        >
          {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#001c3d] rounded-lg shadow-lg overflow-hidden border border-[#708d81]/30"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-[#f4d58d]">
                        Order #{order.trackingNumber}
                      </h3>
                      <p className="text-[#708d81] text-sm">
                        Placed on {new Date(order.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {order.items?.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex items-start space-x-4 p-4 bg-[#001427] rounded-lg border border-[#708d81]/20"
                      >
                        <div className="flex-shrink-0 w-24 h-24 bg-[#001427] rounded overflow-hidden border border-[#708d81]/30">
                          <img
                            src={item.image}
                            alt={item.name || "Product"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/placeholder.jpg";
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-[#f2e8cf]">
                            {item.name}
                          </h4>
                          <p className="text-[#708d81] text-sm capitalize">
                            {item.category}
                          </p>
                          <p className="text-[#f4d58d] font-bold mt-1">
                            ₹{Number(item.price).toLocaleString("en-IN")}
                          </p>
                          <p className="text-[#708d81] text-sm">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#f2e8cf]">
                            ₹
                            {(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#708d81]/20">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-[#708d81] mb-1">
                          Shipping Address
                        </h5>
                        <p className="text-[#f2e8cf] text-sm">
                          {order.shipping?.address || "N/A"},{" "}
                          {order.shipping?.city || "N/A"},{" "}
                          {order.shipping?.state || "N/A"},{" "}
                          {order.shipping?.zip || "N/A"}
                        </p>
                        <p className="text-[#708d81] text-sm mt-1">
                          Payment Method:{" "}
                          <span className="text-[#f4d58d] capitalize">
                            {order.paymentMethod === "cod" ? "Cash on Delivery" : "Card"}
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <h5 className="text-sm font-medium text-[#708d81] mb-1">
                          Order Total
                        </h5>
                        <p className="text-2xl font-bold text-[#f4d58d]">
                          ₹{Number(order.total).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          
          {/* Pagination Controls */}
          {(prevPage || nextPage) && (
            <div className="flex justify-center items-center gap-4 mt-8">
                <button 
                    onClick={handlePrev} 
                    disabled={!prevPage}
                    className={`flex items-center px-4 py-2 rounded-lg border ${!prevPage ? 'border-gray-600 text-gray-600 cursor-not-allowed' : 'border-[#bf0603] text-[#f2e8cf] hover:bg-[#bf0603]'}`}
                >
                    <FiChevronLeft className="mr-2" /> Previous
                </button>
                <button 
                    onClick={handleNext} 
                    disabled={!nextPage}
                    className={`flex items-center px-4 py-2 rounded-lg border ${!nextPage ? 'border-gray-600 text-gray-600 cursor-not-allowed' : 'border-[#bf0603] text-[#f2e8cf] hover:bg-[#bf0603]'}`}
                >
                    Next <FiChevronRight className="ml-2" />
                </button>
            </div>
          )}

        </motion.div>
      )}
    </div>
  );
};

export default Orders;