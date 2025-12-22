import { useEffect, useState, useContext } from "react";
import { useAxios, AuthContext } from "../context/AuthContext";
import { FiBell, FiCheck, FiClock, FiInbox, FiInfo } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const Notifications = () => {
  const api = useAxios();
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications/");
      setNotifications(res.data);
    } catch (error) {
      console.error("Error fetching notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read/`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error("Failed to mark as read");
    }
  };

  // Helper: Time Ago Calculation (Real-world feel)
  const timeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return past.toLocaleDateString();
  };

  if (loading) return (
    <div className="min-h-screen bg-[#001427] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#708d81] border-t-[#f4d58d] rounded-full animate-spin"></div>
    </div>
  );

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-[#001427] text-[#f2e8cf] p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-end mb-8 border-b border-[#708d81]/20 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#f4d58d] flex items-center gap-3">
              Notifications
              {unreadCount > 0 && (
                <span className="bg-[#bf0603] text-white text-xs px-2 py-0.5 rounded-full shadow-lg shadow-[#bf0603]/40">
                  {unreadCount} new
                </span>
              )}
            </h1>
            <p className="text-[#708d81] text-sm mt-1">Stay updated with latest announcements</p>
          </div>
          <div className="bg-[#001c3d] p-2 rounded-full border border-[#708d81]/20">
            <FiBell className="text-[#f4d58d]" />
          </div>
        </div>

        {/* NOTIFICATION LIST */}
        <div className="space-y-3">
          <AnimatePresence>
            {notifications.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="bg-[#001c3d] p-6 rounded-full mb-4 border border-[#708d81]/20">
                  <FiInbox className="text-4xl text-[#708d81]" />
                </div>
                <h3 className="text-lg font-semibold text-[#f2e8cf]">All caught up!</h3>
                <p className="text-[#708d81] text-sm max-w-xs mt-2">
                  You have no new notifications at the moment.
                </p>
              </motion.div>
            ) : (
              notifications.map((n) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={n.id} 
                  className={`relative group p-4 rounded-xl border transition-all duration-300 ${
                    n.is_read 
                      ? "bg-[#001427] border-[#708d81]/10 opacity-75 hover:opacity-100" 
                      : "bg-[#001c3d]/80 border-[#f4d58d]/20 shadow-lg shadow-black/20"
                  }`}
                >
                  {/* Unread Indicator Dot */}
                  {!n.is_read && (
                    <div className="absolute top-4 right-4 w-2 h-2 bg-[#bf0603] rounded-full shadow-[0_0_8px_#bf0603]"></div>
                  )}

                  <div className="flex gap-4">
                    {/* Icon Box */}
                    <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      n.is_read ? 'bg-[#001c3d] text-[#708d81]' : 'bg-[#f4d58d]/10 text-[#f4d58d]'
                    }`}>
                      <FiInfo size={18} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pr-4">
                      <div className="flex justify-between items-start">
                        <h3 className={`text-sm font-semibold mb-1 ${n.is_read ? "text-[#f2e8cf]/80" : "text-[#f2e8cf]"}`}>
                          {n.title}
                        </h3>
                        <span className="text-[10px] text-[#708d81] font-medium whitespace-nowrap ml-2">
                          {timeAgo(n.created_at)}
                        </span>
                      </div>
                      
                      <p className="text-xs text-[#708d81] leading-relaxed mb-3">
                        {n.message}
                      </p>

                      {/* Actions */}
                      {!n.is_read && (
                        <button 
                          onClick={() => markAsRead(n.id)}
                          className="flex items-center gap-1.5 text-[10px] font-bold text-[#f4d58d] hover:text-white transition-colors bg-[#f4d58d]/10 hover:bg-[#f4d58d]/20 px-3 py-1.5 rounded-md"
                        >
                          <FiCheck size={12} /> Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Notifications;