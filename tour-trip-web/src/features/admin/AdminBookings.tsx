import React, { useState, useEffect } from 'react';
import { Loader2, Check, X, CircleCheckBig } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../api/client';
import { extractData } from '../../api/utils';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../../components/Pagination';
import type { Booking, BookingStatus } from '../../types';

const statusClass = (status: BookingStatus) =>
  status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700' :
  status === 'PENDING' ? 'bg-amber-50 text-amber-700' :
  status === 'CANCELLED' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700';

export const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { page, setPage, totalPages, pageItems, total, pageSize } = usePagination(bookings, 12);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await apiClient.get('/api/v1/bookings');
        setBookings(extractData(res));
      } catch {
        toast.error('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (id: number, status: BookingStatus) => {
    try {
      await apiClient.patch(`/api/v1/bookings/${id}/status?status=${status}`);
      toast.success(`Booking status updated to ${status}`);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    } catch {
      toast.error('Failed to update booking status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Bookings Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage customer bookings and statuses</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase">
              <th className="p-5">Booking ID</th>
              <th className="p-5">Customer</th>
              <th className="p-5">Tour & Dates</th>
              <th className="p-5">Participants</th>
              <th className="p-5">Total Price</th>
              <th className="p-5">Status</th>
              <th className="p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-10 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading bookings...
                  </div>
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-gray-400">No bookings found.</td>
              </tr>
            ) : (
              pageItems.map(b => (
                <tr key={b.id}>
                  <td className="p-5 font-mono font-bold">#{b.id}</td>
                  <td className="p-5">
                    <span className="font-bold text-gray-900 block">{b.userEmail || 'Traveler'}</span>
                    {b.userId != null && <span className="text-xs text-gray-400">User #{b.userId}</span>}
                  </td>
                  <td className="p-5 text-xs text-gray-600">
                    <span className="block font-semibold text-gray-800">{b.tourTitle || `Tour #${b.tourId ?? ''}`}</span>
                    {(b.startDate || b.endDate) && <span>{b.startDate} to {b.endDate}</span>}
                  </td>
                  <td className="p-5 font-semibold">{b.numberOfParticipants ?? b.numberOfGuests ?? 1} guests</td>
                  <td className="p-5 font-extrabold text-teal-600">${b.totalPrice}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold ${statusClass(b.status)}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="p-5 text-right space-x-2">
                    {b.status === 'PENDING' && (
                      <>
                        <button onClick={() => handleUpdateStatus(b.id, 'CONFIRMED')} className="p-2 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-emerald-600 transition-colors" title="Confirm booking"><Check className="w-4 h-4" /></button>
                        <button onClick={() => handleUpdateStatus(b.id, 'CANCELLED')} className="p-2 bg-red-50 hover:bg-red-100 rounded-xl text-red-600 transition-colors" title="Cancel booking"><X className="w-4 h-4" /></button>
                      </>
                    )}
                    {b.status === 'CONFIRMED' && (
                      <>
                        <button onClick={() => handleUpdateStatus(b.id, 'COMPLETED')} className="p-2 bg-blue-50 hover:bg-blue-100 rounded-xl text-blue-600 transition-colors" title="Mark as completed"><CircleCheckBig className="w-4 h-4" /></button>
                        <button onClick={() => handleUpdateStatus(b.id, 'CANCELLED')} className="p-2 bg-red-50 hover:bg-red-100 rounded-xl text-red-600 transition-colors" title="Cancel booking"><X className="w-4 h-4" /></button>
                      </>
                    )}
                    {(b.status === 'COMPLETED' || b.status === 'CANCELLED') && (
                      <span className="text-xs text-gray-300">—</span>
                    )}
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
    </div>
  );
};
