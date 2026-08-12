import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from './Avatar';
import VoiceNotePlayer from './VoiceNotePlayer';
import { FileText, Download, X, MoreVertical, Edit2, Trash2, Clock, Check, CheckCheck } from 'lucide-react';

function ImageLightbox({ src, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors z-10"
      >
        <X size={24} />
      </button>
      <img
        src={src}
        alt="Full size"
        className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

export default function ChatBubble({ message, senderName, senderAvatar, onEdit, onDelete, isGroup = false, deliveryStatus, highlightTerm = '' }) {
  const { user } = useAuth();
  const isOwn = message.senderId === user?.id;
  const type = message.messageType || 'text';
  const [lightbox, setLightbox] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const effectiveStatus =
    deliveryStatus ||
    (message.readAt ? 'read' : message.senderId === user?.id ? 'delivered' : null);

  const renderHighlighted = (text) => {
    if (!highlightTerm.trim()) return text;
    const escaped = highlightTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === highlightTerm.toLowerCase() ? (
        <mark key={i} className="bg-yellow-300 text-black rounded px-0.5">{part}</mark>
      ) : (
        part
      )
    );
  };

  const canEdit = () => {
    if (!isOwn || type !== 'text' || !message.text) return false;
    const sentTime = new Date(message.sentAt).getTime();
    const now = Date.now();
    return now - sentTime < 60 * 60 * 1000;
  };

  const renderAttachment = () => {
    if (!message.attachmentUrl) return null;

    if (type === 'image') {
      return (
        <>
          <img
            src={message.attachmentUrl}
            alt="attachment"
            className="rounded-lg max-w-[280px] max-h-[280px] object-cover mb-1 cursor-pointer"
            onClick={() => setLightbox(true)}
          />
          {lightbox && (
            <ImageLightbox src={message.attachmentUrl} onClose={() => setLightbox(false)} />
          )}
        </>
      );
    }

    if (type === 'voice' || type === 'audio') {
      return <VoiceNotePlayer audioUrl={message.attachmentUrl} isOwn={isOwn} />;
    }

    if (type === 'document') {
      const fileName = message.attachmentUrl.split('/').pop();
      return (
        <a
          href={message.attachmentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 p-2 rounded-lg mb-1 ${
            isOwn ? 'bg-purple-600 dark:bg-purple-700' : 'bg-gray-200 dark:bg-gray-800'
          }`}
        >
          <FileText size={20} className={isOwn ? 'text-purple-200' : 'text-gray-500 dark:text-gray-400'} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{fileName}</p>
          </div>
          <Download size={14} className={isOwn ? 'text-purple-200' : 'text-gray-400'} />
        </a>
      );
    }

    return null;
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end mb-2 group`}>
      <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[80%]`}>
        <Avatar
          src={senderAvatar || (isOwn ? user?.avatarUrl : undefined)}
          alt={isOwn ? 'You' : senderName}
          size="sm"
          className="flex-shrink-0 mb-1"
        />
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwn
              ? 'bg-purple-600 dark:bg-purple-700 text-white rounded-br-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md'
          }`}
        >
        {!isOwn && senderName && (
          <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-0.5">{senderName}</p>
        )}
        {renderAttachment()}
        {message.text && <p className="text-sm break-words">{renderHighlighted(message.text)}</p>}
        {!message.text && message.attachmentUrl && (type === 'voice' || type === 'audio') && (
          <p className="text-xs opacity-60 mt-0.5">Voice message</p>
        )}
        <div className={`text-xs mt-1 flex items-center ${isOwn ? 'text-purple-200' : 'text-gray-400 dark:text-gray-500'}`}>
          {new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {message.editedAt && <span className="mx-1 opacity-60">(edited)</span>}
          {isOwn && !isGroup && (
            <span className="ml-1.5 inline-flex items-center">
              {effectiveStatus === 'sending' && <Clock size={11} className="animate-pulse" />}
              {effectiveStatus === 'sent' && <Check size={12} />}
              {effectiveStatus === 'delivered' && <CheckCheck size={13} />}
              {effectiveStatus === 'read' && <CheckCheck size={13} className="text-sky-300" />}
            </span>
          )}
        </div>
        {isOwn && (
          <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`p-1 rounded-full ${isOwn ? 'bg-purple-700 hover:bg-purple-800' : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700'}`}
            >
              <MoreVertical size={12} className={isOwn ? 'text-white' : 'text-gray-600'} />
            </button>
            {menuOpen && (
              <div className={`absolute right-0 bottom-full mb-1 w-36 rounded-md shadow-lg overflow-hidden z-50 ${
                isOwn ? 'bg-gray-800 text-gray-200' : 'bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
              }`}>
                {canEdit() && onEdit && (
                  <button
                    onClick={() => { onEdit(message); setMenuOpen(false); }}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-xs hover:${isOwn ? 'bg-purple-700' : 'bg-gray-100 dark:bg-gray-800'}`}
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => { onDelete(message); setMenuOpen(false); }}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-red-900/20`}
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
