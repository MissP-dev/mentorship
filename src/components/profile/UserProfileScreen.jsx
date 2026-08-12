import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserById, getUserStats } from '../../services/auth';
import { getPostsByAuthor } from '../../services/posts';
import { getConversations, createConversation } from '../../services/conversations';
import TopBar from '../shared/TopBar';
import Avatar from '../shared/Avatar';
import Badge from '../shared/Badge';
import Button from '../shared/Button';
import ProfileGrid from './ProfileGrid';
import PostDetailModal from './PostDetailModal';
import { MessageCircle, GraduationCap, BookOpen, Star, UserPlus } from 'lucide-react';

export default function UserProfileScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [startingChat, setStartingChat] = useState(false);

  const isOwnProfile = user?.id === Number(id);

  useEffect(() => {
    if (!id) return;
    let active = true;
    Promise.all([
      getUserById(id).catch(() => null),
      getPostsByAuthor(id).catch(() => []),
      getUserStats(id).catch(() => null),
    ]).then(([p, postsData, statsData]) => {
      if (!active) return;
      if (!p) {
        setError('User not found.');
        return;
      }
      setProfile(p);
      setPosts((postsData || []).filter((x) => x.mediaType !== 'reel'));
      setStats(statsData);
    });
    return () => {
      active = false;
    };
  }, [id]);

  const handleMessage = useCallback(async () => {
    setStartingChat(true);
    try {
      const convs = await getConversations(user.id).catch(() => []);
      const existing = convs.find((c) => c.type === 'direct' && c.participantIds?.includes(Number(id)));
      let conv;
      if (existing) {
        conv = existing;
      } else {
        conv = await createConversation({ participantIds: [Number(id)] });
      }
      navigate(`/messages/${conv.id}`);
    } catch (err) {
      console.error('Failed to open chat:', err);
    } finally {
      setStartingChat(false);
    }
  }, [id, user.id, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <TopBar title="Profile" showBack />
        <div className="flex flex-col items-center justify-center py-24 px-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{error}</p>
          <Button variant="secondary" onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <TopBar title="Profile" showBack />
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-purple-700 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const isMentor = profile.isMentorProfileComplete;
  const totalPosts = (stats?.totalPosts ?? posts.length);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopBar title="Profile" showBack />
      <main className="max-w-2xl mx-auto px-3 py-4 sm:px-4">
        <section className="bg-white dark:bg-[#0d0f17] rounded-2xl border border-gray-200 dark:border-[#1e293b] p-4">
          <div className="flex items-start gap-4">
            <Avatar src={profile.avatarUrl} alt={profile.fullName} size="xl" />
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white break-words">{profile.fullName}</h1>
              <Badge color={isMentor ? 'purple' : 'green'} className="self-start flex items-center gap-1">
                {isMentor ? <><GraduationCap size={10} /> Mentor</> : <><BookOpen size={10} /> Member</>}
              </Badge>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 break-words">{profile.bio || 'MConnect Member'}</p>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-gray-900 dark:text-white">{profile.rating?.toFixed(1) || '0.0'}</span> rating
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="font-semibold text-gray-900 dark:text-white">{totalPosts}</span> posts
                </span>
                {isMentor && (
                  <span className="flex items-center gap-1.5">
                    <span className="font-semibold text-gray-900 dark:text-white">{stats?.totalMenteesGraduated || 0}</span> mentees graduated
                  </span>
                )}
              </div>
              {profile.expertiseTags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {profile.expertiseTags.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {!isOwnProfile && (
            <div className="flex flex-wrap gap-2 mt-4">
              <Button onClick={handleMessage} disabled={startingChat} className="gap-2">
                <MessageCircle size={15} />
                {startingChat ? 'Opening chat...' : 'Message'}
              </Button>
              {isMentor && (
                <Button variant="secondary" onClick={() => navigate(`/mentors/${profile.id}`)} className="gap-2">
                  <UserPlus size={15} />
                  View Mentor Profile
                </Button>
              )}
            </div>
          )}
        </section>

        <section className="mt-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">Posts</h2>
          <ProfileGrid items={posts} kind="posts" onSelect={setSelectedPost} emptyText="No posts yet." />
        </section>

        {selectedPost && (
          <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />
        )}
      </main>
    </div>
  );
}
