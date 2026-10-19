import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { HomePage } from '../features/tours/HomePage';

// Route-level code splitting: heavy pages (recharts, framer-motion, admin CRUD)
// load on demand so the landing page ships a much smaller first bundle.
const TourListPage = lazy(() => import('../features/tours/TourListPage').then(m => ({ default: m.TourListPage })));
const TourDetailPage = lazy(() => import('../features/tours/TourDetailPage').then(m => ({ default: m.TourDetailPage })));
const DestinationsPage = lazy(() => import('../features/tours/DestinationsPage').then(m => ({ default: m.DestinationsPage })));
const DestinationDetailPage = lazy(() => import('../features/tours/DestinationDetailPage').then(m => ({ default: m.DestinationDetailPage })));
const AboutPage = lazy(() => import('../features/company/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('../features/company/ContactPage').then(m => ({ default: m.ContactPage })));
const AuthPages = import('../features/auth/AuthPages');
const Login = lazy(() => AuthPages.then(m => ({ default: m.Login })));
const Register = lazy(() => AuthPages.then(m => ({ default: m.Register })));
const ForgotPassword = lazy(() => AuthPages.then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => AuthPages.then(m => ({ default: m.ResetPassword })));
const BookingPages = import('../features/bookings/BookingPages');
const BookingCheckout = lazy(() => BookingPages.then(m => ({ default: m.BookingCheckout })));
const MyBookings = lazy(() => BookingPages.then(m => ({ default: m.MyBookings })));

const AdminPages = import('../features/admin/AdminPages');
const AdminDashboard = lazy(() => AdminPages.then(m => ({ default: m.AdminDashboard })));
const AdminTours = lazy(() => AdminPages.then(m => ({ default: m.AdminTours })));
const AdminBookings = lazy(() => AdminPages.then(m => ({ default: m.AdminBookings })));
const AdminPayments = lazy(() => AdminPages.then(m => ({ default: m.AdminPayments })));
const AdminRefunds = lazy(() => AdminPages.then(m => ({ default: m.AdminRefunds })));
const AdminCategories = lazy(() => AdminPages.then(m => ({ default: m.AdminCategories })));
const AdminDestinations = lazy(() => AdminPages.then(m => ({ default: m.AdminDestinations })));
const AdminUsers = lazy(() => AdminPages.then(m => ({ default: m.AdminUsers })));
const AdminRoles = lazy(() => AdminPages.then(m => ({ default: m.AdminRoles })));
const AdminReports = lazy(() => AdminPages.then(m => ({ default: m.AdminReports })));
const AdminSettings = lazy(() => AdminPages.then(m => ({ default: m.AdminSettings })));
const AdminTourSchedules = lazy(() => AdminPages.then(m => ({ default: m.AdminTourSchedules })));
const AdminTourImages = lazy(() => AdminPages.then(m => ({ default: m.AdminTourImages })));
const AdminReviews = lazy(() => AdminPages.then(m => ({ default: m.AdminReviews })));

const RouteFallback: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-live="polite">
    <div className="w-10 h-10 rounded-full border-4 border-teal-600/20 border-t-teal-600 animate-spin" />
    <span className="sr-only">Loading…</span>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Public / Customer Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/tours" element={<TourListPage />} />
          <Route path="/tours/:id" element={<TourDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/destinations" element={<DestinationsPage />} />
          <Route path="/destinations/:id" element={<DestinationDetailPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Customer Routes */}
          <Route element={<ProtectedRoute requiredRole="CUSTOMER" />}>
            <Route path="/bookings/new" element={<BookingCheckout />} />
            <Route path="/my-bookings" element={<MyBookings />} />
          </Route>
        </Route>

        {/* Admin Routes (ADMIN only) */}
        <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/tours" element={<AdminTours />} />
            <Route path="/admin/tour_images" element={<AdminTourImages />} />
            <Route path="/admin/tour_schedules" element={<AdminTourSchedules />} />
            <Route path="/admin/reviews" element={<AdminReviews />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/refunds" element={<AdminRefunds />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/destinations" element={<AdminDestinations />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/roles" element={<AdminRoles />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Suspense>
  );
};
