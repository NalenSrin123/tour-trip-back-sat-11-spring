import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../api/client';
import { extractData } from '../../api/utils';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../../components/Pagination';

interface RoleDetail {
  id: number;
  name: string;
  description?: string;
}

export const AdminRoles: React.FC = () => {
  const [roles, setRoles] = useState<RoleDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const { page, setPage, totalPages, pageItems, total, pageSize } = usePagination(roles, 12);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/v1/roles');
      setRoles(extractData(res));
    } catch {
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingRoleId(null);
    setRoleName('');
    setRoleDescription('');
    setModalOpen(true);
  };

  const handleOpenEdit = (role: RoleDetail) => {
    setEditingRoleId(role.id);
    setRoleName(role.name);
    setRoleDescription(role.description || '');
    setModalOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRoleId) {
        await apiClient.put(`/api/v1/roles/${editingRoleId}`, {
          name: roleName,
          description: roleDescription
        });
        toast.success('Role updated successfully');
      } else {
        await apiClient.post('/api/v1/roles', {
          name: roleName,
          description: roleDescription
        });
        toast.success('Role created successfully');
      }
      setModalOpen(false);
      fetchRoles();
    } catch {
      toast.error('Failed to save role');
    }
  };

  const handleDeleteRole = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try {
      await apiClient.delete(`/api/v1/roles/${id}`);
      toast.success('Role deleted successfully');
      setRoles(prev => prev.filter(r => r.id !== id));
    } catch {
      toast.error('Failed to delete role');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Roles Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage platform roles and permissions</p>
        </div>
        <button onClick={handleOpenCreate} className="flex items-center gap-2 px-5 py-3 bg-teal-600 text-white rounded-2xl text-xs font-semibold shadow-lg shadow-teal-600/30 hover:bg-teal-700 transition-all">
          <Plus className="w-4 h-4" /> Add New Role
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase">
            <tr>
              <th className="p-5">ID</th>
              <th className="p-5">Role Name</th>
              <th className="p-5">Description</th>
              <th className="p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-10 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading roles...
                  </div>
                </td>
              </tr>
            ) : roles.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-10 text-center text-gray-400">No roles found.</td>
              </tr>
            ) : (
              pageItems.map(role => (
                <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-5 font-mono font-bold">#{role.id}</td>
                  <td className="p-5 font-bold text-gray-900">{role.name}</td>
                  <td className="p-5 text-gray-500">{role.description || 'No description'}</td>
                  <td className="p-5 text-right space-x-2">
                    <button onClick={() => handleOpenEdit(role)} className="p-2 bg-teal-50 hover:bg-teal-100 rounded-xl text-teal-600 transition-colors" title="Edit Role">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteRole(role.id)} className="p-2 bg-red-50 hover:bg-red-100 rounded-xl text-red-600 transition-colors" title="Delete Role">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="px-5 pb-5">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} total={total} pageSize={pageSize} />
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 space-y-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900">{editingRoleId ? 'Update Role' : 'Create Role'}</h3>
            <form onSubmit={handleSaveRole} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Role Name</label>
                <input
                  type="text"
                  value={roleName}
                  onChange={e => setRoleName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-gray-50/50"
                  placeholder="e.g. Administrator"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={roleDescription}
                  onChange={e => setRoleDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-gray-50/50"
                  placeholder="Describe the permissions for this role..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="w-1/2 py-3 border border-gray-200 font-semibold rounded-2xl text-sm">Cancel</button>
                <button type="submit" className="w-1/2 py-3 bg-teal-600 text-white font-semibold rounded-2xl shadow text-sm hover:bg-teal-700">Save Role</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
