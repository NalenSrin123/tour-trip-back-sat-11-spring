import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../api/client';
import { extractData, resolveImageUrl } from '../../api/utils';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../../components/Pagination';
import type { Destination } from '../../types';

export const AdminDestinations: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const { page, setPage, totalPages, pageItems, total, pageSize } = usePagination(destinations, 12);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [country, setCountry] = useState('Cambodia');
  const [description, setDescription] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/v1/destinations');
      setDestinations(extractData(res));
    } catch (err) {
      toast.error('Failed to load destinations');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setCountry('Cambodia');
    setDescription('');
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setRemovedImages([]);
    setModalOpen(true);
  };

  const handleOpenEdit = (dest: Destination) => {
    setEditingId(dest.id);
    setName(dest.name || '');
    setCountry(dest.country || 'Cambodia');
    setDescription(dest.description || '');
    setImageFiles([]);
    setImagePreviews([]);
    setRemovedImages([]);
    const imgs = dest.images && dest.images.length > 0
      ? dest.images
      : (dest.imageUrl ? [dest.imageUrl] : (dest.image ? [dest.image] : []));
    setExistingImages(imgs);
    setModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      setImageFiles(files);
      setImagePreviews(files.map(f => URL.createObjectURL(f)));
    }
  };

  const handleRemoveExisting = (url: string) => {
    setExistingImages(prev => prev.filter(x => x !== url));
    setRemovedImages(prev => (prev.includes(url) ? prev : [...prev, url]));
  };

  const handleRemoveNew = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      const url = prev[index];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this destination?')) return;
    try {
      await apiClient.delete(`/api/v1/destinations/${id}`);
      setDestinations(prev => prev.filter(d => d.id !== id));
      toast.success('Destination deleted successfully');
    } catch (err: any) {
      toast.error('Failed to delete destination: ' + (err?.response?.data?.message || err?.message || 'Server error'));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('country', country);
    formData.append('description', description);
    imageFiles.forEach(file => formData.append('imageFiles', file));
    removedImages.forEach(url => formData.append('imagesToDelete', url));

    try {
      if (editingId) {
        await apiClient.put(`/api/v1/destinations/${editingId}`, formData, {
          headers: { 'Content-Type': undefined },
        });
        toast.success('Destination updated successfully');
      } else {
        await apiClient.post('/api/v1/destinations', formData, {
          headers: { 'Content-Type': undefined },
        });
        toast.success('Destination created successfully');
      }
      await fetchDestinations();
      setModalOpen(false);
    } catch (err: any) {
      toast.error('Failed to save destination: ' + (err?.response?.data?.message || err?.message || 'Server error'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Destinations Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage tour destinations and their images</p>
        </div>
        <button onClick={handleOpenCreate} className="flex items-center gap-2 px-5 py-3 bg-teal-600 text-white rounded-2xl text-xs font-semibold shadow-lg shadow-teal-600/30 hover:bg-teal-700 transition-all">
          <Plus className="w-4 h-4" /> Add Destination
        </button>
      </div>
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase">
              <th className="p-5">Image</th>
              <th className="p-5">ID</th>
              <th className="p-5">Destination Name</th>
              <th className="p-5">Country</th>
              <th className="p-5">Description</th>
              <th className="p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-10 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading destinations...
                  </div>
                </td>
              </tr>
            ) : destinations.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-400">No destinations found.</td>
              </tr>
            ) : (
              pageItems.map(d => (
                <tr key={d.id}>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <img src={resolveImageUrl(d.imageUrl || d.images?.[0] || d.image)} alt={d.name} className="w-16 h-12 rounded-xl object-cover border border-gray-200 bg-gray-100" />
                      {d.images && d.images.length > 1 && (
                        <span className="px-2 py-1 rounded-lg bg-teal-50 text-teal-700 text-xs font-semibold">{d.images.length}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-5 font-mono font-bold">#{d.id}</td>
                  <td className="p-5 font-bold text-gray-900">{d.name}</td>
                  <td className="p-5">{d.country}</td>
                  <td className="p-5 text-gray-500">{d.description || '—'}</td>
                  <td className="p-5 text-right space-x-2">
                    <button onClick={() => handleOpenEdit(d)} className="p-2 bg-teal-50 hover:bg-teal-100 rounded-xl text-teal-600 transition-colors" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(d.id)} className="p-2 bg-red-50 hover:bg-red-100 rounded-xl text-red-600 transition-colors" title="Delete">
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
            <h3 className="text-2xl font-bold text-gray-900">{editingId ? 'Edit Destination' : 'Add Destination'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Destination Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-gray-50/50"
                  placeholder="e.g. Siem Reap"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-gray-50/50"
                  placeholder="Cambodia"
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
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Destination Images <span className="text-gray-400 font-normal">(select 2-5)</span></label>
                {existingImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {existingImages.map((img, idx) => (
                      <div key={`${img}-${idx}`} className="relative group w-16 h-12 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                        <img src={resolveImageUrl(img)} alt={`existing ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveExisting(img)}
                          title="Remove image"
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4">
                  {imagePreviews.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {imagePreviews.map((src, idx) => (
                        <div key={`new-${idx}`} className="relative group w-16 h-12 rounded-xl overflow-hidden border border-teal-200 bg-gray-100">
                          <img src={src} alt={`new ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveNew(idx)}
                            title="Remove image"
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="flex items-center gap-2 px-4 py-3 border border-dashed border-gray-300 rounded-2xl text-sm text-gray-600 cursor-pointer hover:bg-gray-50">
                    <Upload className="w-4 h-4" />
                    {imageFiles.length ? `${imageFiles.length} file(s) selected` : 'Choose images'}
                    <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
                {editingId && (
                  <p className="text-xs text-gray-400 mt-2">Hover an image and click ✕ to remove it. Choosing new files adds them to the gallery.</p>
                )}
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
