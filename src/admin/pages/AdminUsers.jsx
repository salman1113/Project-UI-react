import React, { useEffect, useState, useMemo } from "react";
import { useAxios } from "../../context/AuthContext";
import { 
  FiUserX, FiUserCheck, FiSearch, FiUsers, FiX, 
  FiChevronRight, FiUser, FiTrash2, FiActivity, FiShield, 
  FiShoppingBag, FiCalendar, FiMapPin, FiPhone, FiMail 
} from "react-icons/fi";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const AdminUsers = () => {
  const api = useAxios();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

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
        if (selectedUser && selectedUser.id === user.id) {
            setSelectedUser({ ...selectedUser, is_active: !user.is_active });
        }
      } catch (error) {
        toast.error("Failed to update status");
      }
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`⚠️ WARNING: Are you sure you want to PERMANENTLY DELETE ${user.username}? This cannot be undone.`)) {
      try {
        await api.delete(`/admin/users/${user.id}/`);
        setUsers(users.filter(u => u.id !== user.id));
        setShowProfileModal(false);
        toast.success("User deleted permanently");
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete user. Check if they have active orders.");
      }
    }
  };

  // ✅ 1. Filter out Admins (Superusers) first
  const customers = useMemo(() => {
    return users.filter(user => !user.is_superuser);
  }, [users]);

  // ✅ 2. Calculate Stats based ONLY on Customers (No Admins)
  const stats = useMemo(() => {
    return {
        total: customers.length,
        active: customers.filter(u => u.is_active).length,
        blocked: customers.filter(u => !u.is_active).length
    };
  }, [customers]);

  // ✅ 3. Search Filter applied on Customers list
  const filteredUsers = customers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderAddress = (details) => {
    if (!details) return "No address provided";
    let addr = details;
    if (typeof details === 'string') {
      try { addr = JSON.parse(details); } catch (e) { return details; }
    }
    return (
      <div className="text-sm text-gray-300">
        <p className="font-bold text-[#f2e8cf]">{addr.full_name || addr.name || "N/A"}</p>
        <p>{addr.house_no || addr.address}, {addr.city}</p>
        <p>{addr.state} - <span className="text-[#f4d58d]">{addr.pincode || addr.zip}</span></p>
        <p className="mt-1 flex items-center gap-2 text-xs text-[#708d81]"><FiPhone /> {addr.phone || addr.mobile}</p>
      </div>
    );
  };

  return (
    <div className="space-y-8 p-2">
      
      {/* 1. HEADER & STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <h1 className="text-3xl font-bold text-[#f4d58d] flex items-center gap-3">
            <FiUsers className="text-[#bf0603]" /> Customers
          </h1>
          <p className="text-[#708d81] text-sm mt-1">Manage user access & data.</p>
        </div>
        
        {/* Stat Cards */}
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#001c3d] border border-[#708d81]/20 p-4 rounded-xl flex items-center justify-between shadow-lg">
                <div>
                    <p className="text-[#708d81] text-xs font-bold uppercase">Total Customers</p>
                    <p className="text-2xl font-black text-white">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400"><FiUsers size={24} /></div>
            </div>
            <div className="bg-[#001c3d] border border-[#708d81]/20 p-4 rounded-xl flex items-center justify-between shadow-lg">
                <div>
                    <p className="text-[#708d81] text-xs font-bold uppercase">Active</p>
                    <p className="text-2xl font-black text-[#f4d58d]">{stats.active}</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg text-green-400"><FiActivity size={24} /></div>
            </div>
            <div className="bg-[#001c3d] border border-[#708d81]/20 p-4 rounded-xl flex items-center justify-between shadow-lg">
                <div>
                    <p className="text-[#708d81] text-xs font-bold uppercase">Blocked</p>
                    <p className="text-2xl font-black text-red-400">{stats.blocked}</p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-lg text-red-400"><FiShield size={24} /></div>
            </div>
        </div>
      </div>

      {/* 2. SEARCH BAR */}
      <div className="bg-[#001c3d] p-4 rounded-2xl border border-[#708d81]/10 flex items-center shadow-lg">
        <FiSearch className="text-[#708d81] ml-2" size={20} />
        <input
            type="text" placeholder="Search by name or email..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none px-4 text-white outline-none placeholder:text-gray-600 font-medium"
        />
      </div>

      {/* 3. USERS TABLE */}
      <div className="bg-[#001c3d] rounded-2xl border border-[#708d81]/20 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[850px]">
            <thead className="bg-[#0a192f] text-[#708d81] text-xs uppercase tracking-widest font-bold">
              <tr>
                <th className="p-6">User Profile</th>
                <th className="p-6">Joined Date</th>
                <th className="p-6 text-center">Orders</th>
                <th className="p-6 text-center">Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#708d81]/10">
              {loading ? (
                <tr><td colSpan="5" className="p-12 text-center text-gray-400 animate-pulse">Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="5" className="p-12 text-center text-gray-500 italic">No customers found.</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <motion.tr 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    key={user.id} 
                    className="hover:bg-[#f4d58d]/5 transition-colors group"
                  >
                    <td className="p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#001427] to-[#00254d] border border-[#708d81]/30 flex items-center justify-center text-[#f4d58d] font-black text-xl shadow-lg">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-[#f2e8cf] text-base group-hover:text-[#f4d58d] transition-colors">{user.username}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1"><FiMail size={10} /> {user.email}</div>
                      </div>
                    </td>
                    <td className="p-5 text-sm text-gray-400">
                        <div className="flex items-center gap-2"><FiCalendar size={14}/> {new Date(user.date_joined).toLocaleDateString()}</div>
                    </td>
                    <td className="p-5 text-center">
                        <span className="bg-[#001427] px-3 py-1 rounded-lg border border-[#708d81]/20 font-bold text-[#f2e8cf]">{user.order_count || 0}</span>
                    </td>
                    <td className="p-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${user.is_active ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                        {user.is_active ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => fetchFullUserDetails(user)} className="p-2.5 rounded-xl text-blue-400 hover:bg-blue-500/10 transition-all border border-blue-500/20" title="View Profile">
                          <FiUser size={18} />
                        </button>
                        <button onClick={() => toggleBlock(user)} className={`p-2.5 rounded-xl transition-all border ${user.is_active ? 'text-orange-400 border-orange-500/20 hover:bg-orange-500/10' : 'text-green-400 border-green-500/20 hover:bg-green-500/10'}`} title={user.is_active ? "Block" : "Unblock"}>
                          {user.is_active ? <FiUserX size={18} /> : <FiUserCheck size={18} />}
                        </button>
                        <button onClick={() => handleDeleteUser(user)} className="p-2.5 rounded-xl text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all" title="Delete User">
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. USER PROFILE MODAL (CRM STYLE) */}
      <AnimatePresence>
        {showProfileModal && selectedUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <motion.div 
                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} 
                className="bg-[#001c3d] w-full max-w-5xl rounded-3xl border border-[#708d81]/30 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              
              {/* LEFT SIDEBAR: USER INFO */}
              <div className="md:w-[30%] bg-[#001427] p-8 border-r border-[#708d81]/20 flex flex-col items-center text-center overflow-y-auto">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#f4d58d] to-[#bf0603] flex items-center justify-center text-[#001427] font-black text-4xl shadow-xl mb-6">
                  {selectedUser.username.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-2xl font-bold text-[#f2e8cf] mb-1">{selectedUser.username}</h2>
                <p className="text-[#708d81] text-sm break-all mb-4">{selectedUser.email}</p>
                
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-8 ${selectedUser.is_active ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {selectedUser.is_active ? "Active Account" : "Blocked Account"}
                </span>

                <div className="w-full space-y-4 border-t border-[#708d81]/20 pt-6">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Joined</span>
                        <span className="text-gray-300">{new Date(selectedUser.date_joined).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Orders</span>
                        <span className="text-[#f4d58d] font-bold">{selectedUser.order_count}</span>
                    </div>
                </div>

                <div className="mt-auto w-full pt-8 space-y-3">
                    <button onClick={() => toggleBlock(selectedUser)} className="w-full py-2.5 rounded-xl border border-[#708d81]/30 text-[#708d81] hover:bg-[#708d81] hover:text-[#001427] font-bold transition-all text-sm">
                        {selectedUser.is_active ? "Block User" : "Unblock User"}
                    </button>
                    <button onClick={() => handleDeleteUser(selectedUser)} className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white font-bold transition-all text-sm">
                        Delete Customer
                    </button>
                </div>
              </div>

              {/* RIGHT SIDE: ORDER HISTORY */}
              <div className="md:w-[70%] p-8 bg-[#001c3d] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[#f4d58d] flex items-center gap-2"><FiShoppingBag /> Order History</h3>
                    <button onClick={() => setShowProfileModal(false)} className="p-2 rounded-full hover:bg-[#708d81]/10 transition-colors"><FiX size={24} className="text-gray-400" /></button>
                </div>

                {loadingDetails ? (
                    <div className="py-20 text-center"><div className="w-8 h-8 border-2 border-[#f4d58d] border-t-transparent rounded-full animate-spin mx-auto"></div></div>
                ) : userOrders.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                        {userOrders.map((order) => (
                        <div 
                            key={order.id} 
                            onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }}
                            className="bg-[#001427] p-4 rounded-xl border border-[#708d81]/10 flex justify-between items-center group hover:border-[#f4d58d]/30 cursor-pointer transition-all hover:bg-[#0a1f3d]"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-[#001c3d] flex items-center justify-center border border-[#708d81]/20 text-[#708d81] font-mono text-xs">#{order.id}</div>
                                <div>
                                    <p className="text-[#f2e8cf] font-bold text-sm">₹{Number(order.total_amount).toLocaleString()}</p>
                                    <p className="text-[10px] text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${order.status === 'delivered' ? 'text-green-400' : 'text-blue-400'}`}>{order.status}</span>
                                <FiChevronRight className="text-gray-600 group-hover:text-[#f4d58d]" />
                            </div>
                        </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-[#001427]/30 rounded-3xl border-2 border-dashed border-[#708d81]/10">
                        <FiShoppingBag className="mx-auto text-[#708d81] mb-2 opacity-50" size={32} />
                        <p className="text-gray-500 text-sm">No orders placed by this user yet.</p>
                    </div>
                )}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. ORDER DETAILS MODAL (Nested) */}
      <AnimatePresence>
        {showOrderModal && selectedOrder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className="bg-[#001c3d] w-full max-w-lg rounded-2xl border border-[#f4d58d]/20 shadow-2xl overflow-hidden">
              <div className="p-5 border-b border-[#708d81]/20 flex justify-between items-center bg-[#001427]">
                <h3 className="text-lg font-bold text-[#f4d58d]">Order #{selectedOrder.id}</h3>
                <button onClick={() => setShowOrderModal(false)} className="p-1.5 text-gray-400 hover:text-white bg-[#001c3d] rounded-full"><FiX size={18} /></button>
              </div>

              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                <div className="bg-[#001427]/50 p-4 rounded-xl border border-[#708d81]/10">
                  <p className="text-[10px] text-[#708d81] font-bold uppercase mb-2 flex items-center gap-1"><FiMapPin /> Delivery Address</p>
                  {renderAddress(selectedOrder.shipping_details)}
                </div>

                <div>
                  <p className="text-[10px] text-[#708d81] font-bold uppercase mb-3">Items</p>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-center bg-[#001427] p-3 rounded-xl border border-[#708d81]/5">
                        <img src={item.product_image || "https://placehold.co/100"} className="w-12 h-12 rounded-lg object-cover bg-white" alt="" />
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-200 text-sm font-medium truncate">{item.product_name}</p>
                          <p className="text-[#708d81] text-xs">Qty: {item.quantity} × ₹{Number(item.price).toLocaleString()}</p>
                        </div>
                        <p className="text-[#f4d58d] font-bold text-sm">₹{Number(item.quantity * item.price).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsers;