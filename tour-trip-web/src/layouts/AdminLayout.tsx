import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, MapPin, Calendar, CreditCard, RefreshCcw, FolderTree, Globe, Users, Shield, FileText, Settings as SettingsIcon, LogOut, ArrowLeft, Bell, ChevronLeft, ChevronRight, Image as ImageIcon, CalendarDays, Star, Menu, X } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { apiClient } from '../api/client';
import { ThemeToggle } from '../components/ThemeToggle';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { clearAuth, getUser } from '../api/authStorage';

interface NotificationItem {
  id: number;
  type?: string;
  title?: string;
  message: string;
  isRead: boolean;
  createdAt?: string;
}

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const [notifRes, unreadRes] = await Promise.all([
          apiClient.get('/api/v1/notifications').catch(() => null),
          apiClient.get('/api/v1/notifications/unread').catch(() => null),
        ]);
        if (notifRes?.data && Array.isArray(notifRes.data)) {
          setNotifications(notifRes.data);
        }
        if (unreadRes?.data !== undefined) {
          if (typeof unreadRes.data === 'number') setUnreadCount(unreadRes.data);
          else if (Array.isArray(unreadRes.data)) setUnreadCount(unreadRes.data.length);
          else if (unreadRes.data.count !== undefined) setUnreadCount(unreadRes.data.count);
        } else if (notifRes?.data && Array.isArray(notifRes.data)) {
          setUnreadCount(notifRes.data.filter((n: NotificationItem) => !n.isRead).length);
        }
      } catch {
        // Notifications unavailable
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [refreshKey]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await apiClient.patch(`/api/v1/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleLogout = () => {
    clearAuth();
    setLogoutOpen(false);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navGroups = [
    {
      group: 'Overview',
      items: [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      ]
    },
    {
      group: 'Operations',
      items: [
        { label: 'Tours', path: '/admin/tours', icon: MapPin },
        { label: 'Tour Images', path: '/admin/tour_images', icon: ImageIcon },
        { label: 'Tour Schedules', path: '/admin/tour_schedules', icon: CalendarDays },
        { label: 'Bookings', path: '/admin/bookings', icon: Calendar },
        { label: 'Payments', path: '/admin/payments', icon: CreditCard },
        { label: 'Refunds', path: '/admin/refunds', icon: RefreshCcw },
        { label: 'Reviews', path: '/admin/reviews', icon: Star },
      ]
    },
    {
      group: 'Catalog',
      items: [
        { label: 'Categories', path: '/admin/categories', icon: FolderTree },
        { label: 'Destinations', path: '/admin/destinations', icon: Globe },
      ]
    },
    {
      group: 'People',
      items: [
        { label: 'Users', path: '/admin/users', icon: Users },
        { label: 'Roles', path: '/admin/roles', icon: Shield },
      ]
    },
    {
      group: 'System',
      items: [
        { label: 'Reports', path: '/admin/reports', icon: FileText },
        { label: 'Settings', path: '/admin/settings', icon: SettingsIcon },
      ]
    }
  ];

  const user = getUser();

  useEffect(() => {
    const t = window.setTimeout(() => setMobileNavOpen(false), 0);
    return () => window.clearTimeout(t);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileNavOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [mobileNavOpen]);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 text-gray-800">
      <Toaster richColors position="top-right" />
      {/* Sidebar: dark surface, teal active highlight (matches brand) */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-950 text-slate-400 transition-transform duration-300 md:static md:z-auto md:transition-all md:translate-x-0 ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'} ${collapsed ? 'w-64 md:w-20' : 'w-64'}`}>
        <div className="p-5 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <span className="bg-teal-600 text-white p-1.5 rounded-xl text-xs">TT</span>
              <span>Admin Portal</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white mx-auto"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setMobileNavOpen(false)}
            className="md:hidden p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-6 overflow-y-auto no-scrollbar">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1.5">
              {!collapsed && (
                <p className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{group.group}</p>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileNavOpen(false)}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all border-l-4 ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30 border-teal-400'
                        : 'hover:bg-slate-800 text-slate-400 border-transparent'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2 flex-shrink-0">
          <Link
            to="/"
            onClick={() => setMobileNavOpen(false)}
            title={collapsed ? 'Back to Website' : undefined}
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="truncate">Back to Website</span>}
          </Link>
          <button
            onClick={() => setLogoutOpen(true)}
            title={collapsed ? 'Logout' : undefined}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold hover:bg-red-500/10 text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="truncate">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile backdrop (below header z-40 so the hamburger stays clickable) */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 h-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="md:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors flex-shrink-0"
              title="Open Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-xl font-bold text-gray-900 min-w-0 truncate">Explore Cambodia Management</h1>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle
              className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            />
            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  if (!notifOpen) setRefreshKey(k => k + 1);
                  setNotifOpen(!notifOpen);
                }}
                className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 relative transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-teal-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-3 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl border border-gray-100 py-3 text-gray-800 z-50">
                  <div className="px-5 py-2 border-b border-gray-100 flex items-center justify-between">
                    <span className="font-bold text-sm text-gray-900">Notifications</span>
                    <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-semibold">{unreadCount} unread</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto no-scrollbar divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-gray-400">No notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-4 hover:bg-gray-50 transition-colors flex items-start justify-between gap-3 ${!n.isRead ? 'bg-teal-50/30' : ''}`}>
                          <div>
                            {n.type && (
                              <p className="text-[10px] uppercase tracking-wide font-bold text-teal-600 mb-0.5">{n.type.replace(/_/g, ' ')}</p>
                            )}
                            <p className="text-xs text-gray-700 font-medium">{n.message}</p>
                          </div>
                          {!n.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(n.id)}
                              className="text-[11px] text-teal-600 font-bold hover:underline flex-shrink-0"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900">{user?.fullName || 'Admin User'}</p>
                <p className="text-xs text-teal-600 font-semibold">Administrator</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-extrabold text-sm shadow-md">
                {user?.fullName?.[0] || 'A'}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto no-scrollbar">
          <Outlet />
        </main>
      </div>

      <ConfirmDialog
        open={logoutOpen}
        title="Log out of the admin portal?"
        message="You will be signed out and returned to the sign-in page. Any unsaved changes will be lost."
        confirmLabel="Log out"
        cancelLabel="Stay logged in"
        onConfirm={handleLogout}
        onCancel={() => setLogoutOpen(false)}
      />
    </div>
  );
};
