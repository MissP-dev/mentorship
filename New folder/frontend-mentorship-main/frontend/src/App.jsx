import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/shared/ProtectedRoute';
import AppLayout from './components/shared/AppLayout';
import ErrorBoundary from './components/shared/ErrorBoundary';
import useNotifications from './components/notifications/useNotifications';
import NotificationToast from './components/notifications/NotificationToast';

import WelcomePage from './components/auth/WelcomePage';
import LoginScreen from './components/auth/LoginScreen';
import SignUpScreen from './components/auth/SignUpScreen';

import AdminDashboard from './components/admin/AdminDashboard';

import SearchMentorScreen from './components/mentor/SearchMentorScreen';
import MentorProfile from './components/mentor/MentorProfile';
import MentorshipRequestScreen from './components/mentor/MentorshipRequestScreen';
import MentorProfileSetupScreen from './components/mentor/MentorProfileSetupScreen';
import SessionScreen from './components/mentor/SessionScreen';

import SocialFeedScreen from './components/feed/SocialFeedScreen';
import CreatePostScreen from './components/feed/CreatePostScreen';
import PostDetailScreen from './components/feed/PostDetailScreen';
import CommentsScreen from './components/feed/CommentsScreen';

import GroupsListScreen from './components/groups/GroupsListScreen';
import CreateGroupScreen from './components/groups/CreateGroupScreen';
import ChatInboxScreen from './components/messages/ChatInboxScreen';
import MessageScreen from './components/messages/MessageScreen';
import GroupMessageScreen from './components/messages/GroupMessageScreen';

import NotificationsScreen from './components/notifications/NotificationsScreen';
import SettingsScreen from './components/settings/SettingsScreen';
import ProfileScreen from './components/profile/ProfileScreen';

function NotificationLayer() {
  const { toasts, dismissToast } = useNotifications();
  return <NotificationToast toasts={toasts} onDismiss={dismissToast} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <NotificationLayer />
          <ErrorBoundary>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/signup" element={<SignUpScreen />} />
            <Route path="/dashboard" element={<Navigate to="/feed" replace />} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/mentors" element={<ProtectedRoute><AppLayout><SearchMentorScreen /></AppLayout></ProtectedRoute>} />
            <Route path="/mentors/:id" element={<ProtectedRoute><AppLayout><MentorProfile /></AppLayout></ProtectedRoute>} />
            <Route path="/mentors/:id/request" element={<ProtectedRoute><AppLayout><MentorshipRequestScreen /></AppLayout></ProtectedRoute>} />
            <Route path="/mentor-profile-setup" element={<ProtectedRoute><AppLayout><MentorProfileSetupScreen /></AppLayout></ProtectedRoute>} />
            <Route path="/sessions/:id" element={<ProtectedRoute><AppLayout><SessionScreen /></AppLayout></ProtectedRoute>} />
            <Route path="/feed" element={<AppLayout><SocialFeedScreen /></AppLayout>} />
            <Route path="/feed/new" element={<ProtectedRoute><AppLayout><CreatePostScreen /></AppLayout></ProtectedRoute>} />
            <Route path="/posts/:id" element={<ProtectedRoute><AppLayout><PostDetailScreen /></AppLayout></ProtectedRoute>} />
            <Route path="/posts/:id/comments" element={<ProtectedRoute><AppLayout><CommentsScreen /></AppLayout></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><AppLayout><ChatInboxScreen /></AppLayout></ProtectedRoute>} />
            <Route path="/messages/:id" element={<ProtectedRoute><AppLayout><MessageScreen /></AppLayout></ProtectedRoute>} />
            <Route path="/messages/group/:id" element={<ProtectedRoute><AppLayout><GroupMessageScreen /></AppLayout></ProtectedRoute>} />
            <Route path="/groups" element={<ProtectedRoute><AppLayout><GroupsListScreen /></AppLayout></ProtectedRoute>} />
            <Route path="/groups/new" element={<ProtectedRoute><AppLayout><CreateGroupScreen /></AppLayout></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><AppLayout><NotificationsScreen /></AppLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><AppLayout><SettingsScreen /></AppLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfileScreen /></AppLayout></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
