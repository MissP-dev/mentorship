import { motion, useScroll, useSpring } from 'framer-motion';
import LandingNavbar from '../landing/LandingNavbar';
import Hero from '../landing/Hero';
import TrustBar from '../landing/TrustBar';
import HowItWorks from '../landing/HowItWorks';
import StatsSection from '../landing/StatsSection';
import FeaturedMentors from '../landing/FeaturedMentors';
import Testimonials from '../landing/Testimonials';
import CTASection from '../landing/CTASection';
import Footer from '../landing/Footer';

export default function WelcomePage() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white dark:bg-gray-950"
    >
      <motion.div
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-brand-500 via-accent-500 to-fuchsia-500"
      />
      <LandingNavbar />
      <main>
        <Hero />
        <TrustBar />
        <HowItWorks />
        <StatsSection />
        <FeaturedMentors />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </motion.div>
  );
}
