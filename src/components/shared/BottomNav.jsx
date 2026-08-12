import { NavLink } from 'react-router-dom';
import { Home, MessageSquare, UserCircle, Calendar, Video, Users } from 'lucide-react';

const links = [
  { to: '/feed', icon: Home, label: 'Home' },
  { to: '/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/events', icon: Calendar, label: 'Events' },
  { to: '/meetings', icon: Video, label: 'Meetings' },
  { to: '/mentors', icon: Users, label: 'Mentors' },
  { to: '/profile', icon: UserCircle, label: 'Profile' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0d0f17] border-t border-gray-200 dark:border-[#1e293b] lg:hidden z-50">
      <div className="flex justify-around items-center h-14 max-w-lg mx-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 min-w-0 transition-colors ${
                isActive
                  ? 'text-purple-600 dark:text-[#8b5cf6]'
                  : 'text-gray-500'
              }`
            }
          >
            <Icon size={20} strokeWidth={1.5} />
            <span className="text-[9px] leading-tight">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
