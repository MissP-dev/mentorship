import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSessionById, updateSession } from '../../services/sessions';
import TopBar from '../shared/TopBar';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Badge from '../shared/Badge';
import { Video, X } from 'lucide-react';

export default function SessionScreen() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    getSessionById(id).then(setSession);
  }, [id]);

  const handleJoinCall = () => {
    if (session?.videoCallUrl) {
      window.open(session.videoCallUrl, '_blank');
    } else {
      alert('Video call would launch here');
    }
  };

  const handleCancel = async () => {
    await updateSession(id, { status: 'cancelled' });
    setSession((prev) => ({ ...prev, status: 'cancelled' }));
    setShowCancelModal(false);
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-4 border-purple-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statusColors = { upcoming: 'green', completed: 'gray', cancelled: 'red' };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopBar title="Session" showBack />
      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{session.title}</h2>
              <Badge color={statusColors[session.status]}>{session.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Date</p>
                <p className="font-medium text-gray-900 dark:text-white">{session.date}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Time</p>
                <p className="font-medium text-gray-900 dark:text-white">{session.time}</p>
              </div>
            </div>
          </div>
        </Card>

        {session.status === 'upcoming' && (
          <div className="space-y-3">
            <Button className="w-full" size="lg" onClick={handleJoinCall}>
              <Video size={18} className="mr-2" /> Join Video Call
            </Button>
            <Button className="w-full" variant="secondary" onClick={() => alert('Reschedule feature coming soon')}>
              Reschedule
            </Button>
            <Button className="w-full" variant="ghost" onClick={() => setShowCancelModal(true)}>
              Cancel Session
            </Button>
          </div>
        )}

        {showCancelModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">Cancel Session?</h3>
                <button onClick={() => setShowCancelModal(false)} className="text-gray-500 dark:text-gray-400"><X size={20} /></button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Are you sure you want to cancel this session? This action cannot be undone.</p>
              <div className="flex gap-3">
                <Button className="flex-1" variant="danger" onClick={handleCancel}>Yes, Cancel</Button>
                <Button className="flex-1" variant="secondary" onClick={() => setShowCancelModal(false)}>Go Back</Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
