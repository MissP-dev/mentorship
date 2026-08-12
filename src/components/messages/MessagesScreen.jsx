import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getConversations, getConversationById, getMessages, sendMessage, markAsRead, updateMessage, createConversation } from '../../services/conversations';
import { createMeeting } from '../../services/meetings';
import { getAllUsers } from '../../services/auth';
import { getMentorshipRequestsByMentor, getMentorshipRequestsByMentee } from '../../services/mentorship';
import TopBar from '../shared/TopBar';
import DesktopSidebar from '../shared/DesktopSidebar';
import BottomNav from '../shared/BottomNav';
import Avatar from '../shared/Avatar';
import Badge from '../shared/Badge';
import Drawer from '../shared/Drawer';
import ChatBubble from '../shared/ChatBubble';
import ChatInput from '../shared/ChatInput';
import {
  MessageSquare, Search, MoreVertical, Plus, Image, FileText,
  GraduationCap, BookOpen, ArrowLeft, X, MessageCircle, Video, Phone,
} from 'lucide-react';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function getLastMessagePreview(conv, userId) {
  if (!conv.lastMessage) return 'No messages yet';
  const isOwn = conv.lastMessageSenderId === userId;
  const prefix = conv.type === 'group' ? (isOwn ? 'You: ' : `${conv.lastMessageSenderName?.split(' ')[0]}: `) : (isOwn ? 'You: ' : '');
  if (conv.lastMessageType === 'image') return `${prefix}📷 Photo`;
  if (conv.lastMessageType === 'voice') return `${prefix}🎤 Voice message`;
  if (conv.lastMessageType === 'document') return `${prefix}📎 Document`;
  return `${prefix}${conv.lastMessage}`;
}

function dayLabel(ts) {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(d.getFullYear() !== today.getFullYear() ? { year: 'numeric' } : {}),
  });
}

