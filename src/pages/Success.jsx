import { useEffect, useState } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { FiShoppingBag, FiPackage, FiCheck } from "react-icons/fi";

const Success = () => {
  const location = useLocation();
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });
  if (!location.state || !location.state.fromCheckout) {
    return <Navigate to="/" replace />;
  }
  const orderId = location.state?.orderId || "EB-ORDER";

  useEffect(() => {
    const handleResize = () => setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#001427] flex items-center justify-center px-4 overflow-hidden">

      <Confetti width={windowDimension.width} height={windowDimension.height} numberOfPieces={200} recycle={false} gravity={0.2} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-[#001c3d] border border-[#708d81]/20 p-8 md:p-12 rounded-3xl shadow-2xl max-w-lg w-full text-center relative z-10"
      >

        {/* ANIMATED CHECKMARK */}
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
            className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center relative"
          >
            <div className="absolute inset-0 rounded-full border-4 border-green-500/30 animate-ping opacity-20"></div>
            <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
        </div>

        {/* TEXT CONTENT */}
        <h1 className="text-3xl font-bold text-[#f2e8cf] mb-2">Order Confirmed!</h1>
        <p className="text-[#708d81] mb-6">Thank you for your purchase. Your order has been received.</p>

        {/* ORDER ID BADGE */}
        <div className="bg-[#001427] inline-block px-4 py-2 rounded-lg border border-[#708d81]/30 mb-8">
          <span className="text-[#708d81] text-sm mr-2">Order ID:</span>
          <span className="text-[#f4d58d] font-mono font-bold tracking-wider">{orderId}</span>
        </div>

        {/* TIMELINE */}
        <div className="flex justify-between items-center mb-10 text-xs sm:text-sm text-[#708d81] px-4">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-green-500 text-[#001427] flex items-center justify-center mb-2 font-bold shadow-lg shadow-green-500/20">
              <FiCheck />
            </div>
            <span className="text-green-500 font-medium">Confirmed</span>
          </div>
          <div className="flex-1 h-0.5 bg-[#708d81]/20 mx-2"></div>
          <div className="flex flex-col items-center opacity-50">
            <div className="w-8 h-8 rounded-full bg-[#001427] border border-[#708d81] flex items-center justify-center mb-2">
              <FiPackage />
            </div>
            <span>Processing</span>
          </div>
          <div className="flex-1 h-0.5 bg-[#708d81]/20 mx-2"></div>
          <div className="flex flex-col items-center opacity-50">
            <div className="w-8 h-8 rounded-full bg-[#001427] border border-[#708d81] flex items-center justify-center mb-2">
              <FiShoppingBag />
            </div>
            <span>Shipped</span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col gap-3">
          <Link
            to="/orders"
            className="w-full py-3.5 rounded-xl bg-[#bf0603] text-[#f2e8cf] font-bold hover:bg-[#8d0801] transition-all shadow-lg hover:shadow-red-900/30 flex items-center justify-center gap-2"
          >
            <FiPackage /> View My Order
          </Link>

          <Link
            to="/products"
            className="w-full py-3.5 rounded-xl border border-[#708d81] text-[#708d81] font-medium hover:text-[#f4d58d] hover:border-[#f4d58d] hover:bg-[#001427] transition-all"
          >
            Continue Shopping
          </Link>
        </div>

      </motion.div>
    </div>
  );
};

export default Success;