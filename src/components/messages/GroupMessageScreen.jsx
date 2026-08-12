import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getConversationById, getMessages, sendMessage } from '../../services/conversations';
import { getAllUsers } from '../../services/auth';
import TopBar from '../shared/TopBar';
import ChatBubble from '../shared/ChatBubble';
import ChatInput from '../shared/ChatInput';
import Avatar from '../shared/Avatar';
import Badge from '../shared/Badge';
import Drawer from '../shared/Drawer';
import { ArrowLeft, MoreVertical, FileText, Image, GraduationCap, BookOpen } from 'lucide-react';

export default function GroupMessageScreen() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    Promise.all([getConversationById(id), getMessages(id), getAllUsers()]).then(([c, m, u]) => {
      setConversation(c);
      setMessages(m);
      setUsers(u);
    });
  }, [id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getUserById = (userId) => users.find((u) => u.id === userId);
  const participants = (conversation?.participantIds || []).map((pid) => getUserById(pid)).filter(Boolean);
  const sharedMedia = (messages || []).filter((m) => m.messageType === 'image' || m.messageType === 'document' || m.messageType === 'file');

  const handleSend = async ({ text, file, messageType }) => {
    const newMsg = await sendMessage({ conversationId: id, senderId: user.id, text, file, messageType });
    setMessages((prev) => [...prev, newMsg]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col h-screen">
      <TopBar showNotifications={false} />

      <div className="bg-white dark:bg-[#0d0f17] border-b border-gray-200 dark:border-[#1e293b] px-4 py-2 flex items-center gap-3">
        <button onClick={() => navigate('/messages')} className="p-1.5 -ml-1.5 hover:bg-gray-100 dark:hover:bg-[#1e293b] rounded-lg transition-colors">
          <ArrowLeft size={18} className="text-gray-500" />
        </button>
        <Avatar src={conversation?.groupIconUrl} alt={conversation?.groupName} size="sm" />
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setDrawerOpen(true)}>
          <span className="font-medium text-gray-900 dark:text-white text-sm block truncate">{conversation?.groupName}</span>
          <p className="text-xs text-gray-400 dark:text-gray-500">{participants.length} members</p>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#1e293b] rounded-lg transition-colors"
        >
          <MoreVertical size={18} className="text-gray-500" />
        </button>
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 overflow-y-auto">
        <div className="space-y-2">
          {messages.map((msg) => {
            const sender = getUserById(msg.senderId);
            return (
              <ChatBubble key={msg.id} message={msg} senderName={sender?.fullName} />
            );
          })}
          <div ref={scrollRef} />
        </div>
      </main>

      <ChatInput onSend={handleSend} />

      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Group Info">
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Avatar src={conversation?.groupIconUrl} alt={conversation?.groupName} size="lg" />
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">{conversation?.groupName}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">{participants.length} members</p>
            </div>
          </div>
          <div>
            <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Members</h5>
            <div className="space-y-2">
              {participants.map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate(p.isMentorProfileComplete ? `/mentors/${p.id}` : `/users/${p.id}`)}
                  className="w-full flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-1 py-0.5 text-left transition-colors"
                >
                  <Avatar src={p.avatarUrl} alt={p.fullName} size="sm" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">{p.fullName}</span>
                  {p.isMentorProfileComplete ? (
                    <Badge color="purple">
                      <GraduationCap size={10} />
                    </Badge>
                  ) : (
                    <Badge color="green">
                      <BookOpen size={10} />
                    </Badge>
                  )}
                  {p.id === user.id && (
                    <Badge color="purple" className="ml-1">You</Badge>
                  )}
                </button>
              ))}
            </div>
          </div>
          {sharedMedia.length > 0 && (
            <>
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
            </>
          )}
        </div>
      </Drawer>
    </div>
  );
}