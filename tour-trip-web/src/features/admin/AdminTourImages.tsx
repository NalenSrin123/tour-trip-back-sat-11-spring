import React from 'react';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { API_URL } from '../../api/client';
import { usePagedQuery } from '../../hooks/usePagedQuery';
import { Pagination } from '../../components/Pagination';
import type { Tour } from '../../types';

export const AdminTourImages: React.FC = () => {
  const {
    items: tours,
    isLoading: loading,
    page, setPage, totalPages, total, pageSize,
  } = usePagedQuery<Tour>('admin-tour-images', '/api/v1/tours/page', { pageSize: 12 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Tour Image Gallery</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of all tour imagery across the platform</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
        </div>
      ) : tours.length === 0 ? (
        <div className="text-center p-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No tours found to display images</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {tours.map(tour => (
            <div key={tour.id} className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm space-y-4">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="font-bold text-gray-900">{tour.title}</h3>
                <span className="text-xs font-mono text-gray-400">#{tour.id}</span>
              </div>
              <div className="p-5">
                {tour.images && tour.images.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {tour.images.map((img, idx) => {
                      const url = typeof img === 'string' ? img : (img.imageUrl || img.imageUrl || '');
                      const finalUrl = url.startsWith('http') ? url : (url ? `${API_URL}${url}` : '');
                      return (
                        <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border border-gray-100 bg-gray-100">
                          <img src={finalUrl} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <button
                              className="p-2 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white rounded-full transition-all"
                              title="View Original"
                              onClick={() => window.open(finalUrl, '_blank')}
                            >
                              <ImageIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-xs">No images uploaded for this tour</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} total={total} pageSize={pageSize} className="px-1" />
        </div>
      )}
    </div>
  );
};
