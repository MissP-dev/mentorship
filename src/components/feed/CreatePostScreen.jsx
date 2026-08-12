import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createPost } from '../../services/posts';
import { uploadFile } from '../../services/upload';
import TopBar from '../shared/TopBar';
import Button from '../shared/Button';
import { Image, Film, FileText, X } from 'lucide-react';

export default function CreatePostScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleMediaSelect = (e, type) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
      setMediaType(type);
    }
  };

  const handlePublish = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      let serverMediaUrl = null;
      let serverMediaType = null;
      if (mediaFile) {
        serverMediaUrl = await uploadFile(mediaFile);
        serverMediaType = mediaType;
      }
      await createPost({ authorId: user.id, content, mediaUrl: serverMediaUrl, mediaType: serverMediaType });
      window.dispatchEvent(new CustomEvent('mconnect:content-created', { detail: { type: 'post' } }));
      navigate('/feed', { replace: true });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 dark:text-gray-400">Cancel</button>
        <h1 className="font-semibold text-gray-900 dark:text-white">New Post</h1>
        <Button size="sm" onClick={handlePublish} disabled={loading || !content.trim()}>
          {loading ? '...' : 'Publish'}
        </Button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          autoFocus
          rows={8}
          className="w-full text-gray-800 dark:text-gray-200 text-sm placeholder-gray-400 dark:placeholder-gray-500 bg-transparent resize-none focus:outline-none"
        />

        {mediaPreview && (
          <div className="relative inline-block mt-2">
            {mediaType === 'image' && (
              <img src={mediaPreview} alt="Preview" className="max-h-60 rounded-lg" />
            )}
            <button
              onClick={() => { setMediaFile(null); setMediaPreview(null); setMediaType(null); }}
              className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <label className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
            <Image size={20} className="text-green-600" />
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleMediaSelect(e, 'image')} />
          </label>
          <label className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
            <Film size={20} className="text-blue-600" />
            <input type="file" accept="video/*" className="sr-only" onChange={(e) => handleMediaSelect(e, 'video')} />
          </label>
          <label className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
            <FileText size={20} className="text-orange-600" />
            <input type="file" accept=".pdf,.doc,.docx" className="sr-only" onChange={(e) => handleMediaSelect(e, 'doc')} />
          </label>
        </div>
      </main>
    </div>
  );
}
