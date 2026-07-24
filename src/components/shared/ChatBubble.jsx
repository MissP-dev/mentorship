import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileText, Download, X } from 'lucide-react';

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

export default function ChatBubble({ message, senderName }) {
  const { user } = useAuth();
  const isOwn = message.senderId === user?.id;
  const type = message.messageType || 'text';
  const [lightbox, setLightbox] = useState(false);

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

    if (type === 'voice') {
      return (
        <div className="mb-1">
          <audio controls src={message.attachmentUrl} className="w-full max-w-[240px] h-8" style={{ filter: isOwn ? 'invert(1) hue-rotate(180deg)' : 'none' }} />
        </div>
      );
    }

    if (type === 'document') {
      const fileName = message.attachmentUrl.split('/').pop();
      return (
        <a
          href={message.attachmentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 p-2 rounded-lg mb-1 ${
            isOwn ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-600'
          }`}
        >
          <FileText size={20} className={isOwn ? 'text-purple-200' : 'text-gray-500'} />
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
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[80%] px-4 py-2 rounded-2xl ${
          isOwn
            ? 'bg-purple-700 text-white rounded-br-md'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md'
        }`}
      >
        {!isOwn && senderName && (
          <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-0.5">{senderName}</p>
        )}
        {renderAttachment()}
        {message.text && <p className="text-sm">{message.text}</p>}
        {!message.text && message.attachmentUrl && type === 'voice' && (
          <p className="text-xs opacity-60 mt-0.5">Voice message</p>
        )}
        <p className={`text-xs mt-1 ${isOwn ? 'text-purple-200' : 'text-gray-400 dark:text-gray-500'}`}>
          {new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {isOwn && (
            <span className="ml-1.5">
              {message.readAt ? (
                <span className="text-purple-200">Seen {new Date(message.readAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              ) : (
                <span className="opacity-60">Sent</span>
              )}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
