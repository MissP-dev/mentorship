import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getConversationById, getMessages, sendMessage } from '../../services/conversations';
import { getAllUsers } from '../../services/auth';
import TopBar from '../shared/TopBar';
import ChatBubble from '../shared/ChatBubble';
import ChatInput from '../shared/ChatInput';
import Avatar from '../shared/Avatar';

export default function GroupMessageScreen() {
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
      <TopBar showBack>
        <div className="flex items-center gap-3">
          <Avatar src={conversation?.groupIconUrl} alt={conversation?.groupName} size="sm" />
          <div>
            <span className="font-medium text-gray-900 dark:text-white text-sm">{conversation?.groupName}</span>
            <p className="text-xs text-gray-400 dark:text-gray-500">{conversation?.participantIds?.length} members</p>
          </div>
        </div>
      </TopBar>

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
