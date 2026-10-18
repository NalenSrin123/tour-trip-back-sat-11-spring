import React, { useState, useEffect } from 'react';
import { Star, Trash2, Loader2, MessageSquare, Search } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../api/client';
import { usePagedQuery } from '../../hooks/usePagedQuery';
import { Pagination } from '../../components/Pagination';

interface AdminReview {
  id: number;
  tourId?: number;
  tourTitle?: string;
  userId?: number;
  userEmail?: string;
  userName?: string;
  userAvatarUrl?: string;
  bookingId?: number;
  rating?: number;
  comment?: string;
  createdAt?: string;
}

export const AdminReviews: React.FC = () => {
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  const {
    items: reviews,
    isLoading: loading,
    refetch,
    page, setPage, totalPages, total, pageSize,
  } = usePagedQuery<AdminReview>('admin-reviews', '/api/v1/reviews/page', {
    pageSize: 12,
    params: { search: appliedSearch || undefined },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search, setPage]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await apiClient.delete(`/api/v1/reviews/${id}`);
      toast.success('Review deleted successfully');
      refetch();
    } catch {
      toast.error('Failed to delete review');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Reviews Management</h2>
          <p className="text-sm text-gray-500 mt-1">Monitor and manage customer feedback and tour ratings</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search reviews..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-white shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-3">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-800">No reviews found</h3>
          <p className="text-sm text-gray-500">Customer reviews will appear here once submitted.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Traveler</th>
                  <th className="py-4 px-6">Tour</th>
                  <th className="py-4 px-6">Rating</th>
                  <th className="py-4 px-6">Comment</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {reviews.map(rev => (
                  <tr key={rev.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-gray-500">#{rev.id}</td>
                    <td className="py-4 px-6 font-bold text-gray-900">{rev.userName || 'Traveler'}</td>
                    <td className="py-4 px-6 text-gray-600 max-w-xs truncate">{rev.tourTitle || 'Tour #' + (rev.tourId || 'N/A')}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2.5 py-1 rounded-xl w-fit">
                        <Star className="w-4 h-4 fill-current" /> {rev.rating || 5}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600 max-w-md truncate">{rev.comment || 'N/A'}</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(rev.id)}
                        className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 pb-5">
            <Pagination page={page} totalPages={totalPages} onChange={setPage} total={total} pageSize={pageSize} />
          </div>
        </div>
      )}
    </div>
  );
};
