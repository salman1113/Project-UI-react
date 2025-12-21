import React, { useEffect, useState } from "react";
import { useAxios } from "../../context/AuthContext";
import { FiUserX, FiUserCheck, FiSearch, FiMail, FiUsers, FiX, FiChevronRight, FiUser, FiTrash2 } from "react-icons/fi"; // FiTrash2 added
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const AdminUsers = () => {
  const api = useAxios();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // User Profile Modal States
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Nested Order Detail Modal States
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users/");
      setUsers(res.data.results || res.data || []);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchFullUserDetails = async (user) => {
    setSelectedUser(user);
    setShowProfileModal(true);
    setLoadingDetails(true);
    try {
      const res = await api.get(`/admin/orders/?user=${user.id}`);
      const data = res.data.results || res.data;
      setUserOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error:", error);
      setUserOrders([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const toggleBlock = async (user) => {
    const action = user.is_active ? 'block' : 'unblock';
    if (window.confirm(`Are you sure you want to ${action} ${user.username}?`)) {
        try {
            await api.patch(`/admin/users/${user.id}/`, { is_active: !user.is_active });
            setUsers(users.map(u => u.id === user.id ? { ...u, is_active: !user.is_active } : u));
            toast.success(`User updated successfully`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    }
  };

  // ✅ DELETE USER FUNCTION
  const handleDeleteUser = async (user) => {
    if (window.confirm(`⚠️ WARNING: Are you sure you want to PERMANENTLY DELETE ${user.username}? This cannot be undone.`)) {
        try {
            await api.delete(`/admin/users/${user.id}/`);
            // UI Update: Remove user from list
            setUsers(users.filter(u => u.id !== user.id));
            setShowProfileModal(false); // Close modal if open
            toast.success("User deleted permanently");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete user. Check if they have active orders.");
        }
    }
  };

  // ✅ FILTER: Show only Non-Admin Users
  const filteredUsers = users.filter(user => 
    !user.is_superuser && // 👈 Only show normal users
    (user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#f4d58d] flex items-center gap-2">
            <FiUsers className="text-[#bf0603]" /> User Management
          </h1>
        </div>
        <div className="relative w-full sm:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#708d81]" />
            <input 
                type="text" placeholder="Search customer..." 
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#001c3d] border border-[#708d81]/20 pl-10 pr-4 py-2.5 rounded-xl text-white outline-none focus:border-[#f4d58d]"
            />
        </div>
      </div>
      
      {/* USERS TABLE */}
      <div className="bg-[#001c3d] rounded-2xl border border-[#708d81]/20 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[850px]">
            <thead className="bg-[#001427] text-[#708d81] text-xs uppercase tracking-widest">
              <tr>
                <th className="p-5">User</th>
                <th className="p-5">Joined</th>
                <th className="p-5 text-center">Orders</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#708d81]/10">
              {loading ? (
                  <tr><td colSpan="5" className="p-10 text-center"><div className="w-8 h-8 border-2 border-[#f4d58d] border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
              ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan="5" className="p-10 text-center text-gray-500">No customers found.</td></tr>
              ) : (
                  filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#001427]/40 transition-colors group">
                      <td className="p-5 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#708d81] to-[#001427] flex items-center justify-center text-white font-bold border border-[#708d81]/30 shadow-lg">
                              {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                              <div className="font-bold text-[#f2e8cf]">{user.username}</div>
                              <div className="text-[10px] text-[#708d81]">{user.email}</div>
                          </div>
                      </td>
                      <td className="p-5 text-xs text-[#708d81]">{new Date(user.date_joined).toLocaleDateString()}</td>
                      <td className="p-5 text-center font-bold text-[#f4d58d]">{user.order_count || 0}</td>
                      <td className="p-5">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold ${user.is_active ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                              {user.is_active ? '● Active' : '● Blocked'}
                          </span>
                      </td>
                      <td className="p-5 text-right space-x-2 flex justify-end">
                          {/* View Profile */}
                          <button onClick={() => fetchFullUserDetails(user)} className="p-2 bg-[#f4d58d]/10 text-[#f4d58d] rounded-lg hover:bg-[#f4d58d] hover:text-[#001427] transition-all" title="View Details">
                            <FiUser size={16} />
                          </button>
                          
                          {/* Block/Unblock */}
                          <button onClick={() => toggleBlock(user)} className={`p-2 rounded-lg transition-all border ${user.is_active ? 'text-orange-400 border-orange-500/20 hover:bg-orange-500 hover:text-white' : 'text-green-400 border-green-500/20 hover:bg-green-500 hover:text-white'}`} title={user.is_active ? "Block User" : "Unblock User"}>
                              {user.is_active ? <FiUserX size={16} /> : <FiUserCheck size={16} />}
                          </button>

                          {/* ✅ Delete Button */}
                          <button onClick={() => handleDeleteUser(user)} className="p-2 rounded-lg text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all" title="Delete User">
                              <FiTrash2 size={16} />
                          </button>
                      </td>
                  </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🟦 MODAL 1: FULL USER PROFILE */}
      <AnimatePresence>
        {showProfileModal && selectedUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-[#001c3d] w-full max-w-4xl rounded-3xl border border-[#708d81]/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-[#708d81]/20 flex justify-between items-start bg-[#001427]/50">
                <div className="flex gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-[#f4d58d] flex items-center justify-center text-[#001427] font-black text-2xl shadow-xl shadow-[#f4d58d]/10">
                    {selectedUser.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#f2e8cf]">{selectedUser.username}</h2>
                    <p className="text-[#708d81] flex items-center gap-1 text-sm mt-1"><FiMail /> {selectedUser.email}</p>
                    <div className="mt-2 flex gap-2">
                         <span className={`text-[10px] px-2 py-0.5 rounded ${selectedUser.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                             {selectedUser.is_active ? "Active Account" : "Blocked Account"}
                         </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowProfileModal(false)} className="p-2 bg-[#001427] rounded-full text-gray-400 hover:text-white transition-colors"><FiX size={24} /></button>
              </div>

              {/* Modal Body */}
              <div className="p-8 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-6 text-sm">
                  <div className="bg-[#001427]/50 p-5 rounded-2xl border border-[#708d81]/10 space-y-4">
                    <h3 className="text-[#f4d58d] text-xs font-black uppercase tracking-widest border-b border-[#708d81]/10 pb-2">User Stats</h3>
                    <p className="text-gray-300 flex justify-between">Joined: <span className="text-white">{new Date(selectedUser.date_joined).toDateString()}</span></p>
                    <p className="text-gray-300 flex justify-between">Total Orders: <span className="text-[#f4d58d] font-bold">{selectedUser.order_count}</span></p>
                  </div>
                  
                  {/* Danger Zone in Profile */}
                  <div className="pt-4 border-t border-red-500/20">
                      <button onClick={() => handleDeleteUser(selectedUser)} className="w-full py-3 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500 hover:text-white transition-all font-bold flex items-center justify-center gap-2">
                          <FiTrash2 /> Delete Customer
                      </button>
                  </div>
                </div>

                {/* ORDER HISTORY LIST */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-[#f4d58d] text-xs font-black uppercase tracking-widest">Order History</h3>
                  {loadingDetails ? (
                    <div className="py-20 text-center"><div className="w-6 h-6 border-2 border-[#f4d58d] border-t-transparent rounded-full animate-spin mx-auto"></div></div>
                  ) : userOrders.length > 0 ? (
                    <div className="space-y-3">
                      {userOrders.map((order) => (
                        <div 
                           key={order.id} 
                           onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }}
                           className="bg-[#001427] p-4 rounded-2xl border border-[#708d81]/10 flex justify-between items-center group hover:border-[#f4d58d]/50 cursor-pointer transition-all active:scale-[0.98]"
                        >
                          <div>
                            <p className="text-[#f2e8cf] font-bold">Order #{order.id}</p>
                            <span className="text-[10px] uppercase text-blue-400 font-bold">{order.status}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-[#f4d58d] font-black text-lg">₹{Number(order.total_amount).toLocaleString()}</p>
                                <p className="text-[10px] text-[#708d81]">{new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                            <FiChevronRight className="text-[#708d81] group-hover:text-[#f4d58d] transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-[#001427]/30 rounded-3xl border-2 border-dashed border-[#708d81]/10 text-[#708d81] italic">No purchases found.</div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-[#001427]/80 border-t border-[#708d81]/20 text-right">
                 <button onClick={() => setShowProfileModal(false)} className="px-8 py-2.5 bg-[#f2e8cf] text-[#001427] font-black rounded-xl hover:bg-[#f4d58d] transition-all">CLOSE</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🟧 MODAL 2: ORDER DETAILS */}
      <AnimatePresence>
        {showOrderModal && selectedOrder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-[#00254d] w-full max-w-xl rounded-3xl border border-[#f4d58d]/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="p-6 border-b border-[#708d81]/20 flex justify-between items-center bg-[#001427]">
                <h3 className="text-lg font-bold text-[#f4d58d]">Order Content #{selectedOrder.id}</h3>
                <button onClick={() => setShowOrderModal(false)} className="p-2 text-gray-400 hover:text-white"><FiX size={20} /></button>
              </div>

              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                {/* Shipping Details */}
                <div className="bg-[#001427]/50 p-4 rounded-xl border border-[#708d81]/10">
                    <p className="text-[10px] text-[#708d81] font-bold uppercase mb-2">Delivery Address</p>
                    <p className="text-sm text-gray-300">
                        {typeof selectedOrder.shipping_details === 'string' 
                            ? selectedOrder.shipping_details 
                            : JSON.stringify(selectedOrder.shipping_details)}
                    </p>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  <p className="text-[10px] text-[#708d81] font-bold uppercase">Purchased Items</p>
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center bg-[#001427] p-3 rounded-2xl">
                      <img src={item.product_image || "https://placehold.co/100"} className="w-12 h-12 rounded-lg object-cover bg-white" alt="" />
                      <div className="flex-1">
                        <p className="text-white text-sm font-bold">{item.product_name}</p>
                        <p className="text-[#708d81] text-xs">{item.quantity} units × ₹{item.price}</p>
                      </div>
                      <p className="text-[#f4d58d] font-bold">₹{item.quantity * item.price}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-[#001427] border-t border-[#708d81]/20 flex justify-between items-center">
                 <p className="text-gray-400 text-sm">Status: <span className="text-blue-400 uppercase font-bold">{selectedOrder.status}</span></p>
                 <button onClick={() => setShowOrderModal(false)} className="px-6 py-2 bg-[#bf0603] text-white font-bold rounded-xl shadow-lg">CLOSE</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsers;