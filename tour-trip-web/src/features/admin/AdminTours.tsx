import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient, API_URL } from '../../api/client';
import { extractData, getTourImageUrl } from '../../api/utils';
import { usePagedQuery } from '../../hooks/usePagedQuery';
import { Pagination } from '../../components/Pagination';
import type { Tour, Category, Destination } from '../../types';
import { getTourDestination, getTourCategory } from '../../types';

export const AdminTours: React.FC = () => {
  const {
    items: tours,
    isLoading: loading,
    refetch,
    page, setPage, totalPages, total, pageSize,
  } = usePagedQuery<Tour>('admin-tours', '/api/v1/tours/page', { pageSize: 12 });

  const destinationsQuery = useQuery({
    queryKey: ['destinations'],
    queryFn: () => apiClient.get('/api/v1/destinations'),
    select: (res): Destination[] => extractData(res),
  });
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.get('/api/v1/categories'),
    select: (res): Category[] => extractData(res),
  });
  const destinations = destinationsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTourId, setEditingTourId] = useState<number | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(85);
  const [durationDays, setDurationDays] = useState(1);
  const [maxGroupSize, setMaxGroupSize] = useState(12);
  const [destinationId, setDestinationId] = useState(1);
  const [categoryId, setCategoryId] = useState(1);
  const [itinerary, setItinerary] = useState('');
  const [includedItems, setIncludedItems] = useState('');
  const [excludedItems, setExcludedItems] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [tourImages, setTourImages] = useState<{id?: number, url: string}[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);

  const handleOpenCreate = () => {
    setEditingTourId(null);
    setTitle('');
    setDescription('');
    setPrice(85);
    setDurationDays(1);
    setMaxGroupSize(12);
    setDestinationId(destinations[0]?.id || 1);
    setCategoryId(categories[0]?.id || 1);
    setItinerary('');
    setIncludedItems('');
    setExcludedItems('');
    setIsPublished(true);
    setTourImages([]);
    setImageFiles([]);
    setImagesToDelete([]);
    setModalOpen(true);
  };

  const handleOpenEdit = (tour: Tour) => {
    setEditingTourId(tour.id);
    setTitle(tour.title || '');
    setDescription(tour.description || '');
    setPrice(tour.price || 85);
    setDurationDays(tour.durationDays || 1);
    setMaxGroupSize(tour.maxGroupSize || 12);
    setDestinationId(tour.destination?.id || tour.destinationId || destinations[0]?.id || 1);
    setCategoryId(tour.category?.id || tour.categoryId || categories[0]?.id || 1);
    setItinerary(tour.itinerary || '');
    setIncludedItems(Array.isArray(tour.includedItems) ? tour.includedItems.join(', ') : (tour.includedItems || ''));
    setExcludedItems(Array.isArray(tour.excludedItems) ? tour.excludedItems.join(', ') : (tour.excludedItems || ''));
    setIsPublished(tour.isPublished !== false);

    // Map ImageResponse objects to our local preview state
    const existingImages = (tour.images || []).map((img) => {
      let url = '';
      if (typeof img === 'string') {
        url = img;
      } else if (img && typeof img === 'object') {
        url = img.imageUrl || img.url || '';
      }

      const finalUrl = url.startsWith('http') ? url : (url ? `${API_URL}${url}` : '');
      return {
        id: typeof img === 'object' && img !== null ? img.id : undefined,
        url: finalUrl
      };
    });
    setTourImages(existingImages);

    setImageFiles([]);
    setImagesToDelete([]);
    setModalOpen(true);
  };

  const handleDeleteTour = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this tour?')) return;
    try {
      await apiClient.delete(`/api/v1/tours/${id}`);
      toast.success('Tour deleted successfully');
      refetch();
    } catch {
      toast.error('Failed to delete tour');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...filesArray]);
      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          if (uploadEvent.target?.result) {
            setTourImages(prev => [...prev, { id: undefined, url: uploadEvent.target!.result as string }]);
          }
        };
        reader.readAsDataURL(file);
      });
      toast.success(`${filesArray.length} image(s) selected`);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const imageToRemove = tourImages[index];

    // 1. If the image has an ID, mark it for deletion in the backend
    if (imageToRemove && imageToRemove.id !== undefined) {
      setImagesToDelete(prev => [...prev, imageToRemove.id!]);
    }

    // 2. REMOVE FROM PREVIEW IMMEDIATELY
    // We use a functional update to ensure we have the latest state
    setTourImages(prev => {
      const newImages = [...prev];
      newImages.splice(index, 1);
      return newImages;
    });

    // 3. If it was a newly uploaded file (no ID), remove it from imageFiles array
    setImageFiles(prev => {
      const existingImagesCount = tourImages.length - prev.length;
      if (index >= existingImagesCount) {
        const newIdx = index - existingImagesCount;
        const newFiles = [...prev];
        newFiles.splice(newIdx, 1);
        return newFiles;
      }
      return prev;
    });
  };

  const handleSaveTour = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price.toString());
    formData.append('durationDays', durationDays.toString());
    formData.append('maxGroupSize', maxGroupSize.toString());
    formData.append('destinationId', destinationId.toString());
    formData.append('categoryId', categoryId.toString());
    formData.append('itinerary', itinerary);
    formData.append('includedItems', includedItems);
    formData.append('excludedItems', excludedItems);
    formData.append('isPublished', isPublished.toString());

    imageFiles.forEach((file) => {
      formData.append('imageFiles', file);
    });

    try {
      if (editingTourId) {
        imagesToDelete.forEach(id => {
          formData.append('imagesToDelete', id.toString());
        });

        await apiClient.put(`/api/v1/tours/${editingTourId}`, formData, {
          headers: { 'Content-Type': undefined }
        });
        toast.success('Tour updated successfully');
      } else {
        await apiClient.post('/api/v1/tours', formData, {
          headers: { 'Content-Type': undefined }
        });
        toast.success('Tour created successfully');
      }
      setModalOpen(false);
      refetch();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message
        || (err as { message?: string })?.message
        || 'Internal Server Error';
      toast.error(`Tour ${editingTourId ? 'updated' : 'created'} failed: ${message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Tours Management</h1>
          <p className="text-sm text-gray-500 mt-1">TourService: Create, Read, Update, Delete tours</p>
        </div>
        <button onClick={handleOpenCreate} className="flex items-center gap-2 px-5 py-3 bg-teal-600 text-white rounded-2xl text-xs font-semibold shadow-lg shadow-teal-600/30 hover:bg-teal-700 transition-all">
          <Plus className="w-4 h-4" /> Add New Tour
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase">
              <th className="p-5">ID</th>
              <th className="p-5">Image</th>
              <th className="p-5">Tour Title</th>
              <th className="p-5">Destination / Category</th>
              <th className="p-5">Price</th>
              <th className="p-5">Duration</th>
              <th className="p-5">Group Size</th>
              <th className="p-5">Status</th>
              <th className="p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {loading && (
              <tr>
                <td colSpan={9} className="p-10 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading tours...
                  </div>
                </td>
              </tr>
            )}
            {!loading && tours.length === 0 && (
              <tr>
                <td colSpan={9} className="p-10 text-center text-gray-400">
                  No tours found. Use <strong>Add New Tour</strong> to create the first one.
                </td>
              </tr>
            )}
            {!loading && tours.map(t => (
              <tr key={t.id}>
                <td className="p-5 font-mono font-bold">#{t.id}</td>
                <td className="p-5">
                  <div className="flex items-center gap-2">
                    <img src={getTourImageUrl(t)} alt={t.title} className="w-16 h-12 rounded-xl object-cover border border-gray-200 bg-gray-100" />
                    {Array.isArray(t.images) && t.images.length > 1 && (
                      <span className="px-2 py-1 rounded-lg bg-teal-50 text-teal-700 text-xs font-semibold">{t.images.length}</span>
                    )}
                  </div>
                </td>
                <td className="p-5 font-bold text-gray-900">{t.title}</td>
                <td className="p-5 text-xs">
                  <span className="font-semibold text-gray-800">
                    {t.destinationName || destinations.find(d => d.id === (t.destination?.id || t.destinationId))?.name || getTourDestination(t).name}
                  </span>
                  <span className="block text-gray-400">
                    {t.categoryName || categories.find(c => c.id === (t.category?.id || t.categoryId))?.name || getTourCategory(t).name}
                  </span>
                </td>
                <td className="p-5 font-extrabold text-teal-600">${t.price}</td>
                <td className="p-5">{t.durationDays ?? 1} Days</td>
                <td className="p-5">{t.maxGroupSize || 12} max</td>
                <td className="p-5">
                  <div className="flex flex-col gap-1">
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold w-fit ${t.isPublished !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                      {t.isPublished !== false ? 'Published' : 'Draft'}
                    </span>
                    <div className="text-[10px] text-gray-400 line-clamp-2 max-w-xs">
                      <strong className="text-gray-500">Itinerary:</strong> {t.itinerary || 'N/A'}
                    </div>
                    <div className="text-[10px] text-gray-400 line-clamp-1 max-w-xs">
                      <strong className="text-gray-500">Incl:</strong> {t.includedItems || 'N/A'}
                    </div>
                    <div className="text-[10px] text-gray-400 line-clamp-1 max-w-xs">
                      <strong className="text-gray-500">Excl:</strong> {t.excludedItems || 'N/A'}
                    </div>
                  </div>
                </td>
                <td className="p-5 text-right space-x-2">
                  <button onClick={() => handleOpenEdit(t)} className="p-2 bg-teal-50 hover:bg-teal-100 rounded-xl text-teal-600 transition-colors" title="Edit Tour">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteTour(t.id)} className="p-2 bg-red-50 hover:bg-red-100 rounded-xl text-red-600 transition-colors" title="Delete Tour">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 pb-5">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} total={total} pageSize={pageSize} />
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto scroll-smooth [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
            <h3 className="text-2xl font-bold text-gray-900">{editingTourId ? 'Update Tour' : 'Create Tour'} (TourService)</h3>
            <form onSubmit={handleSaveTour} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tour Title (title)</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-gray-50/50"
                  placeholder="e.g. Angkor Wat Sunrise Explorer"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description (description)</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-gray-50/50"
                  placeholder="Tour overview..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-gray-50/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    value={durationDays}
                    onChange={e => setDurationDays(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-gray-50/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Max Group Size</label>
                  <input
                    type="number"
                    value={maxGroupSize}
                    onChange={e => setMaxGroupSize(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-gray-50/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={isPublished ? 'true' : 'false'}
                    onChange={e => setIsPublished(e.target.value === 'true')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-gray-50/50"
                  >
                    <option value="true">Published</option>
                    <option value="false">Draft</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Destination Name (destination_id)</label>
                  <select
                    value={destinationId}
                    onChange={e => setDestinationId(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-gray-50/50 cursor-pointer"
                    required
                  >
                    {destinations.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.country})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category Name (category_id)</label>
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-gray-50/50 cursor-pointer"
                    required
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Itinerary (itinerary)</label>
                <textarea
                  rows={2}
                  value={itinerary}
                  onChange={e => setItinerary(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-gray-50/50"
                  placeholder="Day 1: Arrival & Temple tour..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Included Items (included_items)</label>
                  <input
                    type="text"
                    value={includedItems}
                    onChange={e => setIncludedItems(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-gray-50/50"
                    placeholder="Hotel pickup, Guide, Water"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Excluded Items (excluded_items)</label>
                  <input
                    type="text"
                    value={excludedItems}
                    onChange={e => setExcludedItems(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-gray-50/50"
                    placeholder="Personal expenses, Tips"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">Tour Images (tour_images upload)</label>
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="tour-image-file-input"
                    className="cursor-pointer px-5 py-3 bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold rounded-2xl text-xs border border-teal-200 transition-all flex items-center gap-2"
                  >
                    <span>Browse & Upload Images</span>
                    <input
                      id="tour-image-file-input"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-gray-400">Select multiple image files from your device</span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3 max-h-40 overflow-y-auto">
                  {tourImages.map((img, idx) => (
                    <div key={idx} className="relative group rounded-2xl overflow-hidden border border-gray-200 h-24 bg-gray-50">
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="w-1/2 py-3 border border-gray-200 font-semibold rounded-2xl text-sm">Cancel</button>
                <button type="submit" className="w-1/2 py-3 bg-teal-600 text-white font-semibold rounded-2xl shadow text-sm hover:bg-teal-700">
                  {editingTourId ? 'Update Tour' : 'Create Tour'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
