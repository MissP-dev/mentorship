import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { SectionHeading, Stars } from './LandingShared';

const TESTIMONIALS = [
  {
    quote:
      'Within three months of joining MConnect I landed a senior role at a company I’d only dreamed of. My mentor rewired how I approach interviews and architecture.',
    name: 'Emily Carter',
    role: 'Senior Engineer',
    company: 'Stripe',
    rating: 5,
    img: 'https://i.pravatar.cc/120?img=9',
  },
  {
    quote:
      'The structured roadmap was a game changer. Instead of scattered advice, I got a clear 12-week plan that turned into a promotion.',
    name: 'Marcus Lee',
    role: 'Product Manager',
    company: 'Notion',
    rating: 5,
    img: 'https://i.pravatar.cc/120?img=53',
  },
  {
    quote:
      'My mentor gave me feedback no course could. Six months later I switched industries with confidence — best career decision I’ve made.',
    name: 'Sofia Alvarez',
    role: 'Design Lead',
    company: 'Adobe',
    rating: 5,
    img: 'https://i.pravatar.cc/120?img=16',
  },
  {
    quote:
      'As a founder, every session felt like a free board meeting. MConnect matched me with someone who had actually raised and scaled.',
    name: 'Jordan Miles',
    role: 'Startup Founder',
    company: 'Maya Labs',
    rating: 5,
    img: 'https://i.pravatar.cc/120?img=60',
  },
];

function useVisibleCount() {
  const [count, setCount] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 640px)').matches ? 2 : 1,
  );

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    const update = () => setCount(mq.matches ? 2 : 1);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return count;
}

export default function Testimonials() {
  const visible = useVisibleCount();
  const maxIndex = TESTIMONIALS.length - visible;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    if (paused) return undefined;
    const id = setInterval(
      () => setIndex((i) => (i >= maxIndex ? 0 : i + 1)),
      5000,
    );
    return () => clearInterval(id);
  }, [paused, maxIndex]);

  const go = (dir) =>
    setIndex((i) => {
      const next = i + dir;
      if (next > maxIndex) return 0;
      if (next < 0) return maxIndex;
      return next;
    });

  return (
    <section id="testimonials" className="relative py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute right-1/4 top-1/3 h-[300px] w-[300px] rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-[240px] w-[240px] rounded-full bg-accent-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          tag="Success stories"
          title="Mentees who made the leap"
          subtitle="Real people, real growth. Here's what happens when the right mentor shows up."
        />

        <div
          className="relative mt-16"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="-mx-3 overflow-hidden">
            <motion.div
              className="flex"
              animate={{ x: `${-index * (100 / visible)}%` }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            >
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.name}
                  className="shrink-0 px-3"
                  style={{ width: `${100 / visible}%` }}
                >
                  <motion.figure
                    whileHover={{ y: -6 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    className="flex h-full flex-col justify-between rounded-3xl border border-gray-200/70 bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-card-hover dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <Quote size={28} className="text-brand-200 dark:text-brand-700" aria-hidden="true" />
                        <Stars rating={t.rating} />
                      </div>
                      <blockquote className="mt-5 text-base leading-relaxed text-gray-700 dark:text-gray-300 sm:text-lg">
                        “{t.quote}”
                      </blockquote>
                    </div>
                    <figcaption className="mt-7 flex items-center gap-3 border-t border-gray-100 pt-5 dark:border-gray-800">
                      <img
                        src={t.img}
                        alt={t.name}
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-brand-400"
                      />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{t.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t.role} ·{' '}
                          <span className="font-semibold text-brand-600 dark:text-brand-400">
                            {t.company}
                          </span>
                        </p>
                      </div>
                    </figcaption>
                  </motion.figure>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              onClick={() => go(-1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-all hover:scale-105 hover:border-brand-500 hover:text-brand-600 hover:shadow-glow dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:text-brand-400"
              aria-label="Previous testimonials"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to testimonials ${i * visible + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === index
                      ? 'w-8 bg-gradient-to-r from-brand-500 to-accent-500'
                      : 'w-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => go(1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-all hover:scale-105 hover:border-brand-500 hover:text-brand-600 hover:shadow-glow dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:text-brand-400"
              aria-label="Next testimonials"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
