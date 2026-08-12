import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getEventById, deleteEvent, updateEvent } from '../../services/events';
import { uploadFile } from '../../services/upload';
import TopBar from '../shared/TopBar';
import Button from '../shared/Button';
import Badge from '../shared/Badge';
import Card from '../shared/Card';
import Avatar from '../shared/Avatar';
import { ArrowLeft, Calendar, MapPin, Clock, Trash2, Edit2, X } from 'lucide-react';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  const isCreator = event?.creatorId === user?.id || event?.creator?.id === user?.id;

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    try {
      const data = await getEventById(id);
      setEvent(data);
      setForm({
        title: data.title || '',
        description: data.description || '',
        location: data.location || '',
        date: data.startAt ? new Date(data.startAt).toISOString().slice(0, 10) : '',
        time: data.startAt ? new Date(data.startAt).toTimeString().slice(0, 5) : '',
        imageUrls: data.imageUrls || [],
      });
    } catch (err) {
      console.error('Failed to load event:', err);
      setError('Event not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const startAt = form.date ? new Date(`${form.date}T${form.time || '00:00'}`).toISOString() : event.startAt;
      await updateEvent(id, {
        title: form.title,
        description: form.description,
        location: form.location,
        startAt,
        imageUrls: form.imageUrls,
      });
      setEditing(false);
      load();
    } catch (err) {
      console.error('Failed to update event:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await deleteEvent(id);
      navigate('/events');
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  const handleAddImage = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5 - form.imageUrls.length);
    if (files.length === 0) return;
    const urls = [];
    for (const f of files) urls.push(await uploadFile(f));
    setForm((p) => ({ ...p, imageUrls: [...(p.imageUrls || []), ...urls] }));
    e.target.value = '';
  };

  const removeImage = (index) => {
    setForm((p) => ({ ...p, imageUrls: p.imageUrls.filter((_, i) => i !== index) }));
  };

  const formatLongDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <TopBar title="Event" showNotifications />
        <main className="max-w-2xl mx-auto px-4 py-4">
          <p className="text-center text-gray-500 dark:text-gray-400 py-16">Loading event...</p>
        </main>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <TopBar title="Event" showNotifications />
        <main className="max-w-2xl mx-auto px-4 py-4 text-center">
          <p className="text-gray-500 dark:text-gray-400 py-16">Event not found.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopBar title="Event Details" showNotifications />
      <main className="max-w-2xl mx-auto px-4 py-4">
        <button
          onClick={() => navigate('/events')}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> All Events
        </button>

        {!editing ? (
          <div className="space-y-4">
            {event.imageUrls?.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {event.imageUrls.slice(0, 2).map((url, i) => (
                  <img key={i} src={url} alt={`${event.title} ${i + 1}`} className="w-full rounded-xl object-cover border border-gray-200 dark:border-gray-700 aspect-video" />
                ))}
              </div>
            )}

            <Card className="p-4 sm:p-6">
              <div className="flex items-start justify-between gap-2 mb-3">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{event.title}</h1>
                {isCreator && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setEditing(true)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Edit Event">
                      <Edit2 size={16} className="text-gray-400" />
                    </button>
                    <button onClick={handleDelete} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete Event">
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span className="flex items-center gap-1.5"><Calendar size={14} />{formatLongDate(event.startAt)}</span>
                {event.location && <span className="flex items-center gap-1.5"><MapPin size={14} />{event.location}</span>}
                <span className="flex items-center gap-1.5"><Clock size={14} />{new Date(event.startAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Avatar src={event.creator?.avatarUrl} alt={event.creator?.fullName} size="sm" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{event.creator?.fullName || 'MConnect'}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Organizer</p>
                </div>
              </div>

              <Badge color="purple" className="mb-4 capitalize">{(event.category || 'academic').replace('-', ' ')}</Badge>

              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">About this event</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {event.description || 'No description provided.'}
                </p>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="p-4 border-purple-200 dark:border-purple-800">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Edit Event</h2>
            <div className="space-y-3">
              <input type="text" placeholder="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500" />
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500" />
                <input type="time" value={form.time} onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))} className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500" />
              </div>
              <input type="text" placeholder="Location" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500" />
              <textarea placeholder="Description" rows={4} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none" />
              <div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.imageUrls.map((url, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      <img src={url} alt={`Event ${i + 1}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(i)} className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 hover:bg-black/80 text-white rounded-full">
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  {form.imageUrls.length < 5 && (
                    <label className="flex items-center justify-center w-16 h-16 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-xs text-gray-400 cursor-pointer hover:border-purple-400 hover:text-purple-600">
                      +
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleAddImage} />
                    </label>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdate} size="sm">Save</Button>
                <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}