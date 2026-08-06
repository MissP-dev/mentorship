import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Users,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';

const API = '/api/users';

export default function App() {
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      showToast('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = users.filter((u) => u.status === 'Active').length;

  const openCreate = () => { setSelectedUser(null); setModal('create'); };
  const openEdit = (user) => { setSelectedUser(user); setModal('edit'); };
  const openView = (user) => { setSelectedUser(user); setModal('view'); };
  const openDelete = (user) => { setSelectedUser(user); setModal('delete'); };

  const handleCreate = async (data) => {
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        showToast(err.error || 'Failed to create user');
        return;
      }
      setModal(null);
      showToast('User created successfully');
      fetchUsers();
    } catch {
      showToast('Network error');
    }
  };

  const handleUpdate = async (data) => {
    try {
      const res = await fetch(`${API}/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        showToast(err.error || 'Failed to update user');
        return;
      }
      setModal(null);
      showToast('User updated successfully');
      fetchUsers();
    } catch {
      showToast('Network error');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API}/${selectedUser.id}`, { method: 'DELETE' });
      if (!res.ok) {
        showToast('Failed to delete user');
        return;
      }
      setModal(null);
      showToast('User deleted');
      fetchUsers();
    } catch {
      showToast('Network error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-pulse">
          {toast}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Create, read, update, and delete users.</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Users size={20} className="text-blue-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{users.length}</p><p className="text-xs text-gray-500">Total Users</p></div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><UserCheck size={20} className="text-green-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{activeCount}</p><p className="text-xs text-gray-500">Active</p></div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg"><AlertTriangle size={20} className="text-gray-600" /></div>
            <div><p className="text-2xl font-bold text-gray-900">{users.length - activeCount}</p><p className="text-xs text-gray-500">Inactive</p></div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} /> Add User
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">Loading users...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-12 text-gray-400">No users found.</td></tr>
                ) : (
                  filtered.map((user) => (
                    <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <button onClick={() => openView(user)} className="font-medium text-gray-900 hover:text-blue-600 text-left">
                          {user.name}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{user.email}</td>
                      <td className="px-4 py-3 text-gray-500">{user.phone}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'Editor' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>{user.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>{user.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openView(user)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="View">
                            <Users size={16} />
                          </button>
                          <button onClick={() => openEdit(user)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600" title="Edit">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => openDelete(user)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-4 text-right">Showing {filtered.length} of {users.length} users</p>
      </div>

      {(modal === 'create' || modal === 'edit') && (
        <UserFormModal
          user={modal === 'edit' ? selectedUser : null}
          onSubmit={modal === 'edit' ? handleUpdate : handleCreate}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'view' && selectedUser && (
        <ViewModal user={selectedUser} onClose={() => setModal(null)} onEdit={() => setModal('edit')} />
      )}

      {modal === 'delete' && selectedUser && (
        <DeleteModal user={selectedUser} onConfirm={handleDelete} onClose={() => setModal(null)} />
      )}
    </div>
  );
}

function UserFormModal({ user, onSubmit, onClose }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: user || { name: '', email: '', phone: '', role: 'Viewer', status: 'Active' },
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{user ? 'Edit User' : 'Add New User'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input {...register('name', { required: 'Name is required' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="John Doe" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="john@example.com" />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input {...register('phone', { required: 'Phone is required' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="555-0100" />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select {...register('role')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Admin</option>
                <option>Users</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select {...register('status')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">{user ? 'Save Changes' : 'Create User'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ViewModal({ user, onClose, onEdit }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">User Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-500" /></button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
              {user.name.charAt(0)}
            </div>
          </div>
          {[
            ['Name', user.name],
            ['Email', user.email],
            ['Phone', user.phone],
            ['Role', user.role],
            ['Status', user.status],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between">
              <span className="text-sm text-gray-500">{label}</span>
              <span className="text-sm font-medium text-gray-900">
                {label === 'Role' ? (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    value === 'Admin' ? 'bg-purple-100 text-purple-700' :
                    value === 'Editor' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>{value}</span>
                ) : label === 'Status' ? (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    value === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>{value}</span>
                ) : value}
              </span>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">Close</button>
          <button onClick={onEdit} className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">Edit User</button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ user, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl">
        <div className="px-6 py-4 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={24} className="text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Delete User?</h2>
          <p className="text-sm text-gray-500">Are you sure you want to delete <strong>{user.name}</strong>? This action cannot be undone.</p>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
  );
}
