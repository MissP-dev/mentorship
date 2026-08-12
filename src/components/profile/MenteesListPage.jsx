import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserMentorships } from '../../services/auth';
import TopBar from '../shared/TopBar';
import Avatar from '../shared/Avatar';
import Badge from '../shared/Badge';
import { ArrowLeft, Clock, Archive } from 'lucide-react';

function formatRemainingDuration(request) {
  if (request.endDate) {
    const diffMs = new Date(request.endDate).getTime() - Date.now();
    if (diffMs <= 0) return 'Ended';
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return `${diffDays} days left`;
  }
  if (request.durationDays) {
    if (request.startDate) {
      const start = new Date(request.startDate);
      const end = new Date(start.getTime() + request.durationDays * 24 * 60 * 60 * 1000);
      const diffMs = end.getTime() - Date.now();
      if (diffMs <= 0) return 'Ended';
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      return `${diffDays} days left`;
    }
    return `${request.durationDays} days`;
  }
  if (request.duration) {
    return request.duration;
  }
  return 'Active';
}

export default function MenteesListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [activeMentees, setActiveMentees] = useState([]);
  const [historyMentees, setHistoryMentees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserMentorships(user.id, '?role=mentor').then((data) => {
      setActiveMentees((data.active || []).map((r) => ({ ...r.mentee, mentorshipRequest: r })));
      setHistoryMentees((data.history || []).map((r) => ({ ...r.mentee, mentorshipRequest: r })));
      setLoading(false);
    }).catch(() => { setLoading(false); });
  }, [user.id]);

  const displayedMentees = activeTab === 'active' ? activeMentees : historyMentees;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopBar title="Mentees" showNotifications />
      <main className="max-w-2xl mx-auto px-4 py-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 mb-4">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'active'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            <Clock size={14} />
            Active Sessions
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            <Archive size={14} />
            History / Storage Room
          </button>
        </div>
        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {displayedMentees.map((mentee) => (
              <div key={mentee.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/mentors/${mentee.id}`)}>
                <Avatar src={mentee.avatarUrl} alt={mentee.fullName} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{mentee.fullName}</h3>
                    <Badge color="green">Mentee</Badge>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{activeTab === 'active' ? 'Active mentorship' : `Completed ${mentee.mentorshipRequest?.endedAt ? new Date(mentee.mentorshipRequest.endedAt).toLocaleDateString() : ''}`}</p>
                </div>
                <div className="shrink-0 flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                  <Clock size={12} />
                  <span>{mentee.mentorshipRequest ? formatRemainingDuration(mentee.mentorshipRequest) : 'Active'}</span>
                </div>
              </div>
            ))}
            {displayedMentees.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                {activeTab === 'active' ? 'No active mentees.' : 'No past mentees in history.'}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
