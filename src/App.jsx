import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/shared/ProtectedRoute';
import AppLayout from './components/shared/AppLayout';
import ErrorBoundary from './components/shared/ErrorBoundary';
import useNotifications from './components/notifications/useNotifications';
import NotificationToast from './components/notifications/NotificationToast';

import WelcomePage from './components/auth/WelcomePage';
import LoginScreen from './components/auth/LoginScreen';
import SignUpScreen from './components/auth/SignUpScreen';
import ForgotPasswordScreen from './components/auth/ForgotPasswordScreen';
import ResetPasswordScreen from './components/auth/ResetPasswordScreen';

import AdminDashboard from './components/admin/AdminDashboard';

import SearchMentorScreen from './components/mentor/SearchMentorScreen';
import MentorProfile from './components/mentor/MentorProfile';
import MentorshipRequestScreen from './components/mentor/MentorshipRequestScreen';
import MentorDiscussionScreen from './components/mentor/MentorDiscussionScreen';
import MentorProfileSetupScreen from './components/mentor/MentorProfileSetupScreen';
import SessionScreen from './components/mentor/SessionScreen';

import SocialFeedScreen from './components/feed/SocialFeedScreen';
import CreatePostScreen from './components/feed/CreatePostScreen';
import PostDetailScreen from './components/feed/PostDetailScreen';
import CommentsScreen from './components/feed/CommentsScreen';
import StoriesPage from './components/stories/StoriesPage';
import ReelsPage from './components/reels/ReelsPage';

import GroupsListScreen from './components/groups/GroupsListScreen';
import CreateGroupScreen from './components/groups/CreateGroupScreen';
import GroupEditScreen from './components/groups/GroupEditScreen';
import MessagesScreen from './components/messages/MessagesScreen';
import GroupCallScreen from './components/call/GroupCallScreen';

import EventsPage from './components/events/EventsPage';
import EventDetailPage from './components/events/EventDetailPage';
import MeetingsPage from './components/meetings/MeetingsPage';
import MeetingDetailPage from './components/meetings/MeetingDetailPage';
import MeetingRoom from './components/meetings/MeetingRoom';
import MentorsListPage from './components/profile/MentorsListPage';
import MenteesListPage from './components/profile/MenteesListPage';

import NotificationsScreen from './components/notifications/NotificationsScreen';
import SettingsScreen from './components/settings/SettingsScreen';
import ProfileScreen from './components/profile/ProfileScreen';
import UserProfileScreen from './components/profile/UserProfileScreen';
import LiveCallAlert from './components/meetings/LiveCallAlert';

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
          <LiveCallAlert />
          <ErrorBoundary>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/signup" element={<SignUpScreen />} />
            <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
            <Route path="/reset-password" element={<ResetPasswordScreen />} />
            <Route path="/dashboard" element={<Navigate to="/feed" replace />} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/mentors" element={<ProtectedRoute><AppLayout><SearchMentorScreen /></AppLayout></ProtectedRoute>} />
            <Route path="/mentors/:id" element={<ProtectedRoute><AppLayout><MentorProfile /></AppLayout></ProtectedRoute>} />
            <Route path="/mentors/:id/request" element={<ProtectedRoute><AppLayout><MentorshipRequestScreen /></AppLayout></ProtectedRoute>} />
            <Route path="/mentors/discuss" element={<ProtectedRoute><AppLayout><MentorDiscussionScreen /></AppLayout></ProtectedRoute>} />
            <Route path="/mentor-profile-setup" element={<ProtectedRoute><AppLayout><MentorProfileSetupScreen /></AppLayout></ProtectedRoute>} />
            <Route path="/sessions/:id" element={<ProtectedRoute><AppLayout><SessionScreen /></AppLayout></ProtectedRoute>} />
            <Route path="/feed" element={<SocialFeedScreen />} />
            <Route path="/feed/new" element={<ProtectedRoute><AppLayout><CreatePostScreen /></AppLayout></ProtectedRoute>} />
            <Route path="/posts/:id" element={<ProtectedRoute><AppLayout><PostDetailScreen /></AppLayout></ProtectedRoute>} />
            <Route path="/posts/:id/comments" element={<ProtectedRoute><AppLayout><CommentsScreen /></AppLayout></ProtectedRoute>} />
            <Route path="/stories" element={<ProtectedRoute><AppLayout><StoriesPage /></AppLayout></ProtectedRoute>} />
            <Route path="/reels" element={<ProtectedRoute><AppLayout><ReelsPage /></AppLayout></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><MessagesScreen /></ProtectedRoute>} />
            <Route path="/messages/:id" element={<ProtectedRoute><MessagesScreen /></ProtectedRoute>} />
            <Route path="/messages/group/:id" element={<ProtectedRoute><MessagesScreen /></ProtectedRoute>} />
            <Route path="/groups/:id/call" element={<ProtectedRoute><GroupCallScreen /></ProtectedRoute>} />
            <Route path="/groups" element={<ProtectedRoute><AppLayout><GroupsListScreen /></AppLayout></ProtectedRoute>} />
            <Route path="/groups/new" element={<ProtectedRoute><AppLayout><CreateGroupScreen /></AppLayout></ProtectedRoute>} />
            <Route path="/groups/:id/edit" element={<ProtectedRoute><AppLayout><GroupEditScreen /></AppLayout></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsScreen /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><AppLayout><SettingsScreen /></AppLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfileScreen /></AppLayout></ProtectedRoute>} />
            <Route path="/users/:id" element={<ProtectedRoute><AppLayout><UserProfileScreen /></AppLayout></ProtectedRoute>} />
            <Route path="/profile/mentors" element={<ProtectedRoute><AppLayout><MentorsListPage /></AppLayout></ProtectedRoute>} />
            <Route path="/profile/mentees" element={<ProtectedRoute><AppLayout><MenteesListPage /></AppLayout></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><AppLayout><EventsPage /></AppLayout></ProtectedRoute>} />
            <Route path="/events/:id" element={<ProtectedRoute><AppLayout><EventDetailPage /></AppLayout></ProtectedRoute>} />
            <Route path="/meetings" element={<ProtectedRoute><AppLayout><MeetingsPage /></AppLayout></ProtectedRoute>} />
            <Route path="/meetings/:id" element={<ProtectedRoute><AppLayout><MeetingDetailPage /></AppLayout></ProtectedRoute>} />
            <Route path="/meetings/:id/join" element={<ProtectedRoute><MeetingRoom /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
