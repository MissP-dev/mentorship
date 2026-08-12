import { Users, UserCheck, HeartHandshake, Award } from 'lucide-react';
import { CountUp, Stagger, StaggerItem } from './LandingShared';

const STATS = [
  { icon: Users, value: 500, suffix: '+', label: 'Active Mentors', desc: 'Vetted leaders across 40+ industries' },
  { icon: UserCheck, value: 1200, suffix: '+', label: 'Successful Matches', desc: 'Mentorship pairs that stuck' },
  { icon: HeartHandshake, value: 95, suffix: '%', label: 'Satisfaction Rate', desc: 'From post-session surveys' },
  { icon: Award, value: 4.9, suffix: '/5', label: 'Average Rating', desc: 'Across 3,200+ sessions', decimals: 1 },
];

export default function StatsSection() {
  return (
    <section className="relative py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Stagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <StaggerItem key={stat.label}>
              <div className="group relative h-full overflow-hidden rounded-3xl border border-gray-200/70 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover dark:border-gray-800 dark:bg-gray-900">
                <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-brand-500/20 to-accent-500/20 blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-60" />
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-200/60 dark:bg-brand-900/40 dark:text-brand-400 dark:ring-brand-700/40">
                  <stat.icon size={24} />
                </div>
                <p className="mt-5 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  <CountUp to={stat.value} suffix={stat.suffix} decimals={stat.decimals ?? 0} />
                </p>
                <p className="mt-1.5 font-semibold text-gray-800 dark:text-gray-200">{stat.label}</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{stat.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
