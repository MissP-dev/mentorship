import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { login as loginService, signup as signupService } from '../../services/auth';
import ThemeToggle from '../shared/ThemeToggle';
import logoSrc from '../../assets/mconnect-logo.png';

function Field({ label, type = 'text', placeholder, error, register, hint }) {
  const [show, setShow] = useState(false);
  const isSecret = type === 'password';
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <div className="relative">
        <input
          type={isSecret && !show ? 'password' : 'text'}
          placeholder={placeholder}
          className={`w-full bg-gray-100 dark:bg-zinc-800 rounded-lg p-3 pr-10 text-sm text-[#1F2937] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-zinc-900 ${
            error ? 'ring-2 ring-red-500' : ''
          }`}
          {...register}
        />
        {isSecret && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            tabIndex={-1}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {hint && <div className="mt-1.5 flex justify-end">{hint}</div>}
    </div>
  );
}

export default function AuthModal({ initialTab = 'login' }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [tab, setTab] = useState(initialTab === 'signup' ? 'signup' : 'login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loginForm = useForm();
  const signupForm = useForm();
  const signupPassword = signupForm.watch('password');

  const switchTab = (next) => {
    if (next === tab) return;
    setTab(next);
    setError('');
  };

  const onSubmitLogin = async (data) => {
    setError('');
    setLoading(true);
    try {
      const user = await loginService(data.email, data.password);
      login(user);
      navigate(user.isAdmin ? '/admin' : '/feed', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitSignup = async (data) => {
    setError('');
    setLoading(true);
    try {
      const user = await signupService({ fullName: data.fullName, email: data.email, password: data.password });
      login(user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillAdmin = () => {
    setError('');
    loginForm.setValue('email', 'admin@mconnect.com');
    loginForm.setValue('password', 'password123');
    loginForm.handleSubmit(onSubmitLogin)();
  };

  const TabButton = ({ active, onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex-1 pb-3 text-base font-semibold transition-colors ${
        active ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
      }`}
    >
      {children}
      <span
        className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-purple-600 transition-all duration-300 ${
          active ? 'scale-x-100' : 'scale-x-0'
        }`}
      />
    </button>
  );

  const header = tab === 'login' ? 'Welcome Back' : 'Join the MConnect Community';
  const subtitle = tab === 'login' ? 'Sign in to continue to your account' : 'Create an account and start connecting';

  return (
    <div className="relative min-h-dvh flex bg-gradient-to-br from-purple-100 via-white to-indigo-100 dark:from-[#0f1220] dark:via-[#14102b] dark:to-[#1a0b2e]">
      <aside className="hidden lg:flex w-[45%] xl:w-[42%] bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 text-white items-center justify-center relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-24 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl" />
        <div className="relative flex items-center justify-center">
          <div className="absolute w-72 h-72 rounded-full bg-white/15 blur-3xl" />
          <img src={logoSrc} alt="MConnect" className="w-44 xl:w-52 object-contain relative drop-shadow-2xl [filter:brightness(0)_invert(1)]" />
        </div>
      </aside>

      <main className="relative flex-1 flex items-center justify-center px-4 py-8 overflow-y-auto min-h-dvh">
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md lg:max-w-sm xl:max-w-md my-auto">
          <img
            src={logoSrc}
            alt="MConnect"
            className="lg:hidden mx-auto mb-6 h-10 object-contain dark:[filter:brightness(0)_invert(1)_sepia(1)_saturate(5000%)_hue-rotate(250deg)]"
          />

          <div className="bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-800 p-6 sm:p-8">
            <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-bold">M</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{header}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{subtitle}</p>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-800 mb-8">
          <TabButton active={tab === 'login'} onClick={() => switchTab('login')}>
            Log In
          </TabButton>
          <TabButton active={tab === 'signup'} onClick={() => switchTab('signup')}>
            Sign Up
          </TabButton>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400 mb-4">
            {error}
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={loginForm.handleSubmit(onSubmitLogin)} className="space-y-4">
            <Field
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              error={loginForm.formState.errors.email?.message}
              register={loginForm.register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
              })}
            />
            <Field
              label="Password"
              type="password"
              placeholder="Enter your password"
              error={loginForm.formState.errors.password?.message}
              register={loginForm.register('password', { required: 'Password is required' })}
              hint={
                <Link
                  to="/forgot-password"
                  className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 font-medium"
                >
                  Forgot Password?
                </Link>
              }
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg py-3 text-white font-medium transition-colors mt-1"
            >
              {loading ? 'Signing in...' : 'Log In'}
            </button>
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={fillAdmin}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
              >
                <Shield size={14} />
                Login as Admin
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={signupForm.handleSubmit(onSubmitSignup)} className="space-y-4">
            <Field
              label="Full Name"
              placeholder="John Doe"
              error={signupForm.formState.errors.fullName?.message}
              register={signupForm.register('fullName', { required: 'Full name is required' })}
            />
            <Field
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={signupForm.formState.errors.email?.message}
              register={signupForm.register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
              })}
            />
            <Field
              label="Password"
              type="password"
              placeholder="Min 6 characters"
              error={signupForm.formState.errors.password?.message}
              register={signupForm.register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Min 6 characters' },
              })}
            />
            <Field
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              error={signupForm.formState.errors.confirmPassword?.message}
              register={signupForm.register('confirmPassword', {
                required: 'Please confirm password',
                validate: (val) => val === signupPassword || 'Passwords do not match',
              })}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg py-3 text-white font-medium transition-colors mt-1"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
        )}
          </div>
        </div>
      </main>
    </div>
  );
}