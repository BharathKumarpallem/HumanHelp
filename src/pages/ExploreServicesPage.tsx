import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { ProviderProfile, ServiceCategory } from '../types';
import { ProviderCard } from '../components/ProviderCard';
import { BookingModal } from '../components/BookingModal';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  X, 
  RotateCcw, 
  ShieldCheck, 
  Star, 
  DollarSign, 
  Check, 
  MapPin,
  RefreshCw
} from 'lucide-react';

export const ExploreServicesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProviderForBooking, setSelectedProviderForBooking] = useState<ProviderProfile | null>(null);

  // Filters state initialized from URL search params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [priceMax, setPriceMax] = useState<number>(150);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(searchParams.get('verifiedOnly') === 'true');
  const [minRating, setMinRating] = useState<number>(0);
  const [serviceType, setServiceType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Load categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const cats = await api.categories.getAll();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch filtered providers from backend
  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const results = await api.providers.search({
        q: searchQuery || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        priceMax: priceMax < 150 ? priceMax : undefined,
        verifiedOnly: verifiedOnly || undefined,
        minRating: minRating > 0 ? minRating : undefined,
        serviceType: serviceType !== 'all' ? serviceType : undefined,
        sort: sortBy,
      });
      setProviders(results);
    } catch (err) {
      console.error('Failed to search providers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [selectedCategory, verifiedOnly, minRating, serviceType, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProviders();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceMax(150);
    setVerifiedOnly(false);
    setMinRating(0);
    setServiceType('all');
    setSortBy('rating');
    setSearchParams({});
    setIsLoading(true);
    api.providers.search({ sort: 'rating' }).then((res) => {
      setProviders(res);
      setIsLoading(false);
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Explore Services & Verified Professionals
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Compare transparent pricing, verified licenses, and real customer feedback with full confidence.
        </p>
      </div>

      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2.5 px-3 flex-1">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by specialty, skill (e.g. EV charger, Calculus, Wi-Fi)..."
              className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
            />
          </div>
          <button type="submit" className="btn-primary py-2 px-4 text-xs">
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden flex-1 sm:flex-initial btn-secondary py-2.5 px-4 text-xs"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          {/* Sort Selector */}
          <div className="flex-1 sm:flex-initial">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none font-medium cursor-pointer"
            >
              <option value="rating">Sort: Highest Rated</option>
              <option value="price_asc">Sort: Lowest Price</option>
              <option value="price_desc">Sort: Highest Price</option>
              <option value="reviews">Sort: Most Reviews</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* FILTERS SIDEBAR (Desktop) */}
        <aside className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} space-y-6`}>
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                Refine Search
              </span>
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-2">
                Category
              </label>
              <div className="space-y-1.5">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      selectedCategory === c.id
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Verification filter */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">
                    Verified Credentials Only
                  </span>
                  <span className="text-[11px] text-slate-500 leading-tight">
                    Show only providers with validated state trade licenses or credentials.
                  </span>
                </div>
              </label>
            </div>

            {/* Max Hourly Rate */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-xs font-bold text-slate-900 dark:text-slate-100 mb-2">
                <span>Max Starting Rate</span>
                <span className="text-brand-600 dark:text-brand-400">${priceMax}/hr</span>
              </div>
              <input
                type="range"
                min="30"
                max="150"
                step="5"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>$30/hr</span>
                <span>$150/hr+</span>
              </div>
            </div>

            {/* Min Rating */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-2">
                Minimum Rating
              </label>
              <div className="flex gap-1.5">
                {[0, 4.5, 4.8].map((val) => (
                  <button
                    key={val}
                    onClick={() => setMinRating(val)}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition-colors ${
                      minRating === val
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {val === 0 ? 'All' : `${val}★+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Service Type (Remote / In-person) */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-2">
                Service Delivery
              </label>
              <div className="space-y-1.5">
                {['all', 'in_person', 'remote'].map((mode) => (
                  <label key={mode} className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="serviceType"
                      checked={serviceType === mode}
                      onChange={() => setServiceType(mode)}
                      className="text-brand-600 focus:ring-brand-500"
                    />
                    <span className="capitalize">{mode.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* RESULTS GRID */}
        <main className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span>Showing <strong>{providers.length}</strong> verified listing{providers.length === 1 ? '' : 's'}</span>
            {verifiedOnly && (
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Filtering for verified credentials
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-20 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-brand-600 mx-auto" />
              <p className="text-xs text-slate-500">Searching active providers and availability schedules...</p>
            </div>
          ) : providers.length === 0 ? (
            <div className="text-center py-20 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                No matching providers found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                We did not find active providers matching all your specified filters. Try loosening your price threshold or selecting "All Categories".
              </p>
              <button
                onClick={handleResetFilters}
                className="btn-secondary text-xs px-4"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {providers.map((p) => (
                <ProviderCard
                  key={p.id}
                  provider={p}
                  onBookClick={(selected) => setSelectedProviderForBooking(selected)}
                />
              ))}
            </div>
          )}
        </main>
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
