import { motion } from "framer-motion";

const AboutHero = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center mb-16 md:mb-24"
    >
      <p className="text-emerald-500 text-xs font-bold uppercase tracking-[0.2em] mb-4">
        Our Story
      </p>
      <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight leading-[1.1]">
        Moving the World, <span className="text-emerald-500">One Bike</span>{" "}
        at a Time.
      </h1>
      <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
        BiCycleL is a community-driven marketplace designed specifically for
        cyclists. We make it easy to pass on your pre-loved ride or find
        your next adventure.
      </p>
    </motion.section>
  );
};

export default AboutHero;
