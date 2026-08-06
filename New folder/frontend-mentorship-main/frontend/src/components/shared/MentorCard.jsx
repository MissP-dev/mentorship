import { Star } from 'lucide-react';
import Avatar from './Avatar';
import Badge from './Badge';
import Button from './Button';

export default function MentorCard({ mentor, onViewProfile }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <Avatar src={mentor.avatarUrl} alt={mentor.fullName} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{mentor.fullName}</h3>
            <Badge color="purple">Mentor</Badge>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Star size={14} className="text-yellow-500 fill-yellow-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">{mentor.rating.toFixed(1)}</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {mentor.expertiseTags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                {tag}
              </span>
            ))}
            {mentor.expertiseTags.length > 3 && (
              <span className="px-2 py-0.5 text-gray-400 text-xs">+{mentor.expertiseTags.length - 3}</span>
            )}
          </div>
        </div>
      </div>
      <div className="mt-3">
        <Button variant="secondary" size="sm" className="w-full" onClick={() => onViewProfile?.(mentor.id)}>
          View Profile
        </Button>
      </div>
    </div>
  );
}
