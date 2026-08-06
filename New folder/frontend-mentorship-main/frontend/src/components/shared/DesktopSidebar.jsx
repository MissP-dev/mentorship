import { NavLink } from 'react-router-dom';
import { Home, Search, MessageSquare, User, Settings, LogOut, PenLine, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';

const navItems = [
  { to: '/feed', icon: Home, label: 'Home' },
  { to: '/mentors', icon: Search, label: 'Find Mentors' },
  { to: '/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/groups', icon: Users, label: 'Groups' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function DesktopSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-700 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg font-bold">M</span>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">MConnect</span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <button onClick={() => navigate('/profile')} className="flex items-center gap-3 px-3 py-2 w-full rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <Avatar src={user?.avatarUrl} alt={user?.fullName} size="sm" />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.fullName}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user?.email}</p>
          </div>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors mt-1"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}
