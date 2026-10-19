import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Compass, Clock, Star, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import type { Destination, Tour } from '../../types';
import { apiClient } from '../../api/client';
import { resolveImageUrl } from '../../api/utils';
import { Skeleton, SkeletonCard } from '../../components/Skeleton';
import { Seo } from '../../components/Seo';

export const DestinationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const destQuery = useQuery({
    queryKey: ['destination', id],
    enabled: !!id,
    queryFn: async () => (await apiClient.get(`/api/v1/destinations/${id}`)).data,
  });
  const toursQuery = useQuery({
    queryKey: ['tours', 'by-destination', id],
    enabled: !!id,
    queryFn: () => apiClient.get('/api/v1/tours/page', {
      params: {
        page: 0,
        size: 24,
        isPublished: true,
        destinationId: Number(id) || undefined,
      },
    }),
    select: (res): Tour[] => (Array.isArray(res.data) ? res.data : (res.data?.content ?? [])),
  });

  const destination = (destQuery.data ?? null) as Destination | null;

  const tours = toursQuery.data ?? [];

  if (destQuery.isPending) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 space-y-16">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-[400px] w-full rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(n => <SkeletonCard key={n} />)}
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Destination Not Found</h2>
        <p className="text-gray-500">The destination you are looking for does not exist.</p>
        <Link to="/destinations" className="inline-flex items-center gap-2 text-teal-600 font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Destinations
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 space-y-16">
      <Seo
        title={destination.name}
        description={destination.description || `Explore guided tours and experiences in ${destination.name}, Cambodia.`}
        image={resolveImageUrl(destination.images?.[0] || destination.imageUrl || destination.image)}
        type="article"
      />
      <Link to="/destinations" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Destinations
      </Link>

      {/* Image Gallery */}
      {destination.images && destination.images.length > 0 ? (
        <div className="space-y-4">
          <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={resolveImageUrl(destination.images[0] || destination.imageUrl || destination.image)}
              alt={destination.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-white space-y-2">
              <span className="px-3 py-1 rounded-xl bg-teal-500/30 text-teal-300 border border-teal-500/30 text-xs font-semibold backdrop-blur-md">
                {destination.country}
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold">{destination.name}</h1>
              <p className="text-gray-200 text-sm max-w-2xl">{destination.description || 'Explore remarkable guided tours and unforgettable adventures in this destination.'}</p>
            </div>
          </div>
          {destination.images.length > 1 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {destination.images.slice(1, 5).map((img, idx) => (
                <div key={idx} className="relative h-48 rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={resolveImageUrl(img)}
                    alt={`${destination.name} ${idx + 2}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl">
          <img
            src={resolveImageUrl(destination.imageUrl || destination.image)}
            alt={destination.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 text-white space-y-2">
            <span className="px-3 py-1 rounded-xl bg-teal-500/30 text-teal-300 border border-teal-500/30 text-xs font-semibold backdrop-blur-md">
              {destination.country}
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold">{destination.name}</h1>
            <p className="text-gray-200 text-sm max-w-2xl">{destination.description || 'Explore remarkable guided tours and unforgettable adventures in this destination.'}</p>
          </div>
        </div>
      )}

      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Tours in {destination.name}</h2>
          <p className="text-sm text-gray-500 mt-1">Discover curated experiences available in this destination</p>
        </div>

        {toursQuery.isPending ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(n => <SkeletonCard key={n} />)}
          </div>
        ) : tours.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Compass className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800">No tours available</h3>
            <p className="text-sm text-gray-500 mt-1">Check back later for new tours in this destination.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.map((tour, idx) => {
              const firstImg = tour.images?.[0];
              const imageUrl = typeof firstImg === 'string' ? firstImg : (firstImg?.imageUrl || firstImg?.url || '');
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
                        src={resolveImageUrl(imageUrl)}
                        alt={tour.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5 text-teal-600" /> {tour.durationDays ?? 1} Days
                          </span>
                          <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {tour.rating || 4.8}
                          </span>
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
      </div>
    </div>
  );
};
