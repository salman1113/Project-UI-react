import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAxios } from "../../context/AuthContext";
import { motion } from "framer-motion";
import {
  FiBox, FiUsers, FiShoppingBag, FiDollarSign,
  FiClock, FiActivity, FiArrowUpRight, FiPackage, FiTrendingUp
} from "react-icons/fi";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const AdminDashboard = () => {
  const api = useAxios();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      total_products: 0,
      total_users: 0,
      total_orders: 0,
      total_revenue: 0
    },
    recentOrders: [],
    allOrders: [] 
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes] = await Promise.all([
        api.get("/admin/stats/"),
        api.get("/admin/orders/") 
      ]);

      const orders = ordersRes.data.results || (Array.isArray(ordersRes.data) ? ordersRes.data : []);
      
      const recent = [...orders]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      setDashboardData({
        stats: statsRes.data,
        recentOrders: recent,
        allOrders: orders
      });

    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 📊 REVENUE GRAPH DATA
  const revenueChartData = useMemo(() => {
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        last6Months.push({
            name: date.toLocaleString('default', { month: 'short' }),
            month: date.getMonth(),
            year: date.getFullYear(),
            revenue: 0,
            orders: 0
        });
    }

    dashboardData.allOrders.forEach(order => {
        if (order.status !== 'cancelled') {
            const orderDate = new Date(order.created_at);
            const month = orderDate.getMonth();
            const year = orderDate.getFullYear();

            const monthData = last6Months.find(m => m.month === month && m.year === year);
            if (monthData) {
                monthData.revenue += Number(order.total_amount);
                monthData.orders += 1;
            }
        }
    });

    return last6Months;
  }, [dashboardData.allOrders]);

  // 🥧 PIE CHART DATA
  const pieChartData = useMemo(() => {
    const statusCounts = {
        delivered: 0,
        pending: 0,
        cancelled: 0,
        processing: 0
    };

    dashboardData.allOrders.forEach(order => {
        const status = order.status?.toLowerCase();
        if (status === 'delivered') statusCounts.delivered++;
        else if (status === 'cancelled') statusCounts.cancelled++;
        else if (status === 'pending' || status === 'pending_payment') statusCounts.pending++;
        else statusCounts.processing++;
    });

    return [
        { name: 'Delivered', value: statusCounts.delivered, color: '#10b981' },
        { name: 'Pending', value: statusCounts.pending, color: '#f59e0b' },
        { name: 'Processing', value: statusCounts.processing, color: '#3b82f6' },
        { name: 'Cancelled', value: statusCounts.cancelled, color: '#ef4444' },
    ].filter(item => item.value > 0);
  }, [dashboardData.allOrders]);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0a192f] p-3 border border-[#233554] rounded-lg shadow-xl">
          <p className="text-gray-400 text-xs mb-1">{label}</p>
          <p className="text-[#f4d58d] font-bold text-sm">₹{payload[0].value.toLocaleString()}</p>
          {payload[0].payload.orders !== undefined && (
             <p className="text-blue-400 text-xs mt-1">Orders: {payload[0].payload.orders}</p>
          )}
        </div>
      );
    }
    return null;
  };

  const StatCard = ({ title, value, icon, gradient }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`relative overflow-hidden rounded-2xl p-6 shadow-xl border border-white/5 ${gradient}`}
    >
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-gray-200 text-xs font-bold uppercase tracking-wider mb-1 opacity-80">{title}</p>
          <h3 className="text-3xl font-black text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-white/20 text-white backdrop-blur-md shadow-inner`}>{icon}</div>
      </div>
      <div className="absolute -bottom-6 -right-6 text-white/10 rotate-12 transform scale-150">
        {React.cloneElement(icon, { size: 80 })}
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a192f]">
        <div className="w-16 h-16 border-4 border-[#f4d58d] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 bg-[#0a192f] min-h-screen text-gray-300">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            Admin Dashboard <span className="text-xs bg-[#f4d58d] text-[#0a192f] px-2 py-0.5 rounded font-black tracking-wide">PRO</span>
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Real-time overview of your store's performance.</p>
        </div>
        <div className="flex items-center gap-3 bg-[#112240] px-4 py-2 rounded-xl border border-[#233554] text-gray-300 text-sm font-mono shadow-sm">
          <FiClock className="text-[#f4d58d]" />
          <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`₹${Number(dashboardData.stats.total_revenue || 0).toLocaleString()}`}
          icon={<FiDollarSign size={24} />}
          gradient="bg-gradient-to-br from-emerald-600 to-emerald-900"
        />
        <StatCard
          title="Total Orders"
          value={dashboardData.stats.total_orders || 0}
          icon={<FiShoppingBag size={24} />}
          gradient="bg-gradient-to-br from-blue-600 to-blue-900"
        />
        <StatCard
          title="Products"
          value={dashboardData.stats.total_products || 0}
          icon={<FiBox size={24} />}
          gradient="bg-gradient-to-br from-purple-600 to-purple-900"
        />
        <StatCard
          title="Total Users"
          value={dashboardData.stats.total_users || 0}
          icon={<FiUsers size={24} />}
          gradient="bg-gradient-to-br from-orange-600 to-orange-900"
        />
      </div>

      {/* 3. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* REVENUE CHART - Fixed Height Here */}
        <div className="lg:col-span-2 bg-[#112240] p-6 rounded-2xl border border-[#233554] shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FiTrendingUp className="text-[#f4d58d]" /> Monthly Revenue
            </h3>
          </div>
          <div className="w-full h-[300px]">
            {revenueChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueChartData}>
                    <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f4d58d" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f4d58d" stopOpacity={0}/>
                    </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#233554" vertical={false} />
                    <XAxis dataKey="name" stroke="#8892b0" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                    <YAxis stroke="#8892b0" tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" stroke="#f4d58d" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <FiActivity size={40} className="mb-2 opacity-50"/>
                    <p>Not enough data for chart</p>
                </div>
            )}
          </div>
        </div>

        {/* ORDER STATUS PIE CHART - Fixed Height Here */}
        <div className="bg-[#112240] p-6 rounded-2xl border border-[#233554] shadow-xl flex flex-col">
          <h3 className="text-lg font-bold text-white mb-2">Order Status</h3>
          <p className="text-xs text-gray-500 mb-6">Real-time status distribution</p>
          
          {/* 👇 FIXED HEIGHT ADDED HERE (h-[250px]) */}
          <div className="w-full h-[250px] relative">
            {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                    data={pieChartData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    >
                    {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">No orders yet</div>
            )}
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-white">{dashboardData.stats.total_orders}</span>
                <span className="text-xs text-gray-500 uppercase tracking-widest">Total</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {pieChartData.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    {item.name} <span className="text-white font-bold ml-auto">{item.value}</span>
                </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. RECENT ORDERS & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#112240] rounded-2xl border border-[#233554] shadow-xl overflow-hidden">
          <div className="p-6 border-b border-[#233554] flex justify-between items-center bg-[#112240]">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FiActivity className="text-blue-400" /> Recent Orders
            </h3>
            <Link to="/admin/orders" className="text-xs font-bold text-[#f4d58d] hover:text-[#f4d58d]/80 flex items-center gap-1 bg-[#f4d58d]/10 px-3 py-1.5 rounded-lg transition-colors">
              VIEW ALL <FiArrowUpRight />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#0a192f] text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                <tr>
                  <th className="p-5">Order ID</th>
                  <th className="p-5">Customer</th>
                  <th className="p-5">Amount</th>
                  <th className="p-5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#233554]">
                {dashboardData.recentOrders.length > 0 ? (
                  dashboardData.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#1d2d50] transition-colors group">
                      <td className="p-5 font-mono text-[#f4d58d] text-sm font-bold">#{order.id}</td>
                      <td className="p-5">
                        <div className="text-white text-sm font-bold">{order.username || "Guest"}</div>
                        <div className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="p-5 text-white font-bold text-sm">₹{Number(order.total_amount).toLocaleString()}</td>
                      <td className="p-5 text-center">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          order.status === 'delivered' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          order.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" className="p-10 text-center text-gray-500 italic">No recent orders found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#112240] rounded-2xl border border-[#233554] p-6 shadow-xl h-fit">
          <h3 className="text-lg font-bold text-white mb-6">Quick Actions</h3>
          <div className="space-y-4">
            {[
                { title: "Manage Products", desc: "Inventory & Prices", link: "/admin/products", icon: <FiBox />, color: "text-blue-400", bg: "bg-blue-500/20" },
                { title: "Process Orders", desc: "Shipments & Tracking", link: "/admin/orders", icon: <FiPackage />, color: "text-green-400", bg: "bg-green-500/20" },
                { title: "Customer List", desc: "User Management", link: "/admin/users", icon: <FiUsers />, color: "text-purple-400", bg: "bg-purple-500/20" },
            ].map((item, idx) => (
                <Link key={idx} to={item.link} className="flex items-center gap-4 p-4 rounded-xl bg-[#0a192f] border border-[#233554] hover:border-white/20 hover:bg-[#152a4a] transition-all group">
                    <div className={`${item.bg} ${item.color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                        {React.cloneElement(item.icon, { size: 20 })}
                    </div>
                    <div>
                        <h4 className={`font-bold text-gray-200 group-hover:${item.color} transition-colors`}>{item.title}</h4>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <FiArrowUpRight className="ml-auto text-gray-600 group-hover:text-white transition-colors" />
                </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;