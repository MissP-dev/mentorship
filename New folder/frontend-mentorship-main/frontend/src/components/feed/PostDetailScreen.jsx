import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, PartyPopper, HandHeart, MessageCircle, Trash2 } from 'lucide-react';
import { getPostById, reactToPost, deletePost } from '../../services/posts';
import { getCommentsByPost, addComment } from '../../services/comments';
import { getAllUsers } from '../../services/auth';
import { useAuth } from '../../context/AuthContext';
import TopBar from '../shared/TopBar';
import Avatar from '../shared/Avatar';

export default function PostDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState([]);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    Promise.all([getPostById(id), getCommentsByPost(id), getAllUsers()]).then(([p, c, u]) => {
      setPost(p);
      setComments(c);
      setUsers(u);
    });
  }, [id]);

  const getUserById = (userId) => users.find((u) => u.id === userId);
  const author = post ? getUserById(post.authorId) : null;

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await deletePost(post.id);
      navigate('/feed', { replace: true });
    } catch (err) {
      console.error(err);
    }
  };

  const handleReaction = async (type) => {
    const updated = await reactToPost(post.id, type);
    setPost(updated);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newComment = await addComment({ postId: id, authorId: user.id, text: commentText });
    setComments((prev) => [...prev, newComment]);
    setCommentText('');
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-4 border-purple-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopBar title="Post" showBack />
      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar src={author?.avatarUrl} alt={author?.fullName} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white text-sm">{author?.fullName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo(post.createdAt)}</p>
            </div>
            {user && post.authorId === user.id && (
              <button onClick={handleDelete} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                <Trash2 size={16} />
              </button>
            )}
          </div>
          <p className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap mb-3">{post.content}</p>
          {post.mediaUrl && post.mediaType === 'image' && (
            <img src={post.mediaUrl} alt="Post media" className="w-full rounded-lg mb-3 object-cover max-h-80" />
          )}
          <div className="flex items-center gap-4 pt-2 border-t border-gray-100 dark:border-gray-700">
            <button onClick={() => handleReaction('like')} className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">
              <Heart size={16} /> {post.reactions.like}
            </button>
            <button onClick={() => handleReaction('celebrate')} className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">
              <PartyPopper size={16} /> {post.reactions.celebrate}
            </button>
            <button onClick={() => handleReaction('support')} className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">
              <HandHeart size={16} /> {post.reactions.support}
            </button>
            <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 ml-auto">
              <MessageCircle size={16} /> {comments.length}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {comments.map((comment) => {
            const commentAuthor = getUserById(comment.authorId);
            return (
              <div key={comment.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                <div className="flex items-start gap-2">
                  <Avatar src={commentAuthor?.avatarUrl} alt={commentAuthor?.fullName} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{commentAuthor?.fullName}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{timeAgo(comment.createdAt)}</p>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{comment.text}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleComment} className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sticky bottom-0">
          <Avatar src={user?.avatarUrl} alt={user?.fullName} size="sm" />
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="p-2 text-purple-700 dark:text-purple-400 disabled:text-gray-300 dark:disabled:text-gray-600"
          >
            <MessageCircle size={20} />
          </button>
        </form>
      </main>
    </div>
  );
}
