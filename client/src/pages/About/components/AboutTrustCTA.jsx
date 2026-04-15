import { motion } from "framer-motion";
import { Link } from "react-router";

const IconShield = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const AboutTrustCTA = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
      className="bg-emerald-500 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden mb-4"
    >
      <div className="relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-[1rem] bg-white/20 mb-6 text-white">
          <IconShield />
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 leading-tight">
          Your Trust is Our Priority.
        </h2>
        <p className="max-w-xl mx-auto mb-10 opacity-90 text-base sm:text-lg leading-relaxed">
          Our verified review system and private messaging platform ensure that
          you can buy and sell with absolute confidence. Every feature we build
          exists to protect the community.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex h-14 px-10 items-center justify-center bg-white text-emerald-600 font-black rounded-2xl hover:scale-105 transition-transform text-sm uppercase tracking-widest shadow-lg"
          >
            Browse Listings
          </Link>
          <Link
            to="/listing/create"
            className="inline-flex h-14 px-10 items-center justify-center bg-white/20 backdrop-blur text-white font-black rounded-2xl hover:bg-white/30 transition-all text-sm uppercase tracking-widest border border-white/30"
          >
            Sell Your Bike
          </Link>
        </div>
      </div>
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
    </motion.section>
  );
};

export default AboutTrustCTA;
