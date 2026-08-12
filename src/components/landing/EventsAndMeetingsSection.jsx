import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getEvents } from '../../services/events';
import { getMeetings } from '../../services/meetings';
import TopBar from '../shared/TopBar';
import Button from '../shared/Button';
import { SectionHeading, Stagger } from './LandingShared';
import { Calendar, MapPin, Clock, Users, Video } from 'lucide-react';

const EVENT_IMAGES = [
  '/images/events/workshop.jpg',
  '/images/events/conference.jpg',
  '/images/events/meetup.jpg',
  '/images/events/webinar.jpg',
];

const MEETING_IMAGES = [
  '/images/events/webinar.jpg',
  '/images/events/meetup.jpg',
  '/images/events/workshop.jpg',
  '/images/events/conference.jpg',
];

const SAMPLE_EVENTS = [
  {
    id: 'sample-1',
    title: 'Design Systems Masterclass',
    description: 'Hands-on session on building scalable, accessible design systems with real teams.',
    startAt: new Date(Date.now() + 3 * 86400000).toISOString(),
    location: 'Online',
    time: '4:00 PM',
    image: '/images/events/workshop.jpg',
  },
  {
    id: 'sample-2',
    title: 'Tech Career Conference',
    description: 'Day of keynotes, panels, and networking with engineers and hiring leaders.',
    startAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    location: 'Accra',
    time: '9:00 AM',
    image: '/images/events/conference.jpg',
  },
  {
    id: 'sample-3',
    title: 'Startup Founders Meetup',
    description: 'Founders share lessons on raising, hiring, and shipping in emerging markets.',
    startAt: new Date(Date.now() + 12 * 86400000).toISOString(),
    location: 'Lagos',
    time: '6:30 PM',
    image: '/images/events/meetup.jpg',
  },
];

const SAMPLE_MEETINGS = [
  {
    id: 'sample-m1',
    title: 'Weekly React Mentoring',
    description: 'Weekly live mentoring on React, performance, and clean architecture.',
    startAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    participants: 24,
    image: '/images/events/webinar.jpg',
  },
  {
    id: 'sample-m2',
    title: 'Resume & Interview Prep',
    description: 'One-on-one coaching to sharpen your resume and ace technical interviews.',
    startAt: new Date(Date.now() + 5 * 86400000).toISOString(),
    participants: 18,
    image: '/images/events/meetup.jpg',
  },
  {
    id: 'sample-m3',
    title: 'Career Growth Workshop',
    description: 'Set goals, build a growth plan, and stay accountable with your mentor.',
    startAt: new Date(Date.now() + 9 * 86400000).toISOString(),
    participants: 31,
    image: '/images/events/workshop.jpg',
  },
];

function EventImage({ src, alt }) {
  return (
    <div className="relative h-40 overflow-hidden">
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
    </div>
  );
}

export default function EventsAndMeetingsSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [eventsData, meetingsData] = await Promise.all([
        getEvents(),
        getMeetings(),
      ]);
      setEvents(eventsData);
      setMeetings(meetingsData);
    } catch (err) {
      console.error('Failed to load events and meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const upcomingEvents = events.filter((e) => e.startAt && new Date(e.startAt) >= new Date());
  const upcomingMeetings = meetings.filter((m) => m.startAt && new Date(m.startAt) >= new Date());

  const displayEvents = upcomingEvents.length > 0 ? upcomingEvents : SAMPLE_EVENTS;
  const displayMeetings = upcomingMeetings.length > 0 ? upcomingMeetings : SAMPLE_MEETINGS;

  return (
    <section id="events-and-meetings" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          tag="What's happening"
          title="Upcoming Events"
          subtitle="Find sessions, meetings, and events that matter to you"
        />
        <div className="mt-16">
          <Stagger>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayEvents.map((event, index) => (
                <div key={event.id} className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
                  <EventImage
                    src={event.imageUrls?.[0] || event.image || EVENT_IMAGES[index % EVENT_IMAGES.length]}
                    alt={event.title}
                  />
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
                        <Calendar size={20} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{event.title}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(event.startAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{event.description || 'No description'}</p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      {event.location && <span className="flex items-center gap-1"><MapPin size={12} />{event.location}</span>}
                      {event.time && <span className="flex items-center gap-1"><Clock size={12} />{event.time}</span>}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => navigate(String(event.id).startsWith('sample-') ? '/signup' : `/events/${event.id}`)} className="text-xs">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Stagger>
        </div>
        <div className="mt-12">
          <SectionHeading
            tag="Sessions"
            title="Upcoming Meetings"
            subtitle="Find sessions to join with your mentors"
          />
          <div className="mt-6">
            <Stagger>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayMeetings.map((meeting, index) => (
                  <div key={meeting.id} className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
                    <EventImage
                      src={meeting.image || MEETING_IMAGES[index % MEETING_IMAGES.length]}
                      alt={meeting.title}
                    />
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                          <Video size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{meeting.title}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(meeting.startAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{meeting.description || 'No description'}</p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1"><Users size={12} />{meeting.participants || meeting.mentees || 0} joined</span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => navigate(String(meeting.id).startsWith('sample-') ? '/signup' : `/meetings/${meeting.id}`)} className="text-xs">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Stagger>
          </div>
        </div>
      </div>
    </section>
  );
}