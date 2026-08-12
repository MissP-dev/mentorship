import { ArrowLeft, Bell, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useNotifications from '../notifications/useNotifications';
import ThemeToggle from './ThemeToggle';
import logoSrc from '../../assets/mconnect-logo.png';

export default function TopBar({ showBack = false, showNotifications = true, children, showCreate = false, onCreateClick }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const isAdmin = user?.isAdmin;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0d0f17]/95 backdrop-blur-md border-b border-gray-200 dark:border-[#1e293b]">
      <div className="flex items-center h-12 max-w-[1128px] mx-auto px-4">
        {/* Left: Create button (Plus) */}
        {showCreate && (
          <button
            onClick={onCreateClick}
            className="flex-shrink-0 mr-2 p-1.5 hover:bg-gray-100 dark:hover:bg-[#1e293b] rounded-full transition-colors"
            aria-label="Create new post"
          >
            <Plus size={22} className="text-gray-700 dark:text-gray-300" />
          </button>
        )}

        {showBack && (
          <button onClick={() => navigate(-1)} className="p-1.5 mr-2 hover:bg-gray-100 dark:hover:bg-[#1e293b] rounded-md transition-colors">
            <ArrowLeft size={18} className="text-gray-400" />
          </button>
        )}

        {/* Center: Logo/Brand (only on non-feed pages or when not showing create) */}
        {!showCreate && !showBack && (
          <button onClick={() => !isAdmin && navigate('/feed')} className="flex-shrink-0 mr-2">
            <img src={logoSrc} alt="MConnect" className="h-9 w-auto object-contain dark:[filter:brightness(0)_invert(1)_sepia(1)_saturate(5000%)_hue-rotate(250deg)]" />
          </button>
        )}

        {/* Right side actions */}
        <div className="flex items-center gap-1 ml-auto">
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

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
