import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const { requestPasswordReset } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    requestPasswordReset(email);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-900 p-8 rounded-xl border border-gray-800">
        <h2 className="text-2xl font-bold text-[#E2E2B6] mb-4 text-center">Reset Password</h2>
        <p className="text-gray-400 text-center mb-6">Enter your email address and we'll send you a link to reset your password.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-2 text-sm">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:border-[#E2E2B6] outline-none text-white"
            />
          </div>
          <button type="submit" className="w-full bg-[#E2E2B6] text-black py-3 rounded-lg font-bold hover:bg-[#dcdca0] transition-colors">
            Send Reset Link
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/login" className="text-gray-500 hover:text-white text-sm">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;