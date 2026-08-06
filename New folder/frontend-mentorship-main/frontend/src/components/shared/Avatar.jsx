export default function Avatar({ src, alt = '', size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  return (
    <img
      src={src || `https://i.pravatar.cc/150?u=${alt}`}
      alt={alt}
      className={`${sizes[size]} rounded-full object-cover ${className}`}
    />
  );
}
