import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMeetings, createMeeting, inviteToMeeting, cancelMeeting, endMeeting } from '../../services/meetings';
import { getAllUsers } from '../../services/auth';
import TopBar from '../shared/TopBar';
import Button from '../shared/Button';
import Badge from '../shared/Badge';
import Card from '../shared/Card';
import { Plus, Video, Phone, Calendar, Clock, Users, ChevronRight, Trash2, Square, Search } from 'lucide-react';

export default function MeetingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMeeting, setNewMeeting] = useState({ title: '', type: 'video', menteeIds: [] });

  const isMentor = user?.isMentorProfileComplete;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [meetingsData, usersData] = await Promise.all([
        getMeetings().catch(() => []),
        getAllUsers().catch(() => []),
      ]);
      setMeetings(meetingsData);
      setAllUsers(usersData);
    } catch (err) {
      console.error('Failed to load meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async () => {
    if (!newMeeting.title) return;
    try {
      const meeting = await createMeeting({
        title: newMeeting.title,
        description: '',
        startAt: new Date().toISOString(),
        type: newMeeting.type,
        participantIds: newMeeting.menteeIds,
        startNow: true,
      });
      setNewMeeting({ title: '', type: 'video', menteeIds: [] });
      setShowCreate(false);
      navigate(`/meetings/${meeting.id}/join`, { replace: true });
    } catch (err) {
      console.error('Failed to create meeting:', err);
    }
  };

  const _handleInvite = async (meetingId, participantIds) => {
    try {
      await inviteToMeeting(meetingId, participantIds);
      loadData();
    } catch (err) {
      console.error('Failed to invite:', err);
    }
  };

  const handleCancel = async (meetingId) => {
    try {
      await cancelMeeting(meetingId);
      setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
    } catch (err) {
      console.error('Failed to cancel meeting:', err);
    }
  };

  const handleEndMeeting = async (meetingId) => {
    try {
      await endMeeting(meetingId);
      setMeetings((prev) => prev.map((m) => (m.id === meetingId ? { ...m, status: 'ended' } : m)));
    } catch (err) {
      console.error('Failed to end meeting:', err);
    }
  };

  const toggleMentee = (userId) => {
    setNewMeeting((p) => ({
      ...p,
      menteeIds: p.menteeIds.includes(userId)
        ? p.menteeIds.filter((id) => id !== userId)
        : [...p.menteeIds, userId],
    }));
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredMeetings = searchQuery.trim()
    ? meetings.filter((m) => m.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    : meetings;

  const mentees = allUsers.filter((u) => !u.isMentorProfileComplete);
  const mentors = allUsers.filter((u) => u.isMentorProfileComplete);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopBar title="Meetings" showNotifications />
      <main className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sessions</h2>
          {isMentor && (
            <Button onClick={() => setShowCreate(true)} size="sm" className="gap-2">
              <Plus size={14} /> New Meeting
            </Button>
          )}
        </div>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search meetings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        {!isMentor && (
          <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm text-gray-600 dark:text-gray-400 text-center">
            Only mentors can create and manage meeting sessions.
          </div>
        )}

        {showCreate && (
          <Card className="mb-4 p-4 border-purple-200 dark:border-purple-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Start New Meeting</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Meeting title"
                value={newMeeting.title}
                onChange={(e) => setNewMeeting((p) => ({ ...p, title: e.target.value }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewMeeting((p) => ({ ...p, type: 'video' }))}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 ${newMeeting.type === 'video' ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                  >
                    <Video size={12} /> Video
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMeeting((p) => ({ ...p, type: 'audio' }))}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 ${newMeeting.type === 'audio' ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                  >
                    <Phone size={12} /> Audio
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">Invite Mentors</label>
                <div className="flex flex-wrap gap-2">
                  {mentors.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleMentee(m.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        newMeeting.menteeIds.includes(m.id)
                          ? 'border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-purple-300'
                      }`}
                    >
                      {m.fullName}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">Invite Mentees</label>
                <div className="flex flex-wrap gap-2">
                  {mentees.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleMentee(m.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        newMeeting.menteeIds.includes(m.id)
                          ? 'border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-purple-300'
                      }`}
                    >
                      {m.fullName}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateMeeting} size="sm">Create Session</Button>
                <Button variant="secondary" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </div>
          </Card>
        )}

        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">Loading sessions...</p>
        ) : (
          <div className="space-y-3">
            {filteredMeetings.map((meeting) => {
              const isCreator = meeting.creatorId === user?.id || meeting.creator?.id === user?.id;
              return (
                <Card key={meeting.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${meeting.type === 'video' ? 'bg-purple-100 dark:bg-purple-900/40' : 'bg-blue-100 dark:bg-blue-900/40'}`}>
                      {meeting.type === 'video' ? <Video size={20} className="text-purple-600 dark:text-purple-400" /> : <Phone size={20} className="text-blue-600 dark:text-blue-400" />}
                    </div>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/meetings/${meeting.id}`)}>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{meeting.title}</h3>
                        <Badge color={meeting.status === 'ongoing' ? 'green' : meeting.status === 'cancelled' ? 'red' : 'gray'}>{meeting.status === 'ongoing' ? 'Live' : meeting.status}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                        <span className="flex items-center gap-1"><Calendar size={12} />{formatDate(meeting.startAt || meeting.date)}</span>
                        {meeting.time && <span className="flex items-center gap-1"><Clock size={12} />{meeting.time}</span>}
                        <span className="flex items-center gap-1"><Users size={12} />{(meeting.participants || meeting.mentees || []).length + 1}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">Host: {meeting.creator?.fullName || meeting.mentor}</span>
                        {(meeting.status === 'ongoing' || meeting.status === 'scheduled') && meeting.roomName && (
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/meetings/${meeting.id}/join`); }}
                            className="ml-auto px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-md transition-colors"
                          >
                            Join
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {isCreator && meeting.status === 'scheduled' && (
                        <button onClick={(e) => { e.stopPropagation(); handleCancel(meeting.id); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Cancel Meeting">
                          <Trash2 size={14} className="text-gray-400" />
                        </button>
                      )}
                      {isCreator && (meeting.status === 'ongoing' || meeting.status === 'scheduled') && (
                        <button onClick={(e) => { e.stopPropagation(); handleEndMeeting(meeting.id); }} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="End Meeting">
                          <Square size={14} className="text-red-500" />
                        </button>
                      )}
                      <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />
                    </div>
                  </div>
                </Card>
              );
            })}
            {filteredMeetings.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                {searchQuery.trim() ? 'No meetings match your search.' : 'No meetings yet.'}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}