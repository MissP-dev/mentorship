import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Users, MessageSquare, Calendar, Video, UserCircle, Shield } from 'lucide-react';
import Avatar from './Avatar';
import logoSrc from '../../assets/mconnect-logo.png';

const NAV_ITEMS = [
  { to: '/feed', icon: Home, label: 'Home' },
  { to: '/mentors', icon: Users, label: 'Find Mentors' },
  { to: '/messages', icon: MessageSquare, label: 'Messaging' },
  { to: '/events', icon: Calendar, label: 'Events' },
  { to: '/meetings', icon: Video, label: 'Meetings' },
  { to: '/profile', icon: UserCircle, label: 'Profile' },
];

export default function DesktopSidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-[225px] z-40 overflow-y-auto border-r border-gray-200 dark:border-[#1e293b] bg-white dark:bg-[#0d0f17]">
      <div className="p-3 space-y-3">

        {/* Brand Logo */}
        <div className="px-3 pt-2 pb-1">
          <button onClick={() => navigate('/feed')} className="flex items-center w-full">
            <img src={logoSrc} alt="MConnect" className="h-7 w-auto object-contain dark:[filter:brightness(0)_invert(1)_sepia(1)_saturate(5000%)_hue-rotate(250deg)]" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-[#0d0f17] border border-gray-200 dark:border-[#1e293b] rounded-lg overflow-hidden">
          <div className="h-14 bg-gradient-to-r from-purple-100 to-purple-50 dark:from-[#8b5cf6]/20 dark:to-[#6d28d9]/20 relative">
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
              <button onClick={() => navigate('/profile')}>
                <Avatar src={user?.avatarUrl} alt={user?.fullName} size="lg" className="ring-2 ring-white dark:ring-[#0d0f17] w-16 h-16" />
              </button>
            </div>
          </div>
          <div className="pt-8 px-3 pb-3 text-center">
            <button onClick={() => navigate('/profile')} className="block w-full">
              <p className="text-sm font-semibold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-[#a78bfa] transition-colors truncate">{user?.fullName}</p>
              <p className="text-xs text-gray-500 truncate mt-0.5">{user?.bio || 'MConnect Member'}</p>
            </button>
          </div>
        </div>

        {/* Primary Navigation */}
        <div className="bg-white dark:bg-[#0d0f17] border border-gray-200 dark:border-[#1e293b] rounded-lg p-2">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2 font-medium">Shortcuts</p>
          <div className="space-y-0.5">
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 w-full text-xs rounded-md px-3 py-2 transition-all duration-200 ${
                    isActive
                      ? 'text-white font-medium bg-[#8b5cf6] dark:bg-[#8b5cf6] shadow-[0_0_16px_-2px_rgba(139,92,246,0.5)]'
                      : 'text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-[#a78bfa] hover:bg-gray-100 dark:hover:bg-[#1e293b]'
                  }`
                }
              >
                <Icon size={16} />
                <span>{label}</span>
              </NavLink>
            ))}
            {user?.isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 w-full text-xs rounded-md px-3 py-2 transition-all duration-200 ${
                    isActive
                      ? 'text-white font-medium bg-[#8b5cf6] dark:bg-[#8b5cf6] shadow-[0_0_16px_-2px_rgba(139,92,246,0.5)]'
                      : 'text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-[#a78bfa] hover:bg-gray-100 dark:hover:bg-[#1e293b]'
                  }`
                }
              >
                <Shield size={16} />
                <span>Admin</span>
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}