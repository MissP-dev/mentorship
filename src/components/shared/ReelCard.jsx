import { Heart, MessageCircle, Share2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Avatar from './Avatar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { likeReel, unlikeReel, deleteReel } from '../../services/reels';

export default function ReelCard({ reel, author, onDelete }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [likes, setLikes] = useState(reel.likes || 0);
  const [liked, setLiked] = useState(reel.likedBy?.includes(user?.id) || false);
  const isOwner = user && reel.userId === user.id;

  const handleLike = async () => {
    const prevLiked = liked;
    const prevLikes = likes;
    setLiked(!liked);
    setLikes((l) => (liked ? l - 1 : l + 1));
    try {
      if (liked) {
        await unlikeReel(reel.id);
      } else {
        await likeReel(reel.id);
      }
    } catch {
      setLiked(prevLiked);
      setLikes(prevLikes);
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
    if (!confirm('Delete this reel?')) return;
    try {
      await deleteReel(reel.id);
      if (onDelete) onDelete(reel.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'MConnect Reel',
        text: reel.caption,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
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
              <span className="text-[11px] text-gray-500 flex-shrink-0">{timeAgo(reel.createdAt)}</span>
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

      {reel.mediaUrl && (
        <div className="border-t border-gray-100 dark:border-[#1e293b]">
          <video
            src={reel.mediaUrl}
            controls
            className="w-full rounded-none max-h-[500px] object-contain"
            poster={reel.thumbnailUrl}
          />
        </div>
      )}

      {reel.caption && (
        <div className="px-3 sm:px-4 py-2.5">
          <p className="text-[13px] text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{reel.caption}</p>
        </div>
      )}

      {(likes > 0 || (reel.comments || 0) > 0) && (
        <div className="px-3 sm:px-4 py-2 flex items-center justify-between text-[11px] text-gray-500">
          <div className="flex items-center gap-1">
            {likes > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center">
                  <Heart size={10} className="text-white" fill="white" />
                </span>
                {likes}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {reel.comments > 0 && (
              <button onClick={() => navigate(`/reels/${reel.id}`)} className="hover:text-purple-600 dark:hover:text-[#a78bfa] transition-colors">
                {reel.comments} comment{reel.comments !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="border-t border-gray-100 dark:border-[#1e293b] mx-3 sm:mx-4" />

      <div className="px-1 sm:px-2 py-1 flex items-center">
        <button
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-medium transition-colors ${
            liked
              ? 'text-purple-600 dark:text-[#8b5cf6]'
              : 'text-gray-500 hover:text-purple-600 dark:hover:text-[#a78bfa]'
          }`}
        >
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          <span className="hidden sm:inline">Like</span>
        </button>
        <button
          onClick={() => navigate(`/reels/${reel.id}`)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-medium text-gray-500 hover:text-purple-600 dark:hover:text-[#a78bfa] transition-colors"
        >
          <MessageCircle size={16} />
          <span className="hidden sm:inline">Comment</span>
        </button>
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-medium text-gray-500 hover:text-purple-600 dark:hover:text-[#a78bfa] transition-colors"
        >
          <Share2 size={16} />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>
    </div>
  );
}