import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Booking, ProviderProfile } from '../types';
import { ProviderCard } from '../components/ProviderCard';
import { BookingModal } from '../components/BookingModal';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  Heart, 
  ArrowRight, 
  CheckCircle2, 
  Search,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';

export const CustomerDashboardPage: React.FC = () => {
  const { user, favorites } = useAuth();
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [favoriteProviders, setFavoriteProviders] = useState<ProviderProfile[]>([]);
  const [selectedProviderForBooking, setSelectedProviderForBooking] = useState<ProviderProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadDashboard = async () => {
      setIsLoading(true);
      try {
        const [allBookings, allProvs] = await Promise.all([
          api.bookings.getAll({ customerId: user.id }),
          api.providers.search(),
        ]);
        setRecentBookings(allBookings.slice(0, 3));
        const favs = allProvs.filter(p => favorites.includes(p.id));
        setFavoriteProviders(favs);
      } catch (err) {
        console.error('Failed to load customer dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboard();
  }, [user, favorites]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 rounded-3xl bg-gradient-to-r from-brand-900 via-navy-900 to-slate-900 text-white shadow-md">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-teal-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Customer Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.fullName || 'Alex Rivera'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Manage your service appointments, saved local specialists, and verified reviews.
          </p>
        </div>

        <Link
          to="/explore"
          className="btn-primary py-3 px-6 text-xs font-bold bg-teal-400 hover:bg-teal-300 text-slate-950 shadow-md self-start sm:self-auto"
        >
          <Search className="w-4 h-4" />
          <span>Book a New Service</span>
        </Link>
      </div>

      {/* Grid: Upcoming Appointments & Review Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Bookings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-600" />
              <span>Upcoming & Recent Bookings</span>
            </h2>
            <Link to="/bookings" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              View All ({recentBookings.length})
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500">No active bookings found.</p>
              <Link to="/explore" className="btn-secondary text-xs px-4">Find a Service</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((bk) => (
                <div
                  key={bk.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={bk.providerAvatar}
                      alt={bk.providerName}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          {bk.serviceTitle}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {bk.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">Provider: {bk.providerName}</p>
                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                        <span>{bk.date}</span>
                        <span>•</span>
                        <span>{bk.timeSlot}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link
                      to="/bookings"
                      className="btn-secondary py-1.5 px-3 text-xs"
                    >
                      Details
                    </Link>
                    <Link
                      to="/messages"
                      className="btn-primary py-1.5 px-3 text-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Trust Reminders & Quick Actions */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Customer Protection Active</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              All bookings placed through your account include:
            </p>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Escrow release upon job completion</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Verified trade credential guarantee</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Human dispute arbitration access</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link to="/safety" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
                <span>View Trust & Safety Policy</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Favorite Specialists */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <span>Saved Favorite Specialists</span>
          </h2>
          <span className="text-xs text-slate-500">{favoriteProviders.length} saved</span>
        </div>

        {favoriteProviders.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            No saved specialists yet. Click the heart icon on any provider profile to bookmark them here.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {favoriteProviders.map((prov) => (
              <ProviderCard
                key={prov.id}
                provider={prov}
                onBookClick={(p) => setSelectedProviderForBooking(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedProviderForBooking && (
        <BookingModal
          provider={selectedProviderForBooking}
          onClose={() => setSelectedProviderForBooking(null)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
};
