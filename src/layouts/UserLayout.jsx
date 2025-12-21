import { Outlet } from "react-router-dom"; // 👈 ഇത് പ്രധാനമാണ്
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const UserLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#001427] text-[#f2e8cf]">
      {/* Navbar Fixed at Top */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* 👇 ഇവിടെയാണ് ഓരോ പേജും (Home, Products...) വരുന്നത് */}
        <Outlet /> 
      </main>

      {/* Footer at Bottom */}
      <Footer />
    </div>
  );
};

export default UserLayout;