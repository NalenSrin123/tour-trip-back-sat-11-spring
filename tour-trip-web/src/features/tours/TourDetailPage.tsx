import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Clock, Users, Star, CheckCircle, XCircle, ShieldCheck, ArrowLeft, X, ZoomIn, Loader2 } from 'lucide-react';
import type { Tour, TourSchedule, Review } from '../../types';
import { getTourDestination, getTourCategory } from '../../types';
import { apiClient, API_URL } from '../../api/client';
import { getToken } from '../../api/authStorage';
import { getTourImageUrl } from '../../api/utils';
import { toast } from 'sonner';

export const TourDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const tourId = Number(id);

  const [tour, setTour] = useState<Tour | null>(null);
  const [schedules, setSchedules] = useState<TourSchedule[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'included' | 'excluded' | 'reviews'>('itinerary');

  const [selectedScheduleId, setSelectedScheduleId] = useState<number>(0);
  const [guests, setGuests] = useState(2);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const fetchTourData = async () => {
      setLoading(true);
      try {
        const [tourRes, schedRes, revRes] = await Promise.all([
          apiClient.get(`/api/v1/tours/${tourId}`).catch(() => null),
          apiClient.get(`/api/v1/tours/${tourId}/schedules`).catch(() => null),
          apiClient.get(`/api/v1/tours/${tourId}/reviews`).catch(() => null),
        ]);

        if (tourRes?.data) {
          const tourData = tourRes.data;
          if (tourData.images && Array.isArray(tourData.images)) {
            tourData.images = tourData.images.map((img: any) => {
              const url = typeof img === 'string' ? img : (img?.imageUrl || img?.url || '');
              return url.startsWith('http') ? url : (url ? `${API_URL}${url}` : '');
            });
          }
          setTour(tourData);
        }
        if (schedRes?.data && Array.isArray(schedRes.data)) {
          setSchedules(schedRes.data);
          if (schedRes.data[0]) setSelectedScheduleId(schedRes.data[0].id);
        }
        if (revRes?.data && Array.isArray(revRes.data)) {
          setReviews(revRes.data);
        }
      } catch (err) {
        toast.error('Failed to load tour details');
      } finally {
        setLoading(false);
      }
    };
    fetchTourData();
  }, [tourId]);

  const totalPrice = (tour?.price ?? 0) * guests;

  const handleBookNow = () => {
    const token = getToken();
    if (!token) {
      toast.error('Please sign in to book this tour');
      navigate('/login', { state: { from: location } });
      return;
    }
    if (!selectedScheduleId) {
      toast.error('No available schedule for this tour yet');
      return;
    }
    navigate(`/bookings/new?tourId=${tour?.id}&scheduleId=${selectedScheduleId}&guests=${guests}`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-40 flex items-center justify-center text-gray-400 gap-2">
        <Loader2 className="w-6 h-6 animate-spin" /> Loading tour details...
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-40 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Tour not found</h2>
        <button onClick={() => navigate('/tours')} className="px-5 py-3 bg-teal-600 text-white rounded-2xl text-sm font-semibold">Browse all tours</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 space-y-10">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-teal-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Tours
      </button>

      {/* Header Title & Meta */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="px-3.5 py-1.5 rounded-xl bg-teal-50 text-teal-700 font-semibold">
            {getTourCategory(tour).name}
          </span>
          <span className="flex items-center gap-1.5 text-gray-500 font-medium">
            <MapPin className="w-4 h-4 text-teal-600" /> {getTourDestination(tour).name}{getTourDestination(tour).country ? `, ${getTourDestination(tour).country}` : ''}
          </span>
          {(tour.ratingAvg != null || tour.rating != null) && (
            <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-xl font-bold">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {(tour.ratingAvg ?? tour.rating ?? 0).toFixed(1)}
              {tour.reviewCount != null && ` (${tour.reviewCount} reviews)`}
            </span>
          )}
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 leading-tight">{tour.title}</h1>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 h-[420px] rounded-3xl overflow-hidden shadow-lg relative group cursor-pointer bg-gray-100" onClick={() => setLightboxOpen(true)}>
          <img
            src={getTourImageUrl(tour, activeImageIdx)}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="px-4 py-2 bg-black/60 backdrop-blur-md text-white rounded-xl text-sm font-semibold flex items-center gap-2">
              <ZoomIn className="w-4 h-4" /> Click to view full image
            </span>
          </div>
        </div>
        <div className="flex md:flex-col gap-4">
          {tour.images?.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImageIdx(idx)}
              className={`h-[130px] rounded-2xl overflow-hidden border-2 transition-all ${
                activeImageIdx === idx ? 'border-teal-600 ring-4 ring-teal-600/20' : 'border-transparent opacity-75 hover:opacity-100'
              }`}
            >
              <img src={getTourImageUrl({ images: [img] })} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={getTourImageUrl(tour, activeImageIdx)}
            alt=""
            className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}

      {/* Main Grid + Sticky Booking Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Overview */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
            <p className="text-gray-600 leading-relaxed text-base">{tour.description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-100 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-gray-400 block text-xs">Duration</span>
                  <span className="font-bold text-gray-800">{tour.durationDays ?? 1} {(tour.durationDays ?? 1) > 1 ? 'Days' : 'Day'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-gray-400 block text-xs">Group Size</span>
                  <span className="font-bold text-gray-800">{tour.maxGroupSize ? `Max ${tour.maxGroupSize} People` : 'Small Group'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-gray-400 block text-xs">Guarantee</span>
                  <span className="font-bold text-gray-800">Free Cancellation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs: Itinerary / Included / Excluded / Reviews */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4">
              {[
                { key: 'itinerary', label: 'Itinerary' },
                { key: 'included', label: "What's Included" },
                { key: 'excluded', label: "What's Excluded" },
                { key: 'reviews', label: `Reviews (${reviews.length})` },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                    activeTab === tab.key ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="pt-2">
              {activeTab === 'itinerary' && (
                <div className="whitespace-pre-line text-gray-600 bg-gray-50/50 p-6 rounded-2xl text-sm leading-relaxed border border-gray-100">
                  {tour.itinerary || 'Detailed schedule and itinerary provided upon booking.'}
                </div>
              )}

              {activeTab === 'included' && (
                <ul className="space-y-3 text-sm text-gray-600">
                  {(Array.isArray(tour.includedItems) ? tour.includedItems : (tour.includedItems ? tour.includedItems.split(',') : [])).map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" /> {typeof item === 'string' ? item.trim() : item}
                    </li>
                  ))}
                </ul>
              )}

              {activeTab === 'excluded' && (
                <ul className="space-y-3 text-sm text-gray-600">
                  {(Array.isArray(tour.excludedItems) ? tour.excludedItems : (tour.excludedItems ? tour.excludedItems.split(',') : [])).map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" /> {typeof item === 'string' ? item.trim() : item}
                    </li>
                  ))}
                </ul>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">No reviews yet for this tour.</p>
                  ) : (
                    reviews.map(rev => (
                      <div key={rev.id} className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900 text-sm">{rev.user?.fullName || 'Traveler'}</span>
                          <div className="flex text-amber-400">
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm italic">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Booking Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-white rounded-3xl p-8 border border-gray-100 shadow-2xl space-y-6">
            <div className="flex items-baseline justify-between border-b border-gray-100 pb-5">
              <div>
                <span className="text-xs text-gray-400 font-medium">Price per person</span>
                <div className="text-3xl font-extrabold text-gray-900">${tour.price}</div>
              </div>
              <span className="text-xs font-bold px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl">
                Instant Confirmation
              </span>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Date & Schedule</label>
                {schedules.length === 0 ? (
                  <p className="text-sm text-gray-400 bg-gray-50/50 border border-gray-100 rounded-2xl px-4 py-3">
                    No schedules available yet.
                  </p>
                ) : (
                  <select
                    value={selectedScheduleId}
                    onChange={e => setSelectedScheduleId(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-gray-50/50 cursor-pointer"
                  >
                    {schedules.map(sch => (
                      <option key={sch.id} value={sch.id}>
                        {sch.startDate} (Slots left: {sch.availableSlots})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Guests</label>
                <input
                  type="number"
                  min={1}
                  max={tour.maxGroupSize || 15}
                  value={guests}
                  onChange={e => setGuests(Math.max(1, Number(e.target.value)))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-gray-50/50"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-base font-extrabold text-gray-900">
                <span>Total Amount:</span>
                <span className="text-3xl text-teal-600">${totalPrice}</span>
              </div>
            </div>

            <button
              onClick={handleBookNow}
              disabled={schedules.length === 0}
              className="w-full py-4 bg-teal-600 text-white font-bold rounded-2xl shadow-xl shadow-teal-600/30 hover:bg-teal-700 transition-all text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Book Now
            </button>

            <p className="text-xs text-center text-gray-400">
              You won't be charged yet. Secure your spot today with free cancellation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
