import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getConversationById, getMessages, sendMessage, markAsRead, updateMessage } from '../../services/conversations';
import { createMeeting } from '../../services/meetings';
import { getAllUsers } from '../../services/auth';
import TopBar from '../shared/TopBar';
import ChatBubble from '../shared/ChatBubble';
import ChatInput from '../shared/ChatInput';
import Avatar from '../shared/Avatar';
import Badge from '../shared/Badge';
import Drawer from '../shared/Drawer';
import { ArrowLeft, FileText, Image, GraduationCap, BookOpen, MoreVertical, Video, Phone } from 'lucide-react';

export default function MessageScreen() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mediaTab, setMediaTab] = useState('all');
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    Promise.all([getConversationById(id), getMessages(id), getAllUsers()]).then(([c, m, u]) => {
      setConversation(c);
      setMessages(m);
      setUsers(u);
      markAsRead(id).catch(() => {});
    });
  }, [id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getUserById = (userId) => users.find((u) => u.id === userId);
  const otherId = conversation?.participantIds?.find((pid) => pid !== user.id);
  const other = getUserById(otherId);

  const handleStartCall = async (type) => {
    if (!conversation || !otherId) return;
    try {
      const meeting = await createMeeting({
        title: `${user.fullName} & ${other?.fullName || 'Mentee'}`,
        description: 'Instant call',
        startAt: new Date().toISOString(),
        type,
        participantIds: [otherId],
        startNow: true,
      });
      navigate(`/meetings/${meeting.id}/join`);
    } catch (err) {
      alert(err.message || 'Only mentors can start a call.');
    }
  };

  const handleSend = async ({ text, file, messageType }) => {
    const newMsg = await sendMessage({ conversationId: id, senderId: user.id, text, file, messageType });
    setMessages((prev) => [...prev, newMsg]);
  };

  const handleEdit = async () => {
    if (!editText.trim() || !editingMessage) return;
    try {
      const updated = await updateMessage(id, editingMessage.id, editText.trim());
      setMessages((prev) => prev.map((m) => m.id === editingMessage.id ? updated : m));
    } catch (err) {
      console.error('Failed to edit message:', err);
    } finally {
      setEditingMessage(null);
      setEditText('');
    }
  };

  const handleEditClick = (msg) => {
    setEditingMessage(msg);
    setEditText(msg.text || '');
  };

  const sharedMedia = (messages || []).filter((m) => m.messageType === 'image' || m.messageType === 'document' || m.messageType === 'file');
  const filteredMedia = mediaTab === 'all' ? sharedMedia : sharedMedia.filter((m) => m.messageType === mediaTab);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col h-screen">
      <TopBar showNotifications={false} />

      <div className="bg-white dark:bg-[#0d0f17] border-b border-gray-200 dark:border-[#1e293b] px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate('/messages')} className="p-1.5 -ml-1.5 hover:bg-gray-100 dark:hover:bg-[#1e293b] rounded-lg transition-colors">
            <ArrowLeft size={18} className="text-gray-500" />
          </button>
          <button onClick={() => setDrawerOpen(true)} className="flex items-center gap-3 min-w-0">
            <Avatar src={other?.avatarUrl} alt={other?.fullName} size="sm" />
            <div className="flex-1 min-w-0 text-left">
              <span className="font-medium text-gray-900 dark:text-white text-sm block truncate">{other?.fullName}</span>
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate flex items-center gap-1">
                {other?.isMentorProfileComplete ? <><GraduationCap size={10} /> Mentor</> : <><BookOpen size={10} /> Mentee</>}
              </p>
            </div>
          </button>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => handleStartCall('video')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#1e293b] rounded-lg transition-colors text-purple-600 dark:text-purple-400" title="Video call" aria-label="Video call">
            <Video size={18} />
          </button>
          <button onClick={() => handleStartCall('audio')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#1e293b] rounded-lg transition-colors text-blue-600 dark:text-blue-400" title="Voice call" aria-label="Voice call">
            <Phone size={18} />
          </button>
          <button onClick={() => setDrawerOpen(true)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#1e293b] rounded-lg transition-colors shrink-0">
            <MoreVertical size={18} className="text-gray-500" />
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 overflow-y-auto">
        <div className="space-y-2">
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              senderName={getUserById(msg.senderId)?.fullName}
              onEdit={handleEditClick}
            />
          ))}
          <div ref={scrollRef} />
        </div>
      </main>

      {editingMessage && (
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center gap-2">
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Edit message..."
              autoFocus
            />
            <button
              onClick={handleEdit}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => { setEditingMessage(null); setEditText(''); }}
              className="px-3 py-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <ChatInput onSend={handleSend} />

      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Contact Info">
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Avatar src={other?.avatarUrl} alt={other?.fullName} size="lg" />
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">{other?.fullName}</h4>
              <Badge color={other?.isMentorProfileComplete ? 'purple' : 'green'} className="flex items-center gap-1">
                {other?.isMentorProfileComplete ? <><GraduationCap size={10} /> Mentor</> : <><BookOpen size={10} /> Mentee</>}
              </Badge>
            </div>
          </div>
          {other && (
            <>
              <div>
                <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">About</h5>
                <p className="text-sm text-gray-700 dark:text-gray-300">{other.bio || 'No bio yet.'}</p>
              </div>
              {(other.expertiseTags || []).length > 0 && (
                <div>
                  <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Expertise</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {other.expertiseTags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={() => navigate(other.isMentorProfileComplete ? `/mentors/${other.id}` : `/users/${other.id}`)}
                className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors"
              >
                View Profile
              </button>
            </>
          )}
          {sharedMedia.length > 0 && (
            <>
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setMediaTab('all')}
                  className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-colors ${mediaTab === 'all' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-500'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setMediaTab('image')}
                  className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-colors ${mediaTab === 'image' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-500'}`}
                >
                  <Image size={12} className="inline mr-1" /> Photos
                </button>
                <button
                  onClick={() => setMediaTab('document')}
                  className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-colors ${mediaTab === 'document' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-500'}`}
                >
                  <FileText size={12} className="inline mr-1" /> Files
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {filteredMedia.map((m, i) => (
                  <div key={i} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    {m.messageType === 'image' ? <Image size={20} className="text-gray-400" /> : <FileText size={20} className="text-gray-400" />}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Drawer>
    </div>
  );
}