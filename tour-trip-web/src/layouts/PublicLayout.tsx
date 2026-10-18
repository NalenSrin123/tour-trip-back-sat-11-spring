import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, Bell, User as UserIcon, Calendar, LogOut, Shield, Menu, X, ChevronDown, Mail, Phone, MapPin } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { ThemeToggle } from '../components/ThemeToggle';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useTheme } from '../context/themeContext';
import { clearAuth, getToken, getUser } from '../api/authStorage';
import { API_URL } from '../api/client';

export const PublicLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const token = getToken();
  const user = getUser();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const requestLogout = () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    setLogoutOpen(true);
  };

  const handleLogout = () => {
    clearAuth();
    setLogoutOpen(false);
    toast.success('Logged out successfully');
    setDropdownOpen(false);
    navigate('/login');
  };

  const isHome = location.pathname === '/';
  // Auth pages use a dedicated full-height layout (no marketing footer).
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);
  const { isDark } = useTheme();

  // Footer tones follow the theme so it switches together with the rest of the page.
  const f = isDark
    ? {
        footer: 'bg-slate-950 border-slate-800 text-slate-300',
        brand: 'text-white',
        heading: 'text-white',
        body: 'text-slate-400',
        icon: 'text-teal-400',
        link: 'text-slate-400 hover:text-teal-300',
        divider: 'border-slate-800 text-slate-500',
      }
    : {
        footer: 'bg-white border-gray-200 text-gray-600',
        brand: 'text-gray-900',
        heading: 'text-gray-900',
        body: 'text-gray-500',
        icon: 'text-teal-600',
        link: 'text-gray-500 hover:text-teal-600',
        divider: 'border-gray-200 text-gray-400',
      };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <Toaster richColors position="top-right" />

      {/* Sticky Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || !isHome
            ? 'bg-white/95 backdrop-blur-md shadow-md py-3'
            : 'bg-transparent py-5 text-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Compass className="w-8 h-8 text-teal-600 animate-pulse" />
            <span className={scrolled || !isHome ? 'text-gray-900' : 'text-white'}>Explore Cambodia</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className={`hidden md:flex items-center gap-8 font-medium text-sm ${scrolled || !isHome ? 'text-gray-600' : 'text-gray-100'}`}>
            <Link to="/" className="hover:text-teal-600 transition-colors">Home</Link>
            <Link to="/tours" className="hover:text-teal-600 transition-colors">Tours</Link>
            <Link to="/destinations" className="hover:text-teal-600 transition-colors">Destinations</Link>
            <Link to="/about" className="hover:text-teal-600 transition-colors">About</Link>
            <Link to="/contact" className="hover:text-teal-600 transition-colors">Contact</Link>
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className="text-teal-600 font-semibold flex items-center gap-1 hover:underline">
                <Shield className="w-4 h-4" /> Admin Portal
              </Link>
            )}
          </nav>

          {/* Right Action Buttons / User Dropdown */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle
              className={`p-2 transition-colors ${scrolled || !isHome ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
            />
            {token && user ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toast.info('No new notifications')}
                  className={`p-2 rounded-full relative transition-colors ${scrolled || !isHome ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-teal-600 rounded-full"></span>
                </button>

                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                      scrolled || !isHome ? 'border-gray-200 bg-white text-gray-800' : 'border-white/30 bg-black/20 text-white'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-gray-200 bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl?.startsWith('http') ? user.avatarUrl : `${API_URL}${user.avatarUrl}`}
                          alt={user.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user.fullName?.[0] || 'U'
                      )}
                    </div>
                    <span className="text-sm font-medium">{user.fullName || 'User'}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 text-gray-800 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-400">Signed in as</p>
                        <p className="text-sm font-semibold truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/my-bookings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <Calendar className="w-4 h-4 text-teal-600" /> My Bookings
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-teal-600" /> Profile Settings
                      </Link>
                      {user.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 text-teal-600 transition-colors"
                        >
                          <Shield className="w-4 h-4" /> Admin Dashboard
                        </Link>
                      )}
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={requestLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className={`px-5 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    scrolled || !isHome
                      ? 'border-teal-600 text-teal-600 hover:bg-teal-50'
                      : 'border-white text-white hover:bg-white/10'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-teal-600 text-white shadow-md hover:bg-teal-700 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg ${scrolled || !isHome ? 'text-gray-800' : 'text-white'}`}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-xl py-4 px-6 text-gray-800 space-y-4">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block font-medium">Home</Link>
            <Link to="/tours" onClick={() => setMobileMenuOpen(false)} className="block font-medium">Tours</Link>
            <Link to="/destinations" onClick={() => setMobileMenuOpen(false)} className="block font-medium">Destinations</Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block font-medium">About</Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block font-medium">Contact</Link>
            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="font-medium text-sm text-gray-600">Appearance</span>
              <ThemeToggle className="p-2 text-gray-600 hover:bg-gray-100" />
            </div>
            {token ? (
              <>
                <Link to="/my-bookings" onClick={() => setMobileMenuOpen(false)} className="block font-medium text-teal-600">My Bookings</Link>
                <button onClick={requestLogout} className="block font-medium text-red-600">Logout</button>
              </>
            ) : (
              <div className="pt-2 flex flex-gap gap-3">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-1/2 py-2.5 text-center rounded-xl border border-teal-600 text-teal-600 font-semibold text-sm">Sign In</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-1/2 py-2.5 text-center rounded-xl bg-teal-600 text-white font-semibold text-sm">Sign Up</Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer — tones switch with light/dark mode (hidden on auth pages) */}
      {!isAuthPage && (
      <footer id="contact" className={`border-t pt-16 pb-12 mt-20 transition-colors ${f.footer}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className={`flex items-center gap-2 font-bold text-xl ${f.brand}`}>
              <Compass className={`w-7 h-7 ${f.icon}`} />
              <span>Explore Cambodia</span>
            </div>
            <p className={`text-sm leading-relaxed ${f.body}`}>
              Your ultimate travel companion for discovering Angkor Wat, pristine islands, and authentic Cambodian culture with expert local guides.
            </p>
          </div>
          <div>
            <h4 className={`font-semibold mb-4 text-sm uppercase tracking-wider ${f.heading}`}>Quick Links</h4>
            <ul className={`space-y-2.5 text-sm ${f.body}`}>
              <li><Link to="/" className={`transition-colors ${f.link}`}>Home</Link></li>
              <li><Link to="/#tours" className={`transition-colors ${f.link}`}>Featured Tours</Link></li>
              <li><Link to="/#destinations" className={`transition-colors ${f.link}`}>Top Destinations</Link></li>
              <li><Link to="/login" className={`transition-colors ${f.link}`}>Sign In</Link></li>
              <li><Link to="/register" className={`transition-colors ${f.link}`}>Create Account</Link></li>
            </ul>
          </div>
          <div>
            <h4 className={`font-semibold mb-4 text-sm uppercase tracking-wider ${f.heading}`}>Destinations</h4>
            <ul className={`space-y-2.5 text-sm ${f.body}`}>
              <li><span className={`transition-colors cursor-pointer ${f.link}`}>Siem Reap & Angkor Wat</span></li>
              <li><span className={`transition-colors cursor-pointer ${f.link}`}>Phnom Penh Capital</span></li>
              <li><span className={`transition-colors cursor-pointer ${f.link}`}>Sihanoukville & Islands</span></li>
              <li><span className={`transition-colors cursor-pointer ${f.link}`}>Kampot & Kep Countryside</span></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className={`font-semibold mb-4 text-sm uppercase tracking-wider ${f.heading}`}>Contact Info</h4>
            <p className={`text-sm flex items-center gap-2 ${f.body}`}><MapPin className={`w-4 h-4 ${f.icon}`} /> #123 Preah Sihanouk Blvd, Phnom Penh</p>
            <p className={`text-sm flex items-center gap-2 ${f.body}`}><Phone className={`w-4 h-4 ${f.icon}`} /> +855 23 456 789</p>
            <p className={`text-sm flex items-center gap-2 ${f.body}`}><Mail className={`w-4 h-4 ${f.icon}`} /> support@explorecambodia.com</p>
          </div>
        </div>
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t mt-12 pt-8 text-center text-xs ${f.divider}`}>
          &copy; {new Date().getFullYear()} Explore Cambodia & Beyond. All rights reserved.
        </div>
      </footer>
      )}

      <ConfirmDialog
        open={logoutOpen}
        title="Log out?"
        message="You will be signed out and returned to the sign-in page."
        confirmLabel="Log out"
        cancelLabel="Stay logged in"
        onConfirm={handleLogout}
        onCancel={() => setLogoutOpen(false)}
      />
    </div>
  );
};
