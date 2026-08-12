import { useState } from 'react';
import { X, Tag, Upload } from 'lucide-react';
import Button from '../shared/Button';
import Avatar from '../shared/Avatar';
import { updateUserProfile } from '../../services/auth';
import { uploadFile } from '../../services/upload';

export default function EditProfileModal({ user, onClose, onSaved }) {
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [tagsInput, setTagsInput] = useState((user?.expertiseTags || []).join(', '));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const expertiseTags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 10);
      const payload = { fullName: fullName.trim(), bio: bio.trim(), avatarUrl: avatarUrl.trim(), _skipMentorFlag: true };
      if (expertiseTags.length) payload.expertiseTags = expertiseTags;
      const updated = await updateUserProfile(user.id, payload);
      onSaved(updated);
    } catch {
      setError('Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    try {
      const url = await uploadFile(file);
      setAvatarUrl(url);
    } catch {
      setError('Could not upload avatar. Please try again.');
    } finally {
      setAvatarFile(null);
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-6">
      <div className="w-full max-w-md bg-white dark:bg-[#0d0f17] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#1e293b] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-[#1e293b]">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="flex items-center gap-4">
            <Avatar src={avatarUrl} alt={fullName || 'Profile'} size="xl" />
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Avatar
              </label>
              <div className="flex items-center gap-2">
                <label className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Upload size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{avatarFile ? 'Uploading...' : 'Choose photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={saving}
                  />
                </label>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Remove photo"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {!avatarUrl && (
                <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">Pick a photo to set your avatar.</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-[#1e293b] bg-gray-50 dark:bg-[#161b2b] px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={300}
              placeholder="Tell people about yourself..."
              className="w-full rounded-lg border border-gray-200 dark:border-[#1e293b] bg-gray-50 dark:bg-[#161b2b] px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Expertise Tags
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-[#1e293b] bg-gray-50 dark:bg-[#161b2b] px-3 py-2">
              <Tag size={16} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. React, Career, Leadership"
                className="w-full bg-transparent text-sm text-gray-900 dark:text-white outline-none"
              />
            </div>
            <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">Comma-separated tags.</p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="submit" disabled={saving} className="disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}