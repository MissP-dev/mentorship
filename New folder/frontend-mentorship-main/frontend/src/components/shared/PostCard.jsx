import { Heart, PartyPopper, HandHeart, MessageCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Avatar from './Avatar';
import { useNavigate } from 'react-router-dom';
import { reactToPost, deletePost } from '../../services/posts';
import { useAuth } from '../../context/AuthContext';

export default function PostCard({ post, author, onDelete }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reactions, setReactions] = useState(post.reactions);
  const [userReaction, setUserReaction] = useState(post.userReaction || null);
  const isOwner = user && post.authorId === user.id;

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
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-3 mb-3">
        <Avatar src={author?.avatarUrl} alt={author?.fullName} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 dark:text-white text-sm">{author?.fullName}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo(post.createdAt)}</p>
        </div>
        {isOwner && (
          <button onClick={handleDelete} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
            <Trash2 size={16} />
          </button>
        )}
      </div>
      <p className="text-gray-800 dark:text-gray-200 text-sm mb-3 whitespace-pre-wrap">{post.content}</p>
      {post.mediaUrl && post.mediaType === 'image' && (
        <img src={post.mediaUrl} alt="Post media" className="w-full rounded-lg mb-3 object-cover max-h-80" />
      )}
      <div className="flex items-center gap-4 pt-2 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => handleReaction('like')}
          className={`flex items-center gap-1 text-sm transition-colors ${
            userReaction === 'like'
              ? 'text-red-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
          }`}
        >
          <Heart size={16} fill={userReaction === 'like' ? 'currentColor' : 'none'} />
          <span>{reactions.like}</span>
        </button>
        <button
          onClick={() => handleReaction('celebrate')}
          className={`flex items-center gap-1 text-sm transition-colors ${
            userReaction === 'celebrate'
              ? 'text-yellow-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
          }`}
        >
          <PartyPopper size={16} />
          <span>{reactions.celebrate}</span>
        </button>
        <button
          onClick={() => handleReaction('support')}
          className={`flex items-center gap-1 text-sm transition-colors ${
            userReaction === 'support'
              ? 'text-purple-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
          }`}
        >
          <HandHeart size={16} />
          <span>{reactions.support}</span>
        </button>
        <button
          onClick={() => navigate(`/posts/${post.id}`)}
          className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors ml-auto"
        >
          <MessageCircle size={16} />
          <span>{post.commentCount}</span>
        </button>
      </div>
    </div>
  );
}
