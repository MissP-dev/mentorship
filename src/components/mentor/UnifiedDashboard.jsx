import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getSessionsByUser } from '../../services/sessions';
import { getMentorshipRequestsByMentor, getMentorshipRequestsByMentee, updateMentorshipRequest } from '../../services/mentorship';
import { getAllUsers } from '../../services/auth';
import TopBar from '../shared/TopBar';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Badge from '../shared/Badge';
import Avatar from '../shared/Avatar';
import { Search, UserPlus } from 'lucide-react';

export default function UnifiedDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (user?.id) loadData();
  }, [user?.id]);

  const loadData = async () => {
    try {
      const [allSessions, incoming, sent, allUsers] = await Promise.all([
        getSessionsByUser(user.id),
        getMentorshipRequestsByMentor(user.id),
        getMentorshipRequestsByMentee(user.id),
        getAllUsers(),
      ]);
      setSessions(allSessions.filter((s) => s.status === 'upcoming'));
      setIncomingRequests(incoming.filter((r) => r.status === 'PENDING'));
      setSentRequests(sent);
      setUsers(allUsers);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  const getUserById = (id) => users.find((u) => u.id === id);

  const handleAccept = async (requestId) => {
    await updateMentorshipRequest(requestId, { status: 'ACTIVE' });
    loadData();
  };

  const handleDecline = async (requestId) => {
    await updateMentorshipRequest(requestId, { status: 'CANCELLED' });
    loadData();
  };

  return (
    <div>
      <TopBar title="Dashboard" showNotifications />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {!user.isMentorProfileComplete && (
          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 border-purple-200 dark:border-purple-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-200 dark:bg-purple-800 rounded-lg">
                <UserPlus size={20} className="text-purple-700 dark:text-purple-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Want to mentor others?</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Set up your mentor profile to become discoverable.</p>
              </div>
              <Button size="sm" onClick={() => navigate('/mentor-profile-setup')}>Set Up</Button>
            </div>
          </Card>
        )}

        <div onClick={() => navigate('/mentors')} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-purple-300 dark:hover:border-purple-600 transition-colors">
          <Search size={20} className="text-gray-400" />
          <span className="text-gray-400 text-sm">Find a Mentor...</span>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Upcoming Sessions</h2>
          {sessions.length === 0 ? (
            <Card><p className="text-sm text-gray-500 dark:text-gray-400">No upcoming sessions.</p></Card>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const isMentor = session.mentorId === user.id;
                const other = getUserById(isMentor ? session.menteeId : session.mentorId);
                return (
                  <Card key={session.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar src={other?.avatarUrl} alt={other?.fullName} size="sm" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{session.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{session.date} at {session.time}</p>
                          <Badge color={isMentor ? 'purple' : 'green'} className="mt-1">
                            {isMentor ? 'as mentor' : 'as mentee'}
                          </Badge>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => navigate(`/sessions/${session.id}`)}>View</Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {user.isMentorProfileComplete && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Requests to You</h2>
            {incomingRequests.length === 0 ? (
              <Card><p className="text-sm text-gray-500 dark:text-gray-400">No pending requests.</p></Card>
            ) : (
              <div className="space-y-3">
                {incomingRequests.map((req) => {
                  const from = getUserById(req.menteeId);
                  return (
                    <Card key={req.id}>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Avatar src={from?.avatarUrl} alt={from?.fullName} size="sm" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{from?.fullName}</p>
                            <p className="text-xs text-gray-400">{req.duration}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{req.message}</p>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleAccept(req.id)}>Accept</Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDecline(req.id)}>Decline</Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Your Sent Requests</h2>
          {sentRequests.length === 0 ? (
            <Card><p className="text-sm text-gray-500 dark:text-gray-400">No sent requests.</p></Card>
          ) : (
            <div className="space-y-3">
              {sentRequests.map((req) => {
                const to = getUserById(req.mentorId);
                const statusColors = { pending: 'yellow', accepted: 'green', declined: 'red' };
                return (
                  <Card key={req.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar src={to?.avatarUrl} alt={to?.fullName} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{to?.fullName}</p>
                          <p className="text-xs text-gray-400">{req.duration}</p>
                        </div>
                      </div>
                      <Badge color={statusColors[req.status]}>{req.status}</Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
