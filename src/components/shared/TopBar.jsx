import { ArrowLeft, Bell, Search, Home, Users, Briefcase, MessageSquare } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import useNotifications from '../notifications/useNotifications';

const navLinks = [
  { to: '/feed', icon: Home, label: 'Home' },
  { to: '/mentors', icon: Users, label: 'Find Mentors' },
  { to: '/groups', icon: Briefcase, label: 'Groups' },
  { to: '/messages', icon: MessageSquare, label: 'Messaging' },
];

export default function TopBar({ title, showBack = false, showNotifications = true, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const isAdmin = user?.isAdmin;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0d0f17]/95 backdrop-blur-md border-b border-gray-200 dark:border-[#1e293b]">
      <div className="flex items-center h-12 max-w-[1128px] mx-auto px-4">
        <button onClick={() => !isAdmin && navigate('/feed')} className="flex-shrink-0 mr-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-800 dark:from-[#8b5cf6] dark:to-[#6d28d9] rounded-md flex items-center justify-center">
            <span className="text-white text-sm font-bold">M</span>
          </div>
        </button>

        <div className="flex-1 max-w-[280px] mr-2 hidden md:block">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-8 pr-3 py-[6px] bg-gray-100 dark:bg-[#1e293b] border border-gray-200 dark:border-[#334155] rounded text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 dark:focus:ring-[#8b5cf6]/50 focus:border-purple-500/50 dark:focus:border-[#8b5cf6]/50"
            />
          </div>
        </div>

        {showBack && (
          <button onClick={() => navigate(-1)} className="p-1.5 mr-2 hover:bg-gray-100 dark:hover:bg-[#1e293b] rounded-md transition-colors lg:hidden">
            <ArrowLeft size={18} className="text-gray-400" />
          </button>
        )}

        {!isAdmin && (
          <nav className="hidden md:flex items-center gap-0 ml-auto">
            {navLinks.map(({ to, icon: Icon, label }) => {
              const isActive = location.pathname === to || (to === '/feed' && location.pathname.startsWith('/feed'));
              return (
                <button
                  key={to}
                  onClick={() => navigate(to)}
                  className={`flex flex-col items-center justify-center px-4 py-1 min-w-[80px] relative transition-colors ${
                    isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                  <span className="text-[10px] mt-0.5">{label}</span>
                  {isActive && <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-gray-900 dark:bg-white rounded-t" />}
                </button>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-2 ml-4 md:ml-0">
          {children}

          {showNotifications && (
            <button
              onClick={() => navigate('/notifications')}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#1e293b] rounded-md relative transition-colors text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-purple-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          )}

          {!isAdmin && (
            <>
              <ThemeToggle />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
