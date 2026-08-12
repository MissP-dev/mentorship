import { Heart, MessageCircle, Repeat2, MoreHorizontal, Trash2, Flag, Share2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
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

function FeedPost({ post, author, onDelete }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reactions, setReactions] = useState(post.reactions);
  const [userReaction, setUserReaction] = useState(post.userReaction || null);
  const initialRepost = loadRepostMap()[post.id] || {
    reposted: post.userReposted || false,
    count: post.repostCount || 0,
  };
  const [reposted, setReposted] = useState(initialRepost.reposted);
  const [repostCount, setRepostCount] = useState(initialRepost.count);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const isOwner = user && post.authorId === user.id;

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w`;
    const months = Math.floor(days / 30);
    return `${months}mo`;
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await deletePost(post.id);
      if (onDelete) onDelete(post.id);
    } catch (err) {
      console.error(err);
    }
    setShowMenu(false);
  };

  const handleReport = async () => {
    if (!confirm('Report this post?')) return;
    setShowMenu(false);
  };

  const handleRepost = () => {
    const map = loadRepostMap();
    const entry = map[post.id] || { reposted: post.userReposted || false, count: post.repostCount || 0 };
    const became = !entry.reposted;
    entry.reposted = became;
    entry.count = Math.max(0, entry.count + (became ? 1 : -1));
    map[post.id] = entry;
    try {
      localStorage.setItem(REPOST_KEY, JSON.stringify(map));
    } catch {}
    setReposted(became);
    setRepostCount(entry.count);
    window.dispatchEvent(new CustomEvent('mconnect:reposts-changed'));
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
    setShowMenu(false);
  };

  const totalLikes = reactions.like + repostCount;
  const likeText = totalLikes > 0 ? `${totalLikes} like${totalLikes !== 1 ? 's' : ''}` : '';

  return (
    <article className="bg-white dark:bg-[#0d0f17] border-b border-gray-100 dark:border-[#1e293b] last:border-0">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => author && navigate(`/users/${author.id}`)}
          className="flex-shrink-0"
        >
          <Avatar src={author?.avatarUrl} alt={author?.fullName} size="md" />
        </button>
        <div className="flex-1 min-w-0">
          <button
            onClick={() => author && navigate(`/users/${author.id}`)}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-[#a78bfa] transition-colors"
          >
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{author?.fullName}</p>
            <span className="text-gray-400 dark:text-gray-600 text-xs">·</span>
            <time className="text-xs text-gray-500 flex-shrink-0" dateTime={post.createdAt}>{timeAgo(post.createdAt)}</time>
          </button>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-[#1e293b] rounded-full transition-colors text-gray-500"
            aria-label="Post options"
          >
            <MoreHorizontal size={20} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-[#2d3748] rounded-lg shadow-lg py-1 z-50">
              <button
                onClick={handleShare}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2d3748] flex items-center gap-2"
              >
                <Share2 size={16} />
                Share
              </button>
              {isOwner && (
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-[#2d3748] flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              )}
              {!isOwner && (
                <button
                  onClick={handleReport}
                  className="w-full px-4 py-2 text-left text-sm text-orange-600 dark:text-orange-400 hover:bg-gray-100 dark:hover:bg-[#2d3748] flex items-center gap-2"
                >
                  <Flag size={16} />
                  Report
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Media Container - Full Width */}
      {post.mediaUrl && post.mediaType === 'image' && (
        <div className="w-full">
          <img
            src={post.mediaUrl}
            alt="Post media"
            className="w-full h-auto object-cover max-h-[600px]"
            loading="lazy"
          />
        </div>
      )}
      {post.mediaUrl && post.mediaType === 'video' && (
        <div className="w-full">
          <video
            src={post.mediaUrl}
            controls
            className="w-full h-auto max-h-[600px]"
            preload="metadata"
          />
        </div>
      )}

      {/* Action Bar */}
      <div className="px-4 py-3 flex items-center gap-6 border-t border-gray-100 dark:border-[#1e293b]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleReaction('like')}
            className={`flex items-center gap-1.5 p-1 transition-colors ${
              userReaction === 'like'
                ? 'text-red-500'
                : 'text-gray-500 hover:text-red-500'
            }`}
            aria-label={userReaction === 'like' ? 'Unlike' : 'Like'}
          >
            <Heart
              size={24}
              fill={userReaction === 'like' ? 'currentColor' : 'none'}
              strokeWidth={userReaction === 'like' ? 0 : 2}
            />
          </button>
          <button
            onClick={() => navigate(`/posts/${post.id}`)}
            className="flex items-center gap-1.5 p-1 text-gray-500 hover:text-purple-600 dark:hover:text-[#a78bfa] transition-colors"
            aria-label="Comment"
          >
            <MessageCircle size={24} />
          </button>
          <button
            onClick={handleRepost}
            className={`flex items-center gap-1.5 p-1 transition-colors ${
              reposted ? 'text-green-500' : 'text-gray-500 hover:text-green-500'
            }`}
            aria-label={reposted ? 'Undo repost' : 'Repost'}
          >
            <Repeat2 size={24} />
          </button>
        </div>
      </div>

      {/* Engagement Details */}
      {(totalLikes > 0 || post.caption || (post.commentCount || 0) > 0) && (
        <div className="px-4 pb-3">
          {totalLikes > 0 && (
            <button
              onClick={() => navigate(`/posts/${post.id}`)}
              className="font-semibold text-sm text-gray-900 dark:text-white hover:underline mb-2 block"
            >
              {likeText}
            </button>
          )}

          {post.content || post.caption ? (
            <div className="mb-2">
              <button
                onClick={() => author && navigate(`/users/${author.id}`)}
                className="font-semibold text-sm text-gray-900 dark:text-white hover:underline mr-2 inline-block"
              >
                {author?.fullName}
              </button>
              <span className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{post.content || post.caption}</span>
            </div>
          ) : null}

          {(post.commentCount || 0) > 0 && (
            <button
              onClick={() => navigate(`/posts/${post.id}`)}
              className="text-sm text-gray-500 hover:underline mt-1 block"
            >
              View all {post.commentCount} comment{post.commentCount !== 1 ? 's' : ''}
            </button>
          )}

          <time className="text-xs text-gray-500 block mt-2" dateTime={post.createdAt}>
            {timeAgo(post.createdAt)}
          </time>
        </div>
      )}
    </article>
  );
}

export default function FeedPostWrapper({ post, author, onDelete }) {
  return <FeedPost post={post} author={author} onDelete={onDelete} />;
}