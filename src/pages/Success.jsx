import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Success = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#001427] px-4 py-12">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#6a994e"
              strokeWidth="8"
              strokeDasharray="283"
              strokeDashoffset="283"
              strokeLinecap="round"
              className="animate-drawCircle"
            />
            <path
              d="M30,50 L45,65 L70,35"
              fill="none"
              stroke="#f4d58d"
              strokeWidth="8"
              strokeDasharray="50"
              strokeDashoffset="50"
              strokeLinecap="round"
              className="animate-drawCheck"
            />
          </svg>
        </div>
      </motion.div>
      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-4xl font-bold text-[#f4d58d] mb-6 text-center"
      >
        Order Confirmed!
      </motion.h2>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="text-center mb-10 max-w-md"
      >
        <p className="text-lg text-[#708d81] mb-3">
          Thank you for your purchase!
        </p>
        <p className="text-[#f2e8cf]">
          Your order has been placed successfully and will be processed shortly.
        </p>
        <p className="text-sm text-[#708d81] mt-4">
          A confirmation has been sent to your email.
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link
          to="/products"
          className="bg-gradient-to-r from-[#6a994e] to-[#386641] hover:from-[#386641] hover:to-[#6a994e] text-[#f2e8cf] px-8 py-3 rounded-lg font-medium text-lg shadow-lg transition-all duration-300 flex items-center"
        >
          <span className="mr-2">Continue Shopping</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="mt-12 text-center text-[#708d81] text-sm"
      >
        <p>Need help? <Link to="/contact" className="text-[#f4d58d] hover:underline">Contact us</Link></p>
      </motion.div>

      <style>{`
        @keyframes drawCircle {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes drawCheck {
          to {
            stroke-dashoffset: 0;
          }
        }
        .animate-drawCircle {
          animation: drawCircle 1s ease-out forwards;
        }
        .animate-drawCheck {
          animation: drawCheck 0.8s 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Success;