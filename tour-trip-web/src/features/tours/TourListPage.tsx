import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Star, Heart, Clock, Compass, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { Tour, Category, Destination } from '../../types';
import { getTourDestination } from '../../types';
import { apiClient } from '../../api/client';
import { extractData, getTourImageUrl } from '../../api/utils';
import { Seo } from '../../components/Seo';
import { toast } from 'sonner';

type TourPage = {
  content: Tour[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasMore: boolean;
};

const PAGE_SIZE = 6;

export const TourListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const destination = searchParams.get('destination') || '';
  const category = searchParams.get('category') || '';
  const [maxPrice, setMaxPrice] = useState(200);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState(200);
  const [favorites, setFavorites] = useState<number[]>([]);

  // Debounce the price slider so dragging it doesn't fire a request per step.
  useEffect(() => {
    const t = setTimeout(() => setAppliedMaxPrice(maxPrice), 350);
    return () => clearTimeout(t);
  }, [maxPrice]);

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const toursQuery = useInfiniteQuery({
    queryKey: ['tours', 'page', { search, destination, category, appliedMaxPrice }],
    queryFn: async ({ pageParam }) => {
      const res = await apiClient.get<TourPage>('/api/v1/tours/page', {
        params: {
          page: pageParam,
          size: PAGE_SIZE,
          search: search || undefined,
          destinationName: destination || undefined,
          categoryName: category || undefined,
          maxPrice: appliedMaxPrice,
        },
      });
      return res.data;
    },
    initialPageParam: 0,
    getNextPageParam: (last) => (last?.hasMore ? last.page + 1 : undefined),
  });

  const destinationsQuery = useQuery({
    queryKey: ['destinations'],
    queryFn: () => apiClient.get('/api/v1/destinations'),
    select: (res): Destination[] => extractData(res),
  });
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.get('/api/v1/categories'),
    select: (res): Category[] => extractData(res),
  });

  const tours = toursQuery.data?.pages.flatMap(p => p.content ?? []) ?? [];
  const totalTours = toursQuery.data?.pages[0]?.totalElements ?? 0;

  const destinationOptions = Array.from(
    new Set((destinationsQuery.data ?? []).map(d => d.name).filter(Boolean))
  ).sort();
  const categoryOptions = Array.from(
    new Set((categoriesQuery.data ?? []).map(c => c.name).filter(Boolean))
  ).sort();

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
    toast.success(favorites.includes(id) ? 'Removed from favorites' : 'Added to favorites');
  };

  // Auto-load the next page when the sentinel scrolls into view.
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = toursQuery;
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, tours.length]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 space-y-10">
      <Seo
        title="Explore All Tours"
        description="Discover handpicked guided tours across Cambodia with transparent pricing and instant confirmation."
      />
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-4xl font-extrabold text-gray-900">Explore All Tours</h1>
        <p className="text-sm text-gray-500">Discover handpicked guided tours across Cambodia with transparent pricing and instant confirmation.</p>
        {!toursQuery.isPending && (
          <p className="text-xs font-semibold text-teal-600">{totalTours} tour{totalTours === 1 ? '' : 's'} found</p>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setFilter('search', e.target.value)}
            placeholder="Search tours..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-gray-50/50"
          />
        </div>

        <div>
          <select
            value={destination}
            onChange={e => setFilter('destination', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-gray-50/50 cursor-pointer"
          >
            <option value="">All Destinations</option>
            {destinationOptions.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={category}
            onChange={e => setFilter('category', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-gray-50/50 cursor-pointer"
          >
            <option value="">All Categories</option>
            {categoryOptions.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
            <span>Max Price</span>
            <span className="text-teal-600">${maxPrice}</span>
          </div>
          <input
            type="range"
            min={50}
            max={500}
            step={10}
            value={maxPrice}
            onChange={e => setMaxPrice(Number(e.target.value))}
            className="w-full accent-teal-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Active Filters */}
      {(search || destination || category) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">Filters:</span>
          {search && (
            <button onClick={() => setFilter('search', '')} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold hover:bg-teal-100">
              “{search}” ✕
            </button>
          )}
          {destination && (
            <button onClick={() => setFilter('destination', '')} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold hover:bg-teal-100">
              {destination} ✕
            </button>
          )}
          {category && (
            <button onClick={() => setFilter('category', '')} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold hover:bg-teal-100">
              {category} ✕
            </button>
          )}
          <button
            onClick={() => setSearchParams({}, { replace: true })}
            className="text-xs font-semibold text-gray-400 hover:text-red-500 ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Tour Grid */}
      {toursQuery.isPending ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: PAGE_SIZE }).map((_, n) => (
            <div key={n} className="bg-white rounded-3xl h-96 animate-pulse bg-gray-200" />
          ))}
        </div>
      ) : tours.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <Compass className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-800">No tours found</h3>
          <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour) => {
            const isFav = favorites.includes(tour.id);
            return (
              <motion.div
                key={tour.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Link
                  to={`/tours/${tour.id}`}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group block h-full"
                >
                  <div className="relative h-60 overflow-hidden bg-gray-100">
                    <img
                      src={getTourImageUrl(tour)}
                      alt={tour.title}
                      loading="lazy"
                      decoding="async"
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
                        {(tour.ratingAvg != null || tour.rating != null) && (
                          <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {(tour.ratingAvg ?? tour.rating ?? 0).toFixed(1)}
                            {tour.reviewCount != null && ` (${tour.reviewCount})`}
                          </span>
                        )}
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

      {/* Loading more */}
      {toursQuery.isFetchingNextPage && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, n) => (
            <div key={n} className="bg-white rounded-3xl h-96 animate-pulse bg-gray-200" />
          ))}
        </div>
      )}

      {/* Sentinel + load more */}
      {hasNextPage && (
        <div ref={sentinelRef} className="flex justify-center pt-4">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-gray-200 text-sm font-semibold text-teal-700 hover:bg-teal-50 disabled:opacity-60 transition-colors"
          >
            {isFetchingNextPage ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isFetchingNextPage ? 'Loading more...' : 'Load more tours'}
          </button>
        </div>
      )}
      {!hasNextPage && tours.length > 0 && (
        <p className="text-center text-xs text-gray-400 pt-2">
          You've reached the end · showing all {tours.length} tours
        </p>
      )}
    </div>
  );
};
