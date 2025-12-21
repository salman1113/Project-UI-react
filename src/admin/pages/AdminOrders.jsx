import React, { useEffect, useState } from "react";
import { useAxios } from "../../context/AuthContext";
import { FiEdit, FiCheck, FiX, FiClock, FiSearch, FiShoppingBag, FiEye, FiMapPin, FiPhone, FiCreditCard, FiHash, FiUser } from "react-icons/fi";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const AdminOrders = () => {
  const api = useAxios();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [tempStatus, setTempStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Details Modal States
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const statusOptions = ["pending", "pending_payment", "processing", "shipped", "delivered", "cancelled"];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/orders/"); 
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
      toast.success("Order status updated");
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

  const filteredOrders = orders.filter(order => 
      order.id.toString().includes(searchTerm) || 
      order.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Helper to parse address if it's a JSON string ---
  const renderAddress = (details) => {
    if (!details) return "No address provided";
    let addr = details;
    if (typeof details === 'string') {
        try { addr = JSON.parse(details); } catch (e) { return details; }
    }
    return (
      <div className="space-y-1 text-sm text-gray-300">
        <p className="font-bold text-[#f2e8cf] flex items-center gap-2"><FiUser size={14}/> {addr.full_name || addr.name || "N/A"}</p>
        <p className="flex items-center gap-2"><FiPhone size={14}/> {addr.phone || addr.mobile || "N/A"}</p>
        <p className="flex items-start gap-2 mt-2">
          <FiMapPin className="mt-1 flex-shrink-0" size={14}/>
          <span>{addr.house_no || addr.address}, {addr.landmark && `${addr.landmark},`} <br/> 
          {addr.city}, {addr.state} - <span className="font-bold text-[#f4d58d]">{addr.pincode || addr.zip}</span></span>
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 🟢 HEADER & SEARCH */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#f4d58d] flex items-center gap-2">
            <FiShoppingBag className="text-[#bf0603]" /> Orders Management
          </h1>
          <p className="text-[#708d81] text-sm">Monitor and update customer orders.</p>
        </div>
        <div className="relative w-full sm:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#708d81]" />
            <input type="text" placeholder="Search ID, Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#001c3d] border border-[#708d81]/20 pl-10 pr-4 py-2.5 rounded-xl text-white outline-none focus:border-[#f4d58d] transition-all shadow-lg"
            />
        </div>
      </div>
      
      {/* 🟢 ORDERS TABLE */}
      <div className="bg-[#001c3d] rounded-2xl border border-[#708d81]/20 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[950px]">
            <thead className="bg-[#001427] text-[#708d81] text-xs uppercase tracking-wider">
              <tr>
                <th className="p-5">Order ID</th>
                <th className="p-5">Customer</th>
                <th className="p-5">Date</th>
                <th className="p-5">Total</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#708d81]/10">
              {loading ? (
                  <tr><td colSpan="6" className="p-10 text-center"><div className="w-8 h-8 border-2 border-[#f4d58d] border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
              ) : filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#001427]/40 transition-colors group">
                      <td className="p-5 font-mono text-sm text-[#f4d58d]">#{order.id}</td>
                      <td className="p-5">
                          <div className="font-bold text-[#f2e8cf]">{order.username || "Guest"}</div>
                          <div className="text-[10px] text-[#708d81]">{order.user_email}</div>
                      </td>
                      <td className="p-5 text-sm text-[#708d81]"><FiClock className="inline mr-1" size={12}/> {formatDate(order.created_at)}</td>
                      <td className="p-5 font-bold text-[#f2e8cf]">₹{Number(order.total_amount).toLocaleString("en-IN")}</td>
                      <td className="p-5">
                      {editingId === order.id ? (
                          <select value={tempStatus} onChange={(e) => setTempStatus(e.target.value)} className="bg-[#001427] border border-[#f4d58d] rounded-lg text-white p-1.5 text-xs outline-none">
                              {statusOptions.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                          </select>
                      ) : (
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${order.status === 'delivered' ? 'bg-green-500/10 text-green-400 border-green-500/20' : order.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                              {order.status.replace('_', ' ')}
                          </span>
                      )}
                      </td>
                      <td className="p-5">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => { setSelectedOrder(order); setShowDetailsModal(true); }} className="p-2.5 bg-[#f4d58d]/10 text-[#f4d58d] rounded-xl hover:bg-[#f4d58d] hover:text-[#001427] transition-all border border-[#f4d58d]/20"><FiEye size={18} /></button>
                          {editingId === order.id ? (
                              <><button onClick={() => updateStatus(order.id)} className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500 hover:text-white transition"><FiCheck/></button>
                                <button onClick={() => setEditingId(null)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition"><FiX/></button></>
                          ) : (
                              <button onClick={() => { setEditingId(order.id); setTempStatus(order.status); }} className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white border border-blue-500/20"><FiEdit size={18}/></button>
                          )}
                        </div>
                      </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🟦 FULL ORDER DETAILS MODAL */}
      <AnimatePresence>
        {showDetailsModal && selectedOrder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-[#001c3d] w-full max-w-4xl rounded-3xl border border-[#708d81]/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              
              <div className="p-6 border-b border-[#708d81]/20 flex justify-between items-center bg-[#001427]/50">
                <div>
                  <h2 className="text-xl font-bold text-[#f4d58d]">Order Full Details</h2>
                  <p className="text-xs text-[#708d81] flex items-center gap-1"><FiHash/> ID: {selectedOrder.id} • {formatDate(selectedOrder.created_at)}</p>
                </div>
                <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-white"><FiX size={24} /></button>
              </div>

              <div className="p-8 overflow-y-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Address Section */}
                  <div className="md:col-span-2 bg-[#001427] p-5 rounded-2xl border border-[#708d81]/10">
                    <h3 className="text-[#f4d58d] font-bold mb-4 text-xs uppercase tracking-widest border-b border-[#708d81]/10 pb-2">Shipping Information</h3>
                    {renderAddress(selectedOrder.shipping_details)}
                  </div>

                  {/* Payment & Status Info */}
                  <div className="bg-[#001427] p-5 rounded-2xl border border-[#708d81]/10 space-y-4">
                    <h3 className="text-[#f4d58d] font-bold text-xs uppercase tracking-widest border-b border-[#708d81]/10 pb-2">Order Info</h3>
                    <div>
                      <p className="text-[10px] text-[#708d81] uppercase font-bold">Status</p>
                      <p className="text-blue-400 font-bold uppercase text-sm">{selectedOrder.status.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#708d81] uppercase font-bold">Payment Method</p>
                      <p className="text-white text-sm flex items-center gap-2"><FiCreditCard/> {selectedOrder.payment_method?.toUpperCase()}</p>
                    </div>
                    {selectedOrder.razorpay_payment_id && (
                      <div>
                        <p className="text-[10px] text-[#708d81] uppercase font-bold">Transaction ID</p>
                        <p className="text-[10px] text-gray-400 font-mono">{selectedOrder.razorpay_payment_id}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items List */}
                <div>
                  <h3 className="text-[#f4d58d] font-bold mb-4 text-xs uppercase tracking-widest">Ordered Items ({selectedOrder.items?.length || 0})</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-[#001427]/40 p-4 rounded-2xl border border-[#708d81]/10 group hover:border-[#f4d58d]/30 transition-all">
                        <img src={item.product_image || "https://placehold.co/100"} className="w-16 h-16 rounded-xl object-cover bg-white shadow-lg" alt="" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[#f2e8cf] font-bold text-sm truncate">{item.product_name}</p>
                          <p className="text-[#708d81] text-xs mt-1">Price: ₹{Number(item.price).toLocaleString()} • Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#f4d58d] font-black">₹{Number(item.quantity * item.price).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[#001427] border-t border-[#708d81]/20 flex justify-between items-center">
                  <div className="text-left">
                    <p className="text-[10px] text-[#708d81] uppercase font-bold tracking-tighter">Customer</p>
                    <p className="text-white text-sm font-bold">{selectedOrder.user_email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[#708d81] uppercase font-bold">Grand Total</p>
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