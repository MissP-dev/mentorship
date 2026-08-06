import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { getMentors } from '../../services/auth';
import TopBar from '../shared/TopBar';
import MentorCard from '../shared/MentorCard';
import Button from '../shared/Button';

export default function SearchMentorScreen() {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    getMentors().then(setMentors);
  }, []);

  useEffect(() => {
    let result = mentors;
    if (search) {
      result = result.filter(
        (m) =>
          m.fullName.toLowerCase().includes(search.toLowerCase()) ||
          m.expertiseTags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      );
    }
    if (selectedTags.length > 0) {
      result = result.filter((m) => selectedTags.some((t) => m.expertiseTags.includes(t)));
    }
    if (minRating > 0) {
      result = result.filter((m) => m.rating >= minRating);
    }
    setFiltered(result);
  }, [mentors, search, selectedTags, minRating]);

  const allTags = [...new Set(mentors.flatMap((m) => m.expertiseTags))];

  const toggleTag = (tag) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  return (
    <div>
      <TopBar title="Find Mentors" showBack />
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-lg border ${showFilters ? 'bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-400' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expertise</p>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-purple-700 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Minimum Rating: {minRating > 0 ? `${minRating}+` : 'Any'}</p>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
                className="w-full accent-purple-700"
              />
            </div>
            {(selectedTags.length > 0 || minRating > 0) && (
              <Button variant="ghost" size="sm" onClick={() => { setSelectedTags([]); setMinRating(0); }}>
                Clear Filters
              </Button>
            )}
          </div>
        )}

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No mentors found matching your criteria.</p>
          ) : (
            filtered.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} onViewProfile={(id) => navigate(`/mentors/${id}`)} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
