import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { ProviderProfile, Review, ProviderService } from '../types';
import { VerificationBadge } from '../components/VerificationBadge';
import { BookingModal } from '../components/BookingModal';
import { useAuth } from '../context/AuthContext';
import { 
  Star, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Heart, 
  Calendar, 
  ShieldCheck, 
  MessageSquare, 
  Languages, 
  Award, 
  ArrowLeft,
  DollarSign,
  AlertCircle
} from 'lucide-react';

export const ProviderProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isFavorite, toggleFavorite } = useAuth();

  const [provider, setProvider] = useState<(ProviderProfile & { reviews: Review[] }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<string | undefined>(undefined);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const data = await api.providers.getById(id);
        setProvider(data);
      } catch (err) {
        console.error('Failed to load provider profile:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-slate-500">
        Loading verified provider details...
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Provider Not Found</h2>
        <p className="text-xs text-slate-500">This provider profile may be inactive or does not exist.</p>
        <Link to="/explore" className="btn-primary text-xs px-4">Back to Search</Link>
      </div>
    );
  }

  const favorited = isFavorite(provider.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back button */}
      <div className="mb-6">
        <Link to="/explore" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Explore Listings</span>
        </Link>
      </div>

      {/* Hero Profile Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <img
                src={provider.avatarUrl}
                alt={provider.businessName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-slate-100 dark:border-slate-800 shadow-md"
              />
              {provider.isAcceptingBookings && (
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-3 border-white dark:border-slate-900" title="Accepting bookings" />
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {provider.businessName}
                </h1>
                <button
                  onClick={() => toggleFavorite(provider.id)}
                  className={`p-2 rounded-xl border transition-colors ${
                    favorited
                      ? 'bg-rose-50 border-rose-200 text-rose-500'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-500' : ''}`} />
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {provider.tagline}
              </p>

              <div className="pt-1">
                <VerificationBadge
                  status={provider.verificationStatus}
                  label={provider.verificationBadgeLabel}
                  details={provider.verificationDetails}
                />
              </div>

              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-white">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{provider.rating}</span>
                  <span className="font-normal text-slate-400">({provider.reviewCount} verified reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{provider.completedBookingsCount} bookings completed</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{provider.serviceArea}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Direct CTA box */}
          <div className="w-full md:w-auto p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3 shrink-0">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Starting Rate</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                ${provider.startingRate} <span className="text-xs font-semibold text-slate-500">/{provider.pricingType}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedServiceForBooking(undefined);
                setIsBookingOpen(true);
              }}
              className="w-full btn-primary py-2.5 px-6 text-xs font-bold shadow-sm"
            >
              Request Booking
            </button>

            <Link
              to="/messages"
              className="w-full btn-secondary py-2 px-4 text-xs flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Send Inquiry</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Services & Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* About & Bio */}
          <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Professional Background
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {provider.bio}
            </p>

            <div className="pt-3">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block mb-2">
                Specialized Skills & Scope
              </span>
              <div className="flex flex-wrap gap-2">
                {provider.skills.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Offered Services */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Offered Service Packages
              </h2>
              <span className="text-xs text-slate-500">
                {(provider.services || []).length} available
              </span>
            </div>

            <div className="space-y-3.5">
              {(provider.services || []).map((srv) => (
                <div
                  key={srv.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500 transition-colors shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {srv.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {srv.pricingModel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {srv.description}
                    </p>
                    <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3 pt-1">
                      <span>Est. duration: {srv.durationMinutes || 60} mins</span>
                      <span>•</span>
                      <span>{srv.remoteAvailable ? 'Online video & In-person' : 'In-person visits only'}</span>
                      <span>•</span>
                      <span className="text-amber-700 dark:text-amber-400">{srv.cancellationPolicy}</span>
                    </div>
                  </div>

                  <div className="text-right sm:pl-4 sm:border-l border-slate-100 dark:border-slate-800 shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                    <div className="text-lg font-extrabold text-brand-700 dark:text-brand-300">
                      ${srv.basePrice}
                      <span className="text-[10px] font-normal text-slate-400 ml-1">
                        {srv.pricingModel === 'hourly' ? '/hr' : 'flat'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedServiceForBooking(srv.id);
                        setIsBookingOpen(true);
                      }}
                      className="btn-primary py-1.5 px-4 text-xs font-semibold"
                    >
                      Book Service
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Customer Reviews */}
          <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Verified Customer Reviews
                </h2>
                <p className="text-xs text-slate-500">
                  Reviews are strictly eligible only after an authenticated service is completed.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{provider.rating}</span>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {provider.reviews.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No reviews yet for this provider.</p>
              ) : (
                provider.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{rev.customerName}</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified Booking
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {rev.title}
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {rev.comment}
                    </p>

                    {/* Provider Response if exists */}
                    {rev.providerResponse && (
                      <div className="mt-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                        <span className="font-bold text-[11px] text-brand-700 dark:text-brand-300 block">
                          Response from {provider.businessName}:
                        </span>
                        <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                          {rev.providerResponse.text}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Sidebar: Availability & Credentials Breakdown */}
        <aside className="space-y-6">
          {/* Verification Details Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3.5 text-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Trust & Credential Audit
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {provider.verificationDetails || 'Verified directly through official licensing boards.'}
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-semibold text-emerald-600">{provider.verificationBadgeLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Response Speed:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">~{provider.responseTimeMinutes} mins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Coverage Radius:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{provider.serviceRadiusKm} km</span>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3 text-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600" />
              Standard Working Hours
            </h3>
            <div className="space-y-1.5 text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Working Days:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">Mon - Fri</span>
              </div>
              <div className="flex justify-between">
                <span>Active Hours:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{provider.workingHoursStart} - {provider.workingHoursEnd}</span>
              </div>
            </div>
          </div>

          {/* Languages */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2 text-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Languages className="w-4 h-4 text-brand-600" />
              Languages Spoken
            </h3>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {provider.languages.map((l) => (
                <span
                  key={l}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Booking Modal */}
      {isBookingOpen && (
        <BookingModal
          provider={provider}
          preselectedServiceId={selectedServiceForBooking}
          onClose={() => setIsBookingOpen(false)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
};
