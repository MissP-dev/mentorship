import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUp, Mail, Check } from 'lucide-react';
import { Reveal } from './LandingShared';

const IconX = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.63 7.58H.48l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41z" />
  </svg>
);

const IconLinkedIn = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  </svg>
);

const IconGitHub = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.83 1.24 1.83 1.24 1.08 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.64-.3-5.41-1.32-5.41-5.87 0-1.3.46-2.36 1.24-3.19-.13-.3-.54-1.52.11-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.65 1.66.24 2.88.12 3.18.77.83 1.23 1.89 1.23 3.19 0 4.56-2.78 5.56-5.43 5.85.43.37.81 1.1.81 2.22l-.01 3.29c0 .32.21.7.83.58A12 12 0 0 0 12 .3z" />
  </svg>
);

const IconYouTube = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
  </svg>
);

const COLUMNS = [
  {
    title: 'Company',
    links: ['About Us', 'Careers', 'Blog', 'Press Kit', 'Contact'],
  },
  {
    title: 'Mentorship',
    links: ['Find a Mentor', 'Become a Mentor', 'Pricing', 'Enterprise', 'Sessions'],
  },
  {
    title: 'Resources',
    links: ['Help Center', 'Community', 'Webinars', 'Career Guides', 'API'],
  },
  {
    title: 'Support',
    links: ['FAQ', 'Terms of Service', 'Privacy Policy', 'Security', 'Status'],
  },
];

const SOCIALS = [
  { icon: IconX, label: 'X' },
  { icon: IconLinkedIn, label: 'LinkedIn' },
  { icon: IconGitHub, label: 'GitHub' },
  { icon: IconYouTube, label: 'YouTube' },
];

export default function Footer() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const subscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  const backToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="relative border-t border-gray-200/60 bg-gray-50/80 dark:border-gray-800/60 dark:bg-gray-950/60">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          {/* Brand + newsletter */}
          <Reveal>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 shadow-glow">
                  <span className="text-sm font-extrabold text-white">M</span>
                </span>
                <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                  MConnect
                </span>
              </div>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                The mentorship platform where ambition meets experience. Grow your career with
                structured guidance from the world's best.
              </p>

              <form onSubmit={subscribe} className="mt-7 max-w-sm">
                <label htmlFor="newsletter" className="text-sm font-semibold text-gray-900 dark:text-white">
                  Join our newsletter
                </label>
                <div className="mt-2.5 flex overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/30 dark:border-gray-700 dark:bg-gray-900">
                  <input
                    id="newsletter"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full bg-transparent px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe"
                    className="m-1 flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-accent-500 px-4 text-sm font-semibold text-white shadow-glow transition-all hover:brightness-110"
                  >
                    {subscribed ? <Check size={16} /> : <Mail size={16} />}
                  </button>
                </div>
                {subscribed && (
                  <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    You're in! Welcome aboard.
                  </p>
                )}
              </form>
            </div>
          </Reveal>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((col, ci) => (
              <Reveal key={col.title} delay={ci * 0.07}>
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                    {col.title}
                  </h4>
                  <ul className="mt-4 space-y-3">
                    {col.links.map((link) => (
                      <li key={link}>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            navigate('/signup');
                          }}
                          className="group inline-flex items-center text-sm text-gray-500 transition-colors hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400"
                        >
                          <span className="absolute -ml-4 -translate-x-1 text-brand-500 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                            →
                          </span>
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-6 border-t border-gray-200/70 pt-8 dark:border-gray-800/70 sm:flex-row">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} MConnect. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                onClick={(e) => e.preventDefault()}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-500 hover:text-brand-600 hover:shadow-glow dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:text-brand-400"
              >
                <s.icon size={16} />
              </a>
            ))}
          </div>
          <motion.button
            onClick={backToTop}
            whileHover={{ y: -3 }}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:border-brand-500 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:text-brand-400"
          >
            Back to top <ArrowUp size={15} />
          </motion.button>
        </div>
      </div>
    </footer>
  );
}
