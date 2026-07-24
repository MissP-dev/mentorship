import { X, MessageCircle, Heart, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const iconMap = {
  new_message: MessageCircle,
  new_comment: Heart,
};

export default function NotificationToast({ toasts, onDismiss }) {
  const navigate = useNavigate();

  const handleClick = (toast) => {
    onDismiss(toast.toastId);
    if (toast.linkTo) navigate(toast.linkTo);
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type] || Bell;
        return (
          <div
            key={toast.toastId}
            className="pointer-events-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-3 flex items-start gap-3 animate-slide-in cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => handleClick(toast)}
          >
            <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex-shrink-0">
              <Icon size={16} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">MConnect</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{toast.message}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDismiss(toast.toastId); }}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
