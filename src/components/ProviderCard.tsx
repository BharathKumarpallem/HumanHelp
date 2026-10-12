import React from 'react';
import { Link } from 'react-router-dom';
import { ProviderProfile } from '../types';
import { VerificationBadge } from './VerificationBadge';
import { useAuth } from '../context/AuthContext';
import { 
  Star, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Heart, 
  ArrowRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';

interface ProviderCardProps {
  provider: ProviderProfile;
  onBookClick?: (provider: ProviderProfile) => void;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onBookClick }) => {
  const { isFavorite, toggleFavorite } = useAuth();
  const favorited = isFavorite(provider.id);

  return (
    <div className="group relative rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden">
      {/* Top Banner accent */}
      <div className="h-2 w-full bg-gradient-to-r from-[#0D9488] to-teal-400 group-hover:h-2.5 transition-all" />

      <div className="p-5 flex-1 flex flex-col">
        {/* Header with Avatar, Name, and Favorite Button */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={provider.avatarUrl}
                alt={provider.businessName}
                className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
              />
              {provider.isAcceptingBookings && (
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#1E293B]" title="Accepting bookings today" />
              )}
            </div>
            <div>
              <Link 
                to={`/provider/${provider.id}`} 
                className="font-bold text-base text-[#16324F] dark:text-white hover:text-[#0D9488] dark:hover:text-[#22D3EE] transition-colors line-clamp-1"
              >
                {provider.businessName}
              </Link>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                {provider.tagline}
              </p>
            </div>
          </div>

          <button
            onClick={() => toggleFavorite(provider.id)}
            className={`p-2 rounded-xl border transition-colors ${
              favorited 
                ? 'bg-rose-50 border-rose-200 text-rose-500 dark:bg-rose-950/40 dark:border-rose-900' 
                : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-400 hover:text-rose-500'
            }`}
            title={favorited ? 'Remove from favorites' : 'Save provider'}
          >
            <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-500' : ''}`} />
          </button>
        </div>

        {/* Verification Status Badge */}
        <div className="mb-3.5">
          <VerificationBadge 
            status={provider.verificationStatus} 
            label={provider.verificationBadgeLabel}
            details={provider.verificationDetails}
          />
        </div>

        {/* Bio summary */}
        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 leading-relaxed">
          {provider.bio}
        </p>

        {/* Key Attributes Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 mb-4 bg-[#F8FAFC] dark:bg-[#0F172A]/70 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-[#16324F] dark:text-white">{provider.rating}</span>
            <span className="text-[11px] text-slate-400">({provider.reviewCount} reviews)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">{provider.completedBookingsCount} completed</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{provider.serviceArea}</span>
          </div>
        </div>

        {/* Skills pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {provider.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {skill}
            </span>
          ))}
          {provider.skills.length > 3 && (
            <span className="px-1.5 py-0.5 text-[10px] text-slate-400">
              +{provider.skills.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Footer bar with Pricing & Actions */}
      <div className="p-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 bg-[#F8FAFC]/80 dark:bg-[#0F172A]/50 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 block leading-tight">Starting At</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-extrabold text-[#16324F] dark:text-white">${provider.startingRate}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">/{provider.pricingType}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/provider/${provider.id}`}
            className="btn-secondary py-1.5 px-3 text-xs"
          >
            Profile
          </Link>
          <button
            onClick={() => onBookClick && onBookClick(provider)}
            className="btn-primary py-1.5 px-3.5 text-xs font-bold shadow-xs"
          >
            <span>Book</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
