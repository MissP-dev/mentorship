import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
} from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  Check,
  Clock,
  MessageSquare,
  TrendingUp,
  Video,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PrimaryButton, SecondaryButton, Stars, EASE } from './LandingShared';

const PARTICLES = Array.from({ length: 16 }).map((_, i) => ({
  id: i,
  left: (i * 61) % 100,
  top: (i * 37) % 100,
  size: 3 + (i % 3) * 2,
  delay: (i % 7) * 0.8,
  duration: 7 + (i % 5) * 2,
}));

export default function Hero() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const sectionRef = useRef(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springX = useSpring(mx, { stiffness: 60, damping: 18 });
  const springY = useSpring(my, { stiffness: 60, damping: 18 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-7, 7]);
  const cardX = useTransform(springX, [-0.5, 0.5], [-18, 18]);
  const cardY = useTransform(springY, [-0.5, 0.5], [-14, 14]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);

  const handleMouseMove = (e) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <section
      id="home"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28 lg:pt-40"
    >
      {/* Background blobs */}
      <motion.div style={{ y: bgY }} className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full bg-brand-400/30 blur-3xl animate-blob" />
        <div className="absolute top-1/4 -right-32 h-[420px] w-[420px] rounded-full bg-accent-500/25 blur-3xl animate-blob" style={{ animationDelay: '-6s' }} />
        <div className="absolute bottom-0 left-1/3 h-[360px] w-[360px] rounded-full bg-brand-600/20 blur-3xl animate-blob" style={{ animationDelay: '-12s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(99,102,241,0.045)_1px,transparent_1px),linear-gradient(rgba(99,102,241,0.045)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]" />
      </motion.div>

      {/* Particles */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {PARTICLES.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full bg-brand-500/50"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              animation: `float-slow ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8">
        {/* Copy */}
        <div className="text-center lg:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-gray-900 dark:text-white sm:text-6xl xl:text-7xl"
          >
            Where <span className="text-gradient">growth</span> meets guidance
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
            className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-gray-600 dark:text-gray-400 lg:mx-0 xl:text-xl"
          >
            MConnect pairs ambitious professionals with world-class mentors through structured
            sessions, personalized roadmaps, and a community that has your back.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start"
          >
            <PrimaryButton onClick={() => navigate('/signup')} className="w-full sm:w-auto">
              Get Started Free
              <ArrowRight size={18} />
            </PrimaryButton>
            <SecondaryButton
              onClick={() => (isAuthenticated ? navigate('/feed') : navigate('/login'))}
              className="w-full sm:w-auto"
            >
              <Video size={18} className="text-brand-500" />
              Browse Mentors
            </SecondaryButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.42, ease: EASE }}
            className="mt-12 flex flex-col items-center gap-5 sm:flex-row lg:justify-start"
          >
            <div className="flex -space-x-3">
              {['/images/mentors/mentor-sarah.jpg', '/images/mentors/mentor-james.jpg', '/images/mentors/mentor-priya.jpg', '/images/mentors/mentor-alex.jpg', '/images/mentors/mentor-david.jpg'].map((img) => (
                <img
                  key={img}
                  src={img}
                  alt=""
                  className="h-11 w-11 rounded-full border-2 border-white object-cover shadow-md dark:border-gray-900"
                />
              ))}
            </div>
            <div className="text-center sm:text-left">
              <Stars rating={5} />
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">1,200+ mentees</span>{' '}
                already growing with us
              </p>
            </div>
          </motion.div>
        </div>

        {/* Dashboard mockup + floating cards */}
        <div className="relative mx-auto w-full max-w-lg lg:max-w-none" style={{ perspective: 1200 }}>
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
            style={{ rotateX, rotateY }}
            className="relative"
          >
            <div className="overflow-hidden rounded-3xl border border-white/50 bg-white/80 shadow-2xl shadow-brand-600/20 backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/70">
              {/* Window bar */}
              <div className="flex items-center justify-between border-b border-gray-200/70 px-5 py-3.5 dark:border-gray-800">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  <span className="flex h-4 w-4 items-center justify-center rounded-md bg-gradient-to-br from-brand-600 to-accent-500 text-[9px] font-bold text-white">M</span>
                  app.mconnect.io
                </span>
                <span className="w-12" />
              </div>

              <div className="grid grid-cols-[56px_1fr]">
                {/* Sidebar */}
                <div className="flex flex-col items-center gap-3 border-r border-gray-200/70 py-5 dark:border-gray-800">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className={`h-9 w-9 rounded-xl bg-gradient-to-br ${
                        i === 0
                          ? 'from-brand-600 to-accent-500 shadow-glow'
                          : 'from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800'
                      } ${i === 2 ? 'ring-2 ring-accent-400' : ''}`}
                    />
                  ))}
                </div>

                {/* Main panel */}
                <div className="space-y-4 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Good morning, Alex</p>
                      <p className="text-base font-bold text-gray-900 dark:text-white">
                        Your growth journey
                      </p>
                    </div>
                    <img
                      src="/images/mentors/mentor-maya.jpg"
                      alt="Alex"
                      className="h-9 w-9 rounded-full object-cover ring-2 ring-brand-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-500 p-3.5 text-white shadow-glow">
                      <TrendingUp size={16} className="opacity-80" />
                      <p className="mt-2 text-xl font-extrabold">12</p>
                      <p className="text-[11px] font-medium text-brand-100">Sessions completed</p>
                    </div>
                    <div className="rounded-2xl border border-gray-200/70 bg-white/60 p-3.5 dark:border-gray-700 dark:bg-gray-800/60">
                      <Calendar size={16} className="text-accent-500" />
                      <p className="mt-2 text-xl font-extrabold text-gray-900 dark:text-white">3</p>
                      <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                        Sessions this month
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200/70 bg-white/60 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-gray-700 dark:text-gray-300">Career Sprint · Goal 2026</span>
                      <span className="text-brand-600 dark:text-brand-400">68%</span>
                    </div>
                    <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '68%' }}
                        transition={{ duration: 1.4, delay: 0.9, ease: EASE }}
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
                      />
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                      <Check size={12} className="text-emerald-500" />
                      3 of 5 milestones done
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200/70 bg-white/60 p-3 dark:border-gray-700 dark:bg-gray-800/60">
                    <div className="flex items-center gap-3">
                      <img
                        src="/images/mentors/mentor-sarah.jpg"
                        alt="Sarah Chen"
                        className="h-9 w-9 rounded-full object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                          Career strategy with Sarah
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          Tomorrow · 4:00 PM
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                        Confirmed
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating: upcoming session */}
          <motion.div
            style={{ x: cardX, y: cardY }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.7, ease: EASE }}
            className="absolute -left-4 top-8 hidden sm:block lg:-left-10"
          >
            <div className="glass w-56 rounded-2xl p-4 shadow-xl shadow-brand-600/10 animate-float">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Upcoming Session
              </p>
              <div className="mt-2.5 flex items-center gap-3">
                <img
                  src="/images/mentors/mentor-david.jpg"
                  alt="Mentor"
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-brand-400"
                />
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">System Design</p>
                  <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Clock size={11} /> Today · 6:30 PM
                  </p>
                </div>
              </div>
              <button className="mt-3 w-full rounded-lg bg-gradient-to-r from-brand-600 to-accent-500 py-1.5 text-xs font-semibold text-white shadow-glow">
                Join Session
              </button>
            </div>
          </motion.div>

          {/* Floating: notification popup */}
          <motion.div
            style={{ x: cardX }}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.95, ease: EASE }}
            className="absolute -right-2 top-24 lg:-right-8"
          >
            <div className="glass w-64 rounded-2xl p-4 shadow-xl shadow-accent-500/10 animate-float-slow">
              <div className="flex items-start gap-3">
                <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-500/15 text-accent-500">
                  <MessageSquare size={17} />
                  <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </span>
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Sarah matched with you
                  </p>
                  <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                    She shared a new resource in your roadmap.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating: mentor profile */}
          <motion.div
            style={{ x: cardX }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 1.15, ease: EASE }}
            className="absolute -bottom-6 -right-2 hidden sm:block lg:-right-6"
          >
            <div className="glass flex w-60 items-center gap-3 rounded-2xl p-4 shadow-xl shadow-brand-600/10 animate-float" style={{ animationDelay: '-3s' }}>
              <div className="relative">
                <img
                  src="/images/mentors/mentor-james.jpg"
                  alt="James Wilson"
                  className="h-11 w-11 rounded-full object-cover ring-2 ring-emerald-400"
                />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-gray-900" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white">James Wilson</p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  Product Lead · ex-Figma
                </p>
              </div>
              <span className="ml-auto flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[11px] font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                <span className="text-amber-500">★</span>4.9
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
