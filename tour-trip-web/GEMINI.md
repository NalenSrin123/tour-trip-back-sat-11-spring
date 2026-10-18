# Tour Trip Web - Project Guide & API Specifications

## Admin Routes & Modular Architecture
- `/admin` - Dashboard (`AdminDashboard.tsx`)
- /admin/tour_images add this me check for me too
- /admin/tour_schedules add this me check for me too
- `/admin/tours` - Tours Management with Full CRUD, name-based Destination/Category selects, smooth scrolling modal, and image file upload dialog (`AdminTours.tsx`)
- `/admin/bookings` - Bookings Management & Status Updates (`AdminBookings.tsx`)
- `/admin/payments` - Payments List (`GET /payments`, `GET /payments/{id}`, `GET /payments/booking/{bookingId}`) (`AdminPayments.tsx`)
- `/admin/refunds` - Refunds List (`GET /refunds`, `GET /refunds/{id}`, `PATCH /refunds/{id}/status`) (`AdminRefunds.tsx`)
- `/admin/categories` - Categories Management (`AdminCategories.tsx`)
- `/admin/destinations` - Destinations Management (`AdminDestinations.tsx`)
- `/admin/users` - Users Management & Role Assignment (`AdminUsers.tsx`)
- `/admin/roles` - Roles Management (`AdminRoles.tsx`)
- `/admin/reports` - Reports (`/reports/bookings/excel`, `/reports/bookings/pdf`) (`AdminReports.tsx`)
- `/admin/settings` - Settings (`GET`, `POST`, `DELETE /settings/{id}` — Note: No edit form for settings) (`AdminSettings.tsx`)

## Entity & API Rules
- **Tours (`Tour` Entity):** Includes `id`, `title`, `description`, `destination` (foreign key `destination_id`), `category` (foreign key `category_id`), `createdBy`, `price`, `durationDays` (`duration_days`), `maxGroupSize` (`max_group_size`), `itinerary`, `includedItems` (`included_items`), `excludedItems` (`excluded_items`), `ratingAvg` (`rating_avg`), `isPublished` (`is_published`), `createdAt`, `images` (`tour_images`), and `schedules`.
- **Bookings (`Booking` Entity):** Includes `id`, `user` (`user_id`), `schedule` (`schedule_id`), `numberOfParticipants`, `totalPrice`, `status` (`PENDING`, `PAID`, `CANCELLED`, `COMPLETED`, `REFUNDED`), and `bookingDate`.
- **Schedules & Reviews:** Managed inside individual tour pages (`/tours/{tourId}/schedules`, `/tours/{tourId}/reviews`), not as standalone sidebar pages.
- **Authentication:** Includes endpoints for `/auth/verify-registration` and `/auth/verify-otp`.
- **Notifications:** Supports `GET /notifications`, `GET /notifications/unread`, and `PATCH /notifications/{id}/read`.
