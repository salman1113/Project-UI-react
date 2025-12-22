import React, { useEffect, useState, useMemo } from "react";
import { useAxios } from "../../context/AuthContext";
import { 
  FiEdit, FiCheck, FiX, FiClock, FiSearch, FiShoppingBag, FiEye, 
  FiMapPin, FiPhone, FiCreditCard, FiHash, FiUser, FiFilter, 
  FiDollarSign, FiBox, FiChevronLeft, FiChevronRight, FiPrinter 
} from "react-icons/fi";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const AdminOrders = () => {
  const api = useAxios();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [tempStatus, setTempStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // ✨ New Filter State
  const [page, setPage] = useState(1);

  // Details Modal States
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const statusOptions = ["pending", "pending_payment", "processing", "shipped", "delivered", "cancelled"];

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/orders/?page=${page}`);
      setOrders(res.data.results || res.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id) => {
    try {
      await api.patch(`/admin/orders/${id}/`, { status: tempStatus });
      toast.success("Order status updated successfully");
      setOrders(orders.map(o => o.id === id ? { ...o, status: tempStatus } : o));
      setEditingId(null);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // 📊 CALCULATE STATS (New Feature)
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((acc, curr) => acc + Number(curr.total_amount), 0);
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
    return { totalOrders, totalRevenue, pendingOrders };
  }, [orders]);

  // 🔍 ENHANCED FILTERING
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toString().includes(searchTerm) ||
      order.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'shipped': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'processing': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    }
  };

  const renderAddress = (details) => {
    if (!details) return "No address provided";
    let addr = details;
    if (typeof details === 'string') {
      try { addr = JSON.parse(details); } catch (e) { return details; }
    }
    return (
      <div className="space-y-2 text-sm text-gray-300">
        <p className="font-bold text-[#f2e8cf] flex items-center gap-2 text-base"><FiUser size={16} /> {addr.full_name || addr.name || "N/A"}</p>
        <p className="flex items-center gap-2"><FiPhone size={14} className="text-[#708d81]" /> {addr.phone || addr.mobile || "N/A"}</p>
        <div className="flex items-start gap-2 mt-2 bg-[#001c3d] p-3 rounded-lg border border-[#708d81]/20">
          <FiMapPin className="mt-1 flex-shrink-0 text-[#f4d58d]" size={16} />
          <span>{addr.house_no || addr.address}, {addr.landmark && `${addr.landmark},`} <br />
            {addr.city}, {addr.state} - <span className="font-bold text-[#f4d58d]">{addr.pincode || addr.zip}</span></span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 p-2">
      {/* 1. HEADER & STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-1">
          <h1 className="text-3xl font-bold text-[#f4d58d] flex items-center gap-3">
            <FiShoppingBag className="text-[#bf0603]" /> Orders
          </h1>
          <p className="text-[#708d81] text-sm mt-1">Manage & Track shipments.</p>
        </div>
        
        {/* Stat Cards */}
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#001c3d] border border-[#708d81]/20 p-4 rounded-xl flex items-center justify-between shadow-lg">
                <div>
                    <p className="text-[#708d81] text-xs font-bold uppercase">Total Revenue</p>
                    <p className="text-2xl font-black text-white">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg text-green-400"><FiDollarSign size={24} /></div>
            </div>
            <div className="bg-[#001c3d] border border-[#708d81]/20 p-4 rounded-xl flex items-center justify-between shadow-lg">
                <div>
                    <p className="text-[#708d81] text-xs font-bold uppercase">All Orders</p>
                    <p className="text-2xl font-black text-white">{stats.totalOrders}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400"><FiBox size={24} /></div>
            </div>
            <div className="bg-[#001c3d] border border-[#708d81]/20 p-4 rounded-xl flex items-center justify-between shadow-lg">
                <div>
                    <p className="text-[#708d81] text-xs font-bold uppercase">Pending</p>
                    <p className="text-2xl font-black text-[#f4d58d]">{stats.pendingOrders}</p>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-400"><FiClock size={24} /></div>
            </div>
        </div>
      </div>

      {/* 2. FILTERS & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#001c3d] p-4 rounded-2xl border border-[#708d81]/10">
        <div className="relative w-full md:w-96">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#708d81]" />
          <input 
            type="text" 
            placeholder="Search Order ID, Email or Name..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#001427] border border-[#708d81]/30 pl-11 pr-4 py-3 rounded-xl text-white outline-none focus:border-[#f4d58d] transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
            <FiFilter className="text-[#708d81]" />
            <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)} 
                className="bg-[#001427] text-white border border-[#708d81]/30 py-3 px-4 rounded-xl outline-none focus:border-[#f4d58d] cursor-pointer"
            >
                <option value="all">All Status</option>
                {statusOptions.map(s => <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>)}
            </select>
        </div>
      </div>

      {/* 3. ORDERS TABLE */}
      <div className="bg-[#001c3d] rounded-2xl border border-[#708d81]/20 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-[#0a192f] text-[#708d81] text-xs uppercase tracking-widest font-bold">
              <tr>
                <th className="p-6">Order ID</th>
                <th className="p-6">Customer</th>
                <th className="p-6">Date</th>
                <th className="p-6">Total</th>
                <th className="p-6 text-center">Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#708d81]/10">
              {loading ? (
                <tr><td colSpan="6" className="p-12 text-center text-gray-400 animate-pulse">Loading orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan="6" className="p-12 text-center text-gray-500 italic">No orders found matching your criteria.</td></tr>
              ) : filteredOrders.map((order) => (
                <motion.tr 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    key={order.id} 
                    className="hover:bg-[#f4d58d]/5 transition-colors group"
                >
                  <td className="p-6 font-mono text-sm text-[#f4d58d] font-bold">#{order.id}</td>
                  <td className="p-6">
                    <div className="font-bold text-[#f2e8cf]">{order.username || "Guest User"}</div>
                    <div className="text-xs text-gray-500">{order.user_email}</div>
                  </td>
                  <td className="p-6 text-sm text-gray-400">
                    <div className="flex items-center gap-1.5"><FiClock size={12}/> {formatDate(order.created_at)}</div>
                  </td>
                  <td className="p-6 font-black text-white text-lg">₹{Number(order.total_amount).toLocaleString("en-IN")}</td>
                  
                  {/* Status Column with Dropdown for Editing */}
                  <td className="p-6 text-center">
                    {editingId === order.id ? (
                      <select 
                        value={tempStatus} 
                        onChange={(e) => setTempStatus(e.target.value)} 
                        className="bg-[#001427] border border-[#f4d58d] rounded-lg text-white p-2 text-xs outline-none w-full"
                      >
                        {statusOptions.map(s => <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>)}
                      </select>
                    ) : (
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    )}
                  </td>

                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => { setSelectedOrder(order); setShowDetailsModal(true); }} 
                        className="p-2.5 rounded-xl text-gray-400 hover:text-[#f4d58d] hover:bg-[#f4d58d]/10 transition-all border border-transparent hover:border-[#f4d58d]/20" 
                        title="View Details"
                      >
                        <FiEye size={18} />
                      </button>
                      
                      {editingId === order.id ? (
                        <>
                          <button onClick={() => updateStatus(order.id)} className="p-2.5 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500 hover:text-white transition"><FiCheck size={18} /></button>
                          <button onClick={() => setEditingId(null)} className="p-2.5 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition"><FiX size={18} /></button>
                        </>
                      ) : (
                        <button 
                            onClick={() => { setEditingId(order.id); setTempStatus(order.status); }} 
                            className="p-2.5 rounded-xl text-blue-400 hover:text-white hover:bg-blue-500 transition-all border border-blue-500/20"
                            title="Update Status"
                        >
                            <FiEdit size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="p-4 border-t border-[#708d81]/20 flex justify-between items-center bg-[#0a192f]">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="flex items-center gap-2 text-sm text-[#708d81] hover:text-white disabled:opacity-50 transition">
                <FiChevronLeft /> Previous
            </button>
            <span className="text-xs font-mono text-[#708d81] bg-[#001c3d] px-3 py-1 rounded border border-[#708d81]/30">Page {page}</span>
            <button onClick={() => setPage(page + 1)} className="flex items-center gap-2 text-sm text-[#708d81] hover:text-white transition">
                Next <FiChevronRight />
            </button>
        </div>
      </div>

      {/* 4. FULL ORDER DETAILS MODAL (INVOICE STYLE) */}
      <AnimatePresence>
        {showDetailsModal && selectedOrder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <motion.div 
                initial={{ scale: 0.95, y: 20 }} 
                animate={{ scale: 1, y: 0 }} 
                exit={{ scale: 0.95, y: 20 }} 
                className="bg-[#001c3d] w-full max-w-4xl rounded-3xl border border-[#708d81]/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >

              {/* Modal Header */}
              <div className="p-6 border-b border-[#708d81]/20 flex justify-between items-center bg-[#001427]">
                <div>
                  <h2 className="text-xl font-bold text-[#f4d58d] flex items-center gap-2"><FiShoppingBag /> Order Details</h2>
                  <p className="text-xs text-[#708d81] flex items-center gap-2 mt-1">
                    <span className="bg-[#708d81]/10 px-2 py-0.5 rounded text-[#f4d58d] font-mono">#{selectedOrder.id}</span>
                    <span>•</span>
                    <span>{formatDate(selectedOrder.created_at)}</span>
                  </p>
                </div>
                <div className="flex gap-3">
                    <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#708d81]/10 text-[#708d81] rounded-lg hover:bg-[#708d81]/20 transition text-sm">
                        <FiPrinter /> Print Invoice
                    </button>
                    <button onClick={() => setShowDetailsModal(false)} className="bg-[#001c3d] p-2 rounded-full hover:bg-red-500/20 hover:text-red-400 transition border border-[#708d81]/20 text-gray-400">
                        <FiX size={20} />
                    </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Shipping Info */}
                  <div className="md:col-span-2 bg-[#001427] p-6 rounded-2xl border border-[#708d81]/10 shadow-inner">
                    <h3 className="text-[#f4d58d] font-bold mb-4 text-xs uppercase tracking-widest border-b border-[#708d81]/10 pb-2 flex items-center gap-2">
                        <FiMapPin /> Shipping Information
                    </h3>
                    {renderAddress(selectedOrder.shipping_details)}
                  </div>

                  {/* Payment & Status */}
                  <div className="bg-[#001427] p-6 rounded-2xl border border-[#708d81]/10 shadow-inner space-y-5">
                    <h3 className="text-[#f4d58d] font-bold text-xs uppercase tracking-widest border-b border-[#708d81]/10 pb-2">Order Status</h3>
                    <div>
                      <p className="text-[10px] text-[#708d81] uppercase font-bold mb-1">Current Status</p>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase border ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#708d81] uppercase font-bold mb-1">Payment Method</p>
                      <p className="text-white text-sm flex items-center gap-2 font-medium bg-[#001c3d] px-3 py-2 rounded-lg border border-[#708d81]/20">
                        <FiCreditCard className="text-[#f4d58d]" /> {selectedOrder.payment_method?.toUpperCase()}
                      </p>
                    </div>
                    {selectedOrder.razorpay_payment_id && (
                      <div>
                        <p className="text-[10px] text-[#708d81] uppercase font-bold mb-1">Transaction ID</p>
                        <p className="text-[10px] text-gray-300 font-mono bg-[#001c3d] p-2 rounded break-all border border-[#708d81]/10">{selectedOrder.razorpay_payment_id}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ordered Items Table */}
                <div>
                  <h3 className="text-[#f4d58d] font-bold mb-4 text-xs uppercase tracking-widest">Ordered Items ({selectedOrder.items?.length || 0})</h3>
                  <div className="border border-[#708d81]/20 rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-[#001427] text-[#708d81] text-xs uppercase">
                            <tr>
                                <th className="p-4">Product</th>
                                <th className="p-4 text-center">Qty</th>
                                <th className="p-4 text-right">Price</th>
                                <th className="p-4 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#708d81]/10 bg-[#001c3d]/50">
                            {selectedOrder.items?.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="p-4 flex items-center gap-4">
                                        <img src={item.product_image || "https://placehold.co/100"} className="w-12 h-12 rounded-lg object-cover bg-white shadow-sm" alt="" />
                                        <span className="text-[#f2e8cf] font-medium text-sm">{item.product_name}</span>
                                    </td>
                                    <td className="p-4 text-center text-gray-400 text-sm">x{item.quantity}</td>
                                    <td className="p-4 text-right text-gray-400 text-sm">₹{Number(item.price).toLocaleString()}</td>
                                    <td className="p-4 text-right text-[#f4d58d] font-bold text-sm">₹{Number(item.quantity * item.price).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Modal Footer (Totals) */}
              <div className="p-6 bg-[#001427] border-t border-[#708d81]/20 flex justify-between items-center">
                <div className="text-left">
                  <p className="text-[10px] text-[#708d81] uppercase font-bold tracking-tighter">Customer Email</p>
                  <p className="text-white text-sm font-bold">{selectedOrder.user_email}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[#708d81] uppercase font-bold">Grand Total Amount</p>
                  <p className="text-3xl font-black text-[#f4d58d]">₹{Number(selectedOrder.total_amount).toLocaleString("en-IN")}</p>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;