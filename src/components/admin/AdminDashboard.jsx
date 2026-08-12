import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getAdminStats, getAdminActivities, suspendUser, adminDeleteUser, getAdminReports, updateReport } from '../../services/admin';
import { getAllUsers } from '../../services/auth';
import TopBar from '../shared/TopBar';
import Card from '../shared/Card';
import Badge from '../shared/Badge';
import Avatar from '../shared/Avatar';
import { Users, Briefcase, MessageSquare, AlertTriangle, Activity, Shield, Ban, Trash2, Eye, Clock, ChevronRight, CheckCircle, XCircle } from 'lucide-react';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [reportFilter, setReportFilter] = useState('pending');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, a, u, r] = await Promise.all([
        getAdminStats(),
        getAdminActivities(),
        getAllUsers(),
        getAdminReports(),
      ]);
      setStats(s);
      setActivities(a);
      setUsers(u);
      setReports(r);
    } catch (err) {
      console.error('Admin load failed:', err);
    }
    setLoading(false);
  };

  const handleSuspend = async (userId, currentSuspended) => {
    try {
      await suspendUser(userId);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, suspended: !currentSuspended } : u));
      setActionMsg(currentSuspended ? 'User unsuspended' : 'User suspended');
      setTimeout(() => setActionMsg(''), 2000);
    } catch (err) {
      setActionMsg(err.message);
      setTimeout(() => setActionMsg(''), 2000);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('This will permanently delete this user and all their data. Continue?')) return;
    try {
      await adminDeleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setActionMsg('User deleted');
      setTimeout(() => setActionMsg(''), 2000);
    } catch (err) {
      setActionMsg(err.message);
      setTimeout(() => setActionMsg(''), 2000);
    }
  };

  const handleReportStatus = async (reportId, status) => {
    try {
      await updateReport(reportId, { status });
      setReports((prev) => prev.map((r) => r.id === reportId ? { ...r, status } : r));
    } catch (err) {
      console.error(err);
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const activityIcon = (type) => {
    switch (type) {
      case 'user_joined': return <Users size={14} className="text-green-500" />;
      case 'post_created': return <Activity size={14} className="text-blue-500" />;
      case 'message_sent': return <MessageSquare size={14} className="text-purple-500" />;
      case 'session': return <Briefcase size={14} className="text-yellow-500" />;
      case 'mentorship_request': return <Shield size={14} className="text-indigo-500" />;
      case 'report': return <AlertTriangle size={14} className="text-red-500" />;
      default: return <Activity size={14} className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0d0f17]">
        <TopBar title="Admin Dashboard" showNotifications={false} />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-purple-700 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'activity', label: 'Activity', icon: Eye },
    { id: 'reports', label: 'Reports', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0f17]">
      <TopBar title="Admin Dashboard" showNotifications={false} />

      {actionMsg && (
        <div className="max-w-5xl mx-auto px-4 pt-2">
          <p className={`text-sm text-center py-2 rounded-lg ${actionMsg.includes('Error') || actionMsg.includes('failed') ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'}`}>
            {actionMsg}
          </p>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex gap-1 overflow-x-auto pb-2 mb-4 border-b border-gray-200 dark:border-gray-800">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                tab === id
                  ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {tab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'purple' },
                { label: 'Mentors', value: stats.totalMentors, icon: Briefcase, color: 'green' },
                { label: 'Sessions', value: stats.totalSessions, icon: MessageSquare, color: 'blue' },
                { label: 'Suspended', value: stats.suspendedUsers, icon: Ban, color: 'red' },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/40`}>
                      <Icon size={18} className={`text-${color}-600 dark:text-${color}-400`} />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { label: 'Pending Requests', value: stats.pendingRequests },
                { label: 'Pending Reports', value: stats.pendingReports },
                { label: 'Total Posts', value: stats.totalPosts },
                { label: 'Total Messages', value: stats.totalMessages },
                { label: 'Mentees', value: stats.totalMentees },
              ].map(({ label, value }) => (
                <Card key={label}>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                </Card>
              ))}
            </div>

            <Card>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Recent Activity</h3>
              <div className="space-y-2">
                {activities.slice(0, 8).map((a, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">{activityIcon(a.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white truncate">
                        <span className="font-medium">{a.user}</span>
                        <span className="text-gray-500 dark:text-gray-400"> {a.detail}</span>
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{timeAgo(a.timestamp)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tab === 'users' && (
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                    <th className="pb-2 font-medium">User</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Joined</th>
                    <th className="pb-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-gray-50 dark:border-gray-800/50">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Avatar src={u.avatarUrl} alt={u.fullName} size="sm" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{u.fullName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge color={u.isAdmin ? 'red' : u.isMentorProfileComplete ? 'purple' : 'gray'}>
                          {u.isAdmin ? 'admin' : u.isMentorProfileComplete ? 'mentor' : 'user'}
                        </Badge>
                      </td>
                      <td className="py-3">
                        {u.suspended ? (
                          <Badge color="red">suspended</Badge>
                        ) : (
                          <Badge color="green">active</Badge>
                        )}
                      </td>
                      <td className="py-3 text-gray-400 dark:text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="py-3">
                        <div className="flex items-center justify-end gap-1">
                          {!u.isAdmin && (
                            <>
                              <button
                                onClick={() => handleSuspend(u.id, u.suspended)}
                                className={`p-1.5 rounded-lg transition-colors ${u.suspended ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'}`}
                                title={u.suspended ? 'Unsuspend' : 'Suspend'}
                              >
                                {u.suspended ? <CheckCircle size={15} /> : <Ban size={15} />}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete user"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'activity' && (
          <Card>
            <div className="space-y-1">
              {activities.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No activity yet</p>
              ) : (
                activities.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-full shrink-0">{activityIcon(a.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white truncate">
                        <span className="font-medium">{a.user}</span>
                        <span className="text-gray-500 dark:text-gray-400"> {a.detail}</span>
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{a.type.replace(/_/g, ' ')}</p>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{timeAgo(a.timestamp)}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}

        {tab === 'reports' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              {['pending', 'reviewed', 'resolved'].map((f) => (
                <button key={f} onClick={() => setReportFilter(f)} className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${reportFilter === f ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{f}</button>
              ))}
            </div>
            {reports.filter((r) => r.status === reportFilter).length === 0 ? (
              <Card>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No {reportFilter} reports</p>
              </Card>
            ) : (
              reports.filter((r) => r.status === reportFilter).map((r) => (
                <Card key={r.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={16} className={`mt-0.5 ${r.status === 'pending' ? 'text-yellow-500' : r.status === 'reviewed' ? 'text-blue-500' : 'text-green-500'}`} />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{r.type}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>Reported by <span className="font-medium text-gray-700 dark:text-gray-300">{r.reporter?.fullName || 'Unknown'}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>Target: <span className="font-medium text-gray-700 dark:text-gray-300">{r.targetUser?.fullName || `#${r.targetId} (${r.targetType})`}</span></span>
                          {r.targetUser?.email && <span className="text-gray-400">({r.targetUser.email})</span>}
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{timeAgo(r.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {r.status === 'pending' && (
                        <>
                          <button onClick={() => handleReportStatus(r.id, 'reviewed')} className="px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">Review</button>
                          <button onClick={() => handleReportStatus(r.id, 'resolved')} className="px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded-md hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors">Resolve</button>
                        </>
                      )}
                      {r.status !== 'pending' && <Badge color={r.status === 'reviewed' ? 'blue' : 'green'}>{r.status}</Badge>}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <button
          onClick={() => { logout(); navigate('/login', { replace: true }); }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
