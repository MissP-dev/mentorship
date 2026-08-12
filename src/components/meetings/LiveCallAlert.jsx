import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMeetings } from '../../services/meetings';
import Avatar from '../shared/Avatar';
import { Video, Phone, PhoneOff } from 'lucide-react';

const POLL_INTERVAL = 3000;

export default function LiveCallAlert() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [liveCall, setLiveCall] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const dismissedRef = useRef(new Set());

  useEffect(() => {
    if (!user) return undefined;

    const fetchCalls = () => {
      getMeetings()
        .then((meetings) => {
          const joinedMatch = pathname.match(/^\/meetings\/(\d+)\/join/);
          const joinedId = joinedMatch ? Number(joinedMatch[1]) : null;

          const incoming = (meetings || []).find((m) => {
            if (m.status !== 'ongoing') return false;
            if (m.creatorId === user.id) return false;
            if (!(m.participants || []).some((p) => p.userId === user.id)) return false;
            if (joinedId === m.id) return false;
            if (dismissedRef.current.has(m.id)) return false;
            return true;
          });

          setLiveCall(incoming || null);
        })
        .catch(() => {});
    };

    fetchCalls();
    const interval = setInterval(fetchCalls, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [user?.id, pathname]);

  useEffect(() => {
    if (!liveCall) return undefined;
    setElapsed(0);
    const t = setInterval(() => setElapsed((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, [liveCall?.id]);

  if (!liveCall) return null;

  const isVideo = liveCall.type === 'video';

  const handleAnswer = () => {
    dismissedRef.current.add(liveCall.id);
    setLiveCall(null);
    navigate(`/meetings/${liveCall.id}/join`);
  };

  const handleDecline = () => {
    dismissedRef.current.add(liveCall.id);
    setLiveCall(null);
  };

  return (
    <div className="fixed inset-0 z-[80] bg-gradient-to-b from-gray-950 via-[#14102b] to-gray-950 text-white flex flex-col items-center justify-between py-14 px-6">
      <div className="flex flex-col items-center gap-6 pt-6">
        <p className="text-xs text-gray-500 uppercase tracking-[0.3em]">
          MConnect · {isVideo ? 'video call' : 'voice call'}
        </p>
        <div className="relative">
          <span className="absolute inset-0 rounded-full bg-emerald-500/40 animate-ping" />
          <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-pulse" />
          <Avatar
            src={liveCall.creator?.avatarUrl}
            alt={liveCall.creator?.fullName || 'Caller'}
            size="xl"
            className="relative !w-28 !h-28 !text-2xl border-4 border-white/20 shadow-2xl"
          />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">{liveCall.creator?.fullName || 'MConnect User'}</h2>
          <p className="text-gray-400 text-sm mt-2 flex items-center justify-center gap-2">
            {isVideo ? <Video size={15} /> : <Phone size={15} />}
            Calling you…
            {elapsed > 0 && <span className="text-gray-500">· {elapsed}s</span>}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-12 pb-8">
        <button
          onClick={handleDecline}
          className="flex flex-col items-center gap-2"
          title="Decline"
          aria-label="Decline"
        >
          <span className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/40 transition-colors flex items-center justify-center">
            <PhoneOff size={26} />
          </span>
          <span className="text-xs text-gray-300 font-medium">Decline</span>
        </button>
        <button
          onClick={handleAnswer}
          className="flex flex-col items-center gap-2"
          title="Answer"
          aria-label="Answer"
        >
          <span className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-900/40 transition-colors flex items-center justify-center animate-bounce">
            {isVideo ? <Video size={26} /> : <Phone size={26} />}
          </span>
          <span className="text-xs text-emerald-300 font-medium">Answer</span>
        </button>
      </div>
    </div>
  );
}
