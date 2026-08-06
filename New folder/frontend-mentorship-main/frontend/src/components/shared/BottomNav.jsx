import { NavLink } from 'react-router-dom';
import { Home, Search, MessageSquare, Settings, Users, UserCircle } from 'lucide-react';

const links = [
  { to: '/feed', icon: Home, label: 'Home' },
  { to: '/mentors', icon: Search, label: 'Search' },
  { to: '/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/groups', icon: Users, label: 'Groups' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/profile', icon: UserCircle, label: 'Profile' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 lg:hidden z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] transition-colors ${
                isActive
                  ? 'text-purple-700 dark:text-purple-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-300'
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
