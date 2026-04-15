import AboutHero from "./components/AboutHero";
import AboutMission from "./components/AboutMission";
import AboutProcess from "./components/AboutProcess";
import AboutTrustCTA from "./components/AboutTrustCTA";

const About = () => {
  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#121212] transition-colors duration-300 pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-12 md:pt-20">
        <AboutHero />
        <AboutMission />
        <AboutProcess />
        <AboutTrustCTA />
      </div>
    </div>
  );
};

export default About;
