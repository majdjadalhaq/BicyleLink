import { motion } from "framer-motion";

const IconBike = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="5.5" cy="17.5" r="3.5" />
    <circle cx="18.5" cy="17.5" r="3.5" />
    <path d="M15 6a1 1 0 0 0-1-1h-1" />
    <path d="M5.5 14L9 7l3 5h5.5" />
    <path d="M12 12l1.5-5" />
  </svg>
);

const AboutMission = () => {
  return (
    <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        className="space-y-6"
      >
        <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest">
          Our Mission
        </p>
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
          A Garage for Everyone.
        </h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          Buying and selling bicycles on general platforms like Facebook or eBay
          is messy and risky. Unlike those generic marketplaces, BiCycleL is
          built{" "}
          <strong className="text-gray-900 dark:text-white font-bold">
            only for bikes
          </strong>
          , so you are always dealing with people who understand what they are
          looking at.
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          We focused on creating a space where serious riders and casual
          commuters can connect through a platform built around the specific
          needs of the cycling community.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
        className="aspect-video bg-emerald-500/10 rounded-[2.5rem] border border-emerald-500/20 flex items-center justify-center"
      >
        <span className="text-emerald-400 opacity-60">
          <IconBike />
        </span>
      </motion.div>
    </div>
  );
};

export default AboutMission;
