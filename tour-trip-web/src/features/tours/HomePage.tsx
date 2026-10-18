import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Heart, Compass, Clock, ShieldCheck, Headphones, Award, ThumbsUp, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Tour, Destination, Category } from '../../types';
import { getTourDestination } from '../../types';
import { apiClient } from '../../api/client';
import { extractData, resolveImageUrl, getTourImageUrl } from '../../api/utils';
import { toast } from 'sonner';

const CATEGORY_ICONS = ['🏛️', '🏝️', '🌿', '🍜', '⛰️', '🛶', '🐘', '🌅'];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [tours, setTours] = useState<Tour[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [toursRes, revRes, destRes, catRes] = await Promise.all([
          apiClient.get('/api/v1/tours').catch(() => null),
          apiClient.get('/api/v1/reviews').catch(() => null),
          apiClient.get('/api/v1/destinations').catch(() => null),
          apiClient.get('/api/v1/categories').catch(() => null),
        ]);

        if (toursRes?.data) {
          const data = Array.isArray(toursRes.data) ? toursRes.data : (toursRes.data?.content ?? []);
          setTours(data);
        }
        if (revRes?.data) {
          setReviews(extractData(revRes));
        }
        setDestinations(extractData(destRes));
        setCategories(extractData(catRes));
      } catch (err) {
        console.error('Fetch failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
    toast.success(favorites.includes(id) ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (destinationFilter) params.set('destination', destinationFilter);
    if (categoryFilter) params.set('category', categoryFilter);
    navigate(`/tours${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const goToCategory = (name: string) => {
    navigate(`/tours?category=${encodeURIComponent(name)}`);
  };

  // Only surface destinations/categories that actually have tours, so a client
  // can never land on an empty result. Sorted by the most available tours.
  const destinationTourCount = (name?: string) =>
    name ? tours.filter(t => (t.destinationName || t.destination?.name) === name).length : 0;
  const categoryTourCount = (name?: string) =>
    name ? tours.filter(t => (t.categoryName || t.category?.name) === name).length : 0;

  const popularDestinations = destinations
    .map(d => ({ ...d, tourCount: destinationTourCount(d.name) }))
    .filter(d => d.tourCount > 0)
    .sort((a, b) => b.tourCount - a.tourCount);

  const popularCategories = categories
    .map(c => ({ ...c, tourCount: categoryTourCount(c.name) }))
    .filter(c => c.tourCount > 0)
    .sort((a, b) => b.tourCount - a.tourCount);

  return (
    <div className="space-y-20 pb-16">
      {/* 1. Full-screen Hero with Floating Search Bar */}
      <section className="relative h-[650px] flex items-center justify-center text-white bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,rgba(45,212,191,0.5),transparent_55%),radial-gradient(circle_at_75%_70%,rgba(13,148,136,0.45),transparent_55%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-6 mt-12"
        >
          <span className="px-4 py-1.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
            Explore Cambodia & Beyond
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Discover Ancient Wonders & Tropical Paradise
          </h1>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto">
            Book unforgettable guided tours across Angkor Wat temples, royal palaces, and pristine islands.
          </p>

          {/* Floating Search Bar */}
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-3xl shadow-2xl p-4 max-w-4xl mx-auto flex flex-col md:flex-row gap-3 items-center text-gray-800 mt-8"
          >
            <div className="flex-1 flex items-center gap-3 px-3 py-2.5 w-full border-b md:border-b-0 md:border-r border-gray-100">
              <Search className="w-5 h-5 text-teal-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tours, temples, islands..."
                className="w-full focus:outline-none text-sm bg-transparent font-medium"
              />
            </div>
            <div className="w-full md:w-52 flex items-center gap-2 px-3 py-2.5 border-b md:border-b-0 md:border-r border-gray-100">
              <MapPin className="w-5 h-5 text-teal-600" />
              <select
                value={destinationFilter}
                onChange={e => setDestinationFilter(e.target.value)}
                className="w-full focus:outline-none text-sm bg-transparent cursor-pointer font-medium"
              >
                <option value="">All Destinations</option>
                {popularDestinations.map(d => (
                  <option key={d.id} value={d.name}>{d.name} ({d.tourCount})</option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-52 flex items-center gap-2 px-3 py-2.5">
              <Compass className="w-5 h-5 text-teal-600" />
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full focus:outline-none text-sm bg-transparent cursor-pointer font-medium"
              >
                <option value="">All Categories</option>
                {popularCategories.map(c => (
                  <option key={c.id} value={c.name}>{c.name} ({c.tourCount})</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full md:w-auto px-8 py-3.5 bg-teal-600 text-white font-semibold rounded-2xl shadow-lg shadow-teal-600/30 hover:bg-teal-700 transition-all text-sm"
            >
              Search
            </button>
          </form>
        </motion.div>
      </section>

      {/* 2. Popular Destinations Cards */}
      <section id="destinations" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Popular Destinations</h2>
            <p className="text-sm text-gray-500 mt-1">Explore the most breathtaking regions of Cambodia</p>
          </div>
          <Link
            to="/destinations"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700"
          >
            View all destinations <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularDestinations.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-gray-500">No destinations with tours yet.</p>
            </div>
          ) : (
            popularDestinations.slice(0, 8).map((dest, idx) => {
              const tourCount = dest.tourCount;
              return (
                <motion.div
                  key={dest.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link
                    to={`/destinations/${dest.id}`}
                    className="relative h-80 rounded-3xl overflow-hidden shadow-md group cursor-pointer block"
                  >
                    <img src={resolveImageUrl(dest.imageUrl || dest.image)} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <h3 className="text-xl font-bold">{dest.name}</h3>
                      <p className="text-xs text-gray-300 mt-1">{dest.country}{tourCount > 0 ? ` • ${tourCount} Available Tours` : ''}</p>
                      <span className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-teal-300 opacity-0 group-hover:opacity-100 transition-opacity">
                        Explore tours <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })
          )}
        </div>
      </section>

      {/* 3. Featured Tours Cards */}
      <section id="tours" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Tours</h2>
            <p className="text-sm text-gray-500 mt-1">Handpicked experiences with expert local guides</p>
          </div>
          <Link
            to="/tours"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700"
          >
            View all tours <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-white rounded-3xl h-96 animate-pulse bg-gray-200" />
            ))}
          </div>
        ) : tours.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Compass className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800">No tours found</h3>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tours.slice(0, 8).map((tour, idx) => {
              const isFav = favorites.includes(tour.id);
              return (
                <motion.div
                  key={tour.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link
                    to={`/tours/${tour.id}`}
                    className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group block h-full"
                  >
                    <div className="relative h-56 overflow-hidden bg-gray-100">
                      <img
                        src={getTourImageUrl(tour)}
                        alt={tour.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <button
                        onClick={(e) => toggleFavorite(tour.id, e)}
                        className="absolute top-4 right-4 p-2.5 rounded-full bg-white/80 backdrop-blur-md text-gray-700 hover:text-red-500 transition-colors shadow"
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>
                      {getTourDestination(tour).name !== 'Unknown Destination' && (
                        <span className="absolute bottom-4 left-4 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-teal-400" /> {getTourDestination(tour).name}
                        </span>
                      )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5 text-teal-600" /> {tour.durationDays ?? 1} {(tour.durationDays ?? 1) > 1 ? 'Days' : 'Day'}
                          </span>
                          {(tour.ratingAvg != null || tour.rating != null) ? (
                            <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {(tour.ratingAvg ?? tour.rating ?? 0).toFixed(1)}
                              {tour.reviewCount != null && ` (${tour.reviewCount})`}
                            </span>
                          ) : <span />}
                        </div>
                        <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-2 text-base">
                          {tour.title}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                          <span className="text-xs text-gray-400 block font-medium">From</span>
                          <span className="text-xl font-extrabold text-gray-900">${tour.price}</span>
                        </div>
                        <span className="px-4 py-2 bg-teal-50 text-teal-700 rounded-xl text-xs font-semibold group-hover:bg-teal-600 group-hover:text-white transition-colors">
                          View Details
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {!loading && tours.length > 8 && (
          <div className="text-center mt-12">
            <Link
              to="/tours"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-teal-600 text-white font-semibold rounded-2xl shadow-lg shadow-teal-600/30 hover:bg-teal-700 transition-all text-sm"
            >
              Browse all {tours.length} tours <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </section>

      {/* 4. Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Tour Categories</h2>
          <p className="text-sm text-gray-500 mt-1">Find experiences tailored to your travel style</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularCategories.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-gray-500">No categories with tours yet.</p>
            </div>
          ) : (
            popularCategories.map((cat, idx) => {
              const tourCount = cat.tourCount;
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => goToCategory(cat.name)}
                  className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all cursor-pointer flex items-center gap-4 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {CATEGORY_ICONS[idx % CATEGORY_ICONS.length]}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors">{cat.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{tourCount} Tours Available</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
                </motion.div>
              );
            })
          )}
        </div>
      </section>

      {/* 5. Why Choose Us Section */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-teal-900 text-white rounded-3xl p-12 lg:p-16 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
          <Compass className="w-96 h-96 text-white" />
        </div>
        <div className="relative z-10 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-teal-400 font-semibold text-xs tracking-wider uppercase">Why Travel With Us</span>
            <h2 className="text-3xl sm:text-4xl font-bold">Unmatched Experience & Local Expertise</h2>
            <p className="text-sm text-gray-300">We make your Cambodian journey safe, authentic, and unforgettable.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { title: 'Expert Local Guides', desc: 'Licensed professionals with deep historical and cultural knowledge.', icon: Award },
              { title: '24/7 Customer Support', desc: 'Always here to assist you before, during, and after your trip.', icon: Headphones },
              { title: 'Best Price Guarantee', desc: 'Competitive pricing with no hidden fees or surprise charges.', icon: ThumbsUp },
              { title: 'Secure Bookings', desc: 'Pay with KHQR, major credit cards or cash on arrival.', icon: ShieldCheck },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-white text-base">{item.title}</h3>
                  <p className="text-xs text-gray-300 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Customer Reviews Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">What Travelers Say</h2>
          <p className="text-sm text-gray-500 mt-1">Real reviews from our global community</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-gray-500">No reviews yet. Be the first to share your experience!</p>
            </div>
          ) : (
            reviews.slice(0, 3).map((rev, idx) => (
            <motion.div
              key={rev.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(rev.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm italic leading-relaxed">"{rev.comment}"</p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                {(rev.userAvatarUrl || rev.user?.avatarUrl || rev.avatar) ? (
                  <img src={resolveImageUrl(rev.userAvatarUrl || rev.user?.avatarUrl || rev.avatar)} alt={rev.userName || rev.name || 'Traveler'} className="w-11 h-11 rounded-full object-cover bg-gray-100" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">
                    {(rev.userName || rev.name || rev.user?.fullName || 'T').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{rev.userName || rev.name || rev.user?.fullName || 'Traveler'}</h4>
                  <p className="text-xs text-gray-400">{rev.tourTitle ? `on ${rev.tourTitle}` : 'Verified Traveler'}</p>
                </div>
              </div>
            </motion.div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
