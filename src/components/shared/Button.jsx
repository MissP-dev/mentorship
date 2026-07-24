export default function Button({ children, variant = 'primary', size = 'md', className = '', disabled = false, ...props }) {
  const base = 'font-medium rounded-lg transition-colors inline-flex items-center justify-center';
  const variants = {
    primary: 'bg-purple-700 text-white hover:bg-purple-800 disabled:bg-purple-400',
    secondary: 'border-2 border-purple-700 text-purple-700 dark:border-purple-400 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 disabled:opacity-50',
    ghost: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
