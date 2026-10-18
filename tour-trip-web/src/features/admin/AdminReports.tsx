import React, { useState, useMemo } from 'react';
import { Calendar, CreditCard, RefreshCcw, DollarSign, Search, Loader2, FileSpreadsheet, FileText } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '../../api/client';
import { extractData } from '../../api/utils';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../../components/Pagination';
import { Skeleton } from '../../components/Skeleton';
import type { Booking, Payment, Refund, DashboardStats } from '../../types';

const BOOKING_STATUSES = ['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
const PAYMENT_STATUSES = ['ALL', 'PAID', 'PENDING', 'FAILED', 'REFUNDED'];

type StatsPayload = DashboardStats & { pendingRefunds?: number };

const EMPTY_BOOKINGS: Booking[] = [];
const EMPTY_PAYMENTS: Payment[] = [];

const money = (n: number) => `$${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const dayLabel = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const statusBadge = (status?: string) => {
  const colors: Record<string, string> = {
    CONFIRMED: 'bg-teal-50 text-teal-700',
    COMPLETED: 'bg-blue-50 text-blue-700',
    PENDING: 'bg-amber-50 text-amber-700',
    CANCELLED: 'bg-red-50 text-red-600',
    PAID: 'bg-teal-50 text-teal-700',
    FAILED: 'bg-red-50 text-red-600',
    REFUNDED: 'bg-gray-100 text-gray-600',
  };
  return colors[status || ''] || 'bg-gray-100 text-gray-600';
};

export const AdminReports: React.FC = () => {
  const [tab, setTab] = useState<'bookings' | 'payments'>('bookings');
  const [status, setStatus] = useState('ALL');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');
  const [exporting, setExporting] = useState<string | null>(null);

  const statsQuery = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async (): Promise<StatsPayload> => (await apiClient.get('/api/v1/dashboard/stats')).data,
  });
  const bookingsQuery = useQuery({
    queryKey: ['bookings'],
    queryFn: () => apiClient.get('/api/v1/bookings'),
    select: (res): Booking[] => extractData(res),
  });
  const paymentsQuery = useQuery({
    queryKey: ['payments'],
    queryFn: () => apiClient.get('/api/v1/payments'),
    select: (res): Payment[] => extractData(res),
  });
  const refundsQuery = useQuery({
    queryKey: ['refunds'],
    queryFn: () => apiClient.get('/api/v1/refunds'),
    select: (res): Refund[] => extractData(res),
  });

  const statsData = statsQuery.data;
  const stats: DashboardStats | null = statsData
    ? {
        totalRevenue: statsData.totalRevenue ?? 0,
        totalBookings: statsData.totalBookings ?? 0,
        totalTours: statsData.totalTours ?? 0,
        totalUsers: statsData.totalUsers ?? 0,
      }
    : null;
  const pendingRefunds = statsData?.pendingRefunds ?? 0;
  const bookings = bookingsQuery.data ?? EMPTY_BOOKINGS;
  const payments = paymentsQuery.data ?? EMPTY_PAYMENTS;
  const refunds = refundsQuery.data ?? [];

  const filteredBookings = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings.filter(b => {
      if (status !== 'ALL' && (b.status || 'PENDING') !== status) return false;
      const day = (b.bookingDate || b.createdAt || '').slice(0, 10);
      if (from && (!day || day < from)) return false;
      if (to && (!day || day > to)) return false;
      if (q) {
        const haystack = `${b.userEmail || ''} ${b.tourTitle || ''} ${b.status || ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [bookings, status, from, to, search]);

  const filteredPayments = useMemo(() => {
    const q = search.trim().toLowerCase();
    return payments.filter(p => {
      if (status !== 'ALL' && (p.status || 'PENDING') !== status) return false;
      const day = (p.paidAt || '').slice(0, 10);
      if (from && (!day || day < from)) return false;
      if (to && (!day || day > to)) return false;
      if (q) {
        const haystack = `${p.transactionId || ''} ${p.method || ''} ${String(p.bookingId || '')}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [payments, status, from, to, search]);

  const activeRows = tab === 'bookings' ? filteredBookings : filteredPayments;
  const { page, setPage, totalPages, pageItems, total, pageSize } = usePagination<Booking | Payment>(activeRows, 8);
  const rowsLoading = tab === 'bookings' ? bookingsQuery.isPending : paymentsQuery.isPending;

  const snapshot = useMemo(() => {
    const revenueByDay: Record<string, number> = {};
    payments.forEach(p => {
      if (!p.paidAt) return;
      const key = p.paidAt.slice(0, 10);
      revenueByDay[key] = (revenueByDay[key] || 0) + Number(p.amount || 0);
    });
    const points: { date: string; revenue: number }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      points.push({ date: key, revenue: Math.round((revenueByDay[key] || 0) * 100) / 100 });
    }
    return points;
  }, [payments]);

  const matchedRevenue = filteredPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const activeFilters = (status !== 'ALL' ? 1 : 0) + (from ? 1 : 0) + (to ? 1 : 0) + (search.trim() ? 1 : 0);

  const handleExport = async (kind: 'bookings' | 'payments', format: 'excel' | 'pdf') => {
    const id = `${kind}-${format}`;
    setExporting(id);
    try {
      const response = await apiClient.get(`/api/v1/reports/${kind}/${format}`, {
        params: {
          status: status !== 'ALL' ? status : undefined,
          from: from || undefined,
          to: to || undefined,
        },
        responseType: 'blob',
      });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${kind}-report.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`${kind === 'bookings' ? 'Bookings' : 'Payments'} report downloaded as ${format.toUpperCase()}`);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || `Failed to download ${format.toUpperCase()} report.`);
    } finally {
      setExporting(null);
    }
  };

  const resetFilters = () => {
    setStatus('ALL');
    setFrom('');
    setTo('');
    setSearch('');
    setPage(1);
  };

  const summaryCards = [
    { label: 'Total Bookings', pending: statsQuery.isPending && bookingsQuery.isPending, value: Number(stats?.totalBookings ?? bookings.length).toLocaleString(), icon: Calendar, color: 'text-teal-600 bg-teal-50' },
    { label: 'Total Revenue', pending: statsQuery.isPending, value: money(stats?.totalRevenue ?? 0), icon: DollarSign, color: 'text-teal-600 bg-teal-50' },
    { label: 'Transactions', pending: paymentsQuery.isPending, value: payments.length.toLocaleString(), icon: CreditCard, color: 'text-teal-600 bg-teal-50' },
    { label: 'Pending Refunds', pending: statsQuery.isPending && refundsQuery.isPending, value: (pendingRefunds || refunds.filter(r => r.status === 'PENDING').length).toLocaleString(), icon: RefreshCcw, color: 'text-teal-600 bg-teal-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">System Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Filter the data, preview it, then export exactly what you need from PostgreSQL.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{card.label}</span>
                {card.pending ? (
                  <Skeleton className="h-8 w-24 mt-1" />
                ) : (
                  <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{card.value}</h3>
                )}
              </div>
              <div className={`p-4 rounded-2xl ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-5">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Export Center</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Exports use the filters set in the preview below {activeFilters > 0 ? `(${activeFilters} active)` : '(no filters — full dataset)'}.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-gray-100 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-teal-50 text-teal-600">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Bookings Report</p>
                  <p className="text-xs text-gray-400">{filteredBookings.length} of {bookings.length} bookings match</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleExport('bookings', 'excel')}
                  disabled={exporting !== null}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-60 transition-all text-xs"
                >
                  {exporting === 'bookings-excel' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                  Excel
                </button>
                <button
                  onClick={() => handleExport('bookings', 'pdf')}
                  disabled={exporting !== null}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-2xl shadow-lg shadow-red-600/20 hover:bg-red-700 disabled:opacity-60 transition-all text-xs"
                >
                  {exporting === 'bookings-pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  PDF
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Payments & Revenue</p>
                  <p className="text-xs text-gray-400">{filteredPayments.length} of {payments.length} payments match · {money(matchedRevenue)}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleExport('payments', 'excel')}
                  disabled={exporting !== null}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-60 transition-all text-xs"
                >
                  {exporting === 'payments-excel' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                  Excel
                </button>
                <button
                  onClick={() => handleExport('payments', 'pdf')}
                  disabled={exporting !== null}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-2xl shadow-lg shadow-red-600/20 hover:bg-red-700 disabled:opacity-60 transition-all text-xs"
                >
                  {exporting === 'payments-pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  PDF
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 mb-3">Revenue snapshot · last 7 days</p>
            <div className="h-40 w-full">
              {paymentsQuery.isPending ? (
                <Skeleton className="h-full w-full" />
              ) : payments.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">No payment data yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={snapshot}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickLine={false} tickFormatter={dayLabel} />
                    <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} tickFormatter={(v: number) => `$${v}`} />
                    <Tooltip
                      cursor={{ fill: 'rgba(13, 148, 136, 0.08)' }}
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="bg-slate-900 text-white text-xs rounded-xl px-3 py-2 shadow-lg">
                            <p className="font-bold">{dayLabel(String(label))}</p>
                            <p className="text-teal-300">{money(Number(payload[0].value || 0))}</p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="revenue" fill="#0d9488" radius={[6, 6, 0, 0]} maxBarSize={38} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-5 self-start">
          <h3 className="text-xl font-bold text-gray-900">Quick Summary</h3>
          <div className="space-y-3 text-sm">
            {[
              { label: 'Bookings in preview', value: filteredBookings.length.toLocaleString() },
              { label: 'Payments in preview', value: filteredPayments.length.toLocaleString() },
              { label: 'Matched revenue', value: money(matchedRevenue) },
              { label: 'Total refunds', value: refunds.length.toLocaleString() },
              { label: 'Registered users', value: Number(stats?.totalUsers ?? 0).toLocaleString() },
              { label: 'Active tours', value: Number(stats?.totalTours ?? 0).toLocaleString() },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-gray-500">{row.label}</span>
                <span className="font-bold text-gray-900">{row.value}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-teal-50 border border-teal-100 p-4">
            <p className="text-xs text-teal-800 leading-relaxed">
              Tip: set a status, date range or search term below — the preview table and both exports will use the same selection.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-6 space-y-4 border-b border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex bg-gray-100 rounded-2xl p-1">
              {(['bookings', 'payments'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTab(t); setStatus('ALL'); setPage(1); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                    tab === t ? 'bg-white text-teal-700 shadow' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400">
              <span className="font-bold text-gray-700">{total}</span> record{total === 1 ? '' : 's'} in preview
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder={tab === 'bookings' ? 'Search email or tour…' : 'Search transaction or method…'}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-2xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <select
              value={status}
              onChange={e => { setStatus(e.target.value); setPage(1); }}
              className="px-4 py-2.5 border border-gray-200 rounded-2xl text-sm bg-gray-50/50 font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {(tab === 'bookings' ? BOOKING_STATUSES : PAYMENT_STATUSES).map(s => (
                <option key={s} value={s}>{s === 'ALL' ? 'All statuses' : s}</option>
              ))}
            </select>
            <input
              type="date"
              value={from}
              onChange={e => { setFrom(e.target.value); setPage(1); }}
              className="px-4 py-2.5 border border-gray-200 rounded-2xl text-sm bg-gray-50/50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="From date"
            />
            <input
              type="date"
              value={to}
              onChange={e => { setTo(e.target.value); setPage(1); }}
              className="px-4 py-2.5 border border-gray-200 rounded-2xl text-sm bg-gray-50/50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="To date"
            />
            {activeFilters > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase">
                {tab === 'bookings' ? (
                  <>
                    <th className="p-5">ID</th>
                    <th className="p-5">Customer</th>
                    <th className="p-5">Tour</th>
                    <th className="p-5">Date</th>
                    <th className="p-5 text-right">Total</th>
                    <th className="p-5 text-right">Status</th>
                  </>
                ) : (
                  <>
                    <th className="p-5">ID</th>
                    <th className="p-5">Transaction</th>
                    <th className="p-5">Method</th>
                    <th className="p-5">Paid at</th>
                    <th className="p-5 text-right">Amount</th>
                    <th className="p-5 text-right">Status</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {rowsLoading ? (
                <tr>
                  <td colSpan={6} className="p-5">
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map(n => <Skeleton key={n} className="h-10 w-full" />)}
                    </div>
                  </td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-400">No records match the current filters.</td>
                </tr>
              ) : tab === 'bookings' ? (
                (pageItems as Booking[]).map(b => (
                  <tr key={b.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="p-5 font-mono font-bold">#{b.id}</td>
                    <td className="p-5 text-gray-600">{b.userEmail || '—'}</td>
                    <td className="p-5 text-gray-900 font-medium max-w-[260px] truncate">{b.tourTitle || '—'}</td>
                    <td className="p-5 text-gray-500">{(b.bookingDate || b.createdAt || '').slice(0, 10) || '—'}</td>
                    <td className="p-5 text-right font-semibold">{money(Number(b.totalPrice || 0))}</td>
                    <td className="p-5 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${statusBadge(b.status)}`}>{b.status}</span>
                    </td>
                  </tr>
                ))
              ) : (
                (pageItems as Payment[]).map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="p-5 font-mono font-bold">#{p.id}</td>
                    <td className="p-5 font-mono text-gray-600">{p.transactionId || '—'}</td>
                    <td className="p-5 text-gray-700">{p.method || '—'}</td>
                    <td className="p-5 text-gray-500">{(p.paidAt || '').slice(0, 16).replace('T', ' ') || '—'}</td>
                    <td className="p-5 text-right font-semibold">{money(Number(p.amount || 0))}</td>
                    <td className="p-5 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${statusBadge(p.status)}`}>{p.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 pb-5">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} total={total} pageSize={pageSize} />
        </div>
      </div>
    </div>
  );
};
