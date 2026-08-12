import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStories, deleteStory, createStory } from '../../services/stories';
import TopBar from '../shared/TopBar';
import Button from '../shared/Button';
import Card from '../shared/Card';
import Avatar from '../shared/Avatar';
import { Plus, Trash2, X, Image } from 'lucide-react';

export default function StoriesPage() {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createMode, setCreateMode] = useState('choice');
  const [caption, setCaption] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const data = await getStories();
      setStories(data);
    } catch (err) {
      console.error('Failed to load stories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setCreateMode('media');
      setCaption('');
      setText('');
    }
  };

  const handleSubmit = async () => {
    if (createMode === 'text' && text.trim()) {
      try {
        const story = await createStory(null, '', text.trim(), 'text');
        setStories((prev) => [story, ...prev]);
        setShowCreate(false);
        setText('');
        setCreateMode('choice');
        window.dispatchEvent(new CustomEvent('mconnect:content-created', { detail: { type: 'story' } }));
        loadStories();
      } catch (err) {
        console.error(err);
      }
    } else if (file) {
      try {
        const mediaType = file.type?.startsWith('video') ? 'video' : 'image';
        const story = await createStory(file, caption.trim(), '', mediaType);
        setStories((prev) => [story, ...prev]);
        setShowCreate(false);
        setFile(null);
        setPreview(null);
        setCaption('');
        setCreateMode('choice');
        window.dispatchEvent(new CustomEvent('mconnect:content-created', { detail: { type: 'story' } }));
        loadStories();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this story?')) return;
    try {
      await deleteStory(id);
      setStories((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopBar title="Stories" showNotifications />
      <main className="max-w-2xl mx-auto px-4 py-4 pb-20 lg:pb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Stories</h2>
          <Button onClick={() => setShowCreate(true)} size="sm" className="gap-2">
            <Plus size={14} /> New Story
          </Button>
        </div>

        {showCreate && (
          <Card className="mb-4 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Create Story</h3>
              <button onClick={() => { setShowCreate(false); setCreateMode('choice'); setFile(null); setPreview(null); setCaption(''); setText(''); }} className="p-1">
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            {createMode === 'choice' && (
              <div className="space-y-3">
                <label className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors">
                  <Image size={18} className="text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium">Photo / Video</span>
                  <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />
                </label>
                <button
                  onClick={() => setCreateMode('text')}
                  className="w-full text-left p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Text Story
                </button>
              </div>
            )}

            {createMode === 'text' && (
              <div className="space-y-3">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={6}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
                <Button onClick={handleSubmit} disabled={!text.trim()} className="w-full">
                  Share Story
                </Button>
              </div>
            )}

            {createMode === 'media' && (
              <div className="space-y-3">
                {preview && (
                  file?.type?.startsWith('video') ? (
                    <video src={preview} controls className="w-full rounded-xl max-h-64 object-contain" />
                  ) : (
                    <img src={preview} alt="Preview" className="w-full rounded-xl max-h-64 object-contain" />
                  )
                )}
                <input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Button onClick={handleSubmit} disabled={!file} className="w-full">
                  Share Story
                </Button>
              </div>
            )}
          </Card>
        )}

        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">Loading stories...</p>
        ) : (
          <div className="space-y-3">
            {stories.map((story) => (
              <Card key={story.id} className="p-3">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar src={story.user?.avatarUrl} alt={story.user?.fullName} size="sm" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{story.user?.fullName}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{timeAgo(story.createdAt)}</p>
                  </div>
                  {story.userId === user?.id && (
                    <button onClick={() => handleDelete(story.id)} className="p-1 text-gray-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {story.mediaUrl ? (
                  story.mediaType === 'video' ? (
                    <video src={story.mediaUrl} controls className="w-full rounded-lg max-h-[300px] object-contain" />
                  ) : (
                    <img src={story.mediaUrl} alt="Story" className="w-full rounded-lg max-h-[300px] object-cover" />
                  )
                ) : (
                  <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-lg p-6 min-h-[150px] flex items-center justify-center">
                    <p className="text-white text-center">{story.text || story.caption}</p>
                  </div>
                )}

                {(story.text || story.caption) && story.mediaUrl && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{story.text || story.caption}</p>
                )}

                {story.comments && story.comments.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
                    {story.comments.map((comment) => (
                      <div key={comment.id} className="flex items-center gap-1.5 text-xs">
                        <Avatar src={comment.author?.avatarUrl} alt={comment.author?.fullName} size="sm" className="w-5 h-5" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">{comment.author?.fullName}:</span>
                        <span className="text-gray-600 dark:text-gray-400">{comment.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
            {stories.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No stories yet. Be the first to create one!</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
