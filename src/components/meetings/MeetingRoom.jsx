import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMeetingById, joinMeeting, leaveMeeting } from '../../services/meetings';
import { getToken } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../shared/Avatar';
import {
  PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, VolumeX, Phone,
  MessageCircle, Calendar, Clock, X,
} from 'lucide-react';

export default function MeetingRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meeting, setMeeting] = useState(null);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState(null);
  const [ringing, setRinging] = useState(true);

  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [mutedIds, setMutedIds] = useState(new Set());
  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState('');
  const [started] = useState(Date.now());
  const [localStream, setLocalStream] = useState(null);
  const [noAnswer, setNoAnswer] = useState(false);

  const isVideo = meeting?.type === 'video';

  useEffect(() => {
    if (!meeting) return undefined;
    if (meeting.creatorId !== user?.id) {
      setRinging(false);
      return undefined;
    }
    const otherAnswered = (meeting.activeUserIds || []).some((uid) => uid !== user?.id);
    if (otherAnswered) {
      setRinging(false);
      return undefined;
    }
    const noAnswerTimer = setTimeout(() => setNoAnswer(true), 30000);
    const poll = setInterval(async () => {
      try {
        const fresh = await getMeetingById(id);
        if (!fresh) return;
        setMeeting(fresh);
        const nowAnswered = (fresh.activeUserIds || []).some((uid) => uid !== user?.id);
        if (nowAnswered) setRinging(false);
      } catch (err) {
        console.error(err);
      }
    }, 3000);
    return () => {
      clearInterval(poll);
      clearTimeout(noAnswerTimer);
    };
  }, [id, meeting?.id, user?.id]);

  useEffect(() => {
    if (!isVideo) {
      setLocalStream((prev) => {
        prev?.getTracks().forEach((t) => t.stop());
        return null;
      });
      return undefined;
    }
    if (!navigator.mediaDevices?.getUserMedia) return undefined;
    let stream;
    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({
        video: { width: 640, height: 360 },
        audio: { echoCancellation: true, noiseSuppression: true },
      })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
        } else {
          stream = s;
          setLocalStream(s);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [isVideo]);

  useEffect(() => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach((t) => {
      t.enabled = micOn;
    });
  }, [micOn, localStream]);

  useEffect(() => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach((t) => {
      t.enabled = cameraOn;
    });
  }, [cameraOn, localStream]);

  const streamFor = (m) => (m.id === user?.id && cameraOn ? localStream : null);

  useEffect(() => {
    let active = true;
    getMeetingById(id)
      .then((m) => {
        if (active) setMeeting(m);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Failed to load meeting');
      });
    joinMeeting(id).catch(() => {});

    const beforeUnload = () => {
      const token = getToken();
      if (token) {
        fetch(`/api/meetings/${id}/leave`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          keepalive: true,
        }).catch(() => {});
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => {
      active = false;
      window.removeEventListener('beforeunload', beforeUnload);
      leaveMeeting(id).catch(() => {});
    };
  }, [id]);

  const handleLeave = async () => {
    setLeaving(true);
    try {
      await leaveMeeting(id);
    } catch (err) {
      console.error(err);
    }
    navigate('/meetings', { replace: true });
  };

  const sendChat = (e) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    setChatMessages((prev) => [...prev, { id: Date.now(), text: chatText.trim(), self: true }]);
    setChatText('');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-gray-300 text-sm">{error}</p>
        <button
          onClick={() => navigate('/meetings', { replace: true })}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Back to Meetings
        </button>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-3 text-gray-400">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Joining meeting...</p>
      </div>
    );
  }

  const isLive = meeting.status === 'ongoing';

  const members = [
    {
      id: meeting.creatorId,
      name: meeting.creator?.fullName || 'Host',
      isMentor: meeting.creator?.isMentorProfileComplete,
      avatarUrl: meeting.creator?.avatarUrl,
      isHost: true,
    },
    ...(meeting.participants || []).map((p) => ({
      id: p.userId,
      name: p.user?.fullName || 'Member',
      isMentor: p.user?.isMentorProfileComplete,
      avatarUrl: p.user?.avatarUrl,
    })),
  ];

  const roleTitle = (m) => (m.isHost ? 'Host' : m.isMentor ? 'Mentor' : 'Mentee');

  const otherMember = members.find((m) => m.id !== user?.id) || members[0];
  const isCaller = meeting?.creatorId === user?.id;

  if (ringing && isCaller) {
    return (
      <div className="min-h-screen h-[100dvh] bg-gradient-to-b from-gray-950 via-[#14102b] to-gray-950 text-white flex flex-col items-center justify-between py-14 px-6 overflow-hidden">
        <div className="flex flex-col items-center gap-6 pt-6">
          <div className="relative">
            <span className="absolute inset-0 rounded-full bg-purple-500/40 animate-ping" />
            <span className="absolute inset-0 rounded-full bg-purple-500/20 animate-pulse" />
            <Avatar
              src={otherMember?.avatarUrl}
              alt={otherMember?.name || 'Call'}
              size="xl"
              className="relative !w-28 !h-28 !text-2xl border-4 border-white/20 shadow-2xl"
            />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight">{otherMember?.name || 'MConnect Call'}</h2>
            <p className="text-gray-400 text-sm mt-2 flex items-center justify-center gap-2">
              {noAnswer ? (
                <span className="text-red-400">No answer</span>
              ) : isVideo ? (
                <><Video size={15} /> Video call · Ringing…</>
              ) : (
                <><Phone size={15} /> Voice call · Ringing…</>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-12 pb-8">
          <button
            onClick={() => setMicOn(!micOn)}
            className="flex flex-col items-center gap-2"
            title="Mic"
            aria-label="Mic"
          >
            <span className={`w-16 h-16 rounded-full transition-colors flex items-center justify-center ${micOn ? 'bg-zinc-700 hover:bg-zinc-600 text-white' : 'bg-red-500/80 hover:bg-red-500 text-white'}`}>
              {micOn ? <Mic size={24} /> : <MicOff size={24} />}
            </span>
            <span className="text-xs text-gray-300 font-medium">{micOn ? 'Mute' : 'Unmute'}</span>
          </button>
          <button
            onClick={() => navigate('/meetings', { replace: true })}
            className="flex flex-col items-center gap-2"
            title="End call"
            aria-label="End call"
          >
            <span className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/40 transition-colors flex items-center justify-center">
              <PhoneOff size={24} />
            </span>
            <span className="text-xs text-red-300 font-medium">End</span>
          </button>
        </div>
      </div>
    );
  }

  const toggleMicFor = (memId) => {
    if (memId === user?.id) {
      setMicOn((v) => !v);
      return;
    }
    setMutedIds((prev) => {
      const next = new Set(prev);
      if (next.has(memId)) next.delete(memId);
      else next.add(memId);
      return next;
    });
  };

  const isMuted = (memId) => (memId === user?.id ? !micOn : mutedIds.has(memId));

  const elapsed = () => {
    const secs = Math.floor((Date.now() - started) / 1000);
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className={`min-h-screen h-[100dvh] overflow-hidden relative ${isVideo ? 'bg-black' : 'bg-gray-100 dark:bg-gray-950'}`}>
      {/* Header */}
      <header className={`relative z-20 backdrop-blur border-b ${isVideo ? 'bg-gray-900/90 border-gray-800' : 'bg-white/90 dark:bg-gray-900/90 border-gray-200 dark:border-gray-800'} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isVideo ? 'bg-purple-600' : 'bg-blue-600'}`}>
            <Video size={16} className="text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{meeting.title}</h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              {isLive ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Live · {elapsed()}
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />{meeting.status}
                </>
              )}
            </p>
          </div>
        </div>
      </header>

      {/* ========= Audio call mode ========= */}
      {!isVideo && (
        <main className="h-[calc(100dvh-57px-76px)] overflow-y-auto px-4 py-6">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center justify-center gap-2 mb-6 text-gray-500 dark:text-gray-400 text-sm">
              <Calendar size={13} />
              {new Date(meeting.startAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              <Clock size={13} className="ml-3" />
              {new Date(meeting.startAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => toggleMicFor(m.id)}
                  className="bg-gray-100 dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 rounded-2xl p-6 flex flex-col items-center transition-transform hover:scale-[1.02] cursor-pointer"
                >
                  <div className="relative mb-2">
                    <Avatar
                      src={m.avatarUrl}
                      alt={m.name}
                      size="xl"
                      className={isMuted(m.id) ? 'opacity-60' : ''}
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-gray-900 ${
                        isMuted(m.id) ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                      }`}
                    >
                      {isMuted(m.id) ? <MicOff size={13} /> : <Mic size={13} />}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm truncate w-full text-center">{m.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{roleTitle(m)}</p>
                </button>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* ========= Video mode ========= */}
      {isVideo && (
        <main className="flex h-[calc(100dvh-57px-76px)]">
          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {members.map((m) => (
                <div key={m.id} className="relative aspect-video bg-gray-100 dark:bg-zinc-800 rounded-xl overflow-hidden">
                  {streamFor(m) ? (
                    <video
                      ref={(el) => {
                        if (el && el.srcObject !== streamFor(m)) el.srcObject = streamFor(m);
                      }}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-zinc-800">
                      <Avatar src={m.avatarUrl} alt={m.name} size="xl" className="w-20 h-20" />
                    </div>
                  )}
                  <span className="absolute bottom-2 left-2 text-xs text-white font-medium bg-black/50 rounded-md px-2 py-1 flex items-center gap-1.5">
                    {m.name}
                    {isMuted(m.id) && <MicOff size={11} className="text-red-400" />}
                  </span>
                  {m.id === user?.id && (
                    <span className="absolute top-2 left-2 text-[10px] font-semibold text-white/90 bg-black/40 rounded px-2 py-0.5">You</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {chatOpen && (
            <aside className="w-full sm:w-80 shrink-0 bg-gray-900 border-l border-gray-800 flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <h3 className="text-sm font-semibold text-white">In-call chat</h3>
                <button onClick={() => setChatOpen(false)} className="p-1 text-gray-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {chatMessages.length === 0 && (
                  <p className="text-xs text-gray-500 text-center py-8">No messages yet</p>
                )}
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.self ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-3 py-1.5 rounded-lg text-xs ${msg.self ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-200'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendChat} className="p-3 border-t border-gray-800 flex gap-2">
                <input
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-800 text-gray-200 text-sm placeholder-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <button type="submit" className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg">Send</button>
              </form>
            </aside>
          )}
        </main>
      )}

      {/* Floating controls */}
      <div className="relative z-20 h-[76px] flex items-center justify-center bg-transparent px-4">
        <div className="flex items-center gap-3 sm:gap-4 bg-black/85 dark:bg-gray-900/95 backdrop-blur rounded-2xl px-4 sm:px-5 py-3 shadow-2xl border border-gray-700">
          {isVideo && (
            <>
              <ControlButton
                onClick={() => setCameraOn(!cameraOn)}
                icon={cameraOn ? <Video size={18} /> : <VideoOff size={18} />}
                active={cameraOn}
                danger={!cameraOn}
                label="Camera"
              />
              <Divider />
            </>
          )}

          <ControlButton
            onClick={() => setMicOn(!micOn)}
            icon={micOn ? <Mic size={18} /> : <MicOff size={18} />}
            active={micOn}
            danger={!micOn}
            label="Mic"
          />

          {isVideo ? (
            <>
              <Divider />
              <ControlButton
                onClick={() => setChatOpen(!chatOpen)}
                icon={<MessageCircle size={18} />}
                active={chatOpen}
                label="Chat"
              />
            </>
          ) : (
            <>
              <Divider />
              <ControlButton
                onClick={() => setSpeakerOn(!speakerOn)}
                icon={speakerOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
                active={speakerOn}
                danger={!speakerOn}
                label="Speaker"
              />
            </>
          )}

          <Divider />
          <button
            onClick={handleLeave}
            disabled={leaving}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#654321] hover:bg-[#52361b] disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <PhoneOff size={18} />
            {leaving ? 'Leaving...' : 'End Call'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="w-px h-8 bg-gray-600 hidden sm:block" />;
}

function ControlButton({ onClick, icon, active = true, danger = false, label }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`p-3 rounded-full transition-colors ${
        danger
          ? 'text-red-400 bg-red-500/10 hover:bg-red-500/25'
          : active
            ? 'text-white bg-zinc-600 hover:bg-zinc-500'
            : 'text-gray-500 hover:bg-gray-700'
      }`}
    >
      {icon}
    </button>
  );
}