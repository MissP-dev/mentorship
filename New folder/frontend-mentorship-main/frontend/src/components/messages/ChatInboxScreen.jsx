import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getConversations } from '../../services/conversations';
import { getAllUsers } from '../../services/auth';
import TopBar from '../shared/TopBar';
import Avatar from '../shared/Avatar';
import { Search } from 'lucide-react';

export default function ChatInboxScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([getConversations(user.id), getAllUsers()]).then(([c, u]) => {
      setConversations(c);
      setUsers(u);
    });
  }, [user.id]);

  const getUserById = (id) => users.find((u) => u.id === id);

  const filtered = conversations.filter((c) => {
    if (!search) return true;
    if (c.type === 'group') return c.groupName?.toLowerCase().includes(search.toLowerCase());
    const otherId = c.participantIds.find((id) => id !== user.id);
    const other = getUserById(otherId);
    return other?.fullName?.toLowerCase().includes(search.toLowerCase());
  });

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  const getLastMessagePreview = (conv) => {
    if (!conv.lastMessage) return 'No messages yet';
    const isOwn = conv.lastMessageSenderId === user.id;
    const prefix = conv.type === 'group' ? (isOwn ? 'You: ' : `${conv.lastMessageSenderName?.split(' ')[0]}: `) : (isOwn ? 'You: ' : '');

    if (conv.lastMessageType === 'image') return `${prefix}📷 Photo`;
    if (conv.lastMessageType === 'voice') return `${prefix}🎤 Voice message`;
    if (conv.lastMessageType === 'document') return `${prefix}📎 Document`;
    return `${prefix}${conv.lastMessage}`;
  };

  return (
    <div>
      <TopBar title="Messages" showNotifications />
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-2">
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="space-y-1">
          {filtered.map((conv) => {
            let name, avatar;
            if (conv.type === 'group') {
              name = conv.groupName;
              avatar = conv.groupIconUrl;
            } else {
              const otherId = conv.participantIds.find((id) => id !== user.id);
              const other = getUserById(otherId);
              name = other?.fullName;
              avatar = other?.avatarUrl;
            }

            return (
              <div
                key={conv.id}
                onClick={() => navigate(conv.type === 'group' ? `/messages/group/${conv.id}` : `/messages/${conv.id}`)}
                className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
              >
                <Avatar src={avatar} alt={name} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{name}</p>
                    <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">{timeAgo(conv.lastMessageAt)}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{getLastMessagePreview(conv)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
