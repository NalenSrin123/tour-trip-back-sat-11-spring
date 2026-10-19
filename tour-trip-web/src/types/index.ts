export type Role = 'CUSTOMER' | 'ADMIN' | 'GUIDE';

export interface User {
  id: number;
  email: string;
  fullName?: string;
  name?: string;
  phone?: string;
  phoneNumber?: string;
  role?: Role;
  roles?: string[];
  active?: boolean;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  slug?: string;
  imageUrl?: string;
}

export interface Destination {
  id: number;
  name: string;
  country: string;
  description?: string;
  imageUrl?: string;
  image?: string;
  images?: string[];
}

export interface TourSchedule {
  id: number;
  startDate: string;
  endDate: string;
  availableSlots: number;
  capacity?: number;
  price?: number;
}

export interface Tour {
  id: number;
  title: string;
  name?: string;
  description: string;
  price: number;
  durationDays?: number;
  duration?: number;
  maxGroupSize?: number;
  capacity?: number;
  category?: Category;
  categoryId?: number;
  destination?: Destination;
  destinationId?: number;
  destinationName?: string;
  categoryName?: string;
  createdBy?: User;
  images?: (string | { id?: number; imageUrl?: string; url?: string })[];
  imageUrl?: string;
  itinerary?: string;
  includedItems?: string[] | string;
  excludedItems?: string[] | string;
  schedules?: TourSchedule[];
  ratingAvg?: number;
  rating?: number;
  reviewCount?: number;
  isPublished?: boolean;
  createdAt?: string;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Booking {
  id: number;
  user?: User;
  userId?: number;
  userEmail?: string;
  schedule?: TourSchedule;
  scheduleId?: number;
  tour?: Tour;
  tourId?: number;
  tourTitle?: string;
  startDate?: string;
  endDate?: string;
  numberOfParticipants?: number;
  numberOfGuests?: number;
  totalPrice: number;
  status: BookingStatus;
  bookingDate?: string;
  createdAt?: string;
  paymentMethod?: string;
}

export type RefundStatus = 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED';

export type PaymentMethod = 'KHQR' | 'CREDIT_CARD' | 'CASH';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface Refund {
  id: number;
  booking?: Booking;
  bookingId?: number;
  userEmail?: string;
  userFullName?: string;
  tourTitle?: string;
  startDate?: string;
  endDate?: string;
  bookingStatus?: BookingStatus;
  numberOfParticipants?: number;
  bookingTotal?: number;
  bookingDate?: string;
  paymentMethod?: string;
  paymentStatus?: PaymentStatus;
  amount?: number;
  reason: string;
  status: RefundStatus;
  refundedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  id: number;
  booking?: Booking;
  bookingId?: number;
  amount: number;
  method?: string;
  paymentMethod?: string;
  status: PaymentStatus;
  transactionId?: string;
  paidAt?: string;
  createdAt?: string;
}

export interface Setting {
  id: number;
  key?: string;
  name?: string;
  value?: string;
  settingKey?: string;
  settingValue?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationItem {
  id: number;
  title?: string;
  message: string;
  read?: boolean;
  isRead?: boolean;
  createdAt?: string;
}

export interface Review {
  id: number;
  tour?: Tour;
  user?: User;
  rating: number;
  comment: string;
  createdAt?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalBookings: number;
  totalTours: number;
  totalUsers: number;
  bookingsByStatus?: Record<string, number>;
  revenueChart?: { date: string; revenue: number }[];
  topTours?: Tour[];
}

type TourRef = Pick<
  Tour,
  'destination' | 'destinationId' | 'destinationName' | 'category' | 'categoryId' | 'categoryName'
>;

export const getTourDestination = (tour: TourRef): Destination => {
  if (tour?.destination && tour.destination.name) {
    return tour.destination;
  }
  if (tour?.destinationName) {
    return { id: tour.destinationId ?? 0, name: tour.destinationName, country: '' };
  }
  return { id: 0, name: 'Unknown Destination', country: '' };
};

export const getTourCategory = (tour: TourRef): Category => {
  if (tour?.category && tour.category.name) {
    return tour.category;
  }
  if (tour?.categoryName) {
    return { id: tour.categoryId ?? 0, name: tour.categoryName };
  }
  return { id: 0, name: 'Unknown Category' };
};
