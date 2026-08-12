import { Plus, MoreHorizontal, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { deleteStory } from '../../services/stories';

function StoryRing({ story, user, onClick, isOwn = false }) {
  const hasUnviewed = story && story.mediaUrl;
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const isOwner = user && story?.userId === user.id;

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm('Delete this story?')) return;
    try {
      await deleteStory(story.id);
      onClick(story.id, 'delete');
    } catch (err) {
      console.error(err);
    }
    setShowMenu(false);
  };

  const handleClick = () => {
    if (isOwn) return;
    onClick(story);
  };

  if (!story) return null;

  return (
    <div className="flex flex-col items-center gap-1.5 flex-shrink-0" ref={menuRef}>
      <div className="relative" onClick={handleClick}>
        <div className="p-[3px] rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 shadow-[0_0_12px_-2px_rgba(236,72,153,0.4)]">
          <div className="relative w-16 h-16 rounded-full bg-white dark:bg-[#0d0f17] flex items-center justify-center ring-[3px] ring-white dark:ring-[#0d0f17] overflow-hidden">
            {story.mediaUrl ? (
              <img src={story.mediaUrl} alt={story.user?.fullName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
                <span className="text-white text-xs font-bold text-center px-1 line-clamp-2">{(story.text || story.caption)?.slice(0, 20)}</span>
              </div>
            )}
            {story.avatarUrl && !story.mediaUrl && (
              <img src={story.avatarUrl} alt="" className="absolute inset-0 w-full h-full rounded-full object-cover" />
            )}
          </div>
        </div>

        {/* Add badge for own story when no stories exist */}
        {isOwn && !hasUnviewed && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick(null, 'create');
            }}
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#8b5cf6] text-white rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#0d0f17] shadow-[0_0_8px_rgba(139,92,246,0.5)]"
            aria-label="Add to your story"
          >
            <Plus size={14} />
          </button>
        )}

        {/* Three dots menu for own stories */}
        {isOwner && hasUnviewed && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="absolute -top-1 -right-1 p-1 bg-white/90 dark:bg-[#1e293b]/90 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors shadow-sm"
              aria-label="Story options"
            >
              <MoreHorizontal size={14} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-[#2d3748] rounded-lg shadow-lg py-1 z-50">
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-[#2d3748] flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <span className="text-[10px] text-gray-500 dark:text-gray-400 w-20 text-center truncate">
        {isOwn ? 'Your story' : story.user?.fullName?.split(' ')[0]}
      </span>
    </div>
  );
}

export default function StoriesBar({ stories, onStoryClick }) {
  const { user: currentUser } = useAuth();
  const scrollRef = useRef(null);

  const storiesByUser = {};
  stories.forEach((s) => {
    if (!storiesByUser[s.userId]) storiesByUser[s.userId] = [];
    storiesByUser[s.userId].push(s);
  });

  const myStories = storiesByUser[currentUser?.id] || [];
  const otherUsersStories = Object.keys(storiesByUser)
    .filter((uid) => Number(uid) !== currentUser?.id)
    .map((uid) => ({ userId: Number(uid), stories: storiesByUser[uid], first: storiesByUser[uid][0] }));

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -120, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 120, behavior: 'smooth' });
  };

  const handleStoryAction = (storyId, action) => {
    if (action === 'delete') {
      onStoryClick?.(storyId, 'delete');
    }
  };

  const handleOpenStory = (story) => {
    if (story) {
      onStoryClick?.(story);
    }
  };

  if (!myStories.length && !otherUsersStories.length) return null;

  return (
    <div className="border-b border-gray-100 dark:border-[#1e293b] bg-white/80 dark:bg-[#0d0f17]/80 backdrop-blur-md sticky top-12 z-30">
      <div className="max-w-[1128px] mx-auto px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={scrollLeft}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            aria-label="Scroll stories left"
          >
            <ChevronLeft size={24} />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide lg:pb-0"
            role="list"
            aria-label="Stories"
          >
            <StoryRing
              story={myStories[0] || null}
              user={currentUser}
              onClick={handleStoryAction}
              isOwn={true}
            />

            {otherUsersStories.map(({ userId, first }) => (
              <StoryRing
                key={userId}
                story={first}
                user={currentUser}
                onClick={handleOpenStory}
                isOwn={false}
              />
            ))}
          </div>

          <button
            onClick={scrollRight}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            aria-label="Scroll stories right"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}