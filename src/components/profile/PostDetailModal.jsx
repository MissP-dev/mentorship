import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, Repeat2, X, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPostById, reactToPost, deletePost } from '../../services/posts';
import { getCommentsByPost, addComment } from '../../services/comments';
import { getAllUsers } from '../../services/auth';
import Avatar from '../shared/Avatar';

const REPOST_KEY = 'mconnect_reposts';

function loadRepostMap() {
  try {
    return JSON.parse(localStorage.getItem(REPOST_KEY) || '{}');
  } catch {
    return {};
  }
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function PostDetailModal({ post, onClose, onDeleted }) {
  const { user } = useAuth();
  const [details, setDetails] = useState(post);
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [reposted, setReposted] = useState(() => (loadRepostMap()[post.id]?.reposted) ?? (post.userReposted || false));
  const [repostCount, setRepostCount] = useState(() => (loadRepostMap()[post.id]?.count) ?? (post.repostCount || 0));

  useEffect(() => {
    let active = true;
    Promise.all([
      getPostById(post.id).catch(() => null),
      getCommentsByPost(post.id).catch(() => []),
      getAllUsers().catch(() => []),
    ]).then(([p, c, u]) => {
      if (!active) return;
      if (p) setDetails(p);
      setComments(c);
      setUsers(u);
    });
    return () => {
      active = false;
    };
  }, [post.id]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const author = users.find((u) => u.id === (details.authorId ?? details.userId));
  const isOwner = user && details.authorId === user.id;
  const isVideo = details.mediaType === 'video' || details.mediaType === 'reel';
  const mediaUrl = details.mediaUrls?.[0] || details.mediaUrl;
  const totalLikes = (details.reactions?.like || 0) + repostCount;

  const handleReaction = async () => {
    try {
      await reactToPost(details.id, 'like');
      const updated = await getPostById(details.id);
      if (updated) setDetails(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRepost = () => {
    const map = loadRepostMap();
    const entry = map[details.id] || {
      reposted: post.userReposted || false,
      count: post.repostCount || 0,
      post: details,
    };
    const became = !entry.reposted;
    entry.reposted = became;
    entry.count = Math.max(0, entry.count + (became ? 1 : -1));
    entry.post = details;
    map[details.id] = entry;
    try {
      localStorage.setItem(REPOST_KEY, JSON.stringify(map));
    } catch {}
    setReposted(became);
    setRepostCount(entry.count);
    window.dispatchEvent(new CustomEvent('mconnect:reposts-changed'));
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await deletePost(details.id);
      if (onDeleted) onDeleted(details.id);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const c = await addComment({ postId: details.id, authorId: user.id, text: commentText });
      setComments((prev) => [...prev, c]);
      setCommentText('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute top-3 right-3 z-20 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        aria-label="Close"
      >
        <X size={26} />
      </button>

      <div
        className="relative w-full h-full sm:h-auto sm:max-w-3xl sm:max-h-[90vh] bg-white dark:bg-[#0d0f17] sm:rounded-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 overflow-y-auto">
          {/* Author header */}
          <div className="flex items-center gap-3 px-4 py-3">
            <Avatar src={author?.avatarUrl} alt={author?.fullName} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{author?.fullName}</p>
              <time className="text-xs text-gray-500" dateTime={details.createdAt}>{timeAgo(details.createdAt)}</time>
            </div>
            {isOwner && (
              <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-500 transition-colors" aria-label="Delete">
                <Trash2 size={18} />
              </button>
            )}
          </div>

          {/* Media */}
          {mediaUrl && (
            isVideo ? (
              <video
                src={mediaUrl}
                controls
                autoPlay
                className="w-full max-h-[55vh] object-contain bg-black"
                poster={details.thumbnailUrl}
              />
            ) : (
              <img src={mediaUrl} alt="Post media" className="w-full max-h-[55vh] object-contain bg-black" />
            )
          )}

          {/* Caption */}
          {details.content && (
            <div className="px-4 py-2">
              <span className="font-semibold text-sm text-gray-900 dark:text-white mr-2">{author?.fullName}</span>
              <span className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{details.content}</span>
            </div>
          )}

          {/* Action bar */}
          <div className="px-4 py-2 flex items-center gap-4 border-b border-gray-100 dark:border-[#1e293b]">
            <button
              onClick={handleReaction}
              className={`flex items-center gap-1.5 p-1 transition-colors ${
                details.userReaction === 'like'
                  ? 'text-red-500'
                  : 'text-gray-500 hover:text-red-500'
              }`}
              aria-label={details.userReaction === 'like' ? 'Unlike' : 'Like'}
            >
              <Heart
                size={22}
                fill={details.userReaction === 'like' ? 'currentColor' : 'none'}
                strokeWidth={details.userReaction === 'like' ? 0 : 2}
              />
            </button>
            <button className="flex items-center gap-1.5 p-1 text-gray-500" aria-label="Comment">
              <MessageCircle size={22} />
            </button>
            <button
              onClick={handleRepost}
              className={`flex items-center gap-1.5 p-1 transition-colors ${
                reposted ? 'text-green-500' : 'text-gray-500 hover:text-green-500'
              }`}
              aria-label={reposted ? 'Undo repost' : 'Repost'}
            >
              <Repeat2 size={22} />
            </button>
          </div>

          {/* Likes */}
          {totalLikes > 0 && (
            <p className="px-4 pt-3 font-semibold text-sm text-gray-900 dark:text-white">
              {totalLikes} like{totalLikes !== 1 ? 's' : ''}
            </p>
          )}

          {/* Comments */}
          <div className="px-4 py-2 space-y-3">
            {comments.length > 0 ? (
              comments.map((comment) => {
                const commentAuthor = users.find((u) => u.id === comment.authorId);
                return (
                  <div key={comment.id} className="flex items-start gap-2">
                    <Avatar src={commentAuthor?.avatarUrl} alt={commentAuthor?.fullName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 dark:text-gray-200 break-words">
                        <span className="font-semibold text-gray-900 dark:text-white mr-1.5">{commentAuthor?.fullName}</span>
                        {comment.text}
                      </p>
                      <time className="text-xs text-gray-400 block mt-0.5">{timeAgo(comment.createdAt)}</time>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-2 text-center">Be the first to comment.</p>
            )}
          </div>
        </div>

        {/* Comment input */}
        {user && (
          <form
            onSubmit={handleComment}
            className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 dark:border-[#1e293b] bg-white dark:bg-[#0d0f17]"
          >
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 text-sm bg-gray-100 dark:bg-[#1e293b] text-gray-900 dark:text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="p-2 text-purple-700 dark:text-purple-400 disabled:text-gray-300 dark:disabled:text-gray-600"
            >
              <Send size={18} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
