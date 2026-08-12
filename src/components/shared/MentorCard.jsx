import { Star, ArrowRight } from 'lucide-react';
import Avatar from './Avatar';
import Badge from './Badge';
import Button from './Button';

export default function MentorCard({ mentor, onViewProfile }) {
  return (
    <div
      onClick={() => onViewProfile?.(mentor.id)}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 hover:shadow-md transition-shadow flex items-center gap-3 cursor-pointer"
    >
      <Avatar src={mentor.avatarUrl} alt={mentor.fullName} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{mentor.fullName}</h3>
          <Badge color="purple" className="shrink-0">Mentor</Badge>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <Star size={12} className="text-yellow-500 fill-yellow-500" />
          <span className="text-xs text-gray-600 dark:text-gray-400">{mentor.rating.toFixed(1)}</span>
          {mentor.expertiseTags.length > 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-1 truncate">{mentor.expertiseTags[0]}</span>
          )}
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={() => onViewProfile?.(mentor.id)} className="shrink-0">
        <ArrowRight size={14} />
      </Button>
    </div>
  );
}
