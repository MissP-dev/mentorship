import { Video, Layers } from 'lucide-react';

function isVideoItem(item, kind) {
  if (kind === 'reels') return true;
  return item.mediaType === 'video' || item.mediaType === 'reel';
}

function isCarouselItem(item) {
  return item.mediaType === 'carousel' || (item.mediaUrls?.length || 0) > 1;
}

export default function ProfileGrid({ items, kind = 'posts', onSelect, emptyText = 'No content yet.' }) {
  if (!items.length) {
    return (
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center py-6">
        {emptyText}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {items.map((item) => {
        const video = isVideoItem(item, kind);
        const carousel = isCarouselItem(item);
        const thumb = item.thumbnailUrl || item.mediaUrl;

        return (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="relative aspect-square overflow-hidden bg-gray-200 dark:bg-[#1e293b] group focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="View post"
          >
            {video ? (
              <video
                src={item.mediaUrl}
                poster={item.thumbnailUrl}
                muted
                playsInline
                preload="metadata"
                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
              />
            ) : thumb ? (
              <img
                src={thumb}
                alt={item.caption || item.content || 'Post'}
                loading="lazy"
                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
              />
            ) : (
              <span className="w-full h-full flex items-center justify-center text-gray-400 text-xs px-1 break-words">
                {item.content || 'Post'}
              </span>
            )}

            {(carousel || video) && (
              <span className="absolute top-1.5 right-1.5 text-white drop-shadow">
                {carousel ? <Layers size={14} /> : <Video size={14} />}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
