import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Star, Heart, Users } from 'lucide-react';
import { apiClient } from '../../api/client';
import { extractData, resolveImageUrl } from '../../api/utils';
import { useState, useEffect } from 'react';

export const AboutPage: React.FC = () => {
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        // Fetching users. In a real app, you might have a /api/v1/users/guides endpoint
        const res = await apiClient.get('/api/v1/users');
        const allUsers = extractData(res);
        const filteredGuides = allUsers.filter((u: any) => u.role === 'GUIDE');
        setGuides(filteredGuides);
      } catch (err) {
        console.error('Failed to load guides');
      } finally {
        setLoading(false);
      }
    };
    fetchGuides();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 space-y-24">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 leading-tight">
            Discovering the <span className="text-teal-600">Soul of Cambodia</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We are more than just a tour operator. We are storytellers, cultural ambassadors, and passionate explorers
            dedicated to showing you the hidden gems and timeless wonders of the Kingdom of Wonder.
          </p>
        </motion.div>
      </section>

      {/* Values Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: <ShieldCheck className="w-8 h-8 text-teal-600" />,
            title: 'Authentic Experiences',
            desc: 'We avoid the tourist traps. Our tours focus on real connections with local communities and genuine cultural immersion.'
          },
          {
            icon: <Star className="w-8 h-8 text-teal-600" />,
            title: 'Expert Local Guides',
            desc: 'Our guides aren\'t just experts in history; they are locals who love their home and share it with passion and depth.'
          },
          {
            icon: <Heart className="w-8 h-8 text-teal-600" />,
            title: 'Sustainable Travel',
            desc: 'We believe in responsible tourism that protects Cambodia\'s environment and supports the local economy directly.'
          }
        ].map((val, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.2 }}
            className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center space-y-4"
          >
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto">
              {val.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900">{val.title}</h3>
            <p className="text-gray-500 leading-relaxed">{val.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Our Team Section */}
      <section className="space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-gray-900">Meet Our Expert Guides</h2>
          <p className="text-gray-500">The heart and soul of every journey we create</p>
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : guides.length === 0 ? (
          <div className="text-center p-10 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Our guides are currently updating their profiles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {guides.map((guide, idx) => (
              <motion.div
                key={guide.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 text-center p-6 space-y-4"
              >
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <img
                    src={resolveImageUrl(guide.avatarUrl)}
                    alt={guide.fullName}
                    className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-110 transition-transform"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    GUIDE
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{guide.fullName || guide.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">Certified Cambodia Expert</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
