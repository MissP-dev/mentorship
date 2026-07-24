import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createConversation } from '../../services/conversations';
import { getMentorshipRequestsByMentor } from '../../services/mentorship';
import TopBar from '../shared/TopBar';
import Button from '../shared/Button';
import Avatar from '../shared/Avatar';
import { Check, Users } from 'lucide-react';

export default function CreateGroupScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState('');
  const [mentees, setMentees] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    loadMentees();
  }, [user.id]);

  const loadMentees = async () => {
    try {
      const requests = await getMentorshipRequestsByMentor(user.id);
      const accepted = requests.filter((r) => r.status === 'accepted');
      const uniqueMentees = [];
      const seen = new Set();
      for (const r of accepted) {
        const mentee = r.mentee;
        if (mentee && !seen.has(mentee.id)) {
          seen.add(mentee.id);
          uniqueMentees.push(mentee);
        }
      }
      setMentees(uniqueMentees);
    } catch (err) {
      console.error('Failed to load mentees:', err);
    } finally {
      setFetching(false);
    }
  };

  const toggleMentee = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!groupName.trim() || selectedIds.length === 0) return;
    setLoading(true);
    try {
      const conv = await createConversation({
        participantIds: selectedIds,
        groupName: groupName.trim(),
      });
      navigate(`/messages/group/${conv.id}`, { replace: true });
    } catch (err) {
      console.error('Failed to create group:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopBar title="Create Group" showBack />
      <main className="max-w-lg mx-auto px-4 py-6">
        <form onSubmit={handleCreate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Group Name</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. React Study Group"
              required
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Mentees ({selectedIds.length} selected)
            </label>
            {fetching ? (
              <div className="py-8 text-center">
                <div className="w-6 h-6 border-3 border-purple-700 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : mentees.length === 0 ? (
              <div className="py-8 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <Users size={24} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No mentees yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Accept mentorship requests first to create groups</p>
              </div>
            ) : (
              <div className="space-y-2">
                {mentees.map((mentee) => {
                  const selected = selectedIds.includes(mentee.id);
                  return (
                    <button
                      key={mentee.id}
                      type="button"
                      onClick={() => toggleMentee(mentee.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                        selected
                          ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-300 dark:border-purple-600'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <Avatar src={mentee.avatarUrl} alt={mentee.fullName} size="sm" />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{mentee.fullName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{mentee.email}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        selected
                          ? 'bg-purple-700 border-purple-700'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {selected && <Check size={14} className="text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading || !groupName.trim() || selectedIds.length === 0}
          >
            {loading ? 'Creating...' : `Create Group (${selectedIds.length} members)`}
          </Button>
        </form>
      </main>
    </div>
  );
}
