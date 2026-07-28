import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile, getAllUsers } from '../../services/auth';
import { getSessionsByUser } from '../../services/sessions';
import { getMentorshipRequestsByMentor, getMentorshipRequestsByMentee, updateMentorshipRequest } from '../../services/mentorship';
import { uploadFile } from '../../services/upload';
import TopBar from '../shared/TopBar';
import Card from '../shared/Card';
import Input from '../shared/Input';
import Button from '../shared/Button';
import Badge from '../shared/Badge';
import Avatar from '../shared/Avatar';
import { Camera, BookOpen } from 'lucide-react';

export default function ProfileScreen() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (user?.id) loadDashboardData();
  }, [user?.id]);

  const loadDashboardData = async () => {
    try {
      const [allSessions, incoming, sent, allUsers] = await Promise.all([
        getSessionsByUser(user.id),
        getMentorshipRequestsByMentor(user.id),
        getMentorshipRequestsByMentee(user.id),
        getAllUsers(),
      ]);
      setSessions(allSessions.filter((s) => s.status === 'upcoming'));
      setIncomingRequests(incoming.filter((r) => r.status === 'pending'));
      setSentRequests(sent);
      setUsers(allUsers);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  const getUserById = (id) => users.find((u) => u.id === id);

  const handleAccept = async (requestId) => {
    await updateMentorshipRequest(requestId, { status: 'accepted' });
    loadDashboardData();
  };

  const handleDecline = async (requestId) => {
    await updateMentorshipRequest(requestId, { status: 'declined' });
    loadDashboardData();
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const updates = { fullName, bio };
      if (avatarFile) {
        updates.avatarUrl = await uploadFile(avatarFile);
      }
      const updated = await updateUserProfile(user.id, updates);
      updateUser(updated);
      setMsg('Profile updated!');
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      setMsg(err.message);
    }
    setLoading(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopBar title="Profile" showNotifications />
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <Avatar src={avatarPreview || user?.avatarUrl} alt={user?.fullName} size="xl" />
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera size={24} className="text-white" />
                <input type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} />
              </label>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">Click to change photo</span>
          </div>
          <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>
          {msg && <p className="text-sm text-green-600 dark:text-green-400">{msg}</p>}
          <Button className="w-full" onClick={handleSaveProfile} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => navigate('/mentor-profile-setup')}>
            Mentor Profile
          </Button>
        </div>

        {sessions.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Upcoming Sessions</h2>
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
          </div>
        )}

        {user.isMentorProfileComplete && incomingRequests.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Requests to You</h2>
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
                           <p className="text-xs text-gray-400 dark:text-gray-500">{req.duration}</p>
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
          </div>
        )}

        {sentRequests.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Your Sent Requests</h2>
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
                          <p className="text-xs text-gray-400 dark:text-gray-500">{req.duration}</p>
                        </div>
                      </div>
                      <Badge color={statusColors[req.status]}>{req.status}</Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
