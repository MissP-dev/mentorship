import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getConversationById, getMessages, sendMessage, markAsRead } from '../../services/conversations';
import { getAllUsers } from '../../services/auth';
import TopBar from '../shared/TopBar';
import ChatBubble from '../shared/ChatBubble';
import ChatInput from '../shared/ChatInput';
import Avatar from '../shared/Avatar';

export default function MessageScreen() {
  const { id } = useParams();
  const { user } = useAuth();
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
      <TopBar showBack>
        <div className="flex items-center gap-3">
          <Avatar src={other?.avatarUrl} alt={other?.fullName} size="sm" />
          <span className="font-medium text-gray-900 dark:text-white">{other?.fullName}</span>
        </div>
      </TopBar>

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
