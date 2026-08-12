import { useState, useRef } from 'react';
import { Send, Paperclip, Mic, X, Image, FileText, Loader2, Smile, Lock, Square } from 'lucide-react';
import VoiceNotePlayer from './VoiceNotePlayer';
import { formatAudioTime } from '../../utils/audioWaveform';

const EMOJIS = ['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '🙏', '❤️', '🔥', '🎉', '👏', '💜', '🤝'];

export default function ChatInput({ onSend, disabled = false }) {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [sending, setSending] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [isVoice, setIsVoice] = useState(false);
  const [voiceUrl, setVoiceUrl] = useState(null);
  const fileRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
    e.target.value = '';
  };

  const clearAttachment = () => {
    setFile(null);
    setPreview(null);
    setIsVoice(false);
    if (voiceUrl) URL.revokeObjectURL(voiceUrl);
    setVoiceUrl(null);
  };

  const insertEmoji = (emoji) => {
    setText((prev) => prev + emoji);
  };

  const insertMention = () => {
    setText((prev) => prev + '@');
    setEmojiOpen(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);

      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        clearInterval(recordingTimerRef.current);
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setFile(audioFile);
        setPreview(null);
        setIsVoice(true);
        setVoiceUrl(url);
        setRecording(false);
      };

      mr.start();
      setRecording(true);
    } catch (err) {
      console.error('Microphone access denied', err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    setSending(true);
    try {
      await onSend({ text: text.trim(), file, messageType: isVoice ? 'voice' : undefined });
      setText('');
      clearAttachment();
    } catch (err) {
      console.error(err);
    }
    setSending(false);
  };

  const getFileIcon = () => {
    if (!file) return null;
    if (file.type.startsWith('image/')) return <Image size={14} />;
    return <FileText size={14} />;
  };

  return (
    <form onSubmit={handleSend} className="sticky bottom-0 z-20 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-3">
      <div className="max-w-2xl mx-auto">
        {disabled && (
          <div className="flex items-center justify-center gap-2 py-2 text-sm text-gray-500 dark:text-gray-400">
            <Lock size={14} />
            This conversation is closed
          </div>
        )}
        {!disabled && <>

        {isVoice && file && (
          <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <VoiceNotePlayer audioUrl={voiceUrl} />
            <button type="button" onClick={clearAttachment} className="p-1 text-gray-400 hover:text-red-500 shrink-0">
              <X size={14} />
            </button>
          </div>
        )}

        {!isVoice && file && (
          <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {preview ? (
              <img src={preview} alt="preview" className="w-10 h-10 rounded object-cover" />
            ) : (
              <div className="w-10 h-10 rounded bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600">
                {getFileIcon()}
              </div>
            )}
            <span className="flex-1 text-xs text-gray-600 dark:text-gray-400 truncate">
              {preview ? 'Photo' : 'Document'}
            </span>
            <button type="button" onClick={clearAttachment} className="p-1 text-gray-400 hover:text-red-500">
              <X size={14} />
            </button>
          </div>
        )}

        {recording && (
          <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs text-red-600 dark:text-red-400">
              Recording... {formatAudioTime(recordingSeconds)}
            </span>
            <button
              type="button"
              onClick={stopRecording}
              className="ml-auto p-1.5 text-white bg-red-500 hover:bg-red-600 rounded-full"
              aria-label="Stop recording"
            >
              <Square size={12} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <button
            type="button"
            onClick={insertMention}
            className="px-2.5 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-full transition-colors"
          >
            @ Mention
          </button>
        </div>

        {emojiOpen && (
          <div className="flex items-center gap-1 mb-2 px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg flex-wrap">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => insertEmoji(emoji)}
                className="w-8 h-8 rounded-md text-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <Paperclip size={20} />
          </button>
          <input ref={fileRef} type="file" accept="image/*,application/pdf,.doc,.docx,.txt,.csv,.xlsx" className="hidden" onChange={handleFileSelect} />

          {recording ? (
            <button type="button" onClick={stopRecording} className="p-2 text-red-500 animate-pulse">
              <Mic size={20} />
            </button>
          ) : (
            <button type="button" onClick={startRecording} className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
              <Mic size={20} />
            </button>
          )}

          <button
            type="button"
            onClick={() => setEmojiOpen(!emojiOpen)}
            className={`p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors ${emojiOpen ? 'text-purple-500' : ''}`}
            aria-label="Emoji picker"
          >
            <Smile size={20} />
          </button>

          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={recording ? 'Recording...' : 'Type a message...'}
            disabled={recording}
            className="flex-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || (!text.trim() && !file) || recording}
            className="p-2 bg-purple-600 dark:bg-purple-700 text-white rounded-full disabled:bg-purple-300 dark:disabled:bg-purple-800"
          >
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        </>}
      </div>
    </form>
  );
}
