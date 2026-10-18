import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { HomePage } from '../features/tours/HomePage';
import { TourListPage } from '../features/tours/TourListPage';
import { TourDetailPage } from '../features/tours/TourDetailPage';
import { Login, Register, ForgotPassword, ResetPassword } from '../features/auth/AuthPages';
import { BookingCheckout, MyBookings } from '../features/bookings/BookingPages';
import { AboutPage } from '../features/company/AboutPage';
import { ContactPage } from '../features/company/ContactPage';
import { DestinationsPage } from '../features/tours/DestinationsPage';
import { DestinationDetailPage } from '../features/tours/DestinationDetailPage';
import {
  AdminDashboard,
  AdminTours,
  AdminBookings,
  AdminPayments,
  AdminRefunds,
  AdminCategories,
  AdminDestinations,
  AdminUsers,
  AdminRoles,
  AdminReports,
  AdminSettings,
  AdminTourSchedules,
  AdminTourImages,
  AdminReviews,
} from '../features/admin/AdminPages';

export const AppRoutes: React.FC = () => {
  return (
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
  );
};
