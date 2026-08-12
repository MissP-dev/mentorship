import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getConversationById, updateGroup, addGroupMember, removeGroupMember } from '../../services/conversations';
import { getAllUsers } from '../../services/auth';
import TopBar from '../shared/TopBar';
import Button from '../shared/Button';
import Avatar from '../shared/Avatar';
import Badge from '../shared/Badge';
import { Camera, UserPlus, UserMinus, Check, X } from 'lucide-react';

export default function GroupEditScreen() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [msg, setMsg] = useState('');
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [conv, users] = await Promise.all([getConversationById(id), getAllUsers()]);
      setGroup(conv);
      setGroupName(conv.groupName || '');
      setAllUsers(users);
    } catch (err) {
      console.error('Failed to load group:', err);
    }
  };

  const memberIds = (group?.participants || []).map((p) => p.user?.id ?? p.userId);
  const members = allUsers.filter((u) => memberIds.includes(u.id));
  const nonMembers = allUsers.filter((u) => !memberIds.includes(u.id) && u.id !== user.id);
  const isMentor = user?.isMentorProfileComplete;

  const filteredNonMembers = nonMembers.filter((u) =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRename = async () => {
    if (!groupName.trim() || groupName === group.groupName) return;
    setSavingName(true);
    try {
      await updateGroup(id, { groupName: groupName.trim() });
      setGroup((prev) => ({ ...prev, groupName: groupName.trim() }));
      setMsg('Group name updated!');
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      setMsg(err.message);
    }
    setSavingName(false);
  };

  const handleIconChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIconFile(file);
    setIconPreview(URL.createObjectURL(file));
    setLoading(true);
    try {
      const updated = await updateGroup(id, {}, file);
      setGroup((prev) => ({ ...prev, groupIconUrl: updated.groupIconUrl }));
      setMsg('Group icon updated!');
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      setMsg(err.message);
    }
    setLoading(false);
    setIconFile(null);
  };

  const handleAddMember = async (userId) => {
    try {
      const updated = await addGroupMember(id, userId);
      setGroup(updated);
      setMsg('Member added!');
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      setMsg(err.message);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (userId === user.id) return;
    try {
      const updated = await removeGroupMember(id, userId);
      setGroup(updated);
      setMsg('Member removed!');
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      setMsg(err.message);
    }
  };

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <TopBar title="Edit Group" showBack />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-purple-700 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopBar title="Edit Group" showBack />
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {msg && (
          <p className={`text-sm text-center ${msg.includes('Error') || msg.includes('failed') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            {msg}
          </p>
        )}

        <div className="flex flex-col items-center gap-3">
          <div className="relative group">
            <Avatar src={iconPreview || group.groupIconUrl} alt={group.groupName} size="xl" className="w-20 h-20" />
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera size={20} className="text-white" />
              <input type="file" accept="image/*" className="sr-only" onChange={handleIconChange} disabled={loading} />
            </label>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500">{loading ? 'Uploading...' : 'Click to change icon'}</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Button onClick={handleRename} disabled={savingName || !groupName.trim() || groupName === group.groupName}>
            {savingName ? '...' : 'Rename'}
          </Button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Members ({members.length})</h3>
            {isMentor && (
              <button
                onClick={() => setShowAddMembers(!showAddMembers)}
                className="flex items-center gap-1 text-xs font-medium text-purple-700 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
              >
                <UserPlus size={14} />
                Add
              </button>
            )}
          </div>

          {showAddMembers && (
            <div className="mb-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl space-y-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users to add..."
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredNonMembers.length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">No more users to add</p>
                ) : (
                  filteredNonMembers.map((u) => (
                    <div key={u.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                      <Avatar src={u.avatarUrl} alt={u.fullName} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.fullName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.email}</p>
                      </div>
                      <button
                        onClick={() => handleAddMember(u.id)}
                        className="p-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors"
                      >
                        <UserPlus size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="space-y-1">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <Avatar src={m.avatarUrl} alt={m.fullName} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{m.fullName}</p>
                    {m.isMentorProfileComplete && (
                      <Badge color="purple" className="text-xs">Mentor</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{m.email}</p>
                </div>
                {m.id === user.id ? (
                  <span className="text-xs text-gray-400 dark:text-gray-500">You</span>
                ) : isMentor ? (
                  <button
                    onClick={() => handleRemoveMember(m.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <UserMinus size={14} />
                  </button>
                ) : (
                  <span className="text-xs text-gray-400 dark:text-gray-500 w-9 h-9" />
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