function ContactInfoDrawer({ conversation, users, userId }) {
  const navigate = useNavigate();
  const isGroup = conversation?.type === 'group';
  const otherId = isGroup ? null : conversation?.participantIds?.find((id) => id !== userId);
  const other = users.find((u) => u.id === otherId);
  const participants = isGroup ? (conversation.participantIds || []).map((id) => users.find((u) => u.id === id)).filter(Boolean) : [];
  const sharedMedia = conversation?.messages?.filter((m) => m.messageType === 'image' || m.messageType === 'document' || m.messageType === 'file') || [];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Avatar src={isGroup ? conversation.groupIconUrl : other?.avatarUrl} alt={isGroup ? conversation.groupName : other?.fullName} size="lg" />
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white">{isGroup ? conversation.groupName : other?.fullName}</h4>
          {isGroup ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">{participants.length} members</p>
          ) : (
            <Badge color={other?.isMentorProfileComplete ? 'purple' : 'green'} className="flex items-center gap-1">
              {other?.isMentorProfileComplete ? <><GraduationCap size={10} /> Mentor</> : <><BookOpen size={10} /> Mentee</>}
            </Badge>
          )}
        </div>
      </div>

      {!isGroup && other && (
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
      {isGroup && (
        <div>
          <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Members</h5>
          <div className="space-y-2">
            {participants.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <Avatar src={p.avatarUrl} alt={p.fullName} size="sm" />
                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">{p.fullName}</span>
                <Badge color={p.isMentorProfileComplete ? 'purple' : 'green'} className="flex items-center gap-1">
                  {p.isMentorProfileComplete ? <><GraduationCap size={10} /> Mentor</> : <><BookOpen size={10} /> Mentee</>}
                </Badge>
                {p.id === userId && <Badge color="purple">You</Badge>}
              </div>
            ))}
          </div>
        </div>
      )}
      {sharedMedia.length > 0 && (
        <div>
          <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Shared Media</h5>
          <div className="grid grid-cols-3 gap-2">
            {sharedMedia.slice(0, 6).map((m, i) => (
              <div key={i} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                {m.messageType === 'image' ? <Image size={20} className="text-gray-400" /> : <FileText size={20} className="text-gray-400" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MessagesScreen() {
  const { id } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isGroup = pathname.startsWith('/messages/group');

  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [menteeIds, setMenteeIds] = useState(new Set());
  const [mentorIds, setMentorIds] = useState(new Set());
  const [activeTab, setActiveTab] = useState('mentees');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const [delivery, setDelivery] = useState({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [threadQuery, setThreadQuery] = useState('');
  const [messagingMentorId, setMessagingMentorId] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    getAllUsers().then(setUsers).catch(() => {});
    getConversations(user.id).then(setConversations).catch(() => {});
    Promise.all([
      getMentorshipRequestsByMentor(user.id),
      getMentorshipRequestsByMentee(user.id),
    ])
      .then(([asMentor, asMentee]) => {
        setMenteeIds(new Set((asMentor || []).map((r) => r.mentee?.id ?? r.menteeId)));
        setMentorIds(new Set((asMentee || []).map((r) => r.mentor?.id ?? r.mentorId)));
      })
      .catch(() => {});
  }, [user.id]);

  useEffect(() => {
    if (!id) {
      setConversation(null);
      setMessages([]);
      return;
    }
    Promise.all([getConversationById(id), getMessages(id)])
      .then(([c, m]) => {
        setConversation(c);
        setMessages(m);
        markAsRead(id).catch(() => {});
      })
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getUserById = (userId) => users.find((u) => u.id === userId);

  const getContactRole = (contact) => {
    if (!contact) return 'mentee';
    if (menteeIds.has(contact.id)) return 'mentee';
    if (mentorIds.has(contact.id)) return 'mentor';
    return contact.isMentorProfileComplete ? 'mentor' : 'mentee';
  };

  const matchesTab = (conv) => {
    if (conv.type === 'group') return activeTab === 'groups';
    const otherId = conv.participantIds?.find((pid) => pid !== user.id);
    const other = getUserById(otherId);
    if (activeTab === 'mentors') return getContactRole(other) === 'mentor';
    if (activeTab === 'mentees') return getContactRole(other) === 'mentee';
    return false;
  };

  const filteredConversations = conversations.filter((c) => {
    const match = matchesTab(c);
    if (!match) return false;
    if (!searchQuery.trim()) return true;
    if (c.type === 'group') return c.groupName?.toLowerCase().includes(searchQuery.toLowerCase());
    const otherId = c.participantIds?.find((pid) => pid !== user.id);
    return getUserById(otherId)?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const mentorContactIds = new Set(
    filteredConversations
      .filter((c) => c.type !== 'group')
      .map((c) => c.participantIds?.find((pid) => pid !== user.id))
  );
  const availableMentors = (users || [])
    .filter((u) => u.id !== user.id && u.isMentorProfileComplete)
    .filter((u) => !searchQuery.trim() || u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || (u.expertiseTags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())))
    .filter((u) => !mentorContactIds.has(u.id));

  const handleSelect = (conv) => {
    if (conv.type === 'group') navigate(`/messages/group/${conv.id}`);
    else navigate(`/messages/${conv.id}`);
  };

  const handleSend = async ({ text, file, messageType }) => {
    const tempId = `temp-${Date.now()}`;
    const temp = { id: tempId, senderId: user.id, text: text || '', messageType: messageType || (file ? (file.type.startsWith('image/') ? 'image' : 'document') : 'text'), sentAt: new Date().toISOString() };
    setDelivery((d) => ({ ...d, [tempId]: 'sending' }));
    setMessages((prev) => [...prev, temp]);
    try {
      const newMsg = await sendMessage({ conversationId: id, senderId: user.id, text, file, messageType });
      setMessages((prev) => prev.map((m) => (m.id === tempId ? newMsg : m)));
      if (newMsg.readAt) {
        setDelivery((d) => ({ ...d, [newMsg.id]: 'read' }));
      } else {
        setDelivery((d) => ({ ...d, [newMsg.id]: 'sent' }));
        setTimeout(() => setDelivery((d) => ({ ...d, [newMsg.id]: 'delivered' })), 900);
      }
    } catch (err) {
      console.error(err);
      setDelivery((d) => ({ ...d, [tempId]: 'sending' }));
      setTimeout(() => setDelivery((d) => ({ ...d, [tempId]: 'delivered' })), 2500);
    }
  };

  const handleMessageMentor = async (mentorId) => {
    setMessagingMentorId(mentorId);
    try {
      const existingConv = conversations.find((c) => {
        if (c.type === 'group') return false;
        return c.participantIds?.includes(mentorId);
      });
      let conv;
      if (existingConv) {
        conv = existingConv;
      } else {
        conv = await createConversation({ participantIds: [mentorId] });
      }
      navigate(`/messages/${conv.id}`);
    } catch (err) {
      console.error('Failed to start conversation:', err);
    } finally {
      setMessagingMentorId(null);
    }
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

  const otherId = conversation?.participantIds?.find((pid) => pid !== user.id);
  const other = getUserById(otherId);
  const participants = (conversation?.participantIds || []).map(getUserById).filter(Boolean);
  const chatTitle = isGroup ? conversation?.groupName : other?.fullName;
  const chatSubtitle = isGroup
    ? `${participants.length} members`
    : other?.isMentorProfileComplete ? 'Mentor' : 'Mentee';

  const handleStartCall = async (type) => {
    if (!conversation) return;
    try {
      const meeting = await createMeeting({
        title: isGroup ? `${conversation.groupName} call` : `${user.fullName} & ${other?.fullName || 'Mentee'}`,
        description: 'Instant call',
        startAt: new Date().toISOString(),
        type,
        participantIds: isGroup ? conversation.participantIds : otherId ? [otherId] : [],
        startNow: true,
      });
      navigate(`/meetings/${meeting.id}/join`);
    } catch (err) {
      alert(err.message || 'Only mentors can start a call.');
    }
  };

  let lastDayKey = '';

  const isFrozen = !isGroup && !!conversation?.frozen;
  const statusFor = (msg) => delivery[msg.id] || (msg.readAt ? 'read' : undefined);
  const qLower = threadQuery.trim().toLowerCase();
  const matchingIds = qLower
    ? new Set(messages.filter((m) => m.text && m.text.toLowerCase().includes(qLower)).map((m) => m.id))
    : null;
  const displayedMessages = matchingIds
    ? messages.filter((m) => matchingIds.has(m.id))
    : messages;

  return (
    <div className="h-dvh overflow-hidden bg-gray-50 dark:bg-gray-950">
      <DesktopSidebar />
      <div className="flex flex-col h-full lg:ml-[220px] pb-14 lg:pb-0">
        <TopBar showNotifications />
        <div className="flex flex-1 min-h-0 overflow-hidden bg-white dark:bg-[#0d0f17]">
          <aside className={`w-full lg:w-[320px] lg:shrink-0 border-r border-gray-200 dark:border-[#1e293b] flex flex-col bg-white dark:bg-[#0d0f17] ${id ? 'hidden lg:flex' : 'flex'}`}>
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white capitalize">{isGroup ? 'groups' : 'messaging'}</h2>
              <button
                onClick={() => navigate('/groups/new')}
                className="p-1.5 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-colors"
                aria-label="New group"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="relative mb-3">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="w-full pl-9 pr-3 py-2 bg-gray-100 dark:bg-zinc-800 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex gap-1 bg-gray-100 dark:bg-zinc-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('mentees')}
                className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'mentees' ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
              >
                Mentees
              </button>
              <button
                onClick={() => setActiveTab('mentors')}
                className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'mentors' ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
              >
                Mentors
              </button>
              <button
                onClick={() => setActiveTab('groups')}
                className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'groups' ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
              >
                Groups
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {filteredConversations.length === 0 && activeTab !== 'mentors' && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <MessageSquare size={36} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">No conversations yet</p>
              </div>
            )}
            {filteredConversations.length === 0 && activeTab === 'mentors' && availableMentors.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <MessageSquare size={36} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">No conversations yet</p>
              </div>
            )}
            {filteredConversations.map((conv) => {
              const convOtherId = conv.participantIds?.find((pid) => pid !== user.id);
              const convOther = getUserById(convOtherId);
              const name = conv.type === 'group' ? conv.groupName : convOther?.fullName;
              const avatar = conv.type === 'group' ? conv.groupIconUrl : convOther?.avatarUrl;
              const active = conv.id === id;
              return (
                <button
                  key={conv.id}
                  onClick={() => handleSelect(conv)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors ${
                    active
                      ? 'bg-purple-100/80 dark:bg-purple-900/30'
                      : 'hover:bg-gray-100 dark:hover:bg-[#1e293b]'
                  }`}
                >
                  <Avatar src={avatar} alt={name} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center min-w-0 gap-1.5">
                        <p className={`font-medium text-sm truncate ${active ? 'text-purple-900 dark:text-purple-200' : 'text-gray-900 dark:text-white'}`}>{name}</p>
                        {conv.type !== 'group' && (
                          <span
                            title={getContactRole(convOther) === 'mentor' ? 'Mentor' : 'Mentee'}
                            className={`flex-shrink-0 ${active ? 'text-purple-700 dark:text-purple-300' : 'text-gray-400 dark:text-gray-500'}`}
                          >
                            {getContactRole(convOther) === 'mentor' ? <GraduationCap size={13} /> : <BookOpen size={13} />}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400 dark:text-gray-500 flex-shrink-0 ml-1">{timeAgo(conv.lastMessageAt)}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {getLastMessagePreview(conv, user.id)}
                    </p>
                  </div>
                </button>
              );
            })}

            {activeTab === 'mentors' && availableMentors.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
                  Available Mentors
                </h4>
                {availableMentors.map((mentor) => (
                  <div
                    key={mentor.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-colors"
                  >
                    <Avatar src={mentor.avatarUrl} alt={mentor.fullName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{mentor.fullName}</p>
                        <GraduationCap size={13} className="text-purple-600 dark:text-purple-400 shrink-0" title="Mentor" />
                      </div>
                      {mentor.bio && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{mentor.bio}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleMessageMentor(mentor.id)}
                      disabled={messagingMentorId === mentor.id}
                      className={`shrink-0 p-1.5 rounded-lg transition-colors ${
                        messagingMentorId === mentor.id
                          ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-wait'
                          : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                      }`}
                      aria-label={`Message ${mentor.fullName}`}
                    >
                      <MessageCircle size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        <section className={`flex-1 flex flex-col h-full min-w-0 bg-gray-50 dark:bg-gray-950 ${!id ? 'hidden lg:flex' : ''}`}>
          {conversation ? (
            <>
              <header className="bg-white dark:bg-[#0d0f17] border-b border-gray-200 dark:border-[#1e293b] px-3 sm:px-4 py-2.5 flex items-center gap-3">
                <button onClick={() => navigate('/messages')} className="lg:hidden p-1.5 hover:bg-gray-100 dark:hover:bg-[#1e293b] rounded-lg transition-colors">
                  <ArrowLeft size={18} className="text-gray-500" />
                </button>
                <button onClick={() => setDrawerOpen(true)} className="flex items-center gap-3 min-w-0 text-left rounded-lg px-1 py-0.5 hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-colors lg:hidden">
                  <Avatar src={isGroup ? conversation.groupIconUrl : other?.avatarUrl} alt={chatTitle} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{chatTitle}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{chatSubtitle}</p>
                  </div>
                </button>
                <button onClick={() => setDrawerOpen(true)} className="flex-1 min-w-0 text-left hidden lg:block">
                  <div className="flex items-center gap-3">
                    <Avatar src={isGroup ? conversation.groupIconUrl : other?.avatarUrl} alt={chatTitle} size="sm" />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{chatTitle}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{chatSubtitle}</p>
                    </div>
                  </div>
                </button>
                <button onClick={() => handleStartCall('video')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#1e293b] rounded-lg transition-colors text-purple-600 dark:text-purple-400" title="Video call" aria-label="Video call">
                  <Video size={18} />
                </button>
                <button onClick={() => handleStartCall('audio')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#1e293b] rounded-lg transition-colors text-blue-600 dark:text-blue-400" title="Voice call" aria-label="Voice call">
                  <Phone size={18} />
                </button>
                <button onClick={() => { setSearchOpen((v) => !v); setThreadQuery(''); }} className={`p-1.5 hover:bg-gray-100 dark:hover:bg-[#1e293b] rounded-lg transition-colors ${searchOpen ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  <Search size={18} />
                </button>
                <button onClick={() => setDrawerOpen(true)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#1e293b] rounded-lg transition-colors text-gray-500 dark:text-gray-400">
                  <MoreVertical size={18} />
                </button>
              </header>

              {searchOpen && (
                <div className="bg-white dark:bg-[#0d0f17] border-b border-gray-200 dark:border-[#1e293b] px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Search size={15} className="text-gray-400 dark:text-gray-500 shrink-0" />
                    <input
                      autoFocus
                      value={threadQuery}
                      onChange={(e) => setThreadQuery(e.target.value)}
                      placeholder="Search in this conversation..."
                      className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none"
                    />
                    {qLower && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                        {matchingIds.size} match{matchingIds.size !== 1 ? 'es' : ''}
                      </span>
                    )}
                    <button onClick={() => { setSearchOpen(false); setThreadQuery(''); }} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}

              <main className="flex-1 overflow-y-auto px-4 py-4">
                <div className="space-y-1">
                  {displayedMessages.map((msg) => {
                    const dayKey = new Date(msg.sentAt).toDateString();
                    const showDivider = dayKey !== lastDayKey;
                    lastDayKey = dayKey;
                    const sender = getUserById(msg.senderId);
                    return (
                      <div key={msg.id}>
                        {showDivider && (
                          <div className="flex justify-center my-3">
                            <span className="px-3 py-1 text-[11px] font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-zinc-800 rounded-full">
                              {dayLabel(msg.sentAt)}
                            </span>
                          </div>
                        )}
                        <ChatBubble
                          message={msg}
                          senderName={sender?.fullName}
                          senderAvatar={sender?.avatarUrl}
                          isGroup={isGroup}
                          deliveryStatus={isGroup ? undefined : statusFor(msg)}
                          highlightTerm={threadQuery.trim()}
                          onEdit={isGroup ? undefined : (m) => { setEditingMessage(m); setEditText(m.text || ''); }}
                        />
                      </div>
                    );
                  })}
                  <div ref={scrollRef} />
                </div>
              </main>

              {editingMessage && (
                <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-100 dark:bg-zinc-800 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="Edit message..."
                      autoFocus
                    />
                    <button onClick={handleEdit} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors">
                      Save
                    </button>
                    <button onClick={() => { setEditingMessage(null); setEditText(''); }} className="px-3 py-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 text-sm font-medium">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <ChatInput onSend={handleSend} disabled={isFrozen} />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center mb-4">
                <MessageSquare size={28} className="text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-medium">Select a conversation</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Choose a chat from the list to start messaging</p>
            </div>
          )}
        </section>
      </div>
      </div>

      <BottomNav />

      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={isGroup ? 'Group Info' : 'Contact Info'}
      >
        <ContactInfoDrawer conversation={conversation} users={users} userId={user.id} />
      </Drawer>
    </div>
  );
}