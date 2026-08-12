import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import ThemeToggle from '../shared/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { EASE } from './LandingShared';

const LINKS = [
  { label: 'Mentorship', href: '#how-it-works' },
  { label: 'Mentors', href: '#mentors' },
  { label: 'Success Stories', href: '#testimonials' },
  { label: 'Community', href: '#community' },
];

export default function LandingNavbar() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('#home');
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 16));

  useEffect(() => {
    const ids = ['home', 'how-it-works', 'mentors', 'testimonials', 'community'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const goTo = (href) => {
    setOpen(false);
    if (href.startsWith('#')) {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(href);
    }
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        className={`transition-all duration-300 ${
          scrolled
            ? 'bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button onClick={() => goTo('#home')} className="flex items-center gap-2.5" aria-label="MConnect home">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 shadow-glow">
              <span className="text-sm font-extrabold text-white">M</span>
            </span>
            <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              MConnect
            </span>
          </button>

          <div className="hidden items-center gap-1 lg:flex">
            {LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => goTo(link.href)}
                className="relative rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                {link.label}
                {active === link.href && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => (isAuthenticated ? navigate('/feed') : navigate('/login'))}
              className="hidden text-sm font-medium text-gray-700 transition-colors hover:text-brand-600 dark:text-gray-300 dark:hover:text-brand-400 sm:block"
            >
              Log In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="group hidden items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-500 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-all duration-300 hover:scale-[1.04] hover:brightness-110 active:scale-[0.97] sm:inline-flex"
            >
              Get Started
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={() => setOpen((v) => !v)}
              className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 lg:hidden"
              aria-label="Toggle menu"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="mx-4 mt-2 overflow-hidden rounded-2xl border border-gray-200/70 bg-white/90 shadow-xl backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/90 lg:hidden"
          >
            <div className="flex flex-col p-4">
              {LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => goTo(link.href)}
                  className="rounded-lg px-4 py-3 text-left text-base font-medium text-gray-700 transition-colors hover:bg-brand-50 hover:text-brand-700 dark:text-gray-300 dark:hover:bg-brand-900/40 dark:hover:text-brand-300"
                >
                  {link.label}
                </button>
              ))}
              <div className="my-3 h-px bg-gray-200 dark:bg-gray-800" />
              <button
                onClick={() => goTo('/login')}
                className="rounded-lg px-4 py-3 text-left text-base font-medium text-gray-700 transition-colors hover:bg-brand-50 dark:text-gray-300 dark:hover:bg-brand-900/40"
              >
                Log In
              </button>
              <button
                onClick={() => goTo('/signup')}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-accent-500 px-4 py-3 text-base font-semibold text-white shadow-glow"
              >
                Get Started Free <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
