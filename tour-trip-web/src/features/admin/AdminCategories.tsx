import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../api/client';
import { extractData } from '../../api/utils';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../../components/Pagination';
import type { Category } from '../../types';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { page, setPage, totalPages, pageItems, total, pageSize } = usePagination(categories, 12);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiClient.get('/api/v1/categories');
        setCategories(extractData(res));
      } catch {
        toast.error('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [reloadKey]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name || '');
    setDescription(cat.description || '');
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await apiClient.delete(`/api/v1/categories/${id}`);
      setReloadKey(k => k + 1);
      toast.success('Category deleted successfully');
    } catch (err: unknown) {
      toast.error('Failed to delete category: ' + ((err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (err as { message?: string })?.message || 'Server error'));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, description };
    try {
      if (editingId) {
        await apiClient.put(`/api/v1/categories/${editingId}`, payload);
        toast.success('Category updated successfully');
      } else {
        await apiClient.post('/api/v1/categories', payload);
        toast.success('Category created successfully');
      }
      setReloadKey(k => k + 1);
      setModalOpen(false);
    } catch (err: unknown) {
      toast.error('Failed to save category: ' + ((err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (err as { message?: string })?.message || 'Server error'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Categories Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage tour categories stored in the database</p>
        </div>
        <button onClick={handleOpenCreate} className="flex items-center gap-2 px-5 py-3 bg-teal-600 text-white rounded-2xl text-xs font-semibold shadow-lg shadow-teal-600/30 hover:bg-teal-700 transition-all">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase">
              <th className="p-5">ID</th>
              <th className="p-5">Name</th>
              <th className="p-5">Description</th>
              <th className="p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-10 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading categories...
                  </div>
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-10 text-center text-gray-400">No categories found.</td>
              </tr>
            ) : (
              pageItems.map(c => (
              <tr key={c.id}>
                <td className="p-5 font-mono font-bold">#{c.id}</td>
                <td className="p-5 font-bold text-gray-900">{c.name}</td>
                <td className="p-5 text-gray-500">{c.description || '—'}</td>
                <td className="p-5 text-right space-x-2">
                  <button onClick={() => handleOpenEdit(c)} className="p-2 bg-teal-50 hover:bg-teal-100 rounded-xl text-teal-600 transition-colors" title="Edit">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-2 bg-red-50 hover:bg-red-100 rounded-xl text-red-600 transition-colors" title="Delete">
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
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900">{editingId ? 'Edit Category' : 'Add Category'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-gray-50/50"
                  placeholder="e.g. Cultural & Heritage"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-gray-50/50"
                  placeholder="Short description..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="w-1/2 py-3 border border-gray-200 font-semibold rounded-2xl text-sm">Cancel</button>
                <button type="submit" className="w-1/2 py-3 bg-teal-600 text-white font-semibold rounded-2xl shadow text-sm hover:bg-teal-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
