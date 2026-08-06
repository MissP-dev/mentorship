import { motion, useInView, animate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export const EASE = [0.21, 0.47, 0.32, 0.98];

export function Reveal({ children, delay = 0, y = 30, className = '', once = true }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-70px' }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className = '',
  staggerChildren = 0.09,
  delay = 0,
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-70px' }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '', y = 28 }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function CountUp({ to, duration = 1.8, decimals = 0, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    const controls = animate(0, to, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [inView, to, duration]);

  return (
    <span ref={ref}>
      {value.toLocaleString('en-US', { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

export function SectionTag({ children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/40 ring-1 ring-brand-200 dark:ring-brand-700/50 ${className}`}
    >
      {children}
    </span>
  );
}

export function SectionHeading({ tag, title, subtitle, align = 'center', className = '' }) {
  return (
    <div className={`max-w-2xl ${align === 'center' ? 'mx-auto text-center' : ''} ${className}`}>
      <Reveal>
        <SectionTag>{tag}</SectionTag>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="mt-5 text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.16}>
          <p className="mt-5 text-lg leading-relaxed text-gray-600 dark:text-gray-400">{subtitle}</p>
        </Reveal>
      )}
    </div>
  );
}

function addRipple(e) {
  const btn = e.currentTarget;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const span = document.createElement('span');
  span.className = 'ripple-span';
  span.style.width = `${size}px`;
  span.style.height = `${size}px`;
  span.style.left = `${e.clientX - rect.left - size / 2}px`;
  span.style.top = `${e.clientY - rect.top - size / 2}px`;
  btn.appendChild(span);
  setTimeout(() => span.remove(), 600);
}

export function handleRippleClick(callback) {
  return (e) => {
    addRipple(e);
    callback?.(e);
  };
}

const primaryClasses =
  'relative btn-ripple inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 animate-gradient-x px-8 py-4 text-base font-semibold text-white shadow-glow transition-all duration-300 hover:shadow-glow hover:brightness-110 hover:scale-[1.03] active:scale-[0.97]';

const secondaryClasses =
  'relative btn-ripple glass inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-base font-semibold text-gray-800 dark:text-gray-100 transition-all duration-300 hover:scale-[1.03] hover:border-brand-300 dark:hover:border-brand-500/60 active:scale-[0.97]';

export function PrimaryButton({ children, onClick, className = '', ...props }) {
  return (
    <button
      className={`${primaryClasses} ${className}`}
      onClick={handleRippleClick(onClick)}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick, className = '', ...props }) {
  return (
    <button
      className={`${secondaryClasses} ${className}`}
      onClick={handleRippleClick(onClick)}
      {...props}
    >
      {children}
    </button>
  );
}

export function Stars({ rating = 5, className = '' }) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`} aria-label={`${rating} star rating`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          className={`w-4 h-4 ${i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
        />
      ))}
    </div>
  );
}

function StarIcon({ className }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.29 3.96a1 1 0 0 0 .95.7h4.16c.97 0 1.37 1.24.59 1.81l-3.37 2.44a1 1 0 0 0-.36 1.12l1.29 3.96c.3.92-.75 1.69-1.54 1.12l-3.37-2.44a1 1 0 0 0-1.18 0l-3.37 2.44c-.78.57-1.83-.2-1.54-1.12l1.29-3.96a1 1 0 0 0-.36-1.12L2.06 9.4c-.78-.57-.38-1.81.59-1.81h4.16a1 1 0 0 0 .95-.7l1.29-3.96z" />
    </svg>
  );
}
