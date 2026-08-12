import { Reveal } from './LandingShared';

const AUDIENCES = [
  'University Students',
  'Professionals',
  'Startup Founders',
  'Software Engineers',
  'Designers',
  'Product Managers',
  'Data Scientists',
  'AI Engineers',
];

export default function TrustBar() {
  const items = [...AUDIENCES, ...AUDIENCES];
  return (
    <section className="border-y border-gray-200/60 bg-gray-50/60 py-12 dark:border-gray-800/60 dark:bg-gray-950/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-center text-sm font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Learn from mentors at every stage of the journey
          </p>
        </Reveal>
        <Reveal delay={0.1} className="marquee-mask mt-8 overflow-hidden">
          <div className="flex w-max animate-marquee items-center gap-16 pr-16">
            {items.map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="text-2xl font-bold tracking-tight text-gray-300 transition-colors duration-300 hover:text-brand-500 dark:text-gray-700 dark:hover:text-brand-400"
              >
                {name}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
