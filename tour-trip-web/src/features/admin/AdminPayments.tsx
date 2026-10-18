import React, { useState, useEffect } from 'react';
import { Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../api/client';
import { extractData } from '../../api/utils';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../../components/Pagination';
import type { Payment } from '../../types';

const statusClass = (status: string) =>
  status === 'PAID' ? 'bg-emerald-50 text-emerald-700' :
  status === 'PENDING' ? 'bg-amber-50 text-amber-700' :
  status === 'REFUNDED' ? 'bg-blue-50 text-blue-700' :
  status === 'FAILED' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700';

export const AdminPayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { page, setPage, totalPages, pageItems, total, pageSize } = usePagination(payments, 12);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await apiClient.get('/api/v1/payments');
        setPayments(extractData(res));
      } catch {
        toast.error('Failed to load payments');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const handleMarkPaid = async (id: number) => {
    try {
      await apiClient.patch(`/api/v1/payments/${id}/status?status=PAID`);
      toast.success('Payment marked as paid — booking confirmed');
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'PAID' } : p));
    } catch {
      toast.error('Failed to update payment');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Payments List</h1>
        <p className="text-sm text-gray-500 mt-1">Customer payment transactions</p>
      </div>
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase">
              <th className="p-5">Payment ID</th>
              <th className="p-5">Booking ID</th>
              <th className="p-5">Method</th>
              <th className="p-5">Amount</th>
              <th className="p-5">Transaction</th>
              <th className="p-5">Status</th>
              <th className="p-5">Date</th>
              <th className="p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {loading ? (
              <tr>
                <td colSpan={8} className="p-10 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading payments...
                  </div>
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-10 text-center text-gray-400">No payments found.</td>
              </tr>
            ) : (
              pageItems.map(p => (
                <tr key={p.id}>
                  <td className="p-5 font-mono font-bold">#{p.id}</td>
                  <td className="p-5 font-mono">#{p.bookingId}</td>
                  <td className="p-5 font-semibold">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      p.method === 'CASH' ? 'bg-amber-50 text-amber-700' :
                      p.method === 'KHQR' ? 'bg-teal-50 text-teal-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {p.method || p.paymentMethod || '—'}
                    </span>
                  </td>
                  <td className="p-5 font-extrabold text-teal-600">${p.amount}</td>
                  <td className="p-5 font-mono text-xs text-gray-500">{p.transactionId || '—'}</td>
                  <td className="p-5"><span className={`px-3 py-1 rounded-xl text-xs font-bold ${statusClass(p.status)}`}>{p.status}</span></td>
                  <td className="p-5 text-gray-400 text-xs">{p.paidAt || p.createdAt || '—'}</td>
                  <td className="p-5 text-right">
                    {p.status === 'PENDING' ? (
                      <button
                        onClick={() => handleMarkPaid(p.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl text-xs font-semibold transition-colors"
                        title="Mark as paid and confirm the booking"
                      >
                        <Check className="w-4 h-4" /> Mark Paid
                      </button>
                    ) : (
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
