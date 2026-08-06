import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Send, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getPosts } from '../../services/posts';
import { getAllUsers } from '../../services/auth';
import { getStories, createStory, deleteStory, addStoryComment } from '../../services/stories';
import { useAuth } from '../../context/AuthContext';
import TopBar from '../shared/TopBar';
import PostCard from '../shared/PostCard';
import Avatar from '../shared/Avatar';

function StoryViewer({ stories, startIndex, onClose, user, onDelete }) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [commentText, setCommentText] = useState('');
  const [allStories, setAllStories] = useState(stories);
  const timerRef = useRef(null);

  const story = allStories[currentIndex];
  const comments = story?.comments || [];
  const isOwner = user && story?.userId === user.id;
  const total = allStories.length;

  useEffect(() => {
    setCurrentIndex(startIndex);
  }, [startIndex]);

  useEffect(() => {
    if (!story) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (currentIndex < total - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        onClose();
      }
    }, 6000);
    return () => clearTimeout(timerRef.current);
  }, [currentIndex, total, story, onClose]);

  const goNext = () => {
    clearTimeout(timerRef.current);
    if (currentIndex < total - 1) setCurrentIndex((i) => i + 1);
    else onClose();
  };

  const goPrev = () => {
    clearTimeout(timerRef.current);
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      const comment = await addStoryComment(story.id, commentText.trim());
      setCommentText('');
      setAllStories((prev) =>
        prev.map((s) => s.id === story.id ? { ...s, comments: [...(s.comments || []), comment] } : s)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this story?')) return;
    try {
      await deleteStory(story.id);
      const remaining = allStories.filter((s) => s.id !== story.id);
      if (remaining.length === 0) {
        onDelete(story.id);
        onClose();
      } else {
        setAllStories(remaining);
        if (currentIndex >= remaining.length) setCurrentIndex(remaining.length - 1);
        onDelete(story.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!story) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      <button onClick={onClose} className="absolute top-4 right-4 text-white z-20">
        <X size={28} />
      </button>

      {currentIndex > 0 && (
        <button onClick={goPrev} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-20 bg-black/30 rounded-full p-1">
          <ChevronLeft size={28} />
        </button>
      )}
      {currentIndex < total - 1 && (
        <button onClick={goNext} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-20 bg-black/30 rounded-full p-1">
          <ChevronRight size={28} />
        </button>
      )}

      <div className="relative max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-1 mb-3">
          {allStories.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className={`h-full bg-white rounded-full transition-all duration-300 ${
                  i < currentIndex ? 'w-full' : i === currentIndex ? 'w-full animate-progress' : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Avatar src={story.user?.avatarUrl} alt={story.user?.fullName} size="sm" />
          <span className="text-white text-sm font-medium">{story.user?.fullName}</span>
          <span className="text-white/50 text-xs">
            {Math.max(0, Math.floor((new Date(story.expiresAt) - Date.now()) / 3600000))}h left
          </span>
          {total > 1 && (
            <span className="text-white/40 text-xs ml-auto">{currentIndex + 1}/{total}</span>
          )}
          {isOwner && (
            <button onClick={handleDelete} className="ml-2 text-white/70 hover:text-red-400 transition-colors">
              <Trash2 size={18} />
            </button>
          )}
        </div>

        {story.mediaUrl ? (
          story.mediaType === 'video' ? (
            <video src={story.mediaUrl} controls autoPlay className="w-full rounded-xl max-h-[55vh] object-contain" />
          ) : (
            <img src={story.mediaUrl} alt="Story" className="w-full rounded-xl max-h-[55vh] object-contain" />
          )
        ) : (
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl p-8 min-h-[30vh] flex items-center justify-center">
            <p className="text-white text-xl text-center leading-relaxed">{story.text || story.caption}</p>
          </div>
        )}

        {(story.text || story.caption) && story.mediaUrl && (
          <p className="text-white text-sm mt-2 text-center">{story.text || story.caption}</p>
        )}

        <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
          {comments.map((c) => (
            <div key={c.id} className="flex items-center gap-2">
              <Avatar src={c.author?.avatarUrl} alt={c.author?.fullName} size="sm" className="w-6 h-6" />
              <span className="text-white/80 text-xs font-medium">{c.author?.fullName}</span>
              <span className="text-white/60 text-xs">{c.text}</span>
            </div>
          ))}
        </div>

        {user && (
          <div className="mt-3 flex items-center gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleComment()}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 bg-white/10 text-white text-sm rounded-full placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/30"
            />
            <button onClick={handleComment} className="p-2 text-purple-400 hover:text-purple-300">
              <Send size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function NewStoryModal({ onClose, onSubmit }) {
  const [mode, setMode] = useState('choice');
  const [text, setText] = useState('');
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setMode('media');
    }
  };

  const handleSubmit = () => {
    if (mode === 'text' && text.trim()) {
      onSubmit(null, '', text.trim());
    } else if (file) {
      const mediaType = file.type?.startsWith('video') ? 'video' : 'image';
      onSubmit(file, caption.trim(), '', mediaType);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">New Story</h3>
          <button onClick={onClose}><X size={20} className="text-gray-500" /></button>
        </div>

        {mode === 'choice' && (
          <div className="p-6 space-y-3">
            <button onClick={() => fileRef.current?.click()} className="w-full p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl text-left hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors">
              <p className="text-sm font-medium text-purple-700 dark:text-purple-400">Photo / Video</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Share a moment with your network</p>
            </button>
            <button onClick={() => setMode('text')} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Text</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Share a thought or update</p>
            </button>
            <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />
          </div>
        )}

        {mode === 'text' && (
          <div className="p-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind?"
              rows={6}
              autoFocus
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
            <button
              onClick={handleSubmit}
              disabled={!text.trim()}
              className="mt-3 w-full py-2.5 bg-purple-700 text-white text-sm font-medium rounded-xl hover:bg-purple-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Share
            </button>
          </div>
        )}

        {mode === 'media' && preview && (
          <div className="p-4">
            {file?.type?.startsWith('video') ? (
              <video src={preview} controls className="w-full rounded-xl max-h-64 object-contain" />
            ) : (
              <img src={preview} alt="Preview" className="w-full rounded-xl max-h-64 object-contain" />
            )}
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              className="mt-3 w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleSubmit}
              className="mt-3 w-full py-2.5 bg-purple-700 text-white text-sm font-medium rounded-xl hover:bg-purple-800 transition-colors"
            >
              Share
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SocialFeedScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [stories, setStories] = useState([]);
  const [viewingUserStories, setViewingUserStories] = useState(null);
  const [viewingStartIndex, setViewingStartIndex] = useState(0);
  const [showNewStory, setShowNewStory] = useState(false);

  useEffect(() => {
    Promise.all([getPosts(), getAllUsers(), getStories()]).then(([p, u, s]) => {
      setPosts(p);
      setUsers(u);
      setStories(s);
    });
  }, []);

  const getUserById = (id) => users.find((u) => u.id === id);

  const storiesByUser = {};
  stories.forEach((s) => {
    if (!storiesByUser[s.userId]) storiesByUser[s.userId] = [];
    storiesByUser[s.userId].push(s);
  });

  const myStories = storiesByUser[user?.id] || [];
  const otherUsersStories = Object.keys(storiesByUser)
    .filter((uid) => Number(uid) !== user?.id)
    .map((uid) => ({ userId: Number(uid), stories: storiesByUser[uid], first: storiesByUser[uid][0] }));

  const handleNewStory = async (file, caption, text, mediaType) => {
    try {
      const story = await createStory(file, caption, text, mediaType);
      setStories((prev) => [story, ...prev]);
      setShowNewStory(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStory = async (storyId) => {
    setStories((prev) => prev.filter((s) => s.id !== storyId));
  };

  const openMyStories = () => {
    if (myStories.length > 0) {
      setViewingUserStories(myStories);
      setViewingStartIndex(0);
    } else {
      setShowNewStory(true);
    }
  };

  const openUserStories = (userStories) => {
    setViewingUserStories(userStories);
    setViewingStartIndex(0);
  };

  return (
    <div>
      <TopBar title="Home" showNotifications />
      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="relative">
              <button
                onClick={openMyStories}
                className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  myStories.length > 0
                    ? 'bg-transparent'
                    : 'bg-purple-100 dark:bg-purple-900/40 border-2 border-dashed border-purple-400 dark:border-purple-600'
                }`}
              >
                {myStories.length > 0 ? (
                  myStories[0].mediaUrl ? (
                    <img src={myStories[0].mediaUrl} alt="Your story" className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-gray-950" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-purple-700 flex items-center justify-center border-2 border-white dark:border-gray-950">
                      <span className="text-white text-xs font-bold text-center px-1 line-clamp-2">{(myStories[0].text || myStories[0].caption)?.slice(0, 20)}</span>
                    </div>
                  )
                ) : (
                  <Plus size={24} className="text-purple-600 dark:text-purple-400" />
                )}
              </button>
              {myStories.length > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowNewStory(true); }}
                  className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-gray-950"
                >
                  <Plus size={12} />
                </button>
              )}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-center truncate">
              {myStories.length > 0 ? 'Your story' : 'Add story'}
            </span>
          </div>

          {otherUsersStories.map(({ userId, stories: userStories, first }) => (
            <div key={userId} className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer" onClick={() => openUserStories(userStories)}>
              <div className="p-0.5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                {first.mediaUrl ? (
                  <img src={first.mediaUrl} alt={first.user?.fullName} className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-gray-950" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-purple-700 flex items-center justify-center border-2 border-white dark:border-gray-950">
                    <span className="text-white text-xs font-bold text-center px-1 line-clamp-2">{(first.text || first.caption)?.slice(0, 20)}</span>
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-center truncate">{first.user?.fullName?.split(' ')[0]}</span>
            </div>
          ))}

          {otherUsersStories.length === 0 && myStories.length === 0 && users.filter((u) => u.isMentorProfileComplete).slice(0, 6).map((u) => (
            <div key={u.id} className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="p-0.5 rounded-full bg-gray-200 dark:bg-gray-700">
                <Avatar src={u.avatarUrl} alt={u.fullName} size="md" className="border-2 border-white dark:border-gray-950" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-center truncate">{u.fullName.split(' ')[0]}</span>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} author={getUserById(post.authorId)} onDelete={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))} />
          ))}
          {posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 dark:text-gray-500 text-sm">No posts yet. Be the first to share something!</p>
            </div>
          )}
        </div>
      </main>

      {viewingUserStories && (
        <StoryViewer
          stories={viewingUserStories}
          startIndex={viewingStartIndex}
          onClose={() => { setViewingUserStories(null); setViewingStartIndex(0); }}
          user={user}
          onDelete={handleDeleteStory}
        />
      )}
      {showNewStory && <NewStoryModal onClose={() => setShowNewStory(false)} onSubmit={handleNewStory} />}

      <button
        onClick={() => navigate('/feed/new')}
        className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 w-14 h-14 bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-purple-800 transition-colors z-40"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}
