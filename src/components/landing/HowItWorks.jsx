import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const EASE = [0.21, 0.47, 0.32, 0.98];

const STEPS = [
  {
    number: '01',
    badge: 'Step One',
    title: 'Search Mentors',
    desc: 'Browse experienced mentors based on your interests, career goals, and areas of expertise. Finding the right mentor has never been easier.',
    image: '/images/how-it-works/search-mentors.png',
  },
  {
    number: '02',
    badge: 'Step Two',
    title: 'Send a Request',
    desc: 'Reach out with a personalized mentorship request explaining your goals and what you hope to learn.',
    image: '/images/how-it-works/send-request.png',
  },
  {
    number: '03',
    badge: 'Step Three',
    title: 'Confirm Your Session',
    desc: 'Choose a convenient meeting time and confirm your mentorship session through a simple scheduling experience.',
    image: '/images/how-it-works/confirm-session.png',
  },
  {
    number: '04',
    badge: 'Step Four',
    title: 'Learn & Grow',
    desc: 'Join your mentorship session, gain practical insights and build meaningful professional relationships that support your growth.',
    image: '/images/how-it-works/learn-grow.png',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#FAFAFC] py-24 sm:py-32 dark:bg-gray-950/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, ease: EASE }}
            className="inline-flex items-center rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#3B82F6] ring-1 ring-[#3B82F6]/30"
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
            Your mentorship journey in four simple steps.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-gray-500 dark:text-gray-400"
          >
            From discovering the right mentor to tracking your personal growth, mConnect guides you through every
            stage of the mentorship experience.
          </motion.p>
        </div>

        {/* Vertical alternating timeline */}
        <div className="relative mt-6">
          {/* Curved zigzag connecting line (desktop) */}
          <svg
            className="absolute inset-y-0 left-1/2 hidden w-full max-w-6xl -translate-x-1/2 md:block"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            style={{ filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.35))' }}
          >
            <path
              d="M50 0 C 45 6, 55 19, 50 25 C 45 31, 55 44, 50 50 C 45 56, 55 69, 50 75 C 45 81, 55 94, 50 100"
              fill="none"
              stroke="#3B82F6"
              strokeOpacity="0.4"
              strokeWidth="1.5"
            />
          </svg>

          {/* Left rail (mobile) */}
          <span className="absolute bottom-10 left-6 top-10 w-0.5 bg-blue-200/70 md:hidden" aria-hidden="true" />

          {STEPS.map((step, i) => {
            const illustrationOnLeft = i % 2 === 0;
            return (
              <div
                key={step.number}
                className="relative grid items-center gap-16 py-20 md:grid-cols-2 md:gap-16"
              >
                {/* Center node (desktop) */}
                <span className="absolute left-1/2 top-1/2 z-10 hidden h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#3B82F6] text-sm font-bold text-white shadow-lg shadow-[#3B82F6]/30 ring-4 ring-[#FAFAFC] dark:ring-gray-950 md:flex">
                  {step.number}
                </span>
                {/* Node (mobile) */}
                <span className="absolute left-6 top-1/2 z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#3B82F6] text-sm font-bold text-white shadow-lg md:hidden">
                  {step.number}
                </span>

                {/* Illustration card */}
                <motion.div
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
                  className={`relative ${
                    illustrationOnLeft
                      ? 'md:order-1 md:mr-8 lg:mr-14'
                      : 'md:order-2 md:ml-8 lg:ml-14'
                  }`}
                >
                  <div className="rounded-2xl bg-white p-6 shadow-xl dark:bg-white">
                    <div className="overflow-hidden rounded-xl border border-gray-100">
                      <img
                        src={step.image}
                        alt={`${step.title} screenshot`}
                        loading="lazy"
                        className="aspect-[3/2] w-full object-cover"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Text content */}
                <motion.div
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.6, delay: 0.16, ease: EASE }}
                  className={`relative pl-16 md:pl-0 ${
                    illustrationOnLeft
                      ? 'md:order-2 md:pl-16 lg:pl-24'
                      : 'md:order-1 md:pr-16 lg:pr-24'
                  }`}
                >
                  {/* Watermark number */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-10 left-0 select-none text-8xl font-black leading-none tracking-tight text-[#3B82F6]/10 md:-top-12"
                  >
                    {step.number}
                  </span>

                  <span className="relative inline-flex items-center rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#3B82F6] ring-1 ring-[#3B82F6]/20">
                    {step.badge}
                  </span>

                  <h3 className="relative mt-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                    {step.title}
                  </h3>

                  <p className="relative mt-4 max-w-md text-lg leading-relaxed text-gray-500 dark:text-gray-400">
                    {step.desc}
                  </p>

                  <button
                    type="button"
                    aria-label={`${step.title} - learn more`}
                    className="relative mt-6 inline-flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-[#3B82F6] shadow-sm transition-all duration-300 hover:border-[#3B82F6] hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-[#3B82F6] dark:hover:bg-blue-950/40"
                  >
                    <ArrowUpRight size={20} />
                  </button>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
