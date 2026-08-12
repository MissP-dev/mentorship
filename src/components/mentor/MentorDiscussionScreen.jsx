import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageCircle, Star, Send } from 'lucide-react';
import { getMentors } from '../../services/auth';
import { createConversation } from '../../services/conversations';
import TopBar from '../shared/TopBar';
import Avatar from '../shared/Avatar';
import Badge from '../shared/Badge';

export default function MentorDiscussionScreen() {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [messagingId, setMessagingId] = useState(null);

  useEffect(() => {
    loadMentors();
  }, []);

  const loadMentors = async () => {
    try {
      const data = await getMentors();
      setMentors(data);
    } catch (err) {
      console.error('Failed to load mentors:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = searchQuery.trim()
    ? mentors.filter(
        (m) =>
          m.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (m.expertiseTags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : mentors;

  const handleMessageMentor = async (mentorId) => {
    setMessagingId(mentorId);
    try {
      const conv = await createConversation({ participantIds: [mentorId] });
      navigate(`/messages/${conv.id}`);
    } catch (err) {
      console.error('Failed to start conversation:', err);
    } finally {
      setMessagingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopBar title="Mentor Discussions" showNotifications />
      <main className="max-w-2xl mx-auto px-4 py-4">
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search mentors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">Loading mentors...</p>
        ) : (
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No mentors found.</p>
            ) : (
              filtered.map((mentor) => (
                <div
                  key={mentor.id}
                  className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <Avatar src={mentor.avatarUrl} alt={mentor.fullName} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{mentor.fullName}</h3>
                      <Badge color="purple" className="shrink-0 text-xs">Mentor</Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star size={12} className="text-yellow-500 fill-current" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{mentor.rating?.toFixed(1) || '0.0'}</span>
                      {mentor.expertiseTags?.length > 0 && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 truncate">• {mentor.expertiseTags[0]}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{mentor.bio || 'MConnect Mentor'}</p>
                  </div>
                  <button
                    onClick={() => handleMessageMentor(mentor.id)}
                    disabled={messagingId === mentor.id}
                    className={`shrink-0 p-2 rounded-lg transition-colors ${
                      messagingId === mentor.id
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500'
                        : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                    }`}
                    aria-label={`Message ${mentor.fullName}`}
                  >
                    <MessageCircle size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
