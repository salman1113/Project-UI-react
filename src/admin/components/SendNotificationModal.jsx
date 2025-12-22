import { useState, useEffect } from "react";
import { useAxios } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { FiX, FiSend, FiUsers, FiUser, FiType, FiMessageSquare, FiChevronDown } from "react-icons/fi";

const SendNotificationModal = ({ isOpen, onClose }) => {
  const api = useAxios();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("all");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.get("/users/").then((res) => setUsers(res.data)).catch(console.error);
    }
  }, [isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/notifications/send/", {
        user_id: selectedUser,
        title,
        message,
      });
      toast.success("Notification Sent Successfully!");
      onClose();
      setTitle("");
      setMessage("");
      setSelectedUser("all");
    } catch (error) {
      toast.error("Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#001c3d] w-full max-w-md rounded-2xl border border-[#708d81]/20 shadow-2xl overflow-hidden transform transition-all">
        
        {/* Header */}
        <div className="p-5 border-b border-[#708d81]/20 flex justify-between items-center bg-[#001427]">
          <h3 className="text-[#f4d58d] font-bold text-lg flex items-center gap-2">
            <FiSend className="text-[#bf0603]" /> Send Announcement
          </h3>
          <button 
            onClick={onClose} 
            className="text-[#708d81] hover:text-[#bf0603] transition-colors p-1 rounded-full hover:bg-[#001c3d]"
          >
            <FiX size={20} />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSend} className="p-6 space-y-5">
          
          {/* Recipient Selection */}
          <div className="space-y-2">
            <label className="text-[#708d81] text-xs font-bold uppercase tracking-wider ml-1">Recipient</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUsers className="text-[#f4d58d]" />
              </div>
              <select
                className="w-full bg-[#001427] border border-[#708d81]/30 text-[#f2e8cf] rounded-lg pl-10 pr-10 py-3 focus:border-[#f4d58d] focus:ring-1 focus:ring-[#f4d58d] outline-none appearance-none transition-all cursor-pointer"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="all">All Users (Broadcast)</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <FiChevronDown className="text-[#708d81]" />
              </div>
            </div>
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-[#708d81] text-xs font-bold uppercase tracking-wider ml-1">Title</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiType className="text-[#f4d58d]" />
              </div>
              <input
                type="text"
                required
                className="w-full bg-[#001427] border border-[#708d81]/30 text-[#f2e8cf] rounded-lg pl-10 pr-3 py-3 focus:border-[#f4d58d] focus:ring-1 focus:ring-[#f4d58d] outline-none transition-all placeholder-gray-600"
                placeholder="e.g. Big Sale Tomorrow!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <label className="text-[#708d81] text-xs font-bold uppercase tracking-wider ml-1">Message</label>
            <div className="relative group">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FiMessageSquare className="text-[#f4d58d]" />
              </div>
              <textarea
                required
                rows="4"
                className="w-full bg-[#001427] border border-[#708d81]/30 text-[#f2e8cf] rounded-lg pl-10 pr-3 py-3 focus:border-[#f4d58d] focus:ring-1 focus:ring-[#f4d58d] outline-none transition-all placeholder-gray-600 resize-none"
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#bf0603] hover:bg-[#8d0801] text-white py-3 rounded-lg font-bold tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="animate-pulse">Sending...</span>
            ) : (
              <>
                <FiSend /> Send Notification
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SendNotificationModal;