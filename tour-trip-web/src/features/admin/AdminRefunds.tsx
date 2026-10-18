import React from 'react';
import { Check, X, Loader2, CircleCheckBig } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../api/client';
import { usePagedQuery } from '../../hooks/usePagedQuery';
import { Pagination } from '../../components/Pagination';
import type { Refund, RefundStatus, BookingStatus } from '../../types';

const bookingStatusClass = (status: BookingStatus) =>
  status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700' :
  status === 'PENDING' ? 'bg-amber-50 text-amber-700' :
  status === 'CANCELLED' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700';

const methodClass = (method: string) =>
  method === 'CASH' ? 'bg-amber-50 text-amber-700' :
  method === 'KHQR' ? 'bg-teal-50 text-teal-700' : 'bg-gray-100 text-gray-600';

export const AdminRefunds: React.FC = () => {
  const {
    items: refunds,
    isLoading: loading,
    refetch,
    page, setPage, totalPages, total, pageSize,
  } = usePagedQuery<Refund>('admin-refunds', '/api/v1/refunds/page', { pageSize: 12 });

  const handleStatus = async (id: number, status: RefundStatus) => {
    try {
      await apiClient.patch(`/api/v1/refunds/${id}/status?status=${status}`);
      toast.success(
        status === 'APPROVED'
          ? 'Refund approved — payment refunded and booking cancelled'
          : status === 'COMPLETED'
            ? 'Refund completed'
            : `Refund ${status.toLowerCase()}`
      );
      refetch();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message
        || (err as { message?: string })?.message
        || 'Server error';
      toast.error('Failed to update refund: ' + message);
    }
  };

  const statusClass = (status: RefundStatus) =>
    status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' :
    status === 'COMPLETED' ? 'bg-blue-50 text-blue-700' :
    status === 'REJECTED' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Refunds List</h1>
        <p className="text-sm text-gray-500 mt-1">Customer refund requests</p>
      </div>
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase">
              <th className="p-5">Refund ID</th>
              <th className="p-5">Booking & Customer</th>
              <th className="p-5">Amount</th>
              <th className="p-5">Reason</th>
              <th className="p-5">Status</th>
              <th className="p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-10 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading refunds...
                  </div>
                </td>
              </tr>
            ) : refunds.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-400">No refund requests found.</td>
              </tr>
            ) : (
              refunds.map(r => (
                <tr key={r.id}>
                  <td className="p-5 font-mono font-bold align-top">#{r.id}</td>
                  <td className="p-5 align-top">
                    <div className="space-y-1.5">
                      <span className="block font-semibold text-gray-900">
                        {r.tourTitle || r.booking?.tourTitle || 'Tour'}
                      </span>
                      <span className="block text-xs text-gray-500">
                        Booking #{r.bookingId ?? r.booking?.id}
                        {r.userFullName ? ` • ${r.userFullName}` : (r.userEmail ? ` • ${r.userEmail}` : '')}
                      </span>
                      {r.userFullName && r.userEmail && (
                        <span className="block text-xs text-gray-400">{r.userEmail}</span>
                      )}
                      {(r.startDate || r.endDate) && (
                        <span className="block text-xs text-gray-500">
                          {r.startDate}{r.startDate && r.endDate ? ' → ' : ''}{r.endDate}
                          {r.numberOfParticipants ? ` • ${r.numberOfParticipants} pax` : ''}
                        </span>
                      )}
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {r.bookingStatus && (
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${bookingStatusClass(r.bookingStatus)}`}>
                            {r.bookingStatus}
                          </span>
                        )}
                        {r.paymentMethod && (
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${methodClass(r.paymentMethod)}`}>
                            {r.paymentMethod}{r.paymentStatus ? ` · ${r.paymentStatus}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-5 align-top">
                    <span className="block font-extrabold text-teal-600">${r.amount ?? 0}</span>
                    {r.bookingTotal != null && (
                      <span className="block text-xs text-gray-400">booking ${r.bookingTotal}</span>
                    )}
                  </td>
                  <td className="p-5 max-w-xs align-top">{r.reason}</td>
                  <td className="p-5 align-top">
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold ${statusClass(r.status)}`}>
                      {r.status}
                    </span>
                    {r.refundedAt && (
                      <span className="block mt-1 text-[11px] text-gray-400">
                        refunded {new Date(r.refundedAt).toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td className="p-5 text-right space-x-2 align-top">
                    {r.status === 'PENDING' && (
                      <>
                        <button onClick={() => handleStatus(r.id, 'APPROVED')} className="p-2 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-emerald-600 transition-colors" title="Approve (refunds payment & cancels booking)"><Check className="w-4 h-4" /></button>
                        <button onClick={() => handleStatus(r.id, 'REJECTED')} className="p-2 bg-red-50 hover:bg-red-100 rounded-xl text-red-600 transition-colors" title="Reject"><X className="w-4 h-4" /></button>
                      </>
                    )}
                    {r.status === 'APPROVED' && (
                      <button onClick={() => handleStatus(r.id, 'COMPLETED')} className="p-2 bg-blue-50 hover:bg-blue-100 rounded-xl text-blue-600 transition-colors" title="Mark refund completed"><CircleCheckBig className="w-4 h-4" /></button>
                    )}
                    {(r.status === 'COMPLETED' || r.status === 'REJECTED') && (
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
