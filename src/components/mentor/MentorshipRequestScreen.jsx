import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createMentorshipRequest } from '../../services/mentorship';
import TopBar from '../shared/TopBar';
import Button from '../shared/Button';
import { CheckCircle } from 'lucide-react';

export default function MentorshipRequestScreen() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [duration, setDuration] = useState('1 month');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createMentorshipRequest({
        mentorId: id,
        menteeId: user.id,
        message,
        duration,
      });
      setSubmitted(true);
      setTimeout(() => navigate('/dashboard', { replace: true }), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <CheckCircle size={64} className="text-green-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Request Sent!</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center">Your mentorship request has been sent. You will be notified when the mentor responds.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopBar title="Request Mentorship" showBack />
      <main className="max-w-lg mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message to Mentor</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Tell the mentor why you want their guidance..."
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mentorship Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="1 month">1 Month</option>
              <option value="3 months">3 Months</option>
              <option value="6 months">6 Months</option>
            </select>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading || !message.trim()}>
            {loading ? 'Sending...' : 'Send Request'}
          </Button>
        </form>
      </main>
    </div>
  );
}
