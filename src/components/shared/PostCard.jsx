import { Heart, PartyPopper, HandHeart, MessageCircle, Trash2, MoreHorizontal } from 'lucide-react';
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

  return (
    <div className="bg-white dark:bg-[#0d0f17] border border-gray-200 dark:border-[#1e293b] rounded-lg overflow-hidden">
      <div className="p-3 sm:p-4 pb-0">
        <div className="flex items-start gap-2.5">
          <button onClick={() => author && navigate(`/profile`)}>
            <Avatar src={author?.avatarUrl} alt={author?.fullName} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-[#a78bfa] transition-colors cursor-pointer truncate">{author?.fullName}</p>
              <span className="text-gray-400 dark:text-gray-600 text-xs">·</span>
              <span className="text-[11px] text-gray-500 flex-shrink-0">{timeAgo(post.createdAt)}</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">MConnect Member</p>
          </div>
          {isOwner && (
            <button onClick={handleDelete} className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded hover:bg-gray-100 dark:hover:bg-[#1e293b]">
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      <div className="px-3 sm:px-4 py-2.5">
        <p className="text-[13px] text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{post.content}</p>
      </div>

      {post.mediaUrl && post.mediaType === 'image' && (
        <div className="border-t border-gray-100 dark:border-[#1e293b]">
          <img src={post.mediaUrl} alt="Post media" className="w-full object-cover max-h-[500px]" />
        </div>
      )}

      {(reactions.like + reactions.celebrate + reactions.support) > 0 && (
        <div className="px-3 sm:px-4 py-2 flex items-center justify-between text-[11px] text-gray-500">
          <div className="flex items-center gap-1">
            {reactions.like > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center">
                  <Heart size={10} className="text-white" fill="white" />
                </span>
                {reactions.like}
              </span>
            )}
            {reactions.celebrate > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-[18px] h-[18px] bg-yellow-500 rounded-full flex items-center justify-center text-[9px]">
                  🎉
                </span>
                {reactions.celebrate}
              </span>
            )}
            {reactions.support > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-[18px] h-[18px] bg-purple-500 rounded-full flex items-center justify-center text-[9px]">
                  💜
                </span>
                {reactions.support}
              </span>
            )}
          </div>
          {post.commentCount > 0 && (
            <button onClick={() => navigate(`/posts/${post.id}`)} className="hover:text-purple-600 dark:hover:text-[#a78bfa] transition-colors">
              {post.commentCount} comment{post.commentCount !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}

      <div className="border-t border-gray-100 dark:border-[#1e293b] mx-3 sm:mx-4" />

      <div className="px-1 sm:px-2 py-1 flex items-center">
        <button
          onClick={() => handleReaction('like')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-medium transition-colors ${
            userReaction === 'like'
              ? 'text-purple-600 dark:text-[#8b5cf6]'
              : 'text-gray-500 hover:text-purple-600 dark:hover:text-[#a78bfa]'
          }`}
        >
          <Heart size={16} fill={userReaction === 'like' ? 'currentColor' : 'none'} />
          <span className="hidden sm:inline">Like</span>
        </button>
        <button
          onClick={() => handleReaction('celebrate')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-medium transition-colors ${
            userReaction === 'celebrate'
              ? 'text-yellow-500'
              : 'text-gray-500 hover:text-yellow-500'
          }`}
        >
          <PartyPopper size={16} />
          <span className="hidden sm:inline">Celebrate</span>
        </button>
        <button
          onClick={() => handleReaction('support')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-medium transition-colors ${
            userReaction === 'support'
              ? 'text-purple-500 dark:text-[#a78bfa]'
              : 'text-gray-500 hover:text-purple-600 dark:hover:text-[#a78bfa]'
          }`}
        >
          <HandHeart size={16} />
          <span className="hidden sm:inline">Support</span>
        </button>
        <button
          onClick={() => navigate(`/posts/${post.id}`)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-medium text-gray-500 hover:text-purple-600 dark:hover:text-[#a78bfa] transition-colors"
        >
          <MessageCircle size={16} />
          <span className="hidden sm:inline">Comment</span>
        </button>
      </div>
    </div>
  );
}
