import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getReels, createReel, likeReel, unlikeReel, deleteReel } from '../../services/reels';
import TopBar from '../shared/TopBar';
import Button from '../shared/Button';
import Card from '../shared/Card';
import Avatar from '../shared/Avatar';
import { Plus, Trash2, Heart, MessageCircle, Share2, X } from 'lucide-react';

export default function ReelsPage() {
  const { user } = useAuth();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');

  useEffect(() => {
    loadReels();
  }, []);

  const loadReels = async () => {
    try {
      const data = await getReels();
      setReels(data);
    } catch (err) {
      console.error('Failed to load reels:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async () => {
    if (file) {
      try {
        const reel = await createReel(file, caption.trim());
        setReels((prev) => [reel, ...prev]);
        setShowCreate(false);
        setFile(null);
        setPreview(null);
        setCaption('');
        window.dispatchEvent(new CustomEvent('mconnect:content-created', { detail: { type: 'reel' } }));
        loadReels();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleLike = async (id, currentlyLiked) => {
    try {
      if (currentlyLiked) {
        await unlikeReel(id);
      } else {
        await likeReel(id);
      }
      setReels((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                likes: r.likes + (currentlyLiked ? -1 : 1),
                likedBy: currentlyLiked
                  ? (r.likedBy || []).filter((uid) => uid !== user?.id)
                  : [...(r.likedBy || []), user?.id],
              }
            : r
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this reel?')) return;
    try {
      await deleteReel(id);
      setReels((prev) => prev.filter((r) => r.id !== id));
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
      <TopBar title="Reels" showNotifications />
      <main className="max-w-2xl mx-auto px-4 py-4 pb-20 lg:pb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Reels</h2>
          <Button onClick={() => setShowCreate(true)} size="sm" className="gap-2">
            <Plus size={14} /> New Reel
          </Button>
        </div>

        {showCreate && (
          <Card className="mb-4 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Create Reel</h3>
              <button
                onClick={() => { setShowCreate(false); setFile(null); setPreview(null); setCaption(''); }}
                className="p-1"
              >
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-3">
              {preview && (
                <video src={preview} controls className="w-full rounded-lg max-h-64 object-contain" />
              )}
              <input
                type="file"
                accept="video/*"
                onChange={handleFile}
                className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-700 file:text-white hover:file:bg-purple-800"
              />
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption..."
                rows={3}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
              <Button onClick={handleSubmit} disabled={!file} className="w-full">
                Share Reel
              </Button>
            </div>
          </Card>
        )}

        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">Loading reels...</p>
        ) : (
          <div className="space-y-4">
            {reels.map((reel) => {
              const isLiked = reel.likedBy?.includes(user?.id);
              return (
                <Card key={reel.id} className="p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar src={reel.user?.avatarUrl} alt={reel.user?.fullName} size="sm" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{reel.user?.fullName}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{timeAgo(reel.createdAt)}</p>
                    </div>
                    {reel.userId === user?.id && (
                      <button onClick={() => handleDelete(reel.id)} className="p-1 text-gray-400 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  {reel.mediaUrl && (
                    <video
                      src={reel.mediaUrl}
                      controls
                      className="w-full rounded-lg max-h-[400px] object-contain mb-2"
                      poster={reel.thumbnailUrl}
                    />
                  )}

                  {reel.caption && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 break-words">{reel.caption}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                    <button
                      onClick={() => handleLike(reel.id, isLiked)}
                      className={`flex items-center gap-1 transition-colors ${
                        isLiked
                          ? 'text-purple-600 dark:text-purple-400'
                          : 'hover:text-purple-600 dark:hover:text-purple-400'
                      }`}
                    >
                      <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
                      <span>{reel.likes || 0}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                      <MessageCircle size={14} />
                      <span>{reel.comments || 0}</span>
                    </button>
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({ title: 'Reel from MConnect', url: window.location.href });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                        }
                      }}
                      className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      <Share2 size={14} />
                      <span>Share</span>
                    </button>
                  </div>
                </Card>
              );
            })}
            {reels.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No reels yet. Create one to share with your network!</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
