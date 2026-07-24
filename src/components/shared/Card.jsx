export default function Card({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 ${onClick ? 'cursor-pointer hover:shadow-md' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
