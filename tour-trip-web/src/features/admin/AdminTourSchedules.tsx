import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '../../api/client';
import { usePagedQuery } from '../../hooks/usePagedQuery';
import { Pagination } from '../../components/Pagination';
import type { Tour } from '../../types';

interface TourSchedule {
  id: number;
  tourId: number;
  tourTitle: string;
  startDate: string;
  endDate: string;
  availableSlots: number;
  status: 'ACTIVE' | 'FULL' | 'CANCELLED' | 'COMPLETED';
}

export const AdminTourSchedules: React.FC = () => {
  const {
    items: schedules,
    isLoading: loading,
    refetch,
    page, setPage, totalPages, total, pageSize,
  } = usePagedQuery<TourSchedule>('admin-schedules', '/api/v1/schedules/page', { pageSize: 12 });

  const toursQuery = useQuery({
    queryKey: ['tours', 'select'],
    queryFn: () => apiClient.get('/api/v1/tours/page', { params: { page: 0, size: 50 } }),
    select: (res): Tour[] => res.data?.content ?? [],
  });
  const tours = toursQuery.data ?? [];

  const [modalOpen, setModalOpen] = useState(false);

  const [selectedTourId, setSelectedTourId] = useState<number | ''>('');
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState(20);
  const [status, setStatus] = useState<'ACTIVE' | 'FULL' | 'CANCELLED' | 'COMPLETED'>('ACTIVE');

  const handleOpenCreate = () => {
    setEditingScheduleId(null);
    setSelectedTourId('');
    setStartDate('');
    setEndDate('');
    setAvailableSlots(20);
    setStatus('ACTIVE');
    setModalOpen(true);
  };

  const handleOpenEdit = (schedule: TourSchedule) => {
    setEditingScheduleId(schedule.id);
    setSelectedTourId(schedule.tourId);
    setStartDate(schedule.startDate);
    setEndDate(schedule.endDate);
    setAvailableSlots(schedule.availableSlots);
    setStatus(schedule.status);
    setModalOpen(true);
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTourId) {
      toast.error('Please select a tour first');
      return;
    }

    try {
      const payload = { startDate, endDate, availableSlots, status };
      if (editingScheduleId) {
        await apiClient.put(`/api/v1/schedules/${editingScheduleId}`, payload);
        toast.success('Schedule updated successfully');
      } else {
        await apiClient.post(`/api/v1/tours/${selectedTourId}/schedules`, payload);
        toast.success('Schedule created successfully');
      }
      setModalOpen(false);
      refetch();
    } catch {
      toast.error('Failed to save schedule');
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;
    try {
      await apiClient.delete(`/api/v1/schedules/${id}`);
      toast.success('Schedule deleted successfully');
      refetch();
    } catch {
      toast.error('Failed to delete schedule');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Tour Schedules</h1>
          <p className="text-sm text-gray-500 mt-1">Manage dates and availability for all tours</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-3 bg-teal-600 text-white rounded-2xl text-xs font-semibold shadow-lg shadow-teal-600/30 hover:bg-teal-700 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Schedule
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase">
            <tr>
              <th className="p-5">ID</th>
              <th className="p-5">Tour</th>
              <th className="p-5">Start Date</th>
              <th className="p-5">End Date</th>
              <th className="p-5">Slots</th>
              <th className="p-5">Status</th>
              <th className="p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-10 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading all schedules...
                  </div>
                </td>
              </tr>
            ) : schedules.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-gray-400">No schedules found.</td>
              </tr>
            ) : (
              schedules.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-5 font-mono font-bold">#{s.id}</td>
                  <td className="p-5 font-semibold">{s.tourTitle || `Tour #${s.tourId}`}</td>
                  <td className="p-5">{s.startDate}</td>
                  <td className="p-5">{s.endDate}</td>
                  <td className="p-5">{s.availableSlots}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      s.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' :
                      s.status === 'FULL' ? 'bg-amber-50 text-amber-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-5 text-right space-x-2">
                    <button onClick={() => handleOpenEdit(s)} className="p-2 bg-teal-50 hover:bg-teal-100 rounded-xl text-teal-600 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteSchedule(s.id)} className="p-2 bg-red-50 hover:bg-red-100 rounded-xl text-red-600 transition-colors">
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
          <div className="bg-white rounded-3xl max-w-md w-full p-8 space-y-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900">{editingScheduleId ? 'Edit Schedule' : 'Add New Schedule'}</h3>
            <form onSubmit={handleSaveSchedule} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Tour</label>
                <select
                  value={selectedTourId}
                  onChange={e => setSelectedTourId(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-gray-50"
                  required
                >
                  <option value="">-- Select a Tour --</option>
                  {tours.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date</label>
                  <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">End Date</label>
                  <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-gray-50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Available Slots</label>
                <input type="number" required value={availableSlots} onChange={e => setAvailableSlots(Number(e.target.value))} className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value as TourSchedule['status'])} className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-gray-50">
                  <option value="ACTIVE">Active</option>
                  <option value="FULL">Full</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="w-1/2 py-3 border border-gray-200 font-semibold rounded-2xl text-sm">Cancel</button>
                <button type="submit" className="w-1/2 py-3 bg-teal-600 text-white font-semibold rounded-2xl shadow text-sm hover:bg-teal-700">Save Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
