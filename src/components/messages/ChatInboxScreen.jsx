import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getConversations, createConversation } from '../../services/conversations';
import { getAllUsers } from '../../services/auth';
import TopBar from '../shared/TopBar';
import Avatar from '../shared/Avatar';
import Badge from '../shared/Badge';
import Button from '../shared/Button';
import Drawer from '../shared/Drawer';
import { MessageSquare, Users, Briefcase, MoreVertical, Plus, Image, FileText, GraduationCap, BookOpen, Search } from 'lucide-react';

function timeAgo(dateStr) {
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

function ContactInfoDrawer({ conversation, users }) {
  const userId = useAuth().user?.id;
  const isGroup = conversation?.type === 'group';
  const otherId = isGroup ? null : conversation?.participantIds?.find((id) => id !== userId);
  const other = users.find((u) => u.id === otherId);
  const participants = isGroup ? (conversation.participantIds || []).map((id) => users.find((u) => u.id === id)).filter(Boolean) : [];

  const sharedMedia = conversation?.messages?.filter((m) => m.messageType === 'image' || m.messageType === 'document' || m.messageType === 'file') || [];

  return (
    <div className="p-4 space-y-4">
      {isGroup ? (
        <>
          <div className="flex items-center gap-3">
            <Avatar src={conversation.groupIconUrl} alt={conversation.groupName} size="lg" />
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">{conversation.groupName}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">{participants.length} members</p>
            </div>
          </div>
          <div>
            <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Members</h5>
            <div className="space-y-2">
              {participants.map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <Avatar src={p.avatarUrl} alt={p.fullName} size="sm" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">{p.fullName}</span>
                  {p.isMentorProfileComplete ? (
                    <Badge color="purple" className="flex items-center gap-1">
                      <GraduationCap size={10} /> Mentor
                    </Badge>
                  ) : (
                    <Badge color="green" className="flex items-center gap-1">
                      <BookOpen size={10} /> Mentee
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
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
        </>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <Avatar src={other?.avatarUrl} alt={other?.fullName} size="lg" />
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">{other?.fullName}</h4>
              <Badge color={other?.isMentorProfileComplete ? 'purple' : 'green'} className="flex items-center gap-1">
                {other?.isMentorProfileComplete ? <><GraduationCap size={10} /> Mentor</> : <><BookOpen size={10} /> Mentee</>}
              </Badge>
            </div>
          </div>
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
        </>
      )}
    </div>
  );
}

export default function ChatInboxScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('mentees');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedConv, setSelectedConv] = useState(null);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    Promise.all([getConversations(user.id), getAllUsers()])
      .then(([c, u]) => {
        setConversations(c);
        setUsers(u);
      })
      .catch(() => {});
  }, [user.id]);

  const getUserById = (id) => users.find((u) => u.id === id);

  const menteeConvs = conversations.filter((c) => c.type === 'direct' && c.participantIds.some((id) => {
    const u = getUserById(id);
    if (!u || u.isMentorProfileComplete) return false;
    if (searchQuery.trim()) return u.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    return true;
  }));

  const mentorConvs = conversations.filter((c) => c.type === 'direct' && c.participantIds.some((id) => {
    const u = getUserById(id);
    if (!u || !u.isMentorProfileComplete) return false;
    if (searchQuery.trim()) return u.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    return true;
  }));

  const groupConvs = conversations.filter((c) => {
    if (c.type !== 'group') return false;
    if (searchQuery.trim()) return c.groupName?.toLowerCase().includes(searchQuery.toLowerCase());
    return true;
  });

  const openDrawer = (conv) => {
    setSelectedConv(conv);
    setDrawerOpen(true);
  };

  const handleSelectConversation = (conv) => {
    if (conv.type === 'group') {
      navigate(`/messages/group/${conv.id}`);
    } else {
      navigate(`/messages/${conv.id}`);
    }
  };

  const otherMentors = users.filter((u) => u.isMentorProfileComplete && u.id !== user.id);
  const filteredMentors = searchQuery
    ? otherMentors.filter((m) => m.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
    : otherMentors;

  const handleStartChat = async (mentorId) => {
    try {
      const conv = await createConversation({ participantIds: [mentorId] });
      setNewChatOpen(false);
      setSearchQuery('');
      setSelectedMentor(null);
      navigate(`/messages/${conv.id}`);
    } catch (err) {
      console.error('Failed to start chat:', err);
    }
  };

  const renderConversationItem = (conv) => {
    const otherId = conv.participantIds?.find((id) => id !== user.id);
    const other = getUserById(otherId);
    const name = other?.fullName;
    const avatar = other?.avatarUrl;

    return (
      <div
        key={conv.id}
        className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
      >
        <Avatar src={avatar} alt={name} />
        <div className="flex-1 min-w-0" onClick={() => handleSelectConversation(conv)}>
          <div className="flex items-center justify-between">
            <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{name}</p>
            <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2">{timeAgo(conv.lastMessageAt)}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{getLastMessagePreview(conv, user.id)}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); openDrawer(conv); }}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors shrink-0"
        >
          <MoreVertical size={16} className="text-gray-400" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopBar title="Messages" showNotifications />

      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
        <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('mentees')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'mentees'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Users size={16} />
            Mentees
          </button>
          {user?.isMentorProfileComplete && (
            <button
              onClick={() => setActiveTab('mentors')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'mentors'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <Briefcase size={16} />
              Mentors
            </button>
          )}
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'groups'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Users size={16} />
            Groups
          </button>
        </div>

        {user?.isMentorProfileComplete && activeTab === 'mentors' && (
          <div className="mb-3">
            <Button
              onClick={() => setNewChatOpen(true)}
              size="sm"
              className="w-full gap-2"
              variant="secondary"
            >
              <Plus size={14} /> New Mentor Chat
            </Button>
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="mb-3">
            <Button
              onClick={() => navigate('/groups/new')}
              size="sm"
              className="w-full gap-2"
              variant="secondary"
            >
              <Plus size={14} /> New Group
            </Button>
          </div>
        )}

        <div className="space-y-2">
          {activeTab === 'mentees' && menteeConvs.map((conv) => renderConversationItem(conv))}
          {activeTab === 'mentors' && mentorConvs.map((conv) => renderConversationItem(conv))}
          {activeTab === 'groups' && groupConvs.map((conv) => renderConversationItem(conv))}
          {((activeTab === 'mentees' && menteeConvs.length === 0) ||
            (activeTab === 'mentors' && mentorConvs.length === 0) ||
            (activeTab === 'groups' && groupConvs.length === 0)) && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <MessageSquare size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No {activeTab === 'mentors' ? 'mentor' : activeTab === 'groups' ? 'group' : 'mentee'} conversations yet</p>
            </div>
          )}
        </div>
      </div>

      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedConv?.type === 'group' ? 'Group Info' : 'Contact Info'}
      >
        <ContactInfoDrawer conversation={selectedConv} users={users} onClose={() => setDrawerOpen(false)} />
      </Drawer>

      {newChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => { setNewChatOpen(false); setSearchQuery(''); }}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 max-w-md w-full shadow-xl border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Start New Mentor Chat</h3>
              <button onClick={() => { setNewChatOpen(false); setSearchQuery(''); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <MoreVertical size={18} className="text-gray-500" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Search mentors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500 mb-3"
            />
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredMentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => handleStartChat(mentor.id)}
                >
                  <Avatar src={mentor.avatarUrl} alt={mentor.fullName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{mentor.fullName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Mentor</p>
                  </div>
                  <Button size="sm" variant="ghost">Chat</Button>
                </div>
              ))}
              {filteredMentors.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-4">No mentors found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}