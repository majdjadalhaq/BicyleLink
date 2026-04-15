import { motion } from "framer-motion";

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

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: [0.2, 0.8, 0.2, 1] },
});

const AboutProcess = () => {
  return (
    <section className="mb-24">
      <motion.div {...fadeUp(0)} className="text-center mb-12">
        <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-3">
          The Process
        </p>
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
          From Listing to Riding
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
  );
};

export default AboutProcess;
