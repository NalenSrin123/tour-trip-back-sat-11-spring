import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient, API_URL } from '../../api/client';
import { extractData } from '../../api/utils';
import { usePagedQuery } from '../../hooks/usePagedQuery';
import { Pagination } from '../../components/Pagination';
import type { User } from '../../types';

interface RoleOption {
  id: number;
  name: string;
  description?: string;
}

export const AdminUsers: React.FC = () => {
  const {
    items: users,
    isLoading: loading,
    refetch,
    page, setPage, totalPages, total, pageSize,
  } = usePagedQuery<User>('admin-users', '/api/v1/users/page', { pageSize: 12 });

  const rolesQuery = useQuery({
    queryKey: ['roles'],
    queryFn: () => apiClient.get('/api/v1/roles'),
    select: (res): RoleOption[] => extractData(res),
  });
  const roleOptions = rolesQuery.data ?? [];

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [roleModalOpen, setRoleModalOpen] = useState(false);

  const handleOpenRoleModal = (user: User) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles && user.roles.length > 0 ? [...user.roles] : ['CUSTOMER']);
    setRoleModalOpen(true);
  };

  const toggleRole = (name: string) => {
    setSelectedRoles(prev => prev.includes(name) ? prev.filter(r => r !== name) : [...prev, name]);
  };

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (selectedRoles.length === 0) {
      toast.error('Select at least one role');
      return;
    }
    try {
      await apiClient.put(`/api/v1/users/${selectedUser.id}/roles`, { roles: selectedRoles });
      toast.success(`Roles ${selectedRoles.join(', ')} assigned to ${selectedUser.fullName} successfully`);
      refetch();
      setRoleModalOpen(false);
    } catch {
      toast.error('Failed to assign role');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Users Management</h1>
        <p className="text-sm text-gray-500 mt-1">Assign roles (user_roles) to platform users</p>
      </div>
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase">
              <th className="p-5">Avatar</th>
              <th className="p-5">ID</th>
              <th className="p-5">Name</th>
              <th className="p-5">Email</th>
              <th className="p-5">Roles</th>
              <th className="p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {loading && (
              <tr>
                <td colSpan={6} className="p-10 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading users...
                  </div>
                </td>
              </tr>
            )}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-400">No users found.</td>
              </tr>
            )}
            {!loading && users.map(u => {
              const avatarUrl = u.avatarUrl?.startsWith('http')
                ? u.avatarUrl
                : (u.avatarUrl ? `${API_URL}${u.avatarUrl}` : '');

              return (
                <tr key={u.id}>
                  <td className="p-5">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-100">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={u.fullName} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold uppercase">
                          {u.fullName?.[0] || u.name?.[0] || 'U'}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-5 font-mono font-bold">#{u.id}</td>
                  <td className="p-5 font-bold text-gray-900">{u.fullName || u.name}</td>
                  <td className="p-5 text-gray-500">{u.email}</td>
                  <td className="p-5">
                    <div className="flex flex-wrap gap-1.5">
                      {u.roles && u.roles.length > 0 ? (
                        u.roles.map(r => (
                          <span key={r} className="px-3 py-1 rounded-xl text-xs font-bold bg-teal-50 text-teal-700">
                            {r}
                          </span>
                        ))
                      ) : (
                        <span className="px-3 py-1 rounded-xl text-xs font-bold bg-gray-100 text-gray-400">N/A</span>
                      )}
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <button onClick={() => handleOpenRoleModal(u)} className="px-4 py-2 bg-teal-50 text-teal-700 font-semibold rounded-xl text-xs hover:bg-teal-100 transition-colors">
                      Assign Role
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="px-5 pb-5">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} total={total} pageSize={pageSize} />
        </div>
      </div>

      {roleModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 space-y-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900">Assign Roles to {selectedUser.fullName || selectedUser.name}</h3>
            <form onSubmit={handleAssignRole} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Roles (user_roles)</label>
                <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
                  {roleOptions.map(r => (
                    <label key={r.id} className="flex items-start gap-3 px-4 py-3 border border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(r.name)}
                        onChange={() => toggleRole(r.name)}
                        className="mt-1 w-4 h-4 accent-teal-600"
                      />
                      <span>
                        <span className="block text-sm font-bold text-gray-900">{r.name}</span>
                        {r.description && <span className="block text-xs text-gray-500">{r.description}</span>}
                      </span>
                    </label>
                  ))}
                  {roleOptions.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">No roles found.</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setRoleModalOpen(false)} className="w-1/2 py-3 border border-gray-200 font-semibold rounded-2xl text-sm">Cancel</button>
                <button type="submit" className="w-1/2 py-3 bg-teal-600 text-white font-semibold rounded-2xl shadow text-sm hover:bg-teal-700">Save Roles</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
