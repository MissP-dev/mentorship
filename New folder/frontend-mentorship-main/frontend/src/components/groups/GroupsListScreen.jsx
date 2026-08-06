import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getConversations } from '../../services/conversations';
import { getAllUsers } from '../../services/auth';
import TopBar from '../shared/TopBar';
import Avatar from '../shared/Avatar';
import Button from '../shared/Button';
import { Plus, Users } from 'lucide-react';

export default function GroupsListScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = async () => {
    try {
      const [convs, allUsers] = await Promise.all([
        getConversations(user.id),
        getAllUsers(),
      ]);
      setConversations(convs.filter((c) => c.type === 'group'));
      setUsers(allUsers);
    } catch (err) {
      console.error('Failed to load groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUserById = (id) => users.find((u) => u.id === id);

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  return (
    <div>
      <TopBar title="Groups" showNotifications />
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <div className="flex justify-end">
          <Button size="sm" onClick={() => navigate('/groups/new')}>
            <Plus size={16} className="mr-1" /> Create Group
          </Button>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-4 border-purple-700 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">No groups yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs">Create a group to chat with your mentees</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => navigate(`/messages/group/${conv.id}`)}
                className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
              >
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users size={22} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{conv.groupName}</p>
                    <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">{timeAgo(conv.lastMessageAt)}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {conv.participantIds?.length || 0} members
                    {conv.lastMessage && ` · ${conv.lastMessage}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
