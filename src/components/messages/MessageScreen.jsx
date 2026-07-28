import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getConversationById, getMessages, sendMessage, markAsRead } from '../../services/conversations';
import { getAllUsers } from '../../services/auth';
import TopBar from '../shared/TopBar';
import ChatBubble from '../shared/ChatBubble';
import ChatInput from '../shared/ChatInput';
import Avatar from '../shared/Avatar';
import { ArrowLeft } from 'lucide-react';

export default function MessageScreen() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
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

  const handleSend = async ({ text, file }) => {
    const newMsg = await sendMessage({ conversationId: id, senderId: user.id, text, file });
    setMessages((prev) => [...prev, newMsg]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <TopBar showNotifications={false} />

      <div className="bg-white dark:bg-[#0d0f17] border-b border-gray-200 dark:border-[#1e293b] px-4 py-2 flex items-center gap-3">
        <button onClick={() => navigate('/messages')} className="p-1.5 -ml-1.5 hover:bg-gray-100 dark:hover:bg-[#1e293b] rounded-lg transition-colors">
          <ArrowLeft size={18} className="text-gray-500" />
        </button>
        <Avatar src={other?.avatarUrl} alt={other?.fullName} size="sm" />
        <span className="font-medium text-gray-900 dark:text-white text-sm">{other?.fullName}</span>
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 overflow-y-auto">
        <div className="space-y-2">
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          <div ref={scrollRef} />
        </div>
      </main>

      <ChatInput onSend={handleSend} />
    </div>
  );
}
