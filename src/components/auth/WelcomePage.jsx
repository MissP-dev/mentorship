import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LandingNavbar from '../landing/LandingNavbar';
import Hero from '../landing/Hero';
import StatsSection from '../landing/StatsSection';
import HowItWorks from '../landing/HowItWorks';
import FeaturedMentors from '../landing/FeaturedMentors';
import Testimonials from '../landing/Testimonials';
import CTASection from '../landing/CTASection';
import TrustBar from '../landing/TrustBar';
import Footer from '../landing/Footer';
import EventsAndMeetingsSection from '../landing/EventsAndMeetingsSection';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <LandingNavbar />
      <Hero />
      <StatsSection />
      <HowItWorks />
      <FeaturedMentors />
      <Testimonials />
      <EventsAndMeetingsSection />
      <CTASection />
      <TrustBar />
      <Footer />
    </div>
  );
}
