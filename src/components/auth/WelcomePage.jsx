import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../shared/ThemeToggle';
import { Users, BookOpen, TrendingUp, Handshake } from 'lucide-react';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 bg-purple-700 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">M</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">MConnect</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#how-it-works" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-400 transition-colors">Home</a>
              <a href="#how-it-works" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-400 transition-colors">Mentorship</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button onClick={() => navigate('/login')} className="text-sm text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400 transition-colors">Log In</button>
            <button onClick={() => navigate('/signup')} className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-sm font-medium rounded-lg transition-colors">Sign Up</button>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-950 dark:to-purple-950/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
              Unlock Your Potential with{' '}
              <span className="text-purple-700 dark:text-purple-400">MConnect</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
              The premier platform connecting ambitious mentees with experienced mentors across all industries. Join our community to grow, learn, and lead.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => navigate('/signup')} className="w-full sm:w-auto px-8 py-3.5 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-xl text-base transition-colors shadow-lg shadow-purple-700/25">
                Get Started Free
              </button>
              <button onClick={() => { if (isAuthenticated) navigate('/feed'); else navigate('/login'); }} className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-base hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Browse Mentors
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 sm:py-28 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">How It Works</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">Our streamlined approach ensures you find the right guidance at the right time.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Handshake,
                title: 'Connect',
                desc: 'Browse industry leaders and find the perfect mentor match based on your goals, skills, and interests.',
              },
              {
                icon: BookOpen,
                title: 'Learn',
                desc: 'Engage in structured 1-on-1 sessions, access curated resources, and grow with expert guidance.',
              },
              {
                icon: TrendingUp,
                title: 'Succeed',
                desc: 'Track your milestones, celebrate wins, and expand your professional network with every session.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/40 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <item.icon size={28} className="text-purple-700 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-purple-700 dark:bg-purple-800 rounded-3xl p-10 sm:p-16">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
              {[
                { value: '500+', label: 'Active Mentors' },
                { value: '1,200+', label: 'Successful Matches' },
                { value: '95%', label: 'Satisfaction Rate' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-4xl sm:text-5xl font-extrabold text-white">{stat.value}</p>
                  <p className="mt-2 text-purple-200 text-sm uppercase tracking-wider font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div className="max-w-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-purple-700 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">M</span>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">MConnect</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Connecting the next generation of leaders with the masters of today.</p>
            </div>
            <div className="flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400">
              <a href="#how-it-works" className="hover:text-purple-700 dark:hover:text-purple-400 transition-colors">About</a>
              <a href="#how-it-works" className="hover:text-purple-700 dark:hover:text-purple-400 transition-colors">Mentorship</a>
              <a href="#how-it-works" className="hover:text-purple-700 dark:hover:text-purple-400 transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-400 dark:text-gray-500">&copy; {new Date().getFullYear()} MConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
