import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPostsByAuthor } from '../../services/posts';
import { getReelsByAuthor } from '../../services/reels';
import { getMentors, getUserStats } from '../../services/auth';
import { getMentorshipRequestsByMentor, getMentorshipRequestsByMentee, updateMentorshipRequest, completeMentorshipRequest, createMentorshipRequest } from '../../services/mentorship';
import { getConversations, freezeConversation } from '../../services/conversations';
import TopBar from '../shared/TopBar';
import Button from '../shared/Button';
import Badge from '../shared/Badge';
import Avatar from '../shared/Avatar';
import ProfileGrid from './ProfileGrid';
import PostDetailModal from './PostDetailModal';
import EditProfileModal from './EditProfileModal';
import { Share2, MessageCircle, Users, UserCheck, Video, Settings, Clock } from 'lucide-react';

const REPOST_KEY = 'mconnect_reposts';

function loadReposts() {
  try {
    const map = JSON.parse(localStorage.getItem(REPOST_KEY) || '{}');
    return Object.values(map)
      .filter((e) => e && e.reposted && e.post)
      .map((e) => e.post);
  } catch {
    return [];
  }
}

const TAB_ITEMS = [
  { key: 'posts', label: 'Posts', icon: MessageCircle },
  { key: 'reels', label: 'Reels', icon: Video },
  { key: 'reposts', label: 'Reposts', icon: Share2 },
  { key: 'requests', label: 'Requests', icon: UserCheck },
];

function statusInfo(status) {
  const s = String(status || '').toUpperCase();
  if (s === 'ACTIVE') return { label: 'ACCEPTED', color: 'green' };
  if (s === 'CANCELLED') return { label: 'DECLINED', color: 'red' };
  if (s === 'COMPLETED') return { label: 'COMPLETED', color: 'gray' };
  return { label: 'PENDING', color: 'yellow' };
}

function sessionTypeLabel(type) {
  const t = String(type || 'VIDEO').toUpperCase();
  if (t === 'CHAT') return 'Chat';
  if (t === 'IN_PERSON') return 'In Person';
  return 'Video Call';
}

function formatRequestTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function ProfileScreen() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('posts');
  const [editOpen, setEditOpen] = useState(false);
  const [reposts, setReposts] = useState([]);
  const [completionReq, setCompletionReq] = useState(null);
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [postsCount, setPostsCount] = useState(0);
  const [storiesCount, setStoriesCount] = useState(0);
  const [reelsCount, setReelsCount] = useState(0);
  const [mentorsCount, setMentorsCount] = useState(0);
  const [menteesCount, setMenteesCount] = useState(0);
  const [recommendedMentors, setRecommendedMentors] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loadingActions, setLoadingActions] = useState({});

  const loadContent = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [postsData, reelsData] = await Promise.all([
        getPostsByAuthor(user.id).catch(() => []),
        getReelsByAuthor(user.id).catch(() => []),
      ]);
      const standardPosts = postsData.filter((p) => p.mediaType !== 'reel');
      const reelPosts = postsData.filter((p) => p.mediaType === 'reel');
      const reelsList = reelsData.length > 0 ? reelsData : reelPosts;
      setPosts(standardPosts);
      setReels(reelsList);
      setPostsCount(standardPosts.length);
      setReelsCount(reelsList.length);
    } catch (err) {
      console.error('Failed to load profile content:', err);
    }
  }, [user?.id]);

  const loadRequests = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [incoming, outgoing] = await Promise.all([
        getMentorshipRequestsByMentor(user.id).catch(() => []),
        getMentorshipRequestsByMentee(user.id).catch(() => []),
      ]);
      const filterList = (list) =>
        (list || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setIncomingRequests(filterList(incoming || []));
      setOutgoingRequests(filterList(outgoing || []));
    } catch (err) {
      console.error('Failed to load mentorship requests:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadProfileData();
      loadContent();
      loadRequests();
    }
  }, [user?.id, loadContent, loadRequests]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && TAB_ITEMS.some((t) => t.key === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const refresh = () => setReposts(loadReposts());
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('mconnect:reposts-changed', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('mconnect:reposts-changed', refresh);
    };
  }, []);

  const handleRequestAction = async (id, status) => {
    const prevIncoming = incomingRequests;
    const prevOutgoing = outgoingRequests;
    const apply = (list) => list.map((r) => (r.id === id ? { ...r, status } : r));
    setIncomingRequests((l) => apply(l));
    setOutgoingRequests((l) => apply(l));
    setLoadingActions((m) => ({ ...m, [id]: true }));
    let updated = null;
    try {
      updated = await updateMentorshipRequest(id, { status });
      await loadRequests();
    } catch (err) {
      console.error('Failed to update request:', err);
      setIncomingRequests(prevIncoming);
      setOutgoingRequests(prevOutgoing);
    } finally {
      setLoadingActions((m) => {
        const next = { ...m };
        delete next[id];
        return next;
      });
    }
    return updated;
  };

  const handleEndSession = async (req) => {
    try {
      await completeMentorshipRequest(req.id);
      setCompletionReq(req);
      loadRequests();
    } catch (err) {
      console.error('Failed to complete session:', err);
    }
  };

  const handleBookNewSession = async () => {
    if (!completionReq) return;
    try {
      await createMentorshipRequest({
        mentorId: completionReq.mentorId,
        menteeId: user.id,
        message: 'Booking a new mentorship session',
      });
      setCompletionReq(null);
      loadRequests();
    } catch (err) {
      console.error('Failed to book new session:', err);
    }
  };

  const handleCloseThread = async () => {
    if (!completionReq) return;
    try {
      const convs = await getConversations(user.id).catch(() => []);
      const partnerId = completionReq.mentorId === user.id ? completionReq.menteeId : completionReq.mentorId;
      const conv = convs.find(
        (c) => c.type === 'direct' && c.participantIds?.includes(partnerId) && c.participantIds?.includes(user.id)
      );
      if (conv) await freezeConversation(conv.id);
    } catch (err) {
      console.error('Failed to close thread:', err);
    }
    setCompletionReq(null);
    loadRequests();
  };

  useEffect(() => {
    const handleContentCreated = () => {
      loadContent();
    };
    window.addEventListener('mconnect:content-created', handleContentCreated);
    return () => window.removeEventListener('mconnect:content-created', handleContentCreated);
  }, [loadContent]);

  const loadProfileData = async () => {
    try {
      const [posts, mentors, stats] = await Promise.all([
        getPostsByAuthor(user.id).catch(() => []),
        getMentors(),
        getUserStats(user.id).catch(() => null),
      ]);
      setPostsCount(stats?.posts ?? posts.length);
      setStoriesCount(stats?.stories ?? 0);
      setReelsCount(stats?.reels ?? 0);
      setMentorsCount(stats?.activeMentors ?? 0);
      setMenteesCount(stats?.activeMentees ?? 0);
      setRecommendedMentors(mentors.slice(0, 6));
    } catch (err) {
      console.error('Failed to load profile data:', err);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: user?.fullName, text: `Check out ${user?.fullName}'s profile on MConnect`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-950 box-border overflow-x-hidden">
      <TopBar title="Profile" showNotifications />
      <main className="w-full max-w-full px-3 py-4 sm:px-4 sm:py-6">
        {/* Profile Header */}
        <section className="w-full max-w-full bg-white dark:bg-[#0d0f17] rounded-2xl border border-gray-200 dark:border-[#1e293b] p-4 mb-4 box-border">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="relative shrink-0">
                <Avatar src={user?.avatarUrl} alt={user?.fullName} size="xl" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col gap-1.5">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white break-words">{user?.fullName}</h1>
                  <Badge color="purple" className="self-start">{user?.isMentorProfileComplete ? 'Mentor' : 'Member'}</Badge>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 break-words">{user?.bio || 'MConnect Member'}</p>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <button onClick={() => navigate('/profile/mentors')} className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors truncate">
                    <Users size={14} />
                    <span className="font-semibold text-gray-900 dark:text-white">{mentorsCount}</span> Mentors
                  </button>
                  <button onClick={() => navigate('/profile/mentees')} className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors truncate">
                    <UserCheck size={14} />
                    <span className="font-semibold text-gray-900 dark:text-white">{menteesCount}</span> Mentees
                  </button>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate cursor-default">
                    <MessageCircle size={14} />
                    <span className="font-semibold text-gray-900 dark:text-white">{postsCount + storiesCount + reelsCount}</span> Posts
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/settings')}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors shrink-0 ml-2"
            >
              <Settings size={18} className="text-gray-500" />
            </button>
          </div>
          <div className="flex items-center justify-between w-full mt-4">
            <div className="flex flex-row gap-2">
              <Button onClick={() => setEditOpen(true)} size="sm" className="w-full sm:w-auto">Edit Profile</Button>
              <Button onClick={() => navigate('/mentor-profile-setup')} variant="primary" size="sm" className="w-full sm:w-auto">
                {user?.isMentorProfileComplete ? 'Mentor Profile' : 'Become a Mentor'}
              </Button>
            </div>
            <button
              onClick={handleShare}
              className="p-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
              aria-label="Share profile"
            >
              <Share2 size={18} />
            </button>
          </div>
        </section>
        
        {/* Recommended Mentors */}
        {recommendedMentors.length > 0 && (
          <section className="w-full max-w-full mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-words">Recommended Mentors</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/mentors')} className="shrink-0">See All</Button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {recommendedMentors.map((mentor) => (
                <button
                  key={mentor.id}
                  onClick={() => navigate(`/mentors/${mentor.id}`)}
                  className="shrink-0 w-40 bg-white dark:bg-[#0d0f17] border border-gray-200 dark:border-[#1e293b] rounded-xl p-3 flex flex-col items-center text-center box-border hover:shadow-md transition-shadow"
                >
                  <Avatar src={mentor?.avatarUrl} alt={mentor?.fullName} size="sm" className="w-10 h-10 mb-1.5" />
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate w-full">{mentor?.fullName}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1 w-full break-words">{mentor?.bio || 'MConnect Mentor'}</p>
                  <Badge color="purple" className="mt-1">Mentor</Badge>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Content Tabs */}
        <section className="w-full max-w-full mb-4">
          <div className="flex items-center gap-1 border-b border-gray-200 dark:border-[#1e293b] overflow-x-auto">
            {TAB_ITEMS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap shrink-0 ${
                  activeTab === key
                    ? 'text-purple-600 dark:text-purple-400 border-purple-600 dark:border-purple-400'
                    : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon size={14} className="sm:size-[16px]" />
                {label}
              </button>
            ))}
          </div>
          <div className="mt-3">
            {activeTab === 'posts' && (
              <ProfileGrid
                items={posts}
                kind="posts"
                onSelect={setSelectedPost}
                emptyText="No posts yet."
              />
            )}
            {activeTab === 'reels' && (
              <ProfileGrid
                items={reels}
                kind="reels"
                onSelect={setSelectedPost}
                emptyText="No reels yet. Upload short videos (max 3 minutes)."
              />
            )}
            {activeTab === 'reposts' && (
              <ProfileGrid
                items={reposts}
                kind="posts"
                onSelect={setSelectedPost}
                emptyText="No reposts yet. Tap the repost icon on any post to add it here."
              />
            )}
            {activeTab === 'requests' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Incoming Requests</h3>
                  {incomingRequests.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 py-4">No incoming mentorship requests.</p>
                  ) : (
                    <div className="space-y-3">
                      {incomingRequests.map((r) => {
                        const st = statusInfo(r.status);
                        const pending = String(r.status).toUpperCase() === 'PENDING';
                        return (
                          <div key={r.id} className="bg-white dark:bg-[#0d0f17] rounded-xl border border-gray-200 dark:border-[#1e293b] p-4">
                            <div className="flex items-center gap-3">
                              <Avatar src={r.mentee?.avatarUrl} alt={r.mentee?.fullName} size="md" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{r.mentee?.fullName}</p>
                                  <Badge color={st.color}>{st.label}</Badge>
                                  <Badge color="purple">{sessionTypeLabel(r.sessionType)}</Badge>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                                  <Clock size={11} />
                                  {formatRequestTime(r.createdAt)}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 break-words">
                              {r.duration ? <span className="text-xs text-gray-400 mr-1">· {r.duration}</span> : null}
                              {r.message || 'Wants to connect for mentorship.'}
                            </p>
                             <div className="flex gap-2 mt-4">
                              <Button size="sm" className="gap-1" onClick={() => handleRequestAction(r.id, 'ACTIVE')} disabled={!pending || loadingActions[r.id]}>
                                <UserCheck size={13} /> {loadingActions[r.id] ? 'Processing...' : 'Accept'}
                              </Button>
                              <Button size="sm" variant="secondary" onClick={() => handleRequestAction(r.id, 'CANCELLED')} disabled={!pending || loadingActions[r.id]}>
                                {loadingActions[r.id] ? 'Processing...' : 'Decline'}
                              </Button>
                            </div>
                            {st.label === 'ACCEPTED' && (
                              <div className="flex gap-2 mt-3 flex-wrap">
                                {r.sessionType === 'VIDEO' && r.meetingId && (
                                  <Button size="sm" className="gap-1" onClick={() => navigate(`/meetings/${r.meetingId}/join`)}>
                                    <Video size={13} /> Join Video Call
                                  </Button>
                                )}
                                <Button size="sm" variant="ghost" className="text-amber-600 dark:text-amber-400" onClick={() => handleEndSession(r)}>
                                  End Session
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Outgoing Requests</h3>
                  {outgoingRequests.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 py-4">No outgoing mentorship requests.</p>
                  ) : (
                    <div className="space-y-3">
                      {outgoingRequests.map((r) => {
                        const st = statusInfo(r.status);
                        const isPending = String(r.status).toUpperCase() === 'PENDING';
                        return (
                          <div key={r.id} className="bg-white dark:bg-[#0d0f17] rounded-xl border border-gray-200 dark:border-[#1e293b] p-4">
                            <div className="flex items-center gap-3">
                              <Avatar src={r.mentor?.avatarUrl} alt={r.mentor?.fullName} size="md" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{r.mentor?.fullName}</p>
                                  <Badge color={st.color}>{st.label}</Badge>
                                  <Badge color="purple">{sessionTypeLabel(r.sessionType)}</Badge>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                                  <Clock size={11} />
                                  {formatRequestTime(r.createdAt)}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 break-words">
                              {r.message || 'You requested mentorship.'}
                            </p>
                            {isPending && (
                              <Button
                                size="sm"
                                variant="secondary"
                                className="mt-4"
                                onClick={() => handleRequestAction(r.id, 'CANCELLED')}
                                disabled={loadingActions[r.id]}
                              >
                                {loadingActions[r.id] ? 'Processing...' : 'Cancel Request'}
                              </Button>
                            )}
                            {st.label === 'ACCEPTED' && (
                              <div className="flex gap-2 mt-4 flex-wrap">
                                {r.sessionType === 'VIDEO' && r.meetingId && (
                                  <Button size="sm" className="gap-1" onClick={() => navigate(`/meetings/${r.meetingId}/join`)}>
                                    <Video size={13} /> Join Video Call
                                  </Button>
                                )}
                                <Button size="sm" variant="ghost" className="text-amber-600 dark:text-amber-400" onClick={() => handleEndSession(r)}>
                                  End Session
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {selectedPost && (
          <PostDetailModal
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
            onDeleted={(id) => {
              setPosts((prev) => prev.filter((p) => p.id !== id));
              setReels((prev) => prev.filter((r) => r.id !== id));
            }}
          />
        )}
        {editOpen && user && (
          <EditProfileModal
            user={user}
            onClose={() => setEditOpen(false)}
            onSaved={(updated) => {
              updateUser(updated);
              setEditOpen(false);
              window.dispatchEvent(new Event('mconnect:content-created'));
            }}
          />
        )}
        {completionReq && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="w-full max-w-sm bg-white dark:bg-[#0d0f17] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#1e293b] overflow-hidden">
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Session completed
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 break-words">
                  Your mentorship session with{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {completionReq.mentor?.fullName || 'your mentor'}
                  </span>{' '}
                  is complete. Would you like to book a new session with them?
                </p>
              </div>
              <div className="flex border-t border-gray-200 dark:border-[#1e293b]">
                <button
                  onClick={handleCloseThread}
                  className="flex-1 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  No, close chat
                </button>
                <button
                  onClick={handleBookNewSession}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-sm font-semibold text-white transition-colors"
                >
                  Yes, Book again
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}