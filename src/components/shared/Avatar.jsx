const COLORS = [
  'bg-purple-600', 'bg-indigo-600', 'bg-blue-600', 'bg-teal-600',
  'bg-green-600', 'bg-yellow-600', 'bg-orange-600', 'bg-pink-600',
  'bg-rose-600', 'bg-cyan-600', 'bg-emerald-600', 'bg-violet-600',
];

function getColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({ src, alt = '', size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizes[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full ${getColor(alt)} text-white font-semibold flex items-center justify-center select-none shrink-0 ${className}`}
    >
      {getInitials(alt)}
    </div>
  );
}
