import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, CheckCircle2, CreditCard, QrCode, Star, Banknote } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { Booking, Tour, PaymentMethod, Refund } from '../../types';
import { apiClient } from '../../api/client';
import { extractData } from '../../api/utils';
import { Skeleton } from '../../components/Skeleton';
import { toast } from 'sonner';

export const BookingCheckout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tourId = Number(searchParams.get('tourId')) || 1;
  const scheduleId = Number(searchParams.get('scheduleId')) || 0;
  const guests = Math.max(1, Number(searchParams.get('guests')) || 1);

  const [tour, setTour] = useState<Tour | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [step, setStep] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('KHQR');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiClient.get(`/api/v1/tours/${tourId}`)
      .then(res => setTour(res.data))
      .catch(() => {});
  }, [tourId]);

  const price = tour?.price ?? 0;
  const totalPrice = booking?.totalPrice ?? price * guests;

  const handleConfirmBooking = async () => {
    if (!scheduleId) {
      toast.error('No schedule selected. Please pick a date on the tour page.');
      return;
    }
    setLoading(true);
    try {
      const bookingRes = await apiClient.post('/api/v1/bookings', {
        scheduleId,
        numberOfParticipants: guests,
      });
      const created: Booking = bookingRes.data;
      setBooking(created);

      await apiClient.post('/api/v1/payments', {
        bookingId: created.id,
        amount: created.totalPrice,
        method: paymentMethod,
      });

      toast.success(
        paymentMethod === 'CASH'
          ? 'Booking placed! Please pay in cash on arrival.'
          : 'Booking confirmed and payment received!'
      );
      setStep(4); // Done
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pt-28 pb-12">
      {/* Progress Bar */}
      <div className="mb-8 flex items-center justify-between">
        {['1. Details', '2. Guests', '3. Payment', '4. Confirmation'].map((s, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              step > idx + 1 ? 'bg-emerald-600 text-white' : step === idx + 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {idx + 1}
            </div>
            <span className="hidden sm:inline text-xs font-medium text-gray-600">{s.slice(3)}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Review Booking Details</h2>
            <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Tour package:</span>
                <span className="font-semibold text-gray-800">{tour?.title || 'Loading...'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Guests:</span>
                <span className="font-semibold text-gray-800">{guests} Persons</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Price:</span>
                <span className="font-bold text-primary text-lg">${totalPrice}</span>
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full py-3 bg-primary text-white font-semibold rounded-xl shadow hover:bg-primary/90 transition-colors text-sm"
            >
              Proceed to Guest Info
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Guest Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lead Traveler Name</label>
                <input
                  type="text"
                  defaultValue="Valued Traveler"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests or Dietary Requirements</label>
                <textarea
                  rows={3}
                  placeholder="E.g., Vegetarian meal preference..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="w-1/2 py-3 border border-gray-300 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="w-1/2 py-3 bg-primary text-white font-semibold rounded-xl shadow hover:bg-primary/90 transition-colors text-sm"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Choose Payment Method</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => setPaymentMethod('KHQR')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                  paymentMethod === 'KHQR' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-700'
                }`}
              >
                <QrCode className="w-8 h-8" />
                <span className="font-semibold text-sm">KHQR</span>
              </button>
              <button
                onClick={() => setPaymentMethod('CREDIT_CARD')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                  paymentMethod === 'CREDIT_CARD' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-700'
                }`}
              >
                <CreditCard className="w-8 h-8" />
                <span className="font-semibold text-sm">Credit / Debit Card</span>
              </button>
              <button
                onClick={() => setPaymentMethod('CASH')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                  paymentMethod === 'CASH' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-700'
                }`}
              >
                <Banknote className="w-8 h-8" />
                <span className="font-semibold text-sm">Cash on Arrival</span>
              </button>
            </div>

            {paymentMethod === 'KHQR' && (
              <div className="bg-teal-50 p-6 rounded-xl border border-teal-200 space-y-3">
                <div className="flex items-center gap-2 text-teal-700 font-semibold text-sm">
                  <QrCode className="w-5 h-5" /> Pay with KHQR
                </div>
                <p className="text-sm text-teal-700/80">
                  You'll pay <span className="font-semibold">${totalPrice}</span> through KHQR (Bakong).
                  Your booking is confirmed as soon as the payment is received.
                </p>
              </div>
            )}

            {paymentMethod === 'CREDIT_CARD' && (
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                  <CreditCard className="w-5 h-5" /> Pay with credit / debit card
                </div>
                <p className="text-sm text-gray-600">
                  You'll pay <span className="font-semibold">${totalPrice}</span> by card.
                  Your booking is confirmed as soon as the payment is received.
                </p>
              </div>
            )}

            {paymentMethod === 'CASH' && (
              <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 space-y-3">
                <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm">
                  <Banknote className="w-5 h-5" /> Pay in cash when the tour starts
                </div>
                <p className="text-sm text-amber-700/80">
                  Your booking will be reserved as <span className="font-semibold">Pending</span>. Please pay
                  <span className="font-semibold"> ${totalPrice}</span> in cash on arrival; our team will then confirm your spot.
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="w-1/2 py-3 border border-gray-300 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                Back
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={loading}
                className="w-1/2 py-3 bg-primary text-white font-semibold rounded-xl shadow hover:bg-primary/90 transition-colors text-sm disabled:opacity-50"
              >
                {loading
                  ? 'Processing...'
                  : paymentMethod === 'CASH'
                    ? 'Confirm Booking (Pay on Arrival)'
                    : 'Confirm & Pay'}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center space-y-6 py-6">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
            <h2 className="text-3xl font-bold text-gray-900">
              {paymentMethod === 'CASH' ? 'Booking Placed!' : 'Booking Confirmed!'}
            </h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              {paymentMethod === 'CASH' ? (
                <>
                  Your booking of <span className="font-semibold text-gray-800">${booking?.totalPrice}</span> is reserved as
                  <span className="font-semibold text-gray-800"> Pending</span>. Please pay in cash on arrival.
                  {booking ? ` Booking #${booking.id} for ${booking.tourTitle || tour?.title}.` : ''}
                </>
              ) : (
                <>
                  Your payment of <span className="font-semibold text-gray-800">${booking?.totalPrice}</span> has been received successfully.
                  {booking ? ` Booking #${booking.id} confirmed for ${booking.tourTitle || tour?.title}.` : ''}
                </>
              )}
            </p>
            <div className="pt-4 flex justify-center gap-4">
              <button
                onClick={() => navigate('/my-bookings')}
                className="px-6 py-3 bg-primary text-white font-semibold rounded-xl shadow hover:bg-primary/90 transition-colors text-sm"
              >
                View My Bookings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const MyBookings: React.FC = () => {
  const [tab, setTab] = useState<'Upcoming' | 'Past' | 'Cancelled'>('Upcoming');
  const [refundOverrides, setRefundOverrides] = useState<Record<number, Refund>>({});
  const [refundModalBookingId, setRefundModalBookingId] = useState<number | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [reviewModalBookingId, setReviewModalBookingId] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const bookingsQuery = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => apiClient.get('/api/v1/bookings/my-bookings'),
    select: (res): Booking[] => extractData(res),
  });
  const refundsQuery = useQuery({
    queryKey: ['my-refunds'],
    queryFn: () => apiClient.get('/api/v1/refunds/my-refunds'),
    select: (res): Refund[] => extractData(res),
  });

  const bookings = bookingsQuery.data ?? [];
  const loading = bookingsQuery.isPending;

  // Refunds load independently of bookings, so badges fill in as they arrive.
  const refundsByBooking = useMemo(() => {
    const map: Record<number, Refund> = {};
    (refundsQuery.data ?? []).forEach(r => {
      if (r.bookingId != null) map[r.bookingId] = r;
    });
    return { ...map, ...refundOverrides };
  }, [refundsQuery.data, refundOverrides]);

  const visibleBookings = bookings.filter(b => {
    if (tab === 'Cancelled') return b.status === 'CANCELLED';
    if (tab === 'Past') return b.status === 'COMPLETED';
    return b.status === 'CONFIRMED' || b.status === 'PENDING';
  });

  const handleRequestRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundReason) {
      toast.error('Please provide a reason for refund');
      return;
    }
    const target = bookings.find(b => b.id === refundModalBookingId);
    try {
      const res = await apiClient.post('/api/v1/refunds', {
        bookingId: refundModalBookingId,
        amount: target?.totalPrice ?? 0,
        reason: refundReason,
      });
      const created: Refund = res.data;
      if (created?.bookingId != null) {
        setRefundOverrides(prev => ({ ...prev, [created.bookingId as number]: created }));
      }
      toast.success('Refund request submitted successfully');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || 'Failed to submit refund request');
    }
    setRefundModalBookingId(null);
    setRefundReason('');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/api/v1/reviews', { bookingId: reviewModalBookingId, rating, comment });
      toast.success('Review submitted successfully');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || 'Failed to submit review');
    }
    setReviewModalBookingId(null);
    setComment('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your upcoming and past tour reservations</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
          {(['Upcoming', 'Past', 'Cancelled'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                tab === t ? 'bg-primary text-white shadow' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(n => <Skeleton key={n} className="h-32 w-full rounded-2xl" />)}
          </div>
        ) : visibleBookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">No {tab.toLowerCase()} bookings</h3>
            <p className="text-sm text-gray-500 mt-1">When you book a tour it will appear here.</p>
          </div>
        ) : (
          visibleBookings.map(b => (
          <div key={b.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-24 h-24 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-8 h-8 text-teal-600" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    b.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700' :
                    b.status === 'PENDING' ? 'bg-amber-50 text-amber-700' :
                    b.status === 'CANCELLED' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {b.status}
                  </span>
                  {refundsByBooking[b.id] && (
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        refundsByBooking[b.id].status === 'REJECTED' ? 'bg-gray-100 text-gray-600' :
                        refundsByBooking[b.id].status === 'PENDING' ? 'bg-amber-50 text-amber-700' :
                        'bg-teal-50 text-teal-700'
                      }`}
                      title={refundsByBooking[b.id].reason}
                    >
                      Refund: {refundsByBooking[b.id].status}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 text-base">{b.tourTitle || 'Tour'}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> Date: {b.startDate || b.bookingDate} &bull; {b.numberOfParticipants ?? b.numberOfGuests ?? 1} Guests
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto justify-between border-t md:border-t-0 pt-4 md:pt-0">
              <div className="text-right">
                <span className="text-xs text-gray-400 block">Total Paid</span>
                <span className="text-lg font-bold text-gray-900">${b.totalPrice}</span>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                {refundsByBooking[b.id] ? (
                  <button
                    disabled
                    className="px-4 py-2 border border-gray-200 text-gray-400 text-xs font-semibold rounded-xl cursor-not-allowed"
                  >
                    {refundsByBooking[b.id].status === 'REJECTED' ? 'Refund Declined' : 'Refund Requested'}
                  </button>
                ) : (
                  <button
                    onClick={() => setRefundModalBookingId(b.id)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Request Refund
                  </button>
                )}
                <button
                  onClick={() => setReviewModalBookingId(b.id)}
                  className="px-4 py-2 bg-primary/10 text-primary text-xs font-semibold rounded-xl hover:bg-primary hover:text-white transition-colors"
                >
                  Write Review
                </button>
              </div>
            </div>
          </div>
          ))
        )}
      </div>

      {/* Refund Modal */}
      {refundModalBookingId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900">Request Tour Refund</h3>
            <form onSubmit={handleRequestRefund} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Refund</label>
                <textarea
                  rows={3}
                  value={refundReason}
                  onChange={e => setRefundReason(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm"
                  placeholder="Please specify why you are requesting a refund..."
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRefundModalBookingId(null)}
                  className="w-1/2 py-2.5 border border-gray-300 font-semibold rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-red-600 text-white font-semibold rounded-xl shadow text-sm hover:bg-red-700 transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalBookingId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900">Write Tour Review</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1 - 5 Stars)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-2 rounded-lg ${rating >= star ? 'text-amber-400' : 'text-gray-300'}`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm"
                  placeholder="Share your experience with future travelers..."
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalBookingId(null)}
                  className="w-1/2 py-2.5 border border-gray-300 font-semibold rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-primary text-white font-semibold rounded-xl shadow text-sm hover:bg-primary/90 transition-colors"
                >
                  Post Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
