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
  RefreshCw,
  Activity,
  Truck,
  Home,
  Video,
  UserCheck
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
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || 'all');
  const [deliveryMode, setDeliveryMode] = useState<string>('all');
  const [priceMax, setPriceMax] = useState<number>(180);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(searchParams.get('verifiedOnly') === 'true');
  const [isMedicalOnly, setIsMedicalOnly] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
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
        subcategory: selectedSubcategory !== 'all' ? selectedSubcategory : undefined,
        priceMax: priceMax < 180 ? priceMax : undefined,
        verifiedOnly: verifiedOnly || undefined,
        isMedicalOnly: isMedicalOnly || undefined,
        deliveryMode: deliveryMode !== 'all' ? deliveryMode : undefined,
        minRating: minRating > 0 ? minRating : undefined,
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
  }, [selectedCategory, selectedSubcategory, deliveryMode, verifiedOnly, isMedicalOnly, minRating, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProviders();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setDeliveryMode('all');
    setPriceMax(180);
    setVerifiedOnly(false);
    setIsMedicalOnly(false);
    setMinRating(0);
    setSortBy('rating');
    setSearchParams({});
    setIsLoading(true);
    api.providers.search({ sort: 'rating' }).then((res) => {
      setProviders(res);
      setIsLoading(false);
    });
  };

  const activeCategoryObj = categories.find(c => c.id === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Explore Services & Verified Professionals
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Compare transparent pricing, verified licenses, home visits, and express deliveries across 12 service domains.
        </p>
      </div>

      {/* Regulated Category Notice if Healthcare */}
      {activeCategoryObj?.isRegulated && (
        <div className="mb-6 p-4 rounded-2xl bg-cyan-50/80 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-xs text-cyan-950 dark:text-cyan-200 flex items-start gap-3">
          <Activity className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>{activeCategoryObj.name} Regulatory Policy:</strong> {activeCategoryObj.regulatoryNotice || 'Regulated services require validated professional licenses. Emergency conditions should immediately contact local emergency services (911/112).'}
          </div>
        </div>
      )}

      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2.5 px-3 flex-1">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services (e.g. Doctor visit, Electrician, AC repair, Rx Delivery, Pet grooming)..."
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

      {/* Subcategory Pills (when a category is selected) */}
      {activeCategoryObj && activeCategoryObj.subcategories && activeCategoryObj.subcategories.length > 0 && (
        <div className="mb-6 pb-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedSubcategory('all')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              selectedSubcategory === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
            }`}
          >
            All {activeCategoryObj.name}
          </button>
          {activeCategoryObj.subcategories.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubcategory(sub)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                selectedSubcategory === sub
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* FILTERS SIDEBAR */}
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

            {/* Delivery Format Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-2">
                Delivery Format
              </label>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: 'all', label: 'All Delivery Modes', icon: null },
                  { id: 'home_visit', label: 'Home Visit / On-Site', icon: Home },
                  { id: 'online_consultation', label: 'Online Consultation', icon: Video },
                  { id: 'delivery', label: 'Courier Delivery', icon: Truck },
                  { id: 'in_person', label: 'In-Person Facility', icon: MapPin },
                ].map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <label key={mode.id} className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                      <input
                        type="radio"
                        name="deliveryMode"
                        checked={deliveryMode === mode.id}
                        onChange={() => setDeliveryMode(mode.id)}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{mode.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Categories */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 mb-2">
                Category ({categories.length})
              </label>
              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedSubcategory('all');
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
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
                    onClick={() => {
                      setSelectedCategory(c.id);
                      setSelectedSubcategory('all');
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedCategory === c.id
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    {c.isRegulated && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" title="Regulated profession" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Verification filter */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">
                    Verified Licenses Only
                  </span>
                  <span className="text-[11px] text-slate-500 leading-tight">
                    Show only providers with validated board licenses.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={isMedicalOnly}
                  onChange={(e) => setIsMedicalOnly(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">
                    Licensed Medical Professionals
                  </span>
                  <span className="text-[11px] text-slate-500 leading-tight">
                    Doctors, Registered Nurses, & Medical Boards only.
                  </span>
                </div>
              </label>
            </div>

            {/* Max Hourly Rate */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-xs font-bold text-slate-900 dark:text-slate-100 mb-2">
                <span>Max Starting Rate</span>
                <span className="text-brand-600 dark:text-brand-400">${priceMax}</span>
              </div>
              <input
                type="range"
                min="15"
                max="180"
                step="5"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>$15</span>
                <span>$180+</span>
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
          </div>
        </aside>

        {/* RESULTS GRID */}
        <main className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span>Showing <strong>{providers.length}</strong> verified provider{providers.length === 1 ? '' : 's'}</span>
            <div className="flex items-center gap-3">
              {deliveryMode !== 'all' && (
                <span className="capitalize text-brand-700 dark:text-brand-400 font-semibold">
                  Mode: {deliveryMode.replace('_', ' ')}
                </span>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-20 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-brand-600 mx-auto" />
              <p className="text-xs text-slate-500">Searching active providers and validated licenses...</p>
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
                We did not find active providers matching your criteria. Try loosening filters or choosing "All Categories".
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
