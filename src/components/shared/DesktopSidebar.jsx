import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from './Avatar';
import ThemeToggle from './ThemeToggle';

export default function DesktopSidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="hidden lg:block fixed left-0 top-12 bottom-0 w-[225px] z-40 overflow-y-auto">
      <div className="p-3 space-y-3">
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

        {/* Quick Links */}
        <div className="bg-white dark:bg-[#0d0f17] border border-gray-200 dark:border-[#1e293b] rounded-lg p-3">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 font-medium">Shortcuts</p>
          <div className="space-y-1">
            <button
              onClick={() => navigate('/groups')}
              className="flex items-center gap-2 w-full text-xs text-gray-500 hover:text-purple-600 dark:hover:text-[#a78bfa] transition-colors py-1"
            >
              <span className="w-4 h-4 bg-purple-100 dark:bg-[#8b5cf6]/20 rounded flex items-center justify-center">
                <span className="text-[8px] text-purple-600 dark:text-[#8b5cf6] font-bold">G</span>
              </span>
              <span>Groups</span>
            </button>
            <button
              onClick={() => navigate('/mentors')}
              className="flex items-center gap-2 w-full text-xs text-gray-500 hover:text-purple-600 dark:hover:text-[#a78bfa] transition-colors py-1"
            >
              <span className="w-4 h-4 bg-purple-100 dark:bg-[#8b5cf6]/20 rounded flex items-center justify-center">
                <span className="text-[8px] text-purple-600 dark:text-[#8b5cf6] font-bold">M</span>
              </span>
              <span>Find Mentors</span>
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 w-full text-xs text-gray-500 hover:text-purple-600 dark:hover:text-[#a78bfa] transition-colors py-1"
            >
              <span className="w-4 h-4 bg-purple-100 dark:bg-[#8b5cf6]/20 rounded flex items-center justify-center">
                <span className="text-[8px] text-purple-600 dark:text-[#8b5cf6] font-bold">S</span>
              </span>
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="bg-white dark:bg-[#0d0f17] border border-gray-200 dark:border-[#1e293b] rounded-lg p-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">Appearance</span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
