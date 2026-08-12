import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMeetingById, cancelMeeting, endMeeting } from '../../services/meetings';
import TopBar from '../shared/TopBar';
import Button from '../shared/Button';
import Badge from '../shared/Badge';
import Card from '../shared/Card';
import Avatar from '../shared/Avatar';
import { ArrowLeft, Video, Phone, Calendar, Users, Trash2, Square, Play, Clock } from 'lucide-react';

export default function MeetingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isCreator = meeting?.creatorId === user?.id || meeting?.creator?.id === user?.id;
  const isLive = meeting?.status === 'ongoing';

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    try {
      const data = await getMeetingById(id);
      setMeeting(data);
    } catch (err) {
      console.error('Failed to load meeting:', err);
      setError('Meeting not found or you are not part of it.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this meeting?')) return;
    try {
      await cancelMeeting(id);
      setMeeting((m) => ({ ...m, status: 'cancelled' }));
    } catch (err) {
      console.error('Failed to cancel meeting:', err);
    }
  };

  const handleEnd = async () => {
    if (!window.confirm('End this meeting?')) return;
    try {
      await endMeeting(id);
      setMeeting((m) => ({ ...m, status: 'ended' }));
    } catch (err) {
      console.error('Failed to end meeting:', err);
    }
  };

  const canJoin = meeting && (meeting.status === 'ongoing' || meeting.status === 'scheduled') && meeting.roomName;

  const formatLongDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDuration = (startStr) => {
    const start = new Date(startStr);
    const now = new Date();
    const diffMs = now - start;
    if (diffMs < 0) {
      const future = new Date(startStr);
      const diffFuture = -diffMs;
      const hours = Math.floor(diffFuture / (1000 * 60 * 60));
      const mins = Math.floor((diffFuture % (1000 * 60 * 60)) / (1000 * 60));
      if (hours > 0) return `${hours}h ${mins}m`;
      return `${mins}m`;
    }
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const days = Math.floor(hours / 24);
    const displayHours = hours % 24;
    if (days > 0) return `${days}d ${displayHours}h ${mins}m`;
    if (displayHours > 0) return `${displayHours}h ${mins}m`;
    return `${mins}m`;
  };

  const statusColor = meeting?.status === 'ongoing' ? 'green' : meeting?.status === 'cancelled' ? 'red' : 'gray';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <TopBar title="Meeting" showNotifications />
        <main className="max-w-2xl mx-auto px-4 py-4">
          <p className="text-center text-gray-500 dark:text-gray-400 py-16">Loading meeting...</p>
        </main>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <TopBar title="Meeting" showNotifications />
        <main className="max-w-2xl mx-auto px-4 py-4 text-center">
          <p className="text-gray-500 dark:text-gray-400 py-16">{error || 'Meeting not found.'}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopBar title="Meeting Details" showNotifications />
      <main className="max-w-2xl mx-auto px-4 py-4">
        <button
          onClick={() => navigate('/meetings')}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> All Sessions
        </button>

        <Card className="p-4 sm:p-6 mb-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${meeting.type === 'video' ? 'bg-purple-100 dark:bg-purple-900/40' : 'bg-blue-100 dark:bg-blue-900/40'}`}>
                {meeting.type === 'video' ? <Video size={22} className="text-purple-600 dark:text-purple-400" /> : <Phone size={22} className="text-blue-600 dark:text-blue-400" />}
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white break-words">{meeting.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge color={statusColor}>
                    {meeting.status === 'ongoing' ? 'Live' : meeting.status}
                  </Badge>
                  <Badge color="gray">{meeting.type === 'video' ? 'Video' : 'Audio'}</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <span className="flex items-center gap-1.5"><Calendar size={14} />{formatLongDate(meeting.startAt)}</span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-gray-500 dark:text-gray-400" />
              Duration: {meeting.status === 'ongoing' || meeting.status === 'ended' ? formatDuration(meeting.startAt) : 'Not started'}
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={14} />{meeting.participants?.length || 0} participants
            </span>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Avatar src={meeting.creator?.avatarUrl} alt={meeting.creator?.fullName} size="sm" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Host: {meeting.creator?.fullName}</span>
          </div>

          {meeting.description && (
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">About this session</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{meeting.description}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {canJoin && (
              <Button onClick={() => navigate(`/meetings/${meeting.id}/join`)}>
                <Play size={14} className="mr-1" /> {isLive ? 'Join now' : 'Open room'}
              </Button>
            )}
            {isCreator && meeting.status === 'scheduled' && (
              <Button variant="secondary" onClick={handleCancel}>
                <Trash2 size={14} className="mr-1" /> Cancel Meeting
              </Button>
            )}
            {isCreator && (meeting.status === 'ongoing' || meeting.status === 'scheduled') && (
              <Button variant="danger" onClick={handleEnd}>
                <Square size={14} className="mr-1" /> End Meeting
              </Button>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Participants ({meeting.participants?.length || 0})</h2>
          {meeting.participants?.length > 0 ? (
            <div className="space-y-2">
              {meeting.participants.map((p) => (
                <div key={p.user?.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50 dark:bg-[#1e293b]">
                  <Avatar src={p.user?.avatarUrl} alt={p.user?.fullName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.user?.fullName}</p>
                  </div>
                  {p.user?.id === user?.id && <Badge color="purple">You</Badge>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500">No other participants yet.</p>
          )}
        </Card>
      </main>
    </div>
  );
}