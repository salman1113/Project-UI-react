import { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ResetPasswordConfirm = () => {
  const { uid, token } = useParams(); // URL-ൽ നിന്ന് uid, token എടുക്കുന്നു
  const navigate = useNavigate();
  const { confirmPasswordReset } = useContext(AuthContext);
  
  const [passwords, setPasswords] = useState({ new1: '', new2: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new1 !== passwords.new2) {
      alert("Passwords don't match");
      return;
    }

    const success = await confirmPasswordReset({
      uid,
      token,
      new_password1: passwords.new1,
      new_password2: passwords.new2,
    });

    if (success) navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-900 p-8 rounded-xl border border-gray-800">
        <h2 className="text-2xl font-bold text-[#E2E2B6] mb-6 text-center">Set New Password</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-2 text-sm">New Password</label>
            <input 
              type="password" 
              required
              onChange={(e) => setPasswords({...passwords, new1: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:border-[#E2E2B6] outline-none text-white"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-2 text-sm">Confirm Password</label>
            <input 
              type="password" 
              required
              onChange={(e) => setPasswords({...passwords, new2: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:border-[#E2E2B6] outline-none text-white"
            />
          </div>
          <button type="submit" className="w-full bg-[#E2E2B6] text-black py-3 rounded-lg font-bold hover:bg-[#dcdca0] transition-colors">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordConfirm;