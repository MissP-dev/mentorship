import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Reveal, handleRippleClick } from './LandingShared';

export default function CTASection() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <section id="community" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-700 via-brand-600 to-accent-600 px-6 py-20 text-center shadow-2xl shadow-brand-700/30 sm:px-16 sm:py-24">
            {/* Animated background */}
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-blob" />
              <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-accent-300/20 blur-3xl animate-blob" style={{ animationDelay: '-7s' }} />
              <div className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-brand-300/20 blur-2xl animate-blob" style={{ animationDelay: '-12s' }} />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.14),transparent_55%)]" />
              <div className="absolute inset-0 opacity-40 animate-shimmer" />
            </div>

            {/* Floating shapes */}
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              <span className="absolute left-[12%] top-[22%] h-3 w-3 rounded-full bg-white/50 animate-float" />
              <span className="absolute right-[16%] top-[28%] h-2 w-2 rounded-full bg-white/40 animate-float-slow" />
              <span className="absolute left-[22%] bottom-[24%] h-2.5 w-2.5 rounded-full bg-brand-200/60 animate-float" style={{ animationDelay: '-2s' }} />
              <span className="absolute right-[24%] bottom-[20%] h-3.5 w-3.5 rounded-full bg-accent-300/60 animate-float-slow" style={{ animationDelay: '-4s' }} />
              <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 animate-spin-slow" />
            </div>

            <div className="relative">
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur"
              >
                ✦ Join 1,200+ ambitious mentees
              </motion.span>
              <h2 className="mx-auto mt-6 max-w-2xl text-4xl font-extrabold leading-tight text-white sm:text-5xl">
                Your future self is one mentor away.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-brand-100">
                Start free in under two minutes. No credit card required — just bring your goals
                and we'll find the mentor who can take you further.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  onClick={handleRippleClick(() => navigate('/signup'))}
                  className="group relative btn-ripple inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-brand-700 shadow-xl transition-all duration-300 hover:scale-[1.04] hover:shadow-2xl active:scale-[0.97] sm:w-auto"
                >
                  Get Started Free
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </button>
                <button
                  onClick={handleRippleClick(() => (isAuthenticated ? navigate('/feed') : navigate('/login')))}
                  className="relative btn-ripple inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur transition-all duration-300 hover:scale-[1.04] hover:bg-white/20 active:scale-[0.97] sm:w-auto"
                >
                  <PlayCircle size={18} />
                  Browse Mentors
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
