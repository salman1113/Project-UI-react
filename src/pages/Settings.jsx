import { useState, useContext, useEffect } from 'react';
import { AuthContext, useAxios } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiXCircle, FiMapPin, FiTrash, FiPlus, FiEdit, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router-dom';

const Settings = () => {
  const { user, updateProfile, changePassword } = useContext(AuthContext);
  const api = useAxios();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  const setActiveTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  const [loading, setLoading] = useState(false);

  // Profile & Password State
  const [profileData, setProfileData] = useState({ first_name: '', last_name: '', email: '' });
  const [passData, setPassData] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [showPassword, setShowPassword] = useState({ old: false, new: false, confirm: false });

  // Cancelled Orders State
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // ADDRESS STATE
  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [newAddress, setNewAddress] = useState({ name: '', phone: '', street: '', city: '', state: '', zip_code: '' });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const toggleVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'cancelled') fetchCancelledOrders();
    if (activeTab === 'addresses') fetchAddresses();
  }, [activeTab]);

  // --- ADDRESS FUNCTIONS ---
  const fetchAddresses = async () => {
    setAddressLoading(true);
    try {
      const res = await api.get('/addresses/');
      setAddresses(res.data);
    } catch (err) {
      console.error("Failed to load addresses");
    } finally {
      setAddressLoading(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.city || !newAddress.zip_code) {
      toast.warn("Please fill required fields");
      return;
    }

    try {
      if (editingId) {
        const res = await api.put(`/addresses/${editingId}/`, newAddress);
        setAddresses(addresses.map(addr => addr.id === editingId ? res.data : addr));
        toast.success("Address updated successfully");
      } else {
        const res = await api.post('/addresses/', newAddress);
        setAddresses([...addresses, res.data]);
        toast.success("Address added successfully");
      }

      handleCancelEdit(); // Close form after success

    } catch (err) {
      toast.error("Failed to save address");
    }
  };

  const handleEditClick = (addr) => {
    setNewAddress(addr);
    setEditingId(addr.id);
    setShowAddressForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 👇 ഈ ഫങ്ക്ഷൻ ആണ് ഫോം ക്ലോസ് ചെയ്യാനും റീസെറ്റ് ചെയ്യാനും ഉപയോഗിക്കുന്നത്
  const handleCancelEdit = () => {
    setShowAddressForm(false);
    setNewAddress({ name: '', phone: '', street: '', city: '', state: '', zip_code: '' });
    setEditingId(null);
  };

  // 👇 NEW: "Add New" ബട്ടൺ അമർത്തുമ്പോൾ പ്രവർത്തിക്കുന്ന ഫങ്ക്ഷൻ
  const handleAddNewClick = () => {
    if (showAddressForm) {
      handleCancelEdit(); // ഫോം തുറന്നിട്ടുണ്ടെങ്കിൽ ക്ലോസ് ചെയ്യുക
    } else {
      setNewAddress({ name: '', phone: '', street: '', city: '', state: '', zip_code: '' }); // ക്ലിയർ ചെയ്യുക
      setEditingId(null); // എഡിറ്റിംഗ് അല്ലെന്ന് ഉറപ്പാക്കുക
      setShowAddressForm(true); // ഫോം തുറക്കുക
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await api.delete(`/addresses/${id}/`);
      setAddresses(addresses.filter(addr => addr.id !== id));
      toast.success("Address deleted");
    } catch (err) {
      toast.error("Failed to delete address");
    }
  };

  // --- OTHER FUNCTIONS ---
  const fetchCancelledOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await api.get("/orders/");
      const allOrders = res.data.results || [];
      const cancelled = allOrders.filter(order => order.status === 'cancelled');
      setCancelledOrders(cancelled);
    } catch (err) {
      console.error("Failed to fetch cancelled orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(profileData);
      toast.success("Profile updated successfully");
    } catch (error) { } finally { setLoading(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passData.new_password !== passData.confirm_password) {
      toast.error("New passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      await changePassword({
        old_password: passData.old_password,
        new_password1: passData.new_password,
        new_password2: passData.confirm_password
      });
      setPassData({ old_password: '', new_password: '', confirm_password: '' });
      toast.success("Password changed successfully");
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.detail) toast.error(errorData.detail);
      else toast.error("Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-gray-100 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#E2E2B6] mb-8">Account Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* SIDEBAR */}
          <div className="lg:col-span-1 bg-gray-900 rounded-2xl p-6 h-fit border border-gray-800 shadow-xl">
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center text-4xl mb-4 border-4 border-[#E2E2B6] overflow-hidden">
                {user?.image ? <img src={user.image} className="w-full h-full object-cover" /> : user?.name?.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-white text-center">{user?.name}</h2>
              <p className="text-gray-400 text-sm text-center">{user?.email}</p>
            </div>
            

            <nav className="space-y-2">
              <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-[#E2E2B6] text-[#020617]' : 'text-gray-400 hover:bg-gray-800'}`}>
                <FiUser className="mr-3" /> Edit Profile
              </button>
              <button onClick={() => setActiveTab('addresses')} className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${activeTab === 'addresses' ? 'bg-[#E2E2B6] text-[#020617]' : 'text-gray-400 hover:bg-gray-800'}`}>
                <FiMapPin className="mr-3" /> Addresses
              </button>
              <button onClick={() => setActiveTab('security')} className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${activeTab === 'security' ? 'bg-[#E2E2B6] text-[#020617]' : 'text-gray-400 hover:bg-gray-800'}`}>
                <FiLock className="mr-3" /> Security
              </button>
              <button onClick={() => setActiveTab('cancelled')} className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${activeTab === 'cancelled' ? 'bg-[#E2E2B6] text-[#020617]' : 'text-gray-400 hover:bg-gray-800'}`}>
                <FiXCircle className="mr-3" /> Cancelled Orders
              </button>
            </nav>
          </div>

          {/* CONTENT AREA */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-900 rounded-2xl p-6 sm:p-8 border border-gray-800 shadow-xl"
            >
              {/* 1. PROFILE TAB */}
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <h3 className="text-xl font-bold text-white border-b border-gray-800 pb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-gray-400 text-sm">First Name</label>
                      <input type="text" value={profileData.first_name} onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#E2E2B6] outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-gray-400 text-sm">Last Name</label>
                      <input type="text" value={profileData.last_name} onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#E2E2B6] outline-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-400 text-sm">Email</label>
                    <input type="email" value={profileData.email} disabled className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed" />
                  </div>
                  <button type="submit" disabled={loading} className="bg-[#E2E2B6] text-[#020617] px-6 py-3 rounded-xl font-bold hover:bg-[#dcdca0] transition-all">
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              )}

              {/* 2. ADDRESSES TAB */}
              {activeTab === 'addresses' && (
                <div>
                  <div className="flex justify-between items-center border-b border-gray-800 pb-4 mb-6">
                    <h3 className="text-xl font-bold text-white">Manage Addresses</h3>

                    {/* 👇 UPDATED BUTTON: handleAddNewClick ഉപയോഗിക്കുന്നു */}
                    <button onClick={handleAddNewClick} className="text-[#E2E2B6] flex items-center text-sm hover:text-white transition-colors">
                      {showAddressForm ? <FiXCircle className="mr-1" /> : <FiPlus className="mr-1" />}
                      {showAddressForm ? "Cancel" : "Add New"}
                    </button>
                  </div>

                  {showAddressForm && (
                    <motion.form
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      onSubmit={handleAddressSubmit}
                      className="mb-8 bg-gray-800/50 p-4 rounded-xl border border-gray-700 space-y-4"
                    >
                      <h4 className="text-[#f4d58d] font-bold text-sm mb-2">
                        {editingId ? "Edit Address" : "New Address Details"}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input placeholder="Full Name" value={newAddress.name} onChange={e => setNewAddress({ ...newAddress, name: e.target.value })} className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-[#E2E2B6]" />
                        <input placeholder="Phone" value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-[#E2E2B6]" />
                        <input placeholder="Street Address" value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} className="sm:col-span-2 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-[#E2E2B6]" />
                        <input placeholder="City" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-[#E2E2B6]" />
                        <input placeholder="State" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-[#E2E2B6]" />
                        <input placeholder="ZIP Code" value={newAddress.zip_code} onChange={e => setNewAddress({ ...newAddress, zip_code: e.target.value })} className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-[#E2E2B6]" />
                      </div>
                      <div className="flex gap-3 mt-2">
                        <button type="submit" className="bg-[#E2E2B6] text-black px-6 py-2 rounded-lg font-bold hover:bg-[#dcdca0]">
                          {editingId ? "Update Address" : "Save Address"}
                        </button>
                        <button type="button" onClick={handleCancelEdit} className="border border-gray-600 text-gray-400 px-4 py-2 rounded-lg hover:bg-gray-800">
                          Cancel
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {addressLoading ? <p className="text-center text-gray-500">Loading...</p> : (
                    <div className="space-y-4">
                      {addresses.length === 0 && !showAddressForm && <p className="text-gray-500 text-center">No saved addresses.</p>}
                      {addresses.map(addr => (
                        <div key={addr.id} className={`p-4 rounded-xl border flex justify-between items-start transition-all ${editingId === addr.id ? 'bg-[#E2E2B6]/10 border-[#E2E2B6]' : 'bg-gray-800 border-gray-700'}`}>
                          <div>
                            <p className="font-bold text-white flex items-center gap-2"><FiUser className="text-gray-400" /> {addr.name}</p>
                            <p className="text-gray-400 text-sm mt-1">{addr.street}, {addr.city}</p>
                            <p className="text-gray-400 text-sm">{addr.state} - {addr.zip_code}</p>
                            <p className="text-gray-500 text-xs mt-1">Phone: {addr.phone}</p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <button onClick={() => handleEditClick(addr)} className="text-[#E2E2B6] hover:text-white p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"><FiEdit /></button>
                            <button onClick={() => handleDeleteAddress(addr.id)} className="text-red-500 hover:text-red-400 p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"><FiTrash /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 3. SECURITY TAB */}
              {activeTab === 'security' && (
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <h3 className="text-xl font-bold text-white border-b border-gray-800 pb-4">Change Password</h3>
                  {['old', 'new', 'confirm'].map((field, idx) => (
                    <div key={idx} className="space-y-2">
                      <label className="text-gray-400 text-sm capitalize">{field.replace('_', ' ')} Password</label>
                      <div className="relative">
                        <input
                          type={showPassword[field] ? "text" : "password"}
                          value={passData[`${field}_password`]}
                          onChange={(e) => setPassData({ ...passData, [`${field}_password`]: e.target.value })}
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#E2E2B6] outline-none pr-10"
                        />
                        <button type="button" onClick={() => toggleVisibility(field)} className="absolute right-3 top-3.5 text-gray-400">
                          {showPassword[field] ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button type="submit" disabled={loading} className="bg-[#E2E2B6] text-[#020617] px-6 py-3 rounded-xl font-bold hover:bg-[#dcdca0] transition-all">
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </form>
              )}

              {/* 4. CANCELLED ORDERS TAB */}
              {activeTab === 'cancelled' && (
                <div>
                  <h3 className="text-xl font-bold text-white border-b border-gray-800 pb-4 mb-6 flex items-center gap-2">
                    <FiXCircle className="text-red-500" /> Cancelled Orders
                  </h3>

                  {ordersLoading ? (
                    <p className="text-gray-400 text-center py-10">Loading...</p>
                  ) : cancelledOrders.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-gray-700 rounded-xl">
                      <p className="text-gray-500">No cancelled orders found.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cancelledOrders.map(order => (
                        <div key={order.id} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 flex flex-col sm:flex-row justify-between gap-4">
                          <div>
                            <p className="text-[#E2E2B6] font-mono text-sm">Order #{order.id}</p>
                            <p className="text-gray-400 text-xs mt-1">
                              Placed on: {new Date(order.created_at).toLocaleDateString()}
                            </p>
                            <div className="mt-2 text-sm text-gray-300">
                              {order.items.map((item, i) => (
                                <span key={i} className="block">• {item.product.name} (x{item.quantity})</span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right flex flex-col justify-between items-end">
                            <span className="px-3 py-1 bg-red-500/10 text-red-400 text-xs rounded-full border border-red-500/20 font-bold">
                              CANCELLED
                            </span>
                            <p className="text-white font-bold mt-2">₹{Number(order.total_amount).toLocaleString()}</p>
                            <p className="text-xs text-gray-500 mt-1">Refund Status: {order.cancellation_details?.refund_status || 'Pending'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;