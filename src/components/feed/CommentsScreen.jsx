import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPostById } from '../../services/posts';
import { getCommentsByPost, addComment, likeComment, unlikeComment } from '../../services/comments';
import { getAllUsers } from '../../services/auth';
import TopBar from '../shared/TopBar';
import Avatar from '../shared/Avatar';
import Card from '../shared/Card';
import { Send, Reply, Heart } from 'lucide-react';

function CommentItem({ comment, users, user, _postId, onReply, depth = 0 }) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [liked, setLiked] = useState(comment.likedBy?.includes(user?.id) || false);
  const [likeCount, setLikeCount] = useState(comment.likes || 0);
  const commentAuthor = users.find((u) => u.id === comment.authorId);
  const navigate = useNavigate();

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    await onReply(replyText, comment.id);
    setReplyText('');
    setShowReplyInput(false);
  };

  const handleLike = async () => {
    const prev = liked;
    setLiked(!liked);
    setLikeCount((c) => (prev ? c - 1 : c + 1));
    try {
      if (prev) {
        await unlikeComment(comment.id);
      } else {
        await likeComment(comment.id);
      }
    } catch {
      setLiked(prev);
      setLikeCount((c) => (prev ? c + 1 : c - 1));
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

  const maxDepth = 3;
  const paddingLeft = depth * 16;

  return (
    <div>
      <div className="flex items-start gap-2" style={{ paddingLeft: `${paddingLeft}px` }}>
        <Avatar src={commentAuthor?.avatarUrl} alt={commentAuthor?.fullName} size="sm" />
        <div className="flex-1">
          <div className={`rounded-xl border border-gray-200 dark:border-gray-700 p-3 ${
            depth > 0 ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800'
          }`}>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate(`/users/${comment.authorId}`)} className="text-sm font-medium text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400">
                {commentAuthor?.fullName}
              </button>
              <p className="text-xs text-gray-400 dark:text-gray-500">{timeAgo(comment.createdAt)}</p>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 break-words">{comment.text}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 text-xs transition-colors ${
                  liked
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
                }`}
              >
                <Heart size={12} fill={liked ? 'currentColor' : 'none'} />
                <span>{likeCount}</span>
              </button>
              {depth < maxDepth && (
                <button
                  onClick={() => setShowReplyInput(!showReplyInput)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  <Reply size={12} /> Reply
                </button>
              )}
            </div>
          </div>

          {showReplyInput && depth < maxDepth && (
            <form onSubmit={handleReply} className="flex items-center gap-2 mt-2 ml-6">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${commentAuthor?.fullName}...`}
                autoFocus
                className="flex-1 text-xs bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button type="submit" disabled={!replyText.trim()} className="p-1.5 text-purple-700 dark:text-purple-400 disabled:text-gray-300">
                <Send size={14} />
              </button>
            </form>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-1 space-y-2 border-l border-gray-100 dark:border-gray-700 ml-3 pl-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              users={users}
              user={user}
              postId={_postId}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentsScreen() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState([]);
  const [text, setText] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    Promise.all([getPostById(id), getCommentsByPost(id), getAllUsers()]).then(([p, c, u]) => {
      setPost(p);
      setComments(c);
      setUsers(u);
    });
  }, [id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const getUserById = (userId) => users.find((u) => u.id === userId);
  const author = post ? getUserById(post.authorId) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const newComment = await addComment({ postId: id, authorId: user.id, text });
    setComments((prev) => [...prev, { ...newComment, replies: [] }]);
    setText('');
  };

  const insertReply = (list, parentId, reply) => {
    if (parentId == null) return [...list, { ...reply, replies: [] }];
    return list.map((c) => {
      if (c.id === parentId) return { ...c, replies: insertReply(c.replies || [], parentId, reply) };
      if (c.replies && c.replies.length > 0) {
        return { ...c, replies: insertReply(c.replies, parentId, reply) };
      }
      return c;
    });
  };

  const handleReply = async (text, parentId) => {
    const newReply = await addComment({ postId: id, authorId: user.id, text, parentId });
    setComments((prev) => insertReply(prev, parentId, newReply));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <TopBar title="Comments" showBack />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 flex flex-col">
        {post && (
          <Card className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => navigate(`/users/${post.authorId}`)} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Avatar src={author?.avatarUrl} alt={author?.fullName} size="sm" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">{author?.fullName}</p>
              </button>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{post.content}</p>
          </Card>
        )}

        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              users={users}
              user={user}
              postId={id}
              onReply={handleReply}
              depth={0}
            />
          ))}
          <div ref={scrollRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button type="submit" disabled={!text.trim()} className="p-2 text-purple-700 dark:text-purple-400 disabled:text-gray-300 dark:disabled:text-gray-600">
            <Send size={18} />
          </button>
        </form>
      </main>
    </div>
  );
}
