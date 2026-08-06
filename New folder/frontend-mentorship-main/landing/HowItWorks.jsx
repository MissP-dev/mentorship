import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Video, TrendingUp } from 'lucide-react';

const EASE = [0.21, 0.47, 0.32, 0.98];

const STEPS = [
  {
    title: 'Find Your Match',
    desc: "Tell us your goals and experience. We'll connect you with a mentor who fits your ambitions.",
    image: '/images/how-it-works/find-match.png',
    icon: Search,
  },
  {
    title: 'Learn 1-on-1',
    desc: 'Meet regularly with your mentor through structured video sessions, feedback and personalized guidance.',
    image: '/images/how-it-works/mentor-session.jpeg',
    icon: Video,
  },
  {
    title: 'Accelerate Your Career',
    desc: 'Track milestones, celebrate achievements and continuously grow with measurable progress.',
    image: '/images/how-it-works/growth-dashboard.png',
    icon: TrendingUp,
  },
];

function StepItem({ step, active, onSelect, index }) {
  const Icon = step.icon;
  return (
    <motion.button
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls="how-it-works-illustration"
      onMouseEnter={() => onSelect(index)}
      onClick={() => onSelect(index)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, delay: 0.12 + index * 0.12, ease: EASE }}
      className={`flex w-full items-start gap-4 rounded-[24px] border p-5 text-left transition-all duration-300 sm:p-6 ${
        active
          ? 'border-[#6D5EF8] bg-[#ECE8FF] shadow-md shadow-[#6D5EF8]/10 dark:border-brand-500/60 dark:bg-brand-950/40'
          : 'border-[#ECECEC] bg-white hover:border-[#6D5EF8]/40 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-500/40'
      }`}
    >
      <span
        className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${
          active ? 'bg-[#6D5EF8] text-white' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
        }`}
      >
        <Icon size={20} />
      </span>
      <span className="min-w-0">
        <span
          className={`block text-base transition-colors duration-300 sm:text-lg ${
            active ? 'font-bold text-gray-900 dark:text-white' : 'font-semibold text-gray-800 dark:text-gray-200'
          }`}
        >
          {step.title}
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          {step.desc}
        </span>
      </span>
    </motion.button>
  );
}

export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const activeStep = STEPS[active];

  return (
    <section id="how-it-works" className="bg-[#FAFAFC] py-24 sm:py-32 dark:bg-gray-950/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16">
          {/* Content */}
          <div className="order-2 lg:order-1">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, ease: EASE }}
              className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#6D5EF8] ring-1 ring-[#6D5EF8]/30 dark:text-brand-300 dark:ring-brand-500/40"
            >
              How It Works
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.05, ease: EASE }}
              className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl"
            >
              Your journey to career growth
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
              className="mt-5 max-w-md text-lg leading-relaxed text-gray-500 dark:text-gray-400"
            >
              Find the right mentor, learn together, and track your progress every step of the way.
            </motion.p>

            <div role="tablist" className="mt-10 space-y-4">
              {STEPS.map((step, i) => (
                <StepItem
                  key={step.title}
                  step={step}
                  index={i}
                  active={active === i}
                  onSelect={setActive}
                />
              ))}
            </div>
          </div>

          {/* Illustration */}
          <div className="order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
              className="rounded-[24px] border border-[#ECECEC] bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-[#FAFAFC] dark:bg-gray-950">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.img
                    key={activeStep.title}
                    id="how-it-works-illustration"
                    src={activeStep.image}
                    alt={activeStep.title}
                    role="tabpanel"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -18 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                </AnimatePresence>
              </div>
              <div className="mt-5 flex items-center justify-center gap-2">
                {STEPS.map((s, i) => (
                  <button
                    key={s.title}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Show step ${i + 1}: ${s.title}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      active === i ? 'w-7 bg-[#6D5EF8]' : 'w-2 bg-[#ECECEC] hover:bg-[#6D5EF8]/40 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
