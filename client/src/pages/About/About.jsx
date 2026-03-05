import { motion } from "framer-motion";
import { Link } from "react-router";

/* ─── Inline SVG Icons ─────────────────────────────────────── */
const IconSearch = () => (
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
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconChat = () => (
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
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const IconHandshake = () => (
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
    <path d="M6 9l6-6 6 6" />
    <path d="M12 3v13" />
    <path d="M3 21h18" />
    <path d="M5 21v-4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" />
  </svg>
);
const IconExchange = () => (
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
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);
const IconStar = () => (
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
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IconLeaf = () => (
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
    <path d="M2 20c2-5 5-9 10-9 4 0 8 2 10-7C18 6 14 4 9 6 5 8 2 14 2 20z" />
    <path d="M12 11c-1 3-1.5 6-1 9" />
  </svg>
);
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

/* ─── Data ─────────────────────────────────────────────────── */
const LIFECYCLE = [
  {
    Icon: IconSearch,
    title: "Discover",
    text: "Browse a curated feed of bicycles based on your location and preferences. Filter by category, condition, price, and more.",
  },
  {
    Icon: IconChat,
    title: "Connect",
    text: "Use our secure, private chat to ask questions and discuss details directly with the owner — no personal info is ever shared.",
  },
  {
    Icon: IconHandshake,
    title: "Meet & Inspect",
    text: "Sellers and buyers agree on a safe public meeting spot. This lets the buyer verify the bike's condition before any money changes hands.",
  },
  {
    Icon: IconExchange,
    title: "The Exchange",
    text: "Once the deal is done, the seller marks it Sold and selects the buyer from their chat history to finalise the transaction.",
  },
  {
    Icon: IconStar,
    title: "The Review",
    text: "Only the confirmed buyer can leave a rating, ensuring every review you read is real, earned, and trustworthy.",
  },
  {
    Icon: IconLeaf,
    title: "Sustainability",
    text: "Every pre-loved bike keeps metal and rubber out of landfills. Choosing second-hand is a small act with a big impact on the planet.",
  },
];

/* ─── Animation helpers ─────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: [0.2, 0.8, 0.2, 1] },
});

/* ─── Component ─────────────────────────────────────────────── */
const About = () => {
  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#121212] transition-colors duration-300 pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-12 md:pt-20">
        {/* ── 1. HERO ── */}
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

        {/* ── 2. MISSION ── */}
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
              Buying and selling bicycles on general platforms like Facebook or
              eBay is messy and risky. Unlike those generic marketplaces,
              BiCycleL is built{" "}
              <strong className="text-gray-900 dark:text-white font-bold">
                only for bikes
              </strong>
              , so you are always dealing with people who understand what they
              are looking at.
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

        {/* ── 3. HOW IT WORKS ── */}
        <section className="mb-24">
          <motion.div {...fadeUp(0)} className="text-center mb-12">
            <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-3">
              The Process
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
              From Listing to Leading
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {LIFECYCLE.map(({ Icon, title, text }, i) => (
              <motion.div
                key={title}
                {...fadeUp(i * 0.08)}
                className="p-8 bg-white dark:bg-[#1A1A1A] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-5">
                  <Icon />
                </div>
                <h3 className="font-black text-lg mb-2 text-gray-900 dark:text-white">
                  {title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {text}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── 4. TRUST & SAFETY CTA ── */}
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
              Our verified review system and private messaging platform ensure
              that you can buy and sell with absolute confidence. Every feature
              we build exists to protect the community.
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
      </div>
    </div>
  );
};

export default About;
