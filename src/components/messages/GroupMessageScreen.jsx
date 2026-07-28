import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getConversationById, getMessages, sendMessage } from '../../services/conversations';
import { getAllUsers } from '../../services/auth';
import TopBar from '../shared/TopBar';
import ChatBubble from '../shared/ChatBubble';
import ChatInput from '../shared/ChatInput';
import Avatar from '../shared/Avatar';
import { ArrowLeft, Settings, Phone } from 'lucide-react';

export default function GroupMessageScreen() {
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
    });
  }, [id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getUserById = (userId) => users.find((u) => u.id === userId);

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
        <Avatar src={conversation?.groupIconUrl} alt={conversation?.groupName} size="sm" />
        <div className="flex-1">
          <span className="font-medium text-gray-900 dark:text-white text-sm">{conversation?.groupName}</span>
          <p className="text-xs text-gray-400 dark:text-gray-500">{conversation?.participantIds?.length} members</p>
        </div>
        <button
          onClick={() => navigate(`/groups/${id}/edit`)}
          className="p-2 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Settings size={18} />
        </button>
        <button
          onClick={() => navigate(`/groups/${id}/call`)}
          className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
        >
          <Phone size={18} />
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
    </div>
  );
}
