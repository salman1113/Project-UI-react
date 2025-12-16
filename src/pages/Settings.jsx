import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiSave, FiCheckCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Settings = () => {
  const { user, updateProfile, changePassword } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  // Profile State
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '' 
  });

  // Password State
  const [passData, setPassData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  // 👇 State to toggle visibility for each field
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false
  });

  // Helper to toggle visibility
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

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(profileData);
    } catch (error) {
       // handled in context
    } finally {
      setLoading(false);
    }
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
      // Reset visibility on success
      setShowPassword({ old: false, new: false, confirm: false });
    
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.old_password) toast.error(errorData.old_password[0]);
      else if (errorData?.new_password1) toast.error(errorData.new_password1[0]);
      else if (errorData?.new_password2) toast.error(errorData.new_password2[0]);
      else if (errorData?.detail) toast.error(errorData.detail);
      else toast.error("Failed to change password. Try a stronger one.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-gray-100 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#E2E2B6] mb-8">Account Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- SIDEBAR --- */}
          <div className="bg-gray-900 rounded-2xl p-6 h-fit border border-gray-800 shadow-xl">
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full bg-gray-800 flex items-center justify-center text-5xl mb-4 overflow-hidden border-4 border-[#E2E2B6] shadow-lg">
                   {user?.image ? (
                     <img src={user.image} alt="Profile" className="w-full h-full object-cover"/>
                   ) : (
                     <span className="text-[#E2E2B6] font-bold">
                        {user?.name ? user.name.charAt(0).toUpperCase() : <FiUser />}
                     </span>
                   )}
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white text-center">{user?.name}</h2>
              <p className="text-gray-400 text-sm text-center">{user?.email}</p>
              
              {user?.role === 'admin' && (
                <span className="mt-2 px-3 py-1 bg-blue-900/30 text-blue-400 text-xs rounded-full border border-blue-800">
                  Administrator
                </span>
              )}
            </div>
            
            <nav className="space-y-3">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  activeTab === 'profile' 
                  ? 'bg-[#E2E2B6] text-[#020617] shadow-lg shadow-[#E2E2B6]/20 translate-x-1' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <FiUser className="mr-3 text-lg" /> Edit Profile
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  activeTab === 'security' 
                  ? 'bg-[#E2E2B6] text-[#020617] shadow-lg shadow-[#E2E2B6]/20 translate-x-1' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <FiLock className="mr-3 text-lg" /> Security
              </button>
            </nav>
          </div>

          {/* --- CONTENT AREA --- */}
          <div className="lg:col-span-2">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-900 rounded-2xl p-6 sm:p-10 border border-gray-800 shadow-xl"
            >
              {activeTab === 'profile' ? (
                /* PROFILE FORM */
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
                    <h3 className="text-xl font-bold text-white">Personal Information</h3>
                    <FiUser className="text-gray-500 text-xl" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">First Name</label>
                      <input 
                        type="text" 
                        value={profileData.first_name}
                        onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:border-[#E2E2B6] focus:ring-1 focus:ring-[#E2E2B6] outline-none transition-all text-white placeholder-gray-600"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Last Name</label>
                      <input 
                        type="text" 
                        value={profileData.last_name}
                        onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:border-[#E2E2B6] focus:ring-1 focus:ring-[#E2E2B6] outline-none transition-all text-white placeholder-gray-600"
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Email Address</label>
                    <div className="relative">
                        <input 
                          type="email" 
                          value={profileData.email}
                          disabled
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
                        />
                        <FiCheckCircle className="absolute right-4 top-3.5 text-green-500" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed directly.</p>
                  </div>

                  <div className="pt-4">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-[#E2E2B6] text-[#020617] px-8 py-3 rounded-xl font-bold hover:bg-[#dcdca0] transition-all transform active:scale-95 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                          <><span>Updating...</span></>
                      ) : (
                          <><FiSave className="mr-2" /> Save Changes</>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* PASSWORD FORM */
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
                    <h3 className="text-xl font-bold text-white">Change Password</h3>
                    <FiLock className="text-gray-500 text-xl" />
                  </div>

                  {/* 1. Old Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Current Password</label>
                    <div className="relative">
                        <input 
                        type={showPassword.old ? "text" : "password"} // Dynamic Type
                        value={passData.old_password}
                        onChange={(e) => setPassData({...passData, old_password: e.target.value})}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:border-[#E2E2B6] focus:ring-1 focus:ring-[#E2E2B6] outline-none transition-all text-white pr-12"
                        placeholder="Enter your current password"
                        />
                        <button 
                            type="button"
                            onClick={() => toggleVisibility('old')}
                            className="absolute right-4 top-3.5 text-gray-400 hover:text-white focus:outline-none"
                        >
                            {showPassword.old ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </button>
                    </div>
                  </div>

                  {/* 2. New Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">New Password</label>
                    <div className="relative">
                        <input 
                        type={showPassword.new ? "text" : "password"} 
                        value={passData.new_password}
                        onChange={(e) => setPassData({...passData, new_password: e.target.value})}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:border-[#E2E2B6] focus:ring-1 focus:ring-[#E2E2B6] outline-none transition-all text-white pr-12"
                        placeholder="Min 8 chars, letters & numbers"
                        />
                        <button 
                            type="button"
                            onClick={() => toggleVisibility('new')}
                            className="absolute right-4 top-3.5 text-gray-400 hover:text-white focus:outline-none"
                        >
                            {showPassword.new ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </button>
                    </div>
                  </div>

                  {/* 3. Confirm Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Confirm New Password</label>
                    <div className="relative">
                        <input 
                        type={showPassword.confirm ? "text" : "password"} 
                        value={passData.confirm_password}
                        onChange={(e) => setPassData({...passData, confirm_password: e.target.value})}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:border-[#E2E2B6] focus:ring-1 focus:ring-[#E2E2B6] outline-none transition-all text-white pr-12"
                        placeholder="Re-enter new password"
                        />
                        <button 
                            type="button"
                            onClick={() => toggleVisibility('confirm')}
                            className="absolute right-4 top-3.5 text-gray-400 hover:text-white focus:outline-none"
                        >
                            {showPassword.confirm ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-[#E2E2B6] text-[#020617] px-8 py-3 rounded-xl font-bold hover:bg-[#dcdca0] transition-all transform active:scale-95 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       {loading ? (
                          <><span>Updating...</span></>
                      ) : (
                          <><FiLock className="mr-2" /> Update Password</>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;