import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiClient } from '../../api/client';
import { extractData, resolveImageUrl } from '../../api/utils';
import { Link } from 'react-router-dom';
import type { Destination } from '../../types';

const PAGE_SIZE = 8;

export const DestinationsPage: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res = await apiClient.get('/api/v1/destinations');
        setDestinations(extractData(res));
      } catch {
        console.error('Failed to load destinations');
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();
  }, []);

  const totalPages = Math.ceil(destinations.length / PAGE_SIZE);
  const paginated = destinations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const coverImage = (dest: Destination) =>
    dest.imageUrl || dest.images?.[0] || dest.image || '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-gray-900">Explore Our Destinations</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          From the ancient temples of Siem Reap to the serene riverbanks of Kampot, discover the diverse landscapes of Cambodia.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="bg-white rounded-3xl h-80 animate-pulse bg-gray-200" />
          ))}
        </div>
      ) : destinations.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-gray-500">No destinations found. Please check back soon!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginated.map((dest, idx) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link
                  to={`/destinations/${dest.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 block h-full flex flex-col"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={resolveImageUrl(coverImage(dest))}
                      alt={dest.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute bottom-4 left-4 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-teal-400" /> {dest.country}
                    </div>
                    {dest.images && dest.images.length > 1 && (
                      <div className="absolute top-4 right-4 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-semibold">
                        {dest.images.length} photos
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-teal-600 transition-colors">{dest.name}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mt-1">
                        {dest.description || 'Explore the beauty and culture of this amazing region.'}
                      </p>
                    </div>
                    <span
                      className="inline-flex items-center gap-2 text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors group/btn pt-2"
                    >
                      View Destination & Tours <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-xl text-sm font-semibold transition-colors ${
                    page === p
                      ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                  aria-label={`Go to page ${p}`}
                  aria-current={page === p ? 'page' : undefined}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          <p className="text-center text-xs text-gray-400">
            Showing {paginated.length} of {destinations.length} destinations
          </p>
        </>
      )}
    </div>
  );
};
