import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAvailabilityByMentor, saveAvailability } from '../../services/availability';
import TopBar from '../shared/TopBar';

import Button from '../shared/Button';
import { CheckCircle } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 12 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);

export default function AvailabilityScreen() {
  const { user } = useAuth();
  const [selectedSlots, setSelectedSlots] = useState({});
  const [recurring, setRecurring] = useState(true);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAvailabilityByMentor(user.id).then((data) => {
      const slots = {};
      data.slots.forEach((slot) => {
        const key = `${slot.day}-${slot.startTime}`;
        slots[key] = true;
      });
      setSelectedSlots(slots);
    });
  }, [user.id]);

  const toggleSlot = (day, time) => {
    const key = `${day}-${time}`;
    setSelectedSlots((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setLoading(true);
    const slots = Object.entries(selectedSlots)
      .filter(([_, selected]) => selected)
      .map(([key]) => {
        const [day, startTime] = key.split('-');
        const hour = parseInt(startTime);
        return { day, startTime, endTime: `${(hour + 1).toString().padStart(2, '0')}:00`, recurring };
      });
    await saveAvailability(user.id, slots);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setLoading(false);
  };

  return (
    <div>
      <TopBar title="Availability" showBack />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Weekly Schedule</h2>
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="accent-purple-700"
            />
            Recurring
          </label>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-1">
              <div />
              {DAYS.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
                  {day.slice(0, 3)}
                </div>
              ))}
              {HOURS.map((hour) => (
                <div key={`row-${hour}`} className="contents">
                  <div className="text-xs text-gray-400 dark:text-gray-500 py-2 pr-2 text-right">
                    {hour}
                  </div>
                  {DAYS.map((day) => {
                    const key = `${day}-${hour}`;
                    const isSelected = selectedSlots[key];
                    return (
                      <button
                        key={key}
                        onClick={() => toggleSlot(day, hour)}
                        className={`h-8 rounded transition-colors ${
                          isSelected ? 'bg-purple-700' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {saved && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg text-sm text-green-700 dark:text-green-400">
            <CheckCircle size={16} /> Availability saved successfully!
          </div>
        )}

        <Button className="w-full" onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Availability'}
        </Button>
      </main>
    </div>
  );
}
