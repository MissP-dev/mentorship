import { Bell, MessageSquare, Calendar, UserPlus, Video, Heart, Phone } from 'lucide-react';

const typeIcons = {
  mentorship_request: UserPlus,
  mentorship: UserPlus,
  mentorship_expired: UserPlus,
  session_reminder: Calendar,
  new_comment: MessageSquare,
  new_like: Heart,
  new_message: MessageSquare,
  meeting: Video,
  meeting_invite: Phone,
};

const typeColors = {
  mentorship_request: 'text-purple-500',
  mentorship: 'text-purple-500',
  mentorship_expired: 'text-gray-500',
  session_reminder: 'text-blue-500',
  new_comment: 'text-green-500',
  new_like: 'text-pink-500',
  new_message: 'text-blue-500',
  meeting: 'text-purple-500',
  meeting_invite: 'text-blue-500',
};

export default function NotificationItem({ notification, onClick }) {
  const Icon = typeIcons[notification.type] || Bell;
  const iconColor = typeColors[notification.type] || 'text-gray-500';

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div
      onClick={() => onClick?.(notification)}
      className={`flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
        !notification.read ? 'bg-purple-50/50 dark:bg-purple-900/20' : ''
      }`}
    >
      <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-700 ${iconColor}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${!notification.read ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
          {notification.message}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{timeAgo(notification.createdAt)}</p>
      </div>
      {!notification.read && (
        <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
      )}
    </div>
  );
}
