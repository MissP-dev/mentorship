import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { changePassword } from '../../services/auth';

import TopBar from '../shared/TopBar';
import Card from '../shared/Card';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { LogOut, ChevronRight, Bell, Lock, Palette } from 'lucide-react';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { theme, setThemeMode } = useTheme();
  const navigate = useNavigate();
  const [section, setSection] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notifPrefs, setNotifPrefs] = useState({ email: true, push: true, sessions: true });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMsg('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await changePassword(user.id, currentPassword, newPassword);
      setMsg('Password changed!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      setMsg(err.message);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (section === 'notifications') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <TopBar title="Notification Preferences" showBack />
        <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
          {Object.entries({ email: 'Email Notifications', push: 'Push Notifications', sessions: 'Session Reminders' }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              <button
                onClick={() => setNotifPrefs((prev) => ({ ...prev, [key]: !prev[key] }))}
                className={`w-11 h-6 rounded-full transition-colors ${notifPrefs[key] ? 'bg-purple-700' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${notifPrefs[key] ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </main>
      </div>
    );
  }

  if (section === 'password') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <TopBar title="Change Password" showBack />
        <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
          <Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <Input label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          {msg && <p className={`text-sm ${msg.includes('Error') || msg.includes('match') || msg.includes('incorrect') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{msg}</p>}
          <Button className="w-full" onClick={handleChangePassword} disabled={loading}>
            {loading ? 'Changing...' : 'Change Password'}
          </Button>
        </main>
      </div>
    );
  }

  if (section === 'appearance') {
    const modes = [
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
      { value: 'system', label: 'System' },
    ];
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <TopBar title="Appearance" showBack />
        <main className="max-w-lg mx-auto px-4 py-6 space-y-3">
          {modes.map((mode) => (
            <button
              key={mode.value}
              onClick={() => setThemeMode(mode.value)}
              className={`w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border transition-colors ${
                theme === mode.value
                  ? 'border-purple-500 dark:border-purple-400'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span className="text-sm font-medium text-gray-900 dark:text-white">{mode.label}</span>
              {theme === mode.value && (
                <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full" />
              )}
            </button>
          ))}
        </main>
      </div>
    );
  }

  return (
    <div>
      <TopBar title="Settings" showNotifications />
      <main className="max-w-lg mx-auto px-4 py-6 space-y-3">
        <Card onClick={() => setSection('notifications')}>
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-purple-600 dark:text-purple-400" />
            <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">Notification Preferences</span>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        </Card>
        <Card onClick={() => setSection('appearance')}>
          <div className="flex items-center gap-3">
            <Palette size={20} className="text-purple-600 dark:text-purple-400" />
            <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">Appearance</span>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        </Card>
        <Card onClick={() => setSection('password')}>
          <div className="flex items-center gap-3">
            <Lock size={20} className="text-purple-600 dark:text-purple-400" />
            <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">Change Password</span>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        </Card>

        <div className="pt-4">
          <Button variant="secondary" className="w-full" onClick={handleLogout}>
            <LogOut size={18} className="mr-2" /> Logout
          </Button>
        </div>
      </main>
    </div>
  );
}
