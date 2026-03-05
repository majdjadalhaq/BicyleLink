import { motion } from "framer-motion";
import { Link } from "react-router";

const About = () => {
  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#121212] transition-colors duration-300 pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-12 md:pt-20">
        {/* HERO SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-24"
        >
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
            Moving the World, <span className="text-emerald-500">One Bike</span>{" "}
            at a Time.
          </h1>

          <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            BiCycleL is a community-driven marketplace designed specifically for
            cyclists. We make it easy to pass on your pre-loved ride or find
            your next adventure.
          </p>
        </motion.section>

        {/* MISSION & WHY SECTION */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-black text-gray-900 dark:text-white">
              A Garage for Everyone.
            </h2>

            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Buying and selling bicycles shouldn’t be complicated or unsafe.
              Unlike generic marketplaces, BiCycleL is built only for bikes. We
              focused on creating a space where serious riders and casual
              commuters can connect through a platform that understands the
              specific needs of the cycling community.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="aspect-video bg-emerald-500/10 rounded-[2.5rem] border border-emerald-500/20 flex items-center justify-center"
          >
            <span className="text-6xl">🚲</span>
          </motion.div>
        </div>

        {/* HOW IT WORKS */}
        <section className="mb-24">
          <h2 className="text-3xl font-black text-center mb-12 dark:text-white">
            From Listing to Riding
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Discover",
                text: "Browse bicycles near your location and find the perfect ride.",
                icon: "🔍",
              },
              {
                title: "Connect",
                text: "Use our secure private chat to talk directly with the seller.",
                icon: "💬",
              },
              {
                title: "Meet & Inspect",
                text: "Meet safely and check the bike condition before payment.",
                icon: "🤝",
              },
              {
                title: "The Exchange",
                text: "The seller marks the bike as sold and selects the buyer.",
                icon: "💳",
              },
              {
                title: "The Review",
                text: "Only verified buyers can leave ratings after the deal.",
                icon: "⭐",
              },
              {
                title: "Sustainability",
                text: "Every reused bike helps reduce waste and protect the planet.",
                icon: "🌱",
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 bg-white dark:bg-[#1A1A1A] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-4">{step.icon}</div>

                <h3 className="font-bold text-lg mb-2 dark:text-white">
                  {step.title}
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {step.text}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* TRUST & SAFETY */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-emerald-500 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden mb-24"
        >
          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-6">
              Your Trust is Our Priority.
            </h2>

            <p className="max-w-xl mx-auto mb-10 opacity-90">
              Our verified review system and private messaging platform ensure
              that you can buy and sell with absolute confidence.
            </p>

            <Link
              to="/"
              className="inline-flex h-14 px-10 items-center justify-center bg-white text-emerald-600 font-black rounded-2xl hover:scale-105 transition-transform"
            >
              BROWSE LISTINGS
            </Link>
          </div>

          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </motion.section>
      </div>
    </div>
  );
};

export default About;
