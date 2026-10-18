import React, { useState, useMemo } from 'react';
import { DollarSign, Calendar, MapPin, Users, Download, X, TrendingUp, TrendingDown, ChevronRight, Sparkles } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, ReferenceLine,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '../../api/client';
import { getToken } from '../../api/authStorage';
import { extractData } from '../../api/utils';
import { Skeleton } from '../../components/Skeleton';
import type { DashboardStats, Booking, Payment } from '../../types';

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: '#0d9488',
  PENDING: '#f59e0b',
  COMPLETED: '#3b82f6',
  CANCELLED: '#ef4444',
};

const METHOD_COLORS: Record<string, string> = {
  KHQR: '#0d9488',
  CREDIT_CARD: '#3b82f6',
  CASH: '#f59e0b',
};

const EMPTY_STATS: DashboardStats = {
  totalRevenue: 0,
  totalBookings: 0,
  totalTours: 0,
  totalUsers: 0,
};

type StatsPayload = DashboardStats & { pendingRefunds?: number };

const EMPTY_BOOKINGS: Booking[] = [];
const EMPTY_PAYMENTS: Payment[] = [];

type RangeDays = 7 | 14 | 30;

const toKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const money = (n: number) => `$${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const formatDay = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const formatDayLong = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
};

interface SeriesPoint {
  date: string;
  revenue: number;
  payments: number;
  bookings: number;
}

interface ChartClickState {
  activeTooltipIndex?: number | string | null;
  activeLabel?: string | number | null;
}

export const AdminDashboard: React.FC = () => {
  const [range, setRange] = useState<RangeDays>(7);
  const [detailDate, setDetailDate] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

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

  const statsData = statsQuery.data;
  const stats: DashboardStats = statsData
    ? {
        totalRevenue: statsData.totalRevenue ?? EMPTY_STATS.totalRevenue,
        totalBookings: statsData.totalBookings ?? EMPTY_STATS.totalBookings,
        totalTours: statsData.totalTours ?? EMPTY_STATS.totalTours,
        totalUsers: statsData.totalUsers ?? EMPTY_STATS.totalUsers,
      }
    : EMPTY_STATS;
  const pendingRefunds = statsData?.pendingRefunds ?? 0;
  const bookings = bookingsQuery.data ?? EMPTY_BOOKINGS;
  const payments = paymentsQuery.data ?? EMPTY_PAYMENTS;

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Continuous daily series so the line spikes up and down instead of running flat
  const { series, prevPeriodRevenue, dayStats } = useMemo(() => {
    const dayOffsetKey = (offset: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() - offset);
      return toKey(d);
    };

    const revenueByDay: Record<string, number> = {};
    const paymentsByDay: Record<string, number> = {};
    payments.forEach(p => {
      if (!p.paidAt) return;
      const key = p.paidAt.slice(0, 10);
      revenueByDay[key] = (revenueByDay[key] || 0) + Number(p.amount || 0);
      paymentsByDay[key] = (paymentsByDay[key] || 0) + 1;
    });

    const bookingsByDay: Record<string, number> = {};
    bookings.forEach(b => {
      const raw = b.bookingDate || b.createdAt;
      if (!raw) return;
      const key = raw.slice(0, 10);
      bookingsByDay[key] = (bookingsByDay[key] || 0) + 1;
    });

    const points: SeriesPoint[] = [];
    for (let i = range - 1; i >= 0; i--) {
      const date = dayOffsetKey(i);
      points.push({
        date,
        revenue: Math.round((revenueByDay[date] || 0) * 100) / 100,
        payments: paymentsByDay[date] || 0,
        bookings: bookingsByDay[date] || 0,
      });
    }

    let prev = 0;
    for (let i = range * 2 - 1; i >= range; i--) {
      prev += revenueByDay[dayOffsetKey(i)] || 0;
    }

    const dayBookings = detailDate ? bookings.filter(b => (b.bookingDate || b.createdAt || '').slice(0, 10) === detailDate) : [];
    const dayPayments = detailDate ? payments.filter(p => (p.paidAt || '').slice(0, 10) === detailDate) : [];

    return {
      series: points,
      prevPeriodRevenue: Math.round(prev * 100) / 100,
      dayStats: { bookings: dayBookings, payments: dayPayments },
    };
  }, [payments, bookings, range, detailDate, today]);

  const periodRevenue = series.reduce((sum, p) => sum + p.revenue, 0);
  const periodPayments = series.reduce((sum, p) => sum + p.payments, 0);
  const periodBookings = series.reduce((sum, p) => sum + p.bookings, 0);
  const avgRevenue = periodRevenue / series.length;
  const peak = series.reduce((max, p) => (p.revenue > max.revenue ? p : max), series[0]);
  const activeDays = series.filter(p => p.revenue > 0).length;
  const revenueChange = prevPeriodRevenue > 0
    ? Math.round(((periodRevenue - prevPeriodRevenue) / prevPeriodRevenue) * 100)
    : null;

  const statusDonutData = Object.entries(
    bookings.reduce<Record<string, number>>((acc, b) => {
      const key = b.status || 'PENDING';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value, color: STATUS_COLORS[name] || '#94a3b8' }));

  const statusBreakdown = Object.entries(
    bookings.reduce<Record<string, number>>((acc, b) => {
      const key = b.status || 'PENDING';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const methodBreakdown = Object.entries(
    payments.reduce<Record<string, number>>((acc, p) => {
      const key = p.method || p.paymentMethod || 'OTHER';
      acc[key] = (acc[key] || 0) + Number(p.amount || 0);
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100, color: METHOD_COLORS[name] || '#94a3b8' }))
    .sort((a, b) => b.value - a.value);

  const detailDay = detailDate
    ? series.find(p => p.date === detailDate) ?? { date: detailDate, revenue: 0, payments: 0, bookings: 0 }
    : null;

  const openDetail = (date: string | null = null) => {
    setDetailDate(date);
    setDetailOpen(true);
  };

  const handleChartClick = (state: ChartClickState) => {
    const idx = typeof state?.activeTooltipIndex === 'number' ? state.activeTooltipIndex : null;
    const key = idx != null ? series[idx]?.date : (typeof state?.activeLabel === 'string' ? state.activeLabel : null);
    if (key) openDetail(key);
  };

  const handleExport = async (type: 'excel' | 'pdf') => {
    try {
      const endpoint = type === 'excel' ? '/api/v1/reports/bookings/excel' : '/api/v1/reports/bookings/pdf';
      const token = getToken();
      const response = await apiClient.get(endpoint, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bookings-report.${type === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Bookings report downloaded as ${type.toUpperCase()}`);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || `Failed to download ${type.toUpperCase()} report.`);
    }
  };

  const statCards = [
    { label: 'Total Revenue', value: money(stats.totalRevenue), icon: DollarSign, color: 'text-teal-600 bg-teal-50', pending: statsQuery.isPending },
    { label: 'Total Bookings', value: Number(stats.totalBookings || 0).toLocaleString(), icon: Calendar, color: 'text-teal-600 bg-teal-50', pending: statsQuery.isPending },
    { label: 'Active Tours', value: Number(stats.totalTours || 0).toLocaleString(), icon: MapPin, color: 'text-teal-600 bg-teal-50', pending: statsQuery.isPending },
    { label: 'Registered Users', value: Number(stats.totalUsers || 0).toLocaleString(), icon: Users, color: 'text-teal-600 bg-teal-50', pending: statsQuery.isPending },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Dashboard Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time platform metrics from the database. Click any card or chart point for a deep dive.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-2xl text-xs font-semibold shadow-lg shadow-teal-600/20 hover:bg-teal-700 transition-all"
          >
            <Download className="w-4 h-4" /> Export Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-700 text-white rounded-2xl text-xs font-semibold shadow-lg shadow-teal-700/20 hover:bg-teal-800 transition-all"
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => openDetail()}
              className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between text-left cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg hover:border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <div>
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{stat.label}</span>
                {stat.pending ? (
                  <Skeleton className="h-8 w-24 mt-1" />
                ) : (
                  <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{stat.value}</h3>
                )}
                <span className="mt-1.5 inline-flex items-center gap-0.5 text-[11px] font-bold text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  View details <ChevronRight className="w-3 h-3" />
                </span>
              </div>
              <div className={`p-4 rounded-2xl ${stat.color}`}>
                <Icon className="w-7 h-7" />
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Revenue Trend</h3>
              <p className="text-xs text-gray-400 mt-0.5">Click a point on the line to inspect that day</p>
            </div>
            <div className="flex bg-gray-100 rounded-2xl p-1">
              {([7, 14, 30] as RangeDays[]).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setRange(d)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    range === d ? 'bg-white text-teal-700 shadow' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {d}D
                </button>
              ))}
            </div>
          </div>
          <div className="h-80 w-full">
            {paymentsQuery.isPending ? (
              <Skeleton className="h-full w-full" />
            ) : payments.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No payment data available yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series} onClick={handleChartClick} className="cursor-pointer">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} tickFormatter={formatDay} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} tickFormatter={(v: number) => `$${v}`} />
                  <Tooltip
                    cursor={{ stroke: '#99f6e4', strokeWidth: 1.5 }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const point = payload[0].payload as SeriesPoint;
                      return (
                        <div className="bg-slate-900 text-white text-xs rounded-2xl px-4 py-3 shadow-xl space-y-1">
                          <p className="font-bold">{formatDayLong(String(label ?? point.date))}</p>
                          <p className="text-teal-300 font-semibold">Revenue: {money(point.revenue)}</p>
                          <p className="text-gray-300">{point.payments} payment{point.payments === 1 ? '' : 's'} · {point.bookings} booking{point.bookings === 1 ? '' : 's'}</p>
                          <p className="text-gray-400 text-[10px]">Click for full breakdown</p>
                        </div>
                      );
                    }}
                  />
                  <ReferenceLine
                    y={Math.round(avgRevenue * 100) / 100}
                    stroke="#f59e0b"
                    strokeDasharray="6 4"
                    label={{ value: 'Avg', position: 'insideTopRight', fill: '#f59e0b', fontSize: 11, fontWeight: 700 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0d9488"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#0d9488', strokeWidth: 0 }}
                    activeDot={{ r: 8, fill: '#0d9488', stroke: '#99f6e4', strokeWidth: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-100">
            {[
              { label: `Revenue (${range}d)`, value: money(periodRevenue) },
              { label: `Payments (${range}d)`, value: periodPayments.toLocaleString() },
              { label: `Bookings (${range}d)`, value: periodBookings.toLocaleString() },
              { label: 'Active days', value: `${activeDays}/${series.length}` },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{item.label}</p>
                <p className="text-sm font-extrabold text-gray-900 mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Bookings by Status</h3>
            <p className="text-xs text-gray-400 mt-0.5">All-time distribution across {stats.totalBookings || 0} bookings</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {bookingsQuery.isPending ? (
              <Skeleton className="h-48 w-48 rounded-full" />
            ) : statusDonutData.length === 0 ? (
              <div className="text-gray-400 text-sm">No bookings yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusDonutData} innerRadius={65} outerRadius={95} paddingAngle={6} dataKey="value">
                    {statusDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-center gap-6 text-xs font-semibold flex-wrap">
            {statusDonutData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => openDetail()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-teal-50 text-teal-700 text-xs font-bold hover:bg-teal-100 transition-colors"
          >
            <Sparkles className="w-4 h-4" /> Open full analytics
          </button>
        </div>
      </div>

      {detailOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Analytics details"
          onClick={() => setDetailOpen(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar p-7 space-y-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">
                  {detailDate ? 'Daily Breakdown' : 'Platform Analytics'}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {detailDate ? formatDayLong(detailDate) : `Last ${range} days · generated ${new Date().toLocaleString()}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailOpen(false)}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${stat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{stat.label}</p>
                    {stat.pending ? (
                      <Skeleton className="h-6 w-16 mt-0.5" />
                    ) : (
                      <p className="text-xl font-extrabold text-gray-900 mt-0.5">{stat.value}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {detailDay && (
              <div className="rounded-2xl border border-teal-100 bg-teal-50/60 p-5 space-y-4">
                <p className="text-xs font-extrabold uppercase tracking-wider text-teal-700">This day</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Revenue', value: money(detailDay.revenue) },
                    { label: 'Payments', value: detailDay.payments.toLocaleString() },
                    { label: 'Bookings made', value: dayStats.bookings.length.toLocaleString() },
                    { label: 'Transactions', value: dayStats.payments.length.toLocaleString() },
                  ].map((item, i) => (
                    <div key={i}>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-teal-600/70">{item.label}</p>
                      <p className="text-lg font-extrabold text-gray-900">{item.value}</p>
                    </div>
                  ))}
                </div>
                {dayStats.payments.length > 0 && (
                  <div className="bg-white rounded-2xl border border-teal-100 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-teal-50 text-teal-700 font-bold uppercase text-[10px]">
                          <th className="px-4 py-2.5">Transaction</th>
                          <th className="px-4 py-2.5">Booking</th>
                          <th className="px-4 py-2.5">Method</th>
                          <th className="px-4 py-2.5 text-right">Amount</th>
                          <th className="px-4 py-2.5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {dayStats.payments.map(p => (
                          <tr key={p.id}>
                            <td className="px-4 py-2.5 font-mono">{p.transactionId || `PAY-${p.id}`}</td>
                            <td className="px-4 py-2.5">#{p.bookingId}</td>
                            <td className="px-4 py-2.5">{p.method}</td>
                            <td className="px-4 py-2.5 text-right font-semibold">{money(Number(p.amount || 0))}</td>
                            <td className="px-4 py-2.5 text-right">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">{p.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-gray-100 p-5 space-y-3">
                <p className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Period analysis</p>
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-500">Revenue ({range} days)</span>
                    <span className="font-bold text-gray-900">{money(periodRevenue)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-500">Vs previous {range} days</span>
                    {revenueChange === null ? (
                      <span className="font-bold text-gray-400">— no prior data</span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 font-bold ${revenueChange >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {revenueChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {revenueChange >= 0 ? '+' : ''}{revenueChange}%
                        <span className="text-gray-400 font-medium">({money(prevPeriodRevenue)})</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-500">Daily average</span>
                    <span className="font-bold text-gray-900">{money(avgRevenue)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-500">Peak day</span>
                    <span className="font-bold text-gray-900">
                      {formatDay(peak.date)} · {money(peak.revenue)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-500">Pending refunds</span>
                    <span className="font-bold text-gray-900">{pendingRefunds}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 p-5 space-y-4">
                <p className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Revenue by payment method</p>
                {methodBreakdown.length === 0 ? (
                  <p className="text-sm text-gray-400">No payments yet.</p>
                ) : (
                <div className="space-y-3">
                    {methodBreakdown.map((m, i) => {
                      const methodTotal = methodBreakdown.reduce((s, x) => s + x.value, 0);
                      const pct = methodTotal > 0 ? Math.round((m.value / methodTotal) * 100) : 0;
                      return (
                        <div key={i}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-semibold text-gray-600">{m.name}</span>
                            <span className="font-bold text-gray-900">{money(m.value)} · {pct}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: m.color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 p-5 space-y-4">
              <p className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Bookings by status</p>
              {statusBreakdown.length === 0 ? (
                <p className="text-sm text-gray-400">No bookings yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {statusBreakdown.map((s, i) => (
                    <div key={i} className="bg-gray-50 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.name] || '#94a3b8' }} />
                        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{s.name}</span>
                      </div>
                      <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setDetailOpen(false)}
                className="px-5 py-2.5 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => openDetail(null)}
                className="px-5 py-2.5 rounded-2xl bg-teal-600 text-white text-sm font-semibold shadow-lg shadow-teal-600/20 hover:bg-teal-700 transition-all"
              >
                Back to overview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
