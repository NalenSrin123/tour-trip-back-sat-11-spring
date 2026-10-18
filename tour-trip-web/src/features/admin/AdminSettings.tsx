import React, { useState, useEffect, useMemo } from 'react';
import { Trash2, Loader2, Pencil, Search, Plus, X, Save, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../api/client';
import { extractData } from '../../api/utils';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../../components/Pagination';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import type { Setting } from '../../types';

const PRESETS: { key: string; value: string; description: string }[] = [
  { key: 'SUPPORT_EMAIL', value: 'support@tourtrip.com', description: 'Public support contact shown to customers' },
  { key: 'DEFAULT_CURRENCY', value: 'USD', description: 'Currency used for prices and reports' },
  { key: 'MAINTENANCE_MODE', value: 'false', description: 'Set to true to block new bookings' },
  { key: 'BOOKING_MAX_PARTICIPANTS', value: '10', description: 'Maximum travellers per single booking' },
  { key: 'SITE_NAME', value: 'Explore Cambodia', description: 'Brand name used across the platform' },
];

const relativeTime = (iso?: string | null) => {
  if (!iso) return 'Never updated';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 'Never updated';
  const diff = Math.max(0, Date.now() - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} d ago`;
  return new Date(iso).toLocaleDateString();
};

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Setting | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return settings;
    return settings.filter(s =>
      `${s.settingKey ?? s.key ?? ''} ${s.settingValue ?? s.value ?? ''} ${s.description ?? ''}`.toLowerCase().includes(q)
    );
  }, [settings, query]);

  const { page, setPage, totalPages, pageItems, total, pageSize } = usePagination(filtered, 10);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await apiClient.get('/api/v1/settings');
        if (active) setSettings(extractData(res));
      } catch {
        if (active) toast.error('Failed to load settings');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [refreshKey]);

  const resetForm = () => {
    setEditingId(null);
    setNewKey('');
    setNewValue('');
    setNewDesc('');
  };

  const handlePreset = (preset: typeof PRESETS[number]) => {
    const existing = settings.find(s => (s.settingKey ?? s.key) === preset.key);
    if (existing) {
      setEditingId(existing.id);
      setNewKey(existing.settingKey ?? existing.key ?? preset.key);
      setNewValue(existing.settingValue ?? existing.value ?? '');
      setNewDesc(existing.description ?? preset.description);
      toast.info(`Editing existing setting ${preset.key}`);
    } else {
      setEditingId(null);
      setNewKey(preset.key);
      setNewValue(preset.value);
      setNewDesc(preset.description);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) {
      toast.error('Please enter key and value');
      return;
    }
    setSaving(true);
    try {
      await apiClient.post('/api/v1/settings', {
        settingKey: newKey.trim(),
        settingValue: newValue.trim(),
        description: newDesc.trim(),
      });
      toast.success(editingId !== null ? 'Setting updated successfully' : 'Setting saved successfully');
      resetForm();
      setRefreshKey(k => k + 1);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error('Failed to save setting: ' + (message || 'Server error'));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (setting: Setting) => {
    setEditingId(setting.id);
    setNewKey(setting.settingKey ?? setting.key ?? '');
    setNewValue(setting.settingValue ?? setting.value ?? '');
    setNewDesc(setting.description ?? '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/api/v1/settings/${deleteTarget.id}`);
      toast.success(`Setting "${deleteTarget.settingKey ?? deleteTarget.key}" deleted`);
      if (editingId === deleteTarget.id) resetForm();
      setSettings(prev => prev.filter(s => s.id !== deleteTarget.id));
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error('Failed to delete setting: ' + (message || 'Server error'));
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const renderValue = (value: string) => {
    const v = value ?? '';
    if (v === 'true' || v === 'false') {
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
          v === 'true' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${v === 'true' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
          {v}
        </span>
      );
    }
    return <span className="text-gray-700 break-all max-w-[280px] inline-block">{v || '—'}</span>;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">System Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Key-value configuration stored in PostgreSQL — most recently updated first.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search key, value or description…"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-2xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <p className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Quick presets</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => {
            const exists = settings.some(s => (s.settingKey ?? s.key) === p.key);
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => handlePreset(p)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all ${
                  exists
                    ? 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-teal-200'
                }`}
                title={p.description}
              >
                {p.key}
                <span className="ml-1.5 text-[10px] font-semibold opacity-70">{exists ? 'edit' : 'add'}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-4 max-w-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            {editingId !== null ? 'Edit Setting' : 'Add New Setting'}
          </h3>
          {editingId !== null && (
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-700"
            >
              <X className="w-3.5 h-3.5" /> Cancel edit
            </button>
          )}
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Key</label>
            <input
              type="text"
              value={newKey}
              onChange={e => setNewKey(e.target.value)}
              placeholder="e.g. maintenance_mode"
              readOnly={editingId !== null}
              className={`w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                editingId !== null ? 'text-gray-500 cursor-not-allowed' : ''
              }`}
              required
            />
            {editingId !== null && (
              <p className="text-[11px] text-gray-400 mt-1">Key is locked while editing. Save, then create a new key if you need to rename.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Value</label>
            <input
              type="text"
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              placeholder="e.g. false"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              type="text"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="What is this setting used for?"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white font-semibold rounded-2xl shadow hover:bg-teal-700 disabled:opacity-60 transition-all text-sm"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingId !== null ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editingId !== null ? 'Update Setting' : 'Create Setting'}
            </button>
            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-2xl hover:bg-gray-50 transition-all text-sm"
              >
                Discard
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-bold text-gray-900">All settings</p>
          <p className="text-xs text-gray-400">{filtered.length} of {settings.length} shown{query && ` · filtered by "${query}"`}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase">
                <th className="p-5">ID</th>
                <th className="p-5">Key</th>
                <th className="p-5">Value</th>
                <th className="p-5">Description</th>
                <th className="p-5">Last Updated</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <Loader2 className="w-5 h-5 animate-spin" /> Loading settings...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-400">
                    {query ? 'No settings match your search.' : 'No settings found. Create one above.'}
                  </td>
                </tr>
              ) : (
                pageItems.map(s => (
                  <tr key={s.id} className={`hover:bg-gray-50/70 transition-colors ${editingId === s.id ? 'bg-teal-50/40' : ''}`}>
                    <td className="p-5 font-mono font-bold">#{s.id}</td>
                    <td className="p-5 font-semibold text-gray-900 font-mono text-xs">{s.settingKey ?? s.key}</td>
                    <td className="p-5">{renderValue(s.settingValue ?? s.value ?? '')}</td>
                    <td className="p-5 text-gray-500 text-xs max-w-[220px]">{s.description || '—'}</td>
                    <td className="p-5">
                      <span className={`text-xs font-semibold ${s.updatedAt ? 'text-teal-700' : 'text-gray-400'}`}>
                        {relativeTime(s.updatedAt)}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => handleEdit(s)}
                          className="p-2 bg-teal-50 hover:bg-teal-100 rounded-xl text-teal-600 transition-colors"
                          title="Edit setting"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(s)}
                          className="p-2 bg-red-50 hover:bg-red-100 rounded-xl text-red-600 transition-colors"
                          title="Delete setting"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this setting?"
        message={
          deleteTarget
            ? `"${deleteTarget.settingKey ?? deleteTarget.key}" and its value will be permanently removed. Features relying on it will fall back to defaults.`
            : ''
        }
        confirmLabel={deleting ? 'Deleting…' : 'Delete setting'}
        cancelLabel="Keep it"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
