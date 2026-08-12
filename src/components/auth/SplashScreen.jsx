import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../shared/ThemeToggle';

export default function SplashScreen() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(user?.isAdmin ? '/admin' : '/dashboard', { replace: true });
    } else {
      const timer = setTimeout(() => navigate('/login', { replace: true }), 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="text-center">
        <div className="w-20 h-20 bg-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-3xl font-bold">M</span>
        </div>
        <h1 className="text-4xl font-bold text-purple-700 dark:text-purple-400 mb-2">MConnect</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">Where Growth Meets Guidance</p>
      </div>
    </div>
  );
}
