import { motion } from "framer-motion";
import { FiHeadphones, FiActivity, FiShield, FiCpu, FiMusic, FiAward } from "react-icons/fi";

const About = () => {
  // Animation Variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
  };

  const stats = [
    { label: "Battery Life", value: "50h", icon: <FiActivity /> },
    { label: "Quality Checks", value: "200+", icon: <FiShield /> },
    { label: "Soundstage", value: "360°", icon: <FiMusic /> },
    { label: "Since", value: "2018", icon: <FiAward /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#001427] text-[#708d81] overflow-hidden relative"
    >
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#bf0603]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#f4d58d]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-6 py-20 relative z-10">
        
        {/* --- HERO SECTION --- */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#f4d58d] mb-6 tracking-tight">
            Redefining <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#bf0603] to-[#d64040]">Sound.</span>
          </h1>
          <p className="text-lg md:text-xl text-[#708d81]/80 max-w-2xl mx-auto leading-relaxed">
            At <span className="font-bold text-[#f2e8cf]">ECHO BAY</span>, we don't just build headsets. 
            We engineer acoustic experiences for those who listen closely.
          </p>
        </motion.div>

        {/* --- STATS GRID --- */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={item}
              whileHover={{ scale: 1.05 }}
              className="bg-[#001c3d]/50 border border-[#708d81]/20 p-6 rounded-2xl text-center backdrop-blur-sm hover:border-[#bf0603]/50 transition-colors"
            >
              <div className="text-[#bf0603] text-2xl mb-2 flex justify-center">{stat.icon}</div>
              <h3 className="text-3xl font-bold text-[#f2e8cf] mb-1">{stat.value}</h3>
              <p className="text-sm text-[#708d81] uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* --- BENTO GRID CONTENT --- */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Mission Card (Large) */}
          <motion.div
            variants={item}
            className="md:col-span-2 bg-[#001c3d] p-8 rounded-3xl border border-[#708d81]/20 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#bf0603]/20 to-transparent rounded-bl-full transition-transform group-hover:scale-110"></div>
            <h2 className="text-2xl font-bold text-[#f4d58d] mb-4 flex items-center">
              <FiHeadphones className="mr-3" /> Our Mission
            </h2>
            <p className="text-[#708d81] leading-relaxed text-lg">
              We strive to bridge the gap between studio-grade professional audio and everyday durability. 
              Whether you are an audiophile identifying every nuance or a gamer needing distinct spatial cues, 
              Echo Bay delivers precision without compromise.
            </p>
          </motion.div>

          {/* Technology Card */}
          <motion.div
            variants={item}
            className="bg-[#001c3d] p-8 rounded-3xl border border-[#708d81]/20 hover:bg-[#001c3d]/80 transition-colors"
          >
            <h2 className="text-xl font-bold text-[#f4d58d] mb-6 flex items-center">
              <FiCpu className="mr-3" /> Core Tech
            </h2>
            <ul className="space-y-4">
              {[
                "40mm Graphene Drivers",
                "Active Noise Canceling (35dB)",
                "SoundSphere™ 3D Audio",
                "Aerospace-grade Aluminum"
              ].map((tech, i) => (
                <li key={i} className="flex items-center text-sm group">
                  <span className="w-2 h-2 bg-[#bf0603] rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                  {tech}
                </li>
              ))}
            </ul>
            
          </motion.div>

          {/* Products Card */}
          <motion.div
            variants={item}
            className="bg-[#001c3d] p-8 rounded-3xl border border-[#708d81]/20 hover:bg-[#001c3d]/80 transition-colors"
          >
            <h2 className="text-xl font-bold text-[#f4d58d] mb-6 flex items-center">
              <FiMusic className="mr-3" /> Lineup
            </h2>
            <div className="space-y-3">
              <div className="p-3 bg-[#001427] rounded-xl border-l-4 border-[#f4d58d]">
                <h4 className="text-[#f2e8cf] font-bold text-sm">Wireless Series</h4>
                <p className="text-xs mt-1">For freedom & travel</p>
              </div>
              <div className="p-3 bg-[#001427] rounded-xl border-l-4 border-[#bf0603]">
                <h4 className="text-[#f2e8cf] font-bold text-sm">Pro Studio</h4>
                <p className="text-xs mt-1">For creators & mixing</p>
              </div>
              <div className="p-3 bg-[#001427] rounded-xl border-l-4 border-[#708d81]">
                <h4 className="text-[#f2e8cf] font-bold text-sm">Gaming Elite</h4>
                <p className="text-xs mt-1">Low latency performance</p>
              </div>
            </div>
          </motion.div>

          {/* Engineering Card (Large) */}
          <motion.div
            variants={item}
            className="md:col-span-2 bg-gradient-to-r from-[#001c3d] to-[#001427] p-8 rounded-3xl border border-[#708d81]/20"
          >
            <h2 className="text-2xl font-bold text-[#f4d58d] mb-4">Engineering Precision</h2>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <p className="text-[#708d81] leading-relaxed flex-1">
                Every headset features custom-tuned drivers.  We utilize memory foam ear cups that adapt to your shape, ensuring comfort during those 
                long listening sessions. Our Active Noise Cancellation algorithms are updated regularly to filter out 
                modern distractions.
              </p>
              <div className="w-full md:w-1/3 p-4 bg-[#bf0603]/10 rounded-xl border border-[#bf0603]/30 text-center">
                <span className="block text-3xl font-bold text-[#bf0603] mb-1">0.02%</span>
                <span className="text-xs text-[#f4d58d]">Distortion Rate</span>
              </div>
            </div>
          </motion.div>

        </motion.div>

        {/* --- FOOTER SIGNOFF --- */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-24 text-center"
        >
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#bf0603] to-transparent mx-auto mb-6"></div>
          <p className="text-[#f2e8cf] text-lg font-medium tracking-wide">THE ECHO BAY TEAM</p>
          <p className="text-[#708d81] text-sm mt-2 opacity-60">Engineering perfect sound in Calicut since 2018</p>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default About;