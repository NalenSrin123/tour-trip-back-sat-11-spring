import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Seo } from '../../components/Seo';
import { toast } from 'sonner';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast.success('Message sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 space-y-16">
      <Seo
        title="Contact Us"
        description="Have a question about a tour or need a custom itinerary? Get in touch with the Tour Trip team."
      />
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-gray-900">Get in Touch</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Have questions about our tours or need a custom itinerary? Our team is here to help you plan the perfect Cambodian adventure.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 space-y-6"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-teal-600 outline-none transition-all"
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-teal-600 outline-none transition-all"
                  placeholder="email@example.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Subject</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-teal-600 outline-none transition-all"
                placeholder="How can we help?"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Message</label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-teal-600 outline-none transition-all resize-none"
                placeholder="Tell us about your travel plans..."
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-teal-600/30 hover:bg-teal-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" /> Send Message
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Contact Info & Map */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="bg-slate-900 rounded-3xl p-8 text-white space-y-8 shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/10 rounded-2xl text-teal-400">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Our Office</p>
                  <p className="text-lg font-medium">#123 Preah Sihanouk Blvd, Phnom Penh, Cambodia</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/10 rounded-2xl text-teal-400">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Phone</p>
                  <p className="text-lg font-medium">+855 23 456 789</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/10 rounded-2xl text-teal-400">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Email</p>
                  <p className="text-lg font-medium">support@explorecambodia.com</p>
                </div>
              </div>
            </div>

            <div className="relative h-64 rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_25%,rgba(45,212,191,0.55),transparent_55%),radial-gradient(circle_at_75%_70%,rgba(13,148,136,0.5),transparent_55%)]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute -inset-4 bg-teal-500 rounded-full animate-ping opacity-75"></div>
                  <MapPin className="w-8 h-8 text-teal-500 relative z-10" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
