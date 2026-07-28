import { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getConversationById } from '../../services/conversations';
import { getAllUsers } from '../../services/auth';
import { Phone, PhoneOff } from 'lucide-react';

export default function GroupCallScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const [groupName, setGroupName] = useState('');
  const [connecting, setConnecting] = useState(true);
  const jitsiApi = useRef(null);

  useEffect(() => {
    getConversationById(id).then((conv) => {
      setGroupName(conv.groupName || 'Group Call');
    }).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!iframeRef.current) return;
    const roomName = `mconnect-voice-${id}`;

    const loadJitsi = () => {
      if (window.JitsiMeetExternalAPI) {
        initJitsi();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = initJitsi;
      document.body.appendChild(script);
    };

    const initJitsi = () => {
      try {
        jitsiApi.current = new window.JitsiMeetExternalAPI('meet.jit.si', {
          roomName,
          parentNode: iframeRef.current,
          width: '100%',
          height: '100%',
          configOverrides: {
            startWithVideoMuted: true,
            startAudioMuted: false,
            disableVideo: true,
            disableDeepLinking: true,
            disableInviteFunctions: true,
            prejoinPageEnabled: false,
            toolbarButtons: ['microphone', 'hangup'],
          },
          interfaceConfigOverrides: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            TOOLBAR_ALWAYS_VISIBLE: true,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          },
        });
        setConnecting(false);

        jitsiApi.current.addListener('readyToClose', () => {
          navigate(`/messages/group/${id}`, { replace: true });
        });
      } catch (e) {
        setConnecting(false);
      }
    };

    const timer = setTimeout(loadJitsi, 500);
    return () => { clearTimeout(timer); if (jitsiApi.current) { jitsiApi.current.dispose(); } };
  }, [id, navigate]);

  const handleLeave = () => {
    if (jitsiApi.current) jitsiApi.current.dispose();
    navigate(`/messages/group/${id}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-700 rounded-full flex items-center justify-center">
            <Phone size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">{groupName}</h2>
            <p className="text-xs text-gray-400">Voice call</p>
          </div>
        </div>
        <button
          onClick={handleLeave}
          className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors"
        >
          <PhoneOff size={18} />
        </button>
      </div>

      <div className="flex-1 relative">
        {connecting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400">
            <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Connecting to voice call...</p>
          </div>
        )}
        <div ref={iframeRef} className={`w-full h-full ${connecting ? 'opacity-0' : 'opacity-100'}`} />
      </div>
    </div>
  );
}
