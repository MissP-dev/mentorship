import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile } from '../../services/auth';
import { uploadFile } from '../../services/upload';
import TopBar from '../shared/TopBar';
import Input from '../shared/Input';
import Button from '../shared/Button';
import Avatar from '../shared/Avatar';
import { CheckCircle, X, Plus, Camera } from 'lucide-react';

export default function MentorProfileSetupScreen() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [expertiseTags, setExpertiseTags] = useState(user?.expertiseTags || []);
  const [tagInput, setTagInput] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [msg, setMsg] = useState('');

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !expertiseTags.includes(tag)) {
      setExpertiseTags((prev) => [...prev, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setExpertiseTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const handleSave = async () => {
    if (!bio.trim() || expertiseTags.length === 0) return;
    setLoading(true);
    try {
      const updates = {
        fullName,
        bio,
        expertiseTags,
        isMentorProfileComplete: true,
      };
      if (avatarFile) {
        updates.avatarUrl = await uploadFile(avatarFile);
      }
      const updated = await updateUserProfile(user.id, updates);
      updateUser(updated);
      setSaved(true);
      setMsg('Profile updated!');
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopBar title={user?.isMentorProfileComplete ? 'Edit Mentor Profile' : 'Mentor Profile Setup'} showBack />
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {saved && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <CheckCircle size={18} className="text-green-600" />
            <p className="text-sm text-green-700 dark:text-green-400">{msg}</p>
          </div>
        )}

        <div className="flex flex-col items-center gap-3">
          <div className="relative group">
            <Avatar src={avatarPreview || user?.avatarUrl} alt={user?.fullName} size="xl" />
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera size={24} className="text-white" />
              <input type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} />
            </label>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">Click to change photo</span>
        </div>

        <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={5}
            placeholder="Tell others about your experience and what you can help with..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expertise Tags</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              placeholder="Add a skill (e.g. React)"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Button type="button" variant="secondary" onClick={addTag}>
              <Plus size={16} />
            </Button>
          </div>
          {expertiseTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {expertiseTags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-sm rounded-full">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-purple-900 dark:hover:text-purple-100">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleSave}
          disabled={loading || !bio.trim() || expertiseTags.length === 0}
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </Button>
      </main>
    </div>
  );
}
