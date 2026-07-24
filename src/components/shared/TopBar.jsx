import { ArrowLeft, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function TopBar({ title, showBack = false, showNotifications = true, children }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBack && (
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ArrowLeft size={22} className="text-gray-700 dark:text-gray-300" />
          </button>
        )}
        {children || (title && <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>)}
      </div>
      <div className="flex items-center gap-1">
        {showNotifications && (
          <button
            onClick={() => navigate('/notifications')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative"
          >
            <Bell size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
