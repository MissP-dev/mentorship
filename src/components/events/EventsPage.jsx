import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../../services/events';
import { uploadFile } from '../../services/upload';
import TopBar from '../shared/TopBar';
import Button from '../shared/Button';
import Badge from '../shared/Badge';
import Card from '../shared/Card';
import { Plus, Calendar, MapPin, Users, Clock, ChevronRight, Trash2, Edit2, Search, ImagePlus, X } from 'lucide-react';

const MAX_IMAGES = 5;

export default function EventsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', location: '', description: '' });
  const [imageItems, setImageItems] = useState([]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.title.trim()) return;
    try {
      const imageUrls = await uploadPendingImages();
      const start = newEvent.date
        ? new Date(`${newEvent.date}T${newEvent.time || '12:00'}`)
        : new Date();
      await createEvent({
        ...newEvent,
        startAt: start.toISOString(),
        endAt: null,
        category: 'academic',
        imageUrls,
      });
      setNewEvent({ title: '', date: '', time: '', location: '', description: '' });
      setImageItems([]);
      setShowCreate(false);
      loadEvents();
    } catch (err) {
      console.error('Failed to create event:', err);
      window.alert('Could not create event. You can still upload up to 5 optional images.');
    }
  };

  const handleUpdateEvent = async (id) => {
    if (!editingEvent?.title) return;
    try {
      const imageUrls = await uploadPendingImages();
      await updateEvent(id, {
        title: editingEvent.title,
        description: editingEvent.description,
        location: editingEvent.location,
        startAt: new Date(`${editingEvent.date}T${editingEvent.time || '00:00'}`).toISOString(),
        imageUrls,
      });
      setEditingEvent(null);
      setImageItems([]);
      setShowCreate(false);
      loadEvents();
    } catch (err) {
      console.error('Failed to update event:', err);
    }
  };

  const uploadPendingImages = async () => {
    const urls = [];
    for (const item of imageItems) {
      if (item.file) {
        urls.push(await uploadFile(item.file));
      } else {
        urls.push(item.url);
      }
    }
    return urls.slice(0, MAX_IMAGES);
  };

  const handleImageSelect = (e) => {
    const room = MAX_IMAGES - imageItems.length;
    const files = Array.from(e.target.files || []).slice(0, room);
    if (files.length === 0) return;
    setImageItems((prev) => [
      ...prev,
      ...files.map((f) => ({ url: URL.createObjectURL(f), file: f })),
    ]);
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImageItems((prev) => prev.filter((_, i) => i !== index));
  };

  const openCreate = () => {
    setEditingEvent(null);
    setImageItems([]);
    setNewEvent({ title: '', date: '', time: '', location: '', description: '' });
    setShowCreate(true);
  };

  const openEdit = (event) => {
    setEditingEvent(event);
    setImageItems((event.imageUrls || []).map((url) => ({ url })));
    setShowCreate(true);
  };

  const closeForm = () => {
    setShowCreate(false);
    setEditingEvent(null);
    setImageItems([]);
  };

  const handleDeleteEvent = async (id) => {
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredEvents = searchQuery.trim()
    ? events.filter((e) => e.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    : events;

  const isCreator = (event) => event.creatorId === user?.id || event.creator?.id === user?.id;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopBar title="Events" showNotifications />
      <main className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Events</h2>
          <Button onClick={openCreate} size="sm" className="gap-2">
            <Plus size={14} /> New Event
          </Button>
        </div>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        {showCreate && (
          <Card className="mb-4 p-4 border-purple-200 dark:border-purple-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Event title"
                value={editingEvent ? editingEvent.title : newEvent.title}
                onChange={(e) => {
                  const val = e.target.value;
                  if (editingEvent) setEditingEvent((p) => ({ ...p, title: val }));
                  else setNewEvent((p) => ({ ...p, title: val }));
                }}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={editingEvent ? editingEvent.date?.split('T')[0] : newEvent.date}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (editingEvent) setEditingEvent((p) => ({ ...p, date: val }));
                    else setNewEvent((p) => ({ ...p, date: val }));
                  }}
                  className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <input
                  type="time"
                  value={editingEvent ? editingEvent.time || '' : newEvent.time}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (editingEvent) setEditingEvent((p) => ({ ...p, time: val }));
                    else setNewEvent((p) => ({ ...p, time: val }));
                  }}
                  className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <input
                type="text"
                placeholder="Location"
                value={editingEvent ? editingEvent.location || '' : newEvent.location}
                onChange={(e) => {
                  const val = e.target.value;
                  if (editingEvent) setEditingEvent((p) => ({ ...p, location: val }));
                  else setNewEvent((p) => ({ ...p, location: val }));
                }}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <textarea
                placeholder="Description"
                value={editingEvent ? editingEvent.description || '' : newEvent.description}
                onChange={(e) => {
                  const val = e.target.value;
                  if (editingEvent) setEditingEvent((p) => ({ ...p, description: val }));
                  else setNewEvent((p) => ({ ...p, description: val }));
                }}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                rows={3}
              />
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">
                  Event Images ({imageItems.length}/{MAX_IMAGES})
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {imageItems.map((item, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      <img src={item.url} alt={`Event image ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                        aria-label="Remove image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                {imageItems.length < MAX_IMAGES && (
                  <label className="mt-2 flex items-center justify-center gap-2 px-3 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer transition-colors">
                    <ImagePlus size={16} />
                    Upload images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={editingEvent ? () => handleUpdateEvent(editingEvent.id) : handleCreateEvent} size="sm">
                  {editingEvent ? 'Update' : 'Create'}
                </Button>
                <Button variant="secondary" size="sm" onClick={closeForm}>Cancel</Button>
              </div>
            </div>
          </Card>
        )}

        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">Loading events...</p>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="p-4">
                <div
                  className="flex items-start gap-3 cursor-pointer"
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center shrink-0">
                    <Calendar size={20} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{event.title}</h3>
                      {isCreator(event) && <Badge color="purple" className="shrink-0">Your Event</Badge>}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">{event.description}</p>
                    {event.imageUrls?.length > 0 && (
                      <div className="flex gap-1.5 mb-2">
                        {event.imageUrls.slice(0, 4).map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt={`${event.title} ${i + 1}`}
                            className="w-14 h-14 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                          />
                        ))}
                        {event.imageUrls.length > 4 && (
                          <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-xs text-gray-500">
                            +{event.imageUrls.length - 4}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                      <span className="flex items-center gap-1"><Calendar size={12} />{formatDate(event.startAt || event.date)}</span>
                      {event.time && <span className="flex items-center gap-1"><Clock size={12} />{event.time}</span>}
                      {event.location && <span className="flex items-center gap-1"><MapPin size={12} />{event.location}</span>}
                      {event.attendees !== undefined && <span className="flex items-center gap-1"><Users size={12} />{event.attendees}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {isCreator(event) && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); openEdit(event); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                          <Edit2 size={14} className="text-gray-400" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                          <Trash2 size={14} className="text-gray-400" />
                        </button>
                      </>
                    )}
                    <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />
                  </div>
                </div>
              </Card>
            ))}
            {events.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No events yet.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}