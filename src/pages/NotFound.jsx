import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiHome, FiAlertTriangle } from "react-icons/fi";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#001427] flex flex-col items-center justify-center relative overflow-hidden text-center px-4">
      
      {/* Background Huge Text Effect */}
      <h1 className="text-[12rem] md:text-[20rem] font-bold text-[#708d81] opacity-5 absolute select-none pointer-events-none animate-pulse">
        404
      </h1>

      {/* Main Content */}
      <div className="z-10 bg-[#001c3d]/50 backdrop-blur-sm p-8 md:p-12 rounded-2xl border border-[#708d81]/30 shadow-2xl max-w-lg w-full">
        <div className="flex justify-center mb-6">
          <div className="bg-[#bf0603]/10 p-4 rounded-full">
            <FiAlertTriangle className="text-[#bf0603] text-5xl" />
          </div>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-[#f4d58d] mb-4">
          Page Not Found
        </h2>
        
        <p className="text-[#708d81] text-lg mb-8">
          Oops! The page you are looking for might have been removed or is temporarily unavailable.
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          {/* Go Back Button */}
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center justify-center px-6 py-3 border border-[#708d81] text-[#708d81] rounded-lg hover:bg-[#708d81]/10 transition-all font-semibold"
          >
            <FiArrowLeft className="mr-2" /> Go Back
          </button>

          {/* Go Home Button */}
          <Link 
            to="/" 
            className="flex items-center justify-center px-6 py-3 bg-[#f4d58d] text-[#001427] rounded-lg hover:bg-[#d4b56a] transition-all font-bold shadow-lg hover:shadow-[#f4d58d]/20"
          >
            <FiHome className="mr-2" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;