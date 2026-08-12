import { Heart, MessageCircle, Repeat2, MoreHorizontal, Trash2, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { useState } from 'react';
import Avatar from './Avatar';
import { useNavigate } from 'react-router-dom';
import { reactToPost, deletePost } from '../../services/posts';
import { useAuth } from '../../context/AuthContext';

const REPOST_KEY = 'mconnect_reposts';

function loadRepostMap() {
  try {
    return JSON.parse(localStorage.getItem(REPOST_KEY) || '{}');
  } catch {
    return {};
  }
}

export default function PostCard({ post, author, onDelete }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reactions, setReactions] = useState(post.reactions);
  const [userReaction, setUserReaction] = useState(post.userReaction || null);
  const [reposted, setReposted] = useState(() => (loadRepostMap()[post.id]?.reposted) ?? (post.userReposted || false));
  const [repostCount, setRepostCount] = useState(() => (loadRepostMap()[post.id]?.count) ?? (post.repostCount || 0));
  const [menuOpen, setMenuOpen] = useState(false);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const isOwner = user && post.authorId === user.id;

  const mediaItems = post.mediaUrls && post.mediaUrls.length > 0
    ? post.mediaUrls
    : post.mediaUrl
      ? [post.mediaUrl]
      : [];
  const isVideo = post.mediaType === 'video' || post.mediaType === 'reel';
  const handle = (author?.fullName || 'mconnect.member').toLowerCase().replace(/\s+/g, '.');
  const likesCount = reactions.like || 0;

  const engagementParts = [];
  if (likesCount > 0) engagementParts.push(`${likesCount} like${likesCount !== 1 ? 's' : ''}`);
  if (repostCount > 0) engagementParts.push(`${repostCount} repost${repostCount !== 1 ? 's' : ''}`);
  const engagementText = engagementParts.join(' • ');

  const handleReaction = async (type) => {
    const prev = userReaction;
    const prevReactions = { ...reactions };

    if (prev === type) {
      setUserReaction(null);
      setReactions((r) => ({ ...r, [type]: r[type] - 1 }));
    } else {
      setUserReaction(type);
      if (prev) {
        setReactions((r) => ({ ...r, [prev]: r[prev] - 1, [type]: r[type] + 1 }));
      } else {
        setReactions((r) => ({ ...r, [type]: r[type] + 1 }));
      }
    }

    try {
      await reactToPost(post.id, type);
    } catch {
      setUserReaction(prev);
      setReactions(prevReactions);
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await deletePost(post.id);
      if (onDelete) onDelete(post.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRepost = () => {
    const map = loadRepostMap();
    const entry = map[post.id] || {
      reposted: post.userReposted || false,
      count: post.repostCount || 0,
      post,
    };
    const became = !entry.reposted;
    entry.reposted = became;
    entry.count = Math.max(0, entry.count + (became ? 1 : -1));
    entry.post = post;
    map[post.id] = entry;
    try {
      localStorage.setItem(REPOST_KEY, JSON.stringify(map));
    } catch {}
    setReposted(became);
    setRepostCount(entry.count);
    window.dispatchEvent(new Event('mconnect:reposts-changed'));
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/posts/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'MConnect Post', text: 'Check out this post on MConnect', url });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        prompt('Copy this link:', url);
      }
    }
  };

  const caption = post.content || post.caption || '';
  const showReadMore = caption.length > 150 && !expanded;

  return (
    <article className="bg-white dark:bg-[#131726] rounded-2xl border border-gray-100 dark:border-[#1e293b] shadow-sm hover:shadow-md dark:hover:shadow-[0_8px_30px_-8px_rgba(139,92,246,0.12)] transition-shadow duration-200 overflow-hidden">
      {/* Author header */}
      <div className="flex items-center gap-2.5 px-4 pt-3 pb-2">
        <button onClick={() => author && navigate('/profile')} className="shrink-0">
          <Avatar src={author?.avatarUrl} alt={author?.fullName} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-[#a78bfa] transition-colors cursor-pointer truncate">
            {author?.fullName}
          </p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
            @{handle}
            <span className="mx-1 text-gray-300 dark:text-gray-600">·</span>
            {timeAgo(post.createdAt)}
          </p>
        </div>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-colors"
          aria-label="Post options"
        >
          <MoreHorizontal size={18} />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-4 top-12 z-20 w-44 bg-white dark:bg-[#161b2b] rounded-lg shadow-lg border border-gray-100 dark:border-[#1e293b] py-1">
              {isOwner && (
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-[#1e293b] transition-colors"
                >
                  <Trash2 size={14} /> Delete post
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Main media container */}
      {mediaItems.length > 0 && (
        <div className="relative bg-black mx-0 rounded-none">
          {isVideo ? (
            <video
              src={mediaItems[0]}
              controls
              playsInline
              poster={post.thumbnailUrl}
              className="w-full max-h-[500px] object-contain"
            />
          ) : (
            <>
              <img src={mediaItems[mediaIndex]} alt="Post media" className="w-full max-h-[500px] object-cover" loading="lazy" />
              {mediaItems.length > 1 && (
                <>
                  {mediaIndex > 0 && (
                    <button
                      onClick={() => setMediaIndex((i) => i - 1)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-colors"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft size={18} />
                    </button>
                  )}
                  {mediaIndex < mediaItems.length - 1 && (
                    <button
                      onClick={() => setMediaIndex((i) => i + 1)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-colors"
                      aria-label="Next photo"
                    >
                      <ChevronRight size={18} />
                    </button>
                  )}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
                    {mediaItems.map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 rounded-full transition-all ${i === mediaIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Action bar - Instagram style */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleReaction('like')}
            className={`p-1.5 transition-all duration-150 active:scale-110 ${
              userReaction === 'like' ? 'text-[#ef4444]' : 'text-gray-500 dark:text-gray-400 hover:text-[#ef4444]'
            }`}
            aria-label="Like"
          >
            <Heart size={24} fill={userReaction === 'like' ? 'currentColor' : 'none'} strokeWidth={userReaction === 'like' ? 0 : 2} />
          </button>
          <button
            onClick={() => navigate(`/posts/${post.id}`)}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-[#a78bfa] transition-colors"
            aria-label="Comment"
          >
            <MessageCircle size={24} />
          </button>
          <button
            onClick={handleShare}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-[#a78bfa] transition-colors"
            aria-label="Share"
          >
            <Share2 size={22} />
          </button>
        </div>
        <button
          onClick={handleRepost}
          className={`p-1.5 transition-colors ${reposted ? 'text-green-500' : 'text-gray-500 dark:text-gray-400 hover:text-green-500'}`}
          aria-label="Repost"
        >
          <Repeat2 size={22} />
        </button>
      </div>

      {/* Caption & comments */}
      <div className="px-4 pb-4">
        {engagementText && (
          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1 cursor-pointer" onClick={() => navigate(`/posts/${post.id}`)}>
            {engagementText}
          </p>
        )}
        <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed mt-1">
          <span className="font-semibold text-gray-900 dark:text-white mr-1.5">{author?.fullName}</span>
          {showReadMore ? caption.slice(0, 150) + '... ' : caption}
          {showReadMore && (
            <button onClick={() => setExpanded(true)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm ml-0.5">
              more
            </button>
          )}
        </p>
        {post.commentCount > 0 && (
          <button
            onClick={() => navigate(`/posts/${post.id}`)}
            className="mt-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            View all {post.commentCount} comment{post.commentCount !== 1 ? 's' : ''}
          </button>
        )}
      </div>
    </article>
  );
}