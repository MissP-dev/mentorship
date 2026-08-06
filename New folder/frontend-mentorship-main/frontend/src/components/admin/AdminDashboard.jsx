import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, Users, AlertTriangle, Activity, LogOut } from 'lucide-react';
import { getAllUsers } from '../../services/auth';
import TopBar from '../shared/TopBar';
import Card from '../shared/Card';
import Badge from '../shared/Badge';

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    getAllUsers().then(setUsers);
  }, []);

  const filteredUsers = roleFilter === 'all' ? users : users.filter((u) => roleFilter === 'mentor' ? u.isMentorProfileComplete : roleFilter === 'admin' ? u.isAdmin : !u.isAdmin);
  const userCounts = {
    total: users.length,
    mentors: users.filter((u) => u.isMentorProfileComplete).length,
    admins: users.filter((u) => u.isAdmin).length,
  };

  const mockReports = [
    { id: 'r1', type: 'Inappropriate content', status: 'pending', reportedBy: 'u3', createdAt: '2026-07-20T10:00:00Z' },
    { id: 'r2', type: 'Spam message', status: 'reviewed', reportedBy: 'u4', createdAt: '2026-07-19T14:00:00Z' },
    { id: 'r3', type: 'Fake profile', status: 'pending', reportedBy: 'u1', createdAt: '2026-07-21T09:00:00Z' },
  ];

  const Sidebar = () => (
    <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
      <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">M</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">Admin</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => { logout(); navigate('/login', { replace: true }); }} className="p-2 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg" title="Logout">
              <LogOut size={18} />
            </button>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500">
              <X size={20} />
            </button>
          </div>
        </div>
        <nav className="space-y-1">
          {['Users', 'Reports', 'System Status'].map((item) => (
            <button key={item} className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-400">
              {item}
            </button>
          ))}
        </nav>
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => { logout(); navigate('/login', { replace: true }); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="lg:ml-64">
        <div className="lg:hidden">
          <TopBar title="Admin Dashboard" />
          <button onClick={() => setSidebarOpen(true)} className="fixed top-3 left-4 z-30 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <Menu size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
          <button onClick={() => { logout(); navigate('/login', { replace: true }); }} className="fixed top-3 right-4 z-30 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <LogOut size={18} className="text-purple-500" />
          </button>
        </div>

        <main className="p-4 lg:p-8 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg"><Users size={20} className="text-purple-600 dark:text-purple-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{userCounts.total}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Users</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg"><Users size={20} className="text-green-600 dark:text-green-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{userCounts.mentors}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Mentors</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg"><Activity size={20} className="text-yellow-600 dark:text-yellow-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">99.9%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Uptime</p>
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Users</h2>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-2 py-1"
              >
                <option value="all">All Users</option>
                <option value="mentor">Mentors</option>
                <option value="admin">Admins</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium">Email</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-gray-50 dark:border-gray-800">
                      <td className="py-2 font-medium text-gray-900 dark:text-white">{u.fullName}</td>
                      <td className="py-2 text-gray-500 dark:text-gray-400">{u.email}</td>
                      <td className="py-2">
                        <Badge color={u.isAdmin ? 'red' : u.isMentorProfileComplete ? 'purple' : 'gray'}>
                          {u.isAdmin ? 'admin' : u.isMentorProfileComplete ? 'mentor' : 'user'}
                        </Badge>
                      </td>
                      <td className="py-2 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pending Reports</h2>
            <div className="space-y-3">
              {mockReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={16} className="text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{report.type}</p>
                      <p className="text-xs text-gray-400">{new Date(report.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Badge color={report.status === 'pending' ? 'yellow' : 'green'}>{report.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
