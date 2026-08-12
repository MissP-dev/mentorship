import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Send, Trash2, ChevronLeft, ChevronRight, Film, Video, Calendar, Clock, ArrowRight, Phone } from 'lucide-react';
import { getPosts } from '../../services/posts';
import { getAllUsers } from '../../services/auth';
import { getStories, createStory, deleteStory, addStoryComment } from '../../services/stories';
import { getSessions } from '../../services/sessions';
import { getMeetings } from '../../services/meetings';
import { createReel } from '../../services/reels';
import { useAuth } from '../../context/AuthContext';
import TopBar from '../shared/TopBar';
import DesktopSidebar from '../shared/DesktopSidebar';
import BottomNav from '../shared/BottomNav';
import PostCard from '../shared/PostCard';
import Avatar from '../shared/Avatar';

function StoryViewer({ stories, startIndex, onClose, user, onDelete }) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [commentText, setCommentText] = useState('');
  const [allStories, setAllStories] = useState(stories);
  const timerRef = useRef(null);

  const story = allStories[currentIndex];
  const comments = story?.comments || [];
  const isOwner = user && story?.userId === user.id;
  const total = allStories.length;

  useEffect(() => {
    setCurrentIndex(startIndex);
  }, [startIndex]);

  useEffect(() => {
    if (!story) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (currentIndex < total - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        onClose();
      }
    }, 6000);
    return () => clearTimeout(timerRef.current);
  }, [currentIndex, total, story, onClose]);

  const goNext = () => {
    clearTimeout(timerRef.current);
    if (currentIndex < total - 1) setCurrentIndex((i) => i + 1);
    else onClose();
  };

  const goPrev = () => {
    clearTimeout(timerRef.current);
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      const comment = await addStoryComment(story.id, commentText.trim());
      setCommentText('');
      setAllStories((prev) =>
        prev.map((s) => s.id === story.id ? { ...s, comments: [...(s.comments || []), comment] } : s)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this story?')) return;
    try {
      await deleteStory(story.id);
      const remaining = allStories.filter((s) => s.id !== story.id);
      if (remaining.length === 0) {
        onDelete(story.id);
        onClose();
      } else {
        setAllStories(remaining);
        if (currentIndex >= remaining.length) setCurrentIndex(remaining.length - 1);
        onDelete(story.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!story) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      <button onClick={onClose} className="absolute top-4 right-4 text-white z-20">
        <X size={28} />
      </button>

      {currentIndex > 0 && (
        <button onClick={goPrev} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-20 bg-black/30 rounded-full p-1">
          <ChevronLeft size={28} />
        </button>
      )}
      {currentIndex < total - 1 && (
        <button onClick={goNext} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-20 bg-black/30 rounded-full p-1">
          <ChevronRight size={28} />
        </button>
      )}

      <div className="relative max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-1 mb-3">
          {allStories.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className={`h-full bg-white rounded-full transition-all duration-300 ${
                  i < currentIndex ? 'w-full' : i === currentIndex ? 'w-full animate-progress' : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Avatar src={story.user?.avatarUrl} alt={story.user?.fullName} size="sm" />
          <span className="text-white text-sm font-medium">{story.user?.fullName}</span>
          <span className="text-white/50 text-xs">
            {Math.max(0, Math.floor((new Date(story.expiresAt) - Date.now()) / 3600000))}h left
          </span>
          {total > 1 && (
            <span className="text-white/40 text-xs ml-auto">{currentIndex + 1}/{total}</span>
          )}
          {isOwner && (
            <button onClick={handleDelete} className="ml-2 text-white/70 hover:text-red-400 transition-colors">
              <Trash2 size={18} />
            </button>
          )}
        </div>

        {story.mediaUrl ? (
          story.mediaType === 'video' ? (
            <video src={story.mediaUrl} controls autoPlay className="w-full rounded-xl max-h-[55vh] object-contain" />
          ) : (
            <img src={story.mediaUrl} alt="Story" className="w-full rounded-xl max-h-[55vh] object-contain" />
          )
        ) : (
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl p-8 min-h-[30vh] flex items-center justify-center">
            <p className="text-white text-xl text-center leading-relaxed">{story.text || story.caption}</p>
          </div>
        )}

        {(story.text || story.caption) && story.mediaUrl && (
          <p className="text-white text-sm mt-2 text-center">{story.text || story.caption}</p>
        )}

        <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
          {comments.map((c) => (
            <div key={c.id} className="flex items-center gap-2">
              <Avatar src={c.author?.avatarUrl} alt={c.author?.fullName} size="sm" className="w-6 h-6" />
              <span className="text-white/80 text-xs font-medium">{c.author?.fullName}</span>
              <span className="text-white/60 text-xs">{c.text}</span>
            </div>
          ))}
        </div>

        {user && (
          <div className="mt-3 flex items-center gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleComment()}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 bg-white/10 text-white text-sm rounded-full placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/30"
            />
            <button onClick={handleComment} className="p-2 text-[#a78bfa] hover:text-[#8b5cf6]">
              <Send size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function NewStoryModal({ onClose, onSubmit }) {
  const [mode, setMode] = useState('choice');
  const [text, setText] = useState('');
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setMode('media');
    }
  };

  const handleSubmit = () => {
    if (mode === 'text' && text.trim()) {
      onSubmit(null, '', text.trim());
    } else if (file) {
      const mediaType = file.type?.startsWith('video') ? 'video' : 'image';
      onSubmit(file, caption.trim(), '', mediaType);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white dark:bg-[#131726] rounded-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-200 dark:border-[#1e293b]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">New Story</h3>
          <button onClick={onClose}><X size={20} className="text-gray-500" /></button>
        </div>

        {mode === 'choice' && (
          <div className="p-6 space-y-3">
            <button onClick={() => fileRef.current?.click()} className="w-full p-4 bg-purple-50 dark:bg-[#8b5cf6]/10 rounded-xl text-left hover:bg-purple-100 dark:hover:bg-[#8b5cf6]/20 transition-colors border border-purple-200 dark:border-[#8b5cf6]/20">
              <p className="text-sm font-medium text-purple-700 dark:text-[#a78bfa]">Photo / Video</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Share a moment with your network</p>
            </button>
            <button onClick={() => setMode('text')} className="w-full p-4 bg-gray-50 dark:bg-[#1e293b] rounded-xl text-left hover:bg-gray-100 dark:hover:bg-[#334155] transition-colors">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Text</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Share a thought or update</p>
            </button>
            <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />
          </div>
        )}

        {mode === 'text' && (
          <div className="p-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind?"
              rows={6}
              autoFocus
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1e293b] text-gray-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] resize-none"
            />
            <button
              onClick={handleSubmit}
              disabled={!text.trim()}
              className="mt-3 w-full py-2.5 bg-[#8b5cf6] text-white text-sm font-medium rounded-xl hover:bg-[#7c3aed] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Share
            </button>
          </div>
        )}

        {mode === 'media' && preview && (
          <div className="p-4">
            {file?.type?.startsWith('video') ? (
              <video src={preview} controls className="w-full rounded-xl max-h-64 object-contain" />
            ) : (
              <img src={preview} alt="Preview" className="w-full rounded-xl max-h-64 object-contain" />
            )}
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              className="mt-3 w-full px-3 py-2 bg-gray-50 dark:bg-[#1e293b] text-gray-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
            />
            <button
              onClick={handleSubmit}
              className="mt-3 w-full py-2.5 bg-[#8b5cf6] text-white text-sm font-medium rounded-xl hover:bg-[#7c3aed] transition-colors"
            >
              Share
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ReelCreateModal({ onClose, onSubmit }) {
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = () => {
    if (file) {
      onSubmit(file, caption.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white dark:bg-[#131726] rounded-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-200 dark:border-[#1e293b]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Create Reel</h3>
          <button onClick={onClose}><X size={20} className="text-gray-500" /></button>
        </div>

        <div className="p-4 space-y-3">
          <input
            type="file"
            accept="video/*"
            onChange={handleFile}
            className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#8b5cf6] file:text-white hover:file:bg-[#7c3aed]"
          />

          {preview && (
            <video src={preview} controls className="w-full rounded-xl max-h-64 object-contain" />
          )}

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            rows={3}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1e293b] text-gray-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] resize-none"
          />

          <button
            onClick={handleSubmit}
            disabled={!file}
            className="w-full py-2.5 bg-[#8b5cf6] text-white text-sm font-medium rounded-xl hover:bg-[#7c3aed] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Share Reel
          </button>
        </div>
      </div>
    </div>
  );
}

function UpcomingSessions({ sessions, users }) {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const upcoming = sessions.filter(
    (s) => s.status === 'upcoming' && s.date >= today
  ).slice(0, 3);

  const findUser = (id) => users.find((u) => u.id === id);

  if (upcoming.length === 0) return null;

  return (
    <div className="bg-white dark:bg-[#131726] rounded-2xl border border-gray-100 dark:border-[#1e293b] overflow-hidden shadow-sm relative">
      {/* Gradient border overlay */}
      <div className="absolute inset-0 rounded-2xl p-[1px] pointer-events-none">
        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#8b5cf6]/40 via-[#a78bfa]/20 to-transparent" />
      </div>

      <div className="relative p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-[#8b5cf6] shadow-[0_0_6px_rgba(139,92,246,0.6)]" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Upcoming Sessions</h3>
        </div>

        <div className="space-y-2.5">
          {upcoming.map((session) => {
            const mentor = findUser(session.mentorId);
            const isToday = session.date === today;
            const dateDisplay = isToday
              ? 'Today'
              : new Date(session.date + 'T' + session.time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

            return (
              <button
                key={session.id}
                onClick={() => navigate(`/sessions/${session.id}`)}
                className="w-full text-left p-2.5 rounded-xl bg-gray-50 dark:bg-[#0d0f17] hover:bg-gray-100 dark:hover:bg-[#1a1f33] transition-colors border border-gray-100 dark:border-[#1e293b]/60"
              >
                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{session.title}</p>
                <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-gray-500 dark:text-gray-400">
                  <Calendar size={10} />
                  <span>{dateDisplay}</span>
                  <span className="text-gray-300 dark:text-gray-600">·</span>
                  <Clock size={10} />
                  <span>{session.time}</span>
                </div>
                {mentor && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Avatar src={mentor.avatarUrl} alt={mentor.fullName} size="sm" className="w-4 h-4" />
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{mentor.fullName}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => navigate('/meetings')}
          className="mt-3 w-full flex items-center justify-center gap-1 text-[11px] font-medium text-[#8b5cf6] hover:text-[#7c3aed] transition-colors py-1.5 rounded-lg hover:bg-[#8b5cf6]/5"
        >
          View all sessions
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}

function UpcomingMeetings({ meetings }) {
  const navigate = useNavigate();
  const upcoming = meetings
    .filter((m) => m.status === 'scheduled' || m.status === 'ongoing')
    .sort((a, b) => new Date(a.startAt || a.date) - new Date(b.startAt || b.date))
    .slice(0, 3);

  if (upcoming.length === 0) return null;

  const formatDate = (m) => {
    const d = new Date(m.startAt || m.date);
    if (d.toDateString() === new Date().toDateString()) return 'Today';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (m) => {
    if (m.time) return m.time;
    return new Date(m.startAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="bg-white dark:bg-[#131726] rounded-2xl border border-gray-100 dark:border-[#1e293b] overflow-hidden shadow-sm relative">
      <div className="absolute inset-0 rounded-2xl p-[1px] pointer-events-none">
        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#8b5cf6]/40 via-[#a78bfa]/20 to-transparent" />
      </div>

      <div className="relative p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-[#8b5cf6] shadow-[0_0_6px_rgba(139,92,246,0.6)]" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Upcoming Meetings</h3>
          {upcoming.some((m) => m.status === 'ongoing') && (
            <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
            </span>
          )}
        </div>

        <div className="space-y-2.5">
          {upcoming.map((meeting) => (
            <div key={meeting.id} className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#0d0f17] hover:bg-gray-100 dark:hover:bg-[#1a1f33] transition-colors border border-gray-100 dark:border-[#1e293b]/60">
              <div className="flex items-center gap-2">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${meeting.type === 'audio' ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-purple-100 dark:bg-purple-900/40'}`}>
                  {meeting.type === 'audio' ? <Phone size={13} className="text-blue-600 dark:text-blue-400" /> : <Video size={13} className="text-purple-600 dark:text-purple-400" />}
                </span>
                <p className="text-xs font-medium text-gray-900 dark:text-white truncate flex-1">{meeting.title}</p>
                {(meeting.status === 'ongoing' || (meeting.status === 'scheduled' && meeting.roomName)) && (
                  <button
                    onClick={() => navigate(`/meetings/${meeting.id}/join`)}
                    className="px-2.5 py-1 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-[10px] font-semibold rounded-md transition-colors"
                  >
                    {meeting.status === 'ongoing' ? 'Join now' : 'Join'}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-gray-500 dark:text-gray-400">
                <Calendar size={10} />
                <span>{formatDate(meeting)}</span>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <Clock size={10} />
                <span>{formatTime(meeting)}</span>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span className="truncate">Host: {meeting.creator?.fullName || meeting.mentor || 'MConnect'}</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/meetings')}
          className="mt-3 w-full flex items-center justify-center gap-1 text-[11px] font-medium text-[#8b5cf6] hover:text-[#7c3aed] transition-colors py-1.5 rounded-lg hover:bg-[#8b5cf6]/5"
        >
          View all meetings
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}

export default function SocialFeedScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [stories, setStories] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [viewingUserStories, setViewingUserStories] = useState(null);
  const [viewingStartIndex, setViewingStartIndex] = useState(0);
  const [showNewStory, setShowNewStory] = useState(false);
  const [showReelCreate, setShowReelCreate] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      getPosts().catch(() => []),
      getAllUsers().catch(() => []),
      getStories().catch(() => []),
      getSessions().catch(() => []),
      getMeetings().catch(() => []),
    ]).then(([p, u, s, sess, meet]) => {
      setPosts(p);
      setUsers(u);
      setStories(s);
      setSessions(sess);
      setMeetings(meet);
    });
  }, []);

  const getUserById = (id) => users.find((u) => u.id === id);

  const storiesByUser = {};
  stories.forEach((s) => {
    if (!storiesByUser[s.userId]) storiesByUser[s.userId] = [];
    storiesByUser[s.userId].push(s);
  });

  const myStories = storiesByUser[user?.id] || [];
  const otherUsersStories = Object.keys(storiesByUser)
    .filter((uid) => Number(uid) !== user?.id)
    .map((uid) => ({ userId: Number(uid), stories: storiesByUser[uid], first: storiesByUser[uid][0] }));

  const handleNewReel = async (file, caption) => {
    try {
      await createReel(file, caption);
      setShowReelCreate(false);
      window.dispatchEvent(new CustomEvent('mconnect:content-created', { detail: { type: 'reel' } }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewStory = async (file, caption, text, mediaType) => {
    try {
      const story = await createStory(file, caption, text, mediaType);
      setStories((prev) => [story, ...prev]);
      setShowNewStory(false);
      window.dispatchEvent(new CustomEvent('mconnect:content-created', { detail: { type: 'story' } }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStory = async (storyId) => {
    setStories((prev) => prev.filter((s) => s.id !== storyId));
  };

  const openMyStories = () => {
    if (myStories.length > 0) {
      setViewingUserStories(myStories);
      setViewingStartIndex(0);
    } else {
      setShowNewStory(true);
    }
  };

  const openUserStories = (userStories) => {
    setViewingUserStories(userStories);
    setViewingStartIndex(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F17]">
      <DesktopSidebar />
      <TopBar title="Home" showNotifications />
      <div className="lg:ml-[225px] pt-12 pb-16 lg:pb-0 min-h-screen">
        <div className="max-w-[1128px] mx-auto px-4 py-4">
          <div className="flex gap-6">
            {/* Main Feed Column */}
            <div className="flex-1 min-w-0 max-w-[680px] mx-auto">

              {/* Stories Bar */}
              {(myStories.length > 0 || otherUsersStories.length > 0) && (
                <div className="bg-white dark:bg-[#131726] border border-gray-100 dark:border-[#1e293b] rounded-2xl p-4 mb-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stories</h2>
                    <button
                      onClick={() => setShowNewStory(true)}
                      className="text-[10px] font-medium text-[#8b5cf6] hover:text-[#7c3aed] transition-colors"
                    >
                      Add story
                    </button>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
                    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                      <div className="relative">
                        <button
                          onClick={openMyStories}
                          className={`w-16 h-16 rounded-full flex items-center justify-center ${
                            myStories.length > 0
                              ? 'p-[3px] bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 shadow-[0_0_12px_-2px_rgba(236,72,153,0.4)]'
                              : 'border-2 border-dashed border-[#8b5cf6]/50 bg-[#8b5cf6]/10'
                          }`}
                        >
                          {myStories.length > 0 ? (
                            myStories[0].mediaUrl ? (
                              <img src={myStories[0].mediaUrl} alt="Your story" className="w-full h-full rounded-full object-cover ring-[3px] ring-white dark:ring-[#131726]" />
                            ) : myStories[0].avatarUrl ? (
                              <img src={myStories[0].avatarUrl} alt="" className="w-full h-full rounded-full object-cover ring-[3px] ring-white dark:ring-[#131726]" />
                            ) : (
                              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] flex items-center justify-center ring-[3px] ring-white dark:ring-[#131726]">
                                <span className="text-white text-xs font-bold text-center px-1 line-clamp-2">{(myStories[0].text || myStories[0].caption)?.slice(0, 20)}</span>
                              </div>
                            )
                          ) : (
                            <Plus size={22} className="text-[#8b5cf6]" />
                          )}
                        </button>
                        {myStories.length > 0 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setShowNewStory(true); }}
                            className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-[#8b5cf6] text-white rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#131726] shadow-[0_0_8px_rgba(139,92,246,0.5)]"
                          >
                            <Plus size={12} />
                          </button>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 w-16 text-center truncate">
                        {myStories.length > 0 ? 'Your story' : 'Add story'}
                      </span>
                    </div>

                    {otherUsersStories.map(({ userId, stories: userStories, first }) => (
                      <div key={userId} className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer" onClick={() => openUserStories(userStories)}>
                        <div className="p-[3px] rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 shadow-[0_0_12px_-2px_rgba(236,72,153,0.4)]">
                          {first.mediaUrl ? (
                            <img src={first.mediaUrl} alt={first.user?.fullName} className="w-16 h-16 rounded-full object-cover ring-[3px] ring-white dark:ring-[#131726]" />
                          ) : first.avatarUrl || first.user?.avatarUrl ? (
                            <img src={first.avatarUrl || first.user?.avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover ring-[3px] ring-white dark:ring-[#131726]" />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-[#1e293b] flex items-center justify-center ring-[3px] ring-white dark:ring-[#131726]">
                              <span className="text-gray-900 dark:text-white text-xs font-bold text-center px-1 line-clamp-2">{(first.text || first.caption)?.slice(0, 20)}</span>
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 w-16 text-center truncate">{first.user?.fullName?.split(' ')[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feed Posts */}
              <div className="flex flex-col gap-4">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} author={getUserById(post.authorId)} onDelete={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))} />
                ))}
                {posts.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-sm">No posts yet. Be the first to share something!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar - Desktop only */}
            <div className="hidden lg:block w-[340px] flex-shrink-0 space-y-4 sticky top-20 self-start">
              <UpcomingSessions sessions={sessions} users={users} />
              <UpcomingMeetings meetings={meetings} />
            </div>
          </div>
        </div>
      </div>

      <BottomNav />

      {viewingUserStories && (
        <StoryViewer
          stories={viewingUserStories}
          startIndex={viewingStartIndex}
          onClose={() => { setViewingUserStories(null); setViewingStartIndex(0); }}
          user={user}
          onDelete={handleDeleteStory}
        />
      )}
      {showNewStory && <NewStoryModal onClose={() => setShowNewStory(false)} onSubmit={handleNewStory} />}
      {showReelCreate && <ReelCreateModal onClose={() => setShowReelCreate(false)} onSubmit={handleNewReel} />}

      {/* FAB Creation Menu */}
      {fabOpen && (
        <div className="fixed bottom-36 right-4 lg:bottom-28 lg:right-8 flex flex-col gap-2 z-40">
          <button
            onClick={() => { navigate('/feed/new'); setFabOpen(false); }}
            className="flex items-center gap-2 bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white px-3 py-2 rounded-full shadow-lg shadow-[#8b5cf6]/25 text-sm font-medium hover:brightness-110 transition-all"
          >
            <Plus size={16} />
            <span>Post</span>
          </button>
          <button
            onClick={() => { setShowNewStory(true); setFabOpen(false); }}
            className="flex items-center gap-2 bg-gradient-to-br from-pink-500 to-rose-600 text-white px-3 py-2 rounded-full shadow-lg shadow-pink-500/25 text-sm font-medium hover:brightness-110 transition-all"
          >
            <Film size={16} />
            <span>Story</span>
          </button>
          <button
            onClick={() => { setShowReelCreate(true); setFabOpen(false); }}
            className="flex items-center gap-2 bg-gradient-to-br from-indigo-600 to-blue-700 text-white px-3 py-2 rounded-full shadow-lg shadow-indigo-500/25 text-sm font-medium hover:brightness-110 transition-all"
          >
            <Video size={16} />
            <span>Reel</span>
          </button>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setFabOpen(!fabOpen)}
        className={`fixed bottom-20 right-4 lg:bottom-8 lg:right-8 w-14 h-14 bg-[#8b5cf6] text-white rounded-full shadow-lg shadow-[#8b5cf6]/40 flex items-center justify-center hover:bg-[#7c3aed] hover:shadow-[#8b5cf6]/60 hover:shadow-xl active:scale-95 transition-all z-40 ${fabOpen ? 'rotate-45' : ''}`}
      >
        <Plus size={24} />
      </button>
    </div>
  );
}