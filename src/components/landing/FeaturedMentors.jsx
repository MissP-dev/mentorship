import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, ArrowUpRight, Star } from 'lucide-react';
import { SectionHeading, Stagger, StaggerItem, PrimaryButton } from './LandingShared';

const MENTORS = [
  {
    id: 'u1',
    name: 'Sarah Chen',
    role: 'Senior Software Engineer',
    company: 'Stripe',
    industry: 'Engineering',
    years: 10,
    rating: 4.8,
    img: '/images/mentors/mentor-sarah.jpg',
    tags: ['System Design', 'React', 'Career Growth'],
    bio: 'Helps engineers level up from mid-level to staff through systems thinking.',
  },
  {
    id: 'u2',
    name: 'James Wilson',
    role: 'Head of Product',
    company: 'Figma',
    industry: 'Product',
    years: 12,
    rating: 4.6,
    img: '/images/mentors/mentor-james.jpg',
    tags: ['Strategy', 'Leadership', 'PM Interviews'],
    bio: 'Ex-Fortune 500 PM guiding aspiring product leaders through big career pivots.',
  },
  {
    id: 'u3',
    name: 'Priya Patel',
    role: 'Design Director',
    company: 'Adobe',
    industry: 'Design',
    years: 9,
    rating: 4.9,
    img: '/images/mentors/mentor-priya.jpg',
    tags: ['UX Strategy', 'Design Systems', 'Portfolio'],
    bio: 'Design leader obsessed with craft, systems, and mentorship for junior designers.',
  },
  {
    id: 'u4',
    name: 'Alex Kim',
    role: 'VP of Data Science',
    company: 'Netflix',
    industry: 'Data / AI',
    years: 14,
    rating: 4.7,
    img: '/images/mentors/mentor-alex.jpg',
    tags: ['ML', 'Data Strategy', 'AI Roadmaps'],
    bio: 'Builds ML leaders — from first model to machine learning orgs at scale.',
  },
  {
    id: 'u5',
    name: 'Maya Rodriguez',
    role: 'Startup Founder',
    company: 'Maya Labs',
    industry: 'Entrepreneurship',
    years: 8,
    rating: 4.9,
    img: '/images/mentors/mentor-maya.jpg',
    tags: ['Fundraising', 'GTM', 'Founding'],
    bio: 'Two-time founder who helps first-time founders avoid the classic traps.',
  },
  {
    id: 'u6',
    name: 'David Okafor',
    role: 'Staff Engineer',
    company: 'Vercel',
    industry: 'Engineering',
    years: 11,
    rating: 4.8,
    img: '/images/mentors/mentor-david.jpg',
    tags: ['Architecture', 'Cloud', 'Mentorship'],
    bio: 'Architecture and scalability mentor for engineers at fast-growing startups.',
  },
];

export default function FeaturedMentors() {
  const navigate = useNavigate();

  return (
    <section id="mentors" className="relative bg-gray-50/70 py-24 sm:py-32 dark:bg-gray-950/40">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/4 top-0 h-[300px] w-[300px] rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[280px] w-[280px] rounded-full bg-accent-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          tag="Featured mentors"
          title="Learn from people who've been there"
          subtitle="Hand-picked, vetted mentors with real experience at companies you admire."
        />

        <Stagger className="mt-16 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {MENTORS.map((mentor) => (
            <StaggerItem key={mentor.id}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className="group h-full overflow-hidden rounded-3xl border border-gray-200/70 bg-white shadow-sm transition-shadow duration-300 hover:shadow-card-hover dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={mentor.img}
                    alt={mentor.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-gray-950/10 to-transparent" />
                  <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-gray-900 shadow backdrop-blur dark:bg-gray-950/80 dark:text-white">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    {mentor.rating}
                  </span>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white">{mentor.name}</h3>
                    <p className="text-sm text-gray-200">
                      {mentor.role} · <span className="text-brand-300">{mentor.company}</span>
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 dark:bg-gray-800">
                      <Briefcase size={12} /> {mentor.industry}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 dark:bg-gray-800">
                      {mentor.years} yrs
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {mentor.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-200/60 transition-colors group-hover:bg-brand-100 dark:bg-brand-900/40 dark:text-brand-300 dark:ring-brand-700/40 dark:group-hover:bg-brand-900/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 overflow-hidden">
                    <div className="grid grid-rows-[0fr] transition-all duration-500 group-hover:grid-rows-[1fr]">
                      <p className="overflow-hidden text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                        {mentor.bio}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/mentors/${mentor.id}`)}
                    className="group/btn mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition-all duration-300 hover:border-brand-500 hover:bg-brand-600 hover:text-white hover:shadow-glow dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-brand-600"
                  >
                    Book a Session
                    <ArrowUpRight
                      size={16}
                      className="transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                    />
                  </button>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-14 text-center">
          <PrimaryButton onClick={() => navigate('/signup')}>View All Mentors</PrimaryButton>
        </div>
      </div>
    </section>
  );
}
