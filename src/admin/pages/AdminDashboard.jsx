import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAxios } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { 
  FiBox, FiUsers, FiShoppingBag, FiDollarSign, 
  FiArrowUpRight, FiClock, FiActivity, FiAlertCircle 
} from "react-icons/fi";

const AdminDashboard = () => {
  const api = useAxios();
  const [data, setData] = useState({
    stats: { 
        total_products: 0, 
        total_users: 0, 
        total_orders: 0, 
        total_revenue: 0 
    },
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

// AdminDashboard.jsx-ൽ ഈ മാറ്റം വരുത്തുക

  useEffect(() => {
    // ടോക്കൺ ഉണ്ടോ എന്ന് ഉറപ്പുവരുത്തിയ ശേഷം മാത്രം ഡാറ്റ വിളിക്കുക
    const storedTokens = localStorage.getItem("tokens");
    if (storedTokens) {
        fetchDashboardData();
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Parallel Fetching
      const [statsRes, ordersRes] = await Promise.all([
        api.get("/admin/stats/"),
        api.get("/admin/orders/")
      ]);

      // Pagination Handle ചെയ്യുന്നു
      const allOrders = ordersRes.data.results || (Array.isArray(ordersRes.data) ? ordersRes.data : []);
      
      const recent = allOrders
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      setData({
        stats: statsRes.data,
        recentOrders: recent
      });
    } catch (error) {
      console.error("Dashboard Load Error:", error);
      // 401 ഒഴികെയുള്ള എററുകൾക്ക് മാത്രം ടോസ്റ്റ് കാണിക്കുക
      if (error.response?.status !== 401) {
          // toast.error("Failed to load dashboard statistics");
      }
    } finally {
      setLoading(false);
    }
  };
  const StatCard = ({ title, value, icon, color, delay }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay, duration: 0.4 }}
      className="bg-[#001c3d] p-6 rounded-2xl border border-[#708d81]/20 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 relative overflow-hidden group"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-xl bg-[#001427] text-${color}-400 border border-[#708d81]/10`}>
          {icon}
        </div>
        {/* Placeholder for growth indicator */}
        {/* <span className="flex items-center text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
          <FiArrowUpRight className="mr-1" /> +2.5%
        </span> */}
      </div>
      
      <h3 className="text-[#708d81] text-sm font-medium uppercase tracking-wider mb-1">{title}</h3>
      <h2 className="text-3xl font-bold text-[#f2e8cf]">{value}</h2>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#001427]">
        <div className="w-12 h-12 border-4 border-[#f4d58d] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#001427] text-[#f2e8cf] p-6 md:p-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#f4d58d]">Overview</h1>
          <p className="text-[#708d81] mt-1">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0 bg-[#001c3d] px-4 py-2 rounded-lg border border-[#708d81]/20 text-sm text-[#708d81]">
          <FiClock /> 
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          title="Total Revenue" 
          value={`₹${Number(data.stats.total_revenue || 0).toLocaleString()}`} 
          icon={<FiDollarSign size={24} />} 
          color="green"
          delay={0.1}
        />
        <StatCard 
          title="Total Orders" 
          value={data.stats.total_orders || 0} 
          icon={<FiShoppingBag size={24} />} 
          color="blue"
          delay={0.2}
        />
        <StatCard 
          title="Products" 
          value={data.stats.total_products || 0} 
          icon={<FiBox size={24} />} 
          color="purple"
          delay={0.3}
        />
        <StatCard 
          title="Total Users" 
          value={data.stats.total_users || 0} 
          icon={<FiUsers size={24} />} 
          color="orange"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: RECENT ORDERS */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-[#001c3d] rounded-2xl border border-[#708d81]/20 overflow-hidden shadow-lg"
        >
          <div className="p-6 border-b border-[#708d81]/20 flex justify-between items-center">
            <h3 className="text-lg font-bold text-[#f4d58d] flex items-center gap-2">
              <FiActivity /> Recent Orders
            </h3>
            <Link to="/admin/orders" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              View All
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#001427] text-[#708d81] text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-medium">Order ID</th>
                  <th className="p-4 font-medium">User</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#708d81]/10">
                {data.recentOrders.length > 0 ? (
                  data.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#00254d]/30 transition-colors">
                      <td className="p-4 text-sm font-mono text-white">#{order.id}</td>
                      <td className="p-4 text-sm">{order.username || order.user?.username || "Guest"}</td>
                      <td className="p-4 text-sm text-[#708d81]">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm font-bold text-[#f4d58d]">₹{Number(order.total_amount).toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                          order.status === 'delivered' ? 'bg-green-500/10 text-green-400' :
                          order.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                          'bg-blue-500/10 text-blue-400'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-[#708d81] flex flex-col items-center justify-center w-full">
                        <FiAlertCircle size={30} className="mb-2 opacity-50"/>
                        No recent orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: QUICK ACTIONS */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-[#001c3d] rounded-2xl border border-[#708d81]/20 p-6 shadow-lg h-fit"
        >
          <h3 className="text-lg font-bold text-[#f4d58d] mb-6">Quick Actions</h3>
          
          <div className="space-y-4">
            <Link to="/admin/products" className="block w-full group">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#001427] border border-[#708d81]/20 group-hover:border-blue-500/50 transition-all">
                <div className="bg-blue-500/20 text-blue-400 p-3 rounded-lg group-hover:scale-110 transition-transform">
                  <FiBox size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">Add Product</h4>
                  <p className="text-xs text-[#708d81]">Manage inventory & stock</p>
                </div>
              </div>
            </Link>

            <Link to="/admin/orders" className="block w-full group">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#001427] border border-[#708d81]/20 group-hover:border-green-500/50 transition-all">
                <div className="bg-green-500/20 text-green-400 p-3 rounded-lg group-hover:scale-110 transition-transform">
                  <FiShoppingBag size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white group-hover:text-green-400 transition-colors">Process Orders</h4>
                  <p className="text-xs text-[#708d81]">Update shipping status</p>
                </div>
              </div>
            </Link>

            <Link to="/admin/users" className="block w-full group">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#001427] border border-[#708d81]/20 group-hover:border-purple-500/50 transition-all">
                <div className="bg-purple-500/20 text-purple-400 p-3 rounded-lg group-hover:scale-110 transition-transform">
                  <FiUsers size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white group-hover:text-purple-400 transition-colors">Manage Users</h4>
                  <p className="text-xs text-[#708d81]">View customers & roles</p>
                </div>
              </div>
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default AdminDashboard;