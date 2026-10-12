import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ProviderProfile, ServiceCategory } from '../types';
import { ProviderCard } from '../components/ProviderCard';
import { BookingModal } from '../components/BookingModal';
import { 
  Search, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Wrench, 
  GraduationCap, 
  Laptop, 
  Package, 
  HeartHandshake,
  DollarSign,
  Scale,
  Sparkles,
  ChevronDown,
  UserCheck,
  Award,
  Zap
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [featuredProviders, setFeaturedProviders] = useState<ProviderProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [locationText, setLocationText] = useState('Metropolitan Area');
  const [bookingProvider, setBookingProvider] = useState<ProviderProfile | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, provs] = await Promise.all([
          api.categories.getAll(),
          api.providers.search({ sort: 'rating' }),
        ]);
        setCategories(cats);
        setFeaturedProviders(provs.slice(0, 3));
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    navigate(`/explore?${params.toString()}`);
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wrench': return <Wrench className="w-6 h-6 text-brand-600 dark:text-brand-400" />;
      case 'GraduationCap': return <GraduationCap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />;
      case 'Laptop': return <Laptop className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />;
      case 'Package': return <Package className="w-6 h-6 text-amber-600 dark:text-amber-400" />;
      case 'HeartHandshake': return <HeartHandshake className="w-6 h-6 text-rose-600 dark:text-rose-400" />;
      default: return <Wrench className="w-6 h-6 text-brand-600 dark:text-brand-400" />;
    }
  };

  const faqs = [
    {
      q: 'How does HumanHelp verify service providers?',
      a: 'We review official state trade licenses, professional certificates, and government IDs. Unlike directory apps that award badges automatically for paying advertising fees, our compliance team inspects public registry data and displays exactly what credential was validated.'
    },
    {
      q: 'Are prices guaranteed or subject to surprise charges?',
      a: 'Providers publish upfront rates (hourly or fixed). Any scope expansion requires written customer approval before additional costs can be applied. Unauthorized charges can be flagged immediately via our dispute desk.'
    },
    {
      q: 'Who resolves disputes if a job is not completed satisfactorily?',
      a: 'Consequential disputes are reviewed by human platform compliance arbiters, not automated chatbots. We review written communication, photographic evidence, and initial booking terms to provide fair refunds or remediation.'
    },
    {
      q: 'How are customer reviews verified?',
      a: 'Only customers who have an authenticated, completed booking can submit a review. We strictly prohibit fake reviews, solicited testimonial trades, or competitor sabotages.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-brand-50/40 via-white to-slate-50 dark:from-navy-950 dark:via-[#0b1120] dark:to-navy-950 border-b border-slate-200/80 dark:border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:24px_24px] opacity-10 dark:opacity-5 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-100/70 text-brand-800 dark:bg-brand-950/80 dark:text-brand-300 border border-brand-200/80 dark:border-brand-800 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>A Principled Human Services Marketplace</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Find the Right Help. <br />
              <span className="bg-gradient-to-r from-brand-600 via-teal-500 to-indigo-600 bg-clip-text text-transparent">
                With Greater Confidence.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Discover local professionals, compare services, understand pricing, and manage bookings in one place — backed by genuine credential checking and fair dispute resolution.
            </p>

            {/* SEARCH BOX */}
            <form
              onSubmit={handleSearchSubmit}
              className="mt-8 p-3 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row items-center gap-2 text-left"
            >
              {/* Service Query Input */}
              <div className="flex-1 w-full flex items-center gap-3 px-3.5 py-2.5">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What service do you need? (e.g. Electrician, Math tutor)"
                  className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-slate-800" />

              {/* Category selector */}
              <div className="w-full sm:w-48 px-3.5 py-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-slate-800" />

              {/* Location selector */}
              <div className="w-full sm:w-44 flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                <input
                  type="text"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  placeholder="Location / Area"
                  className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full sm:w-auto btn-primary py-3 px-6 text-sm font-semibold rounded-xl sm:rounded-2xl shadow-md"
              >
                <span>Find Services</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-500">
              <span className="font-medium">Popular:</span>
              <button onClick={() => { setSearchQuery('Electrician'); navigate('/explore?q=Electrician'); }} className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors">
                ⚡ Electricians
              </button>
              <button onClick={() => { setSearchQuery('Plumbing'); navigate('/explore?q=Plumbing'); }} className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors">
                🔧 Leak Diagnostics
              </button>
              <button onClick={() => { setSearchQuery('Calculus'); navigate('/explore?q=Calculus'); }} className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors">
                📐 Math Tutoring
              </button>
              <button onClick={() => { setSearchQuery('Wi-Fi'); navigate('/explore?q=Wi-Fi'); }} className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors">
                💻 Mesh Wi-Fi Setup
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CORE VALUE PILLARS (Trust Before Growth) */}
      <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="p-2.5 w-fit rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Verified Credentials Only
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                We inspect real trade licenses, insurance policies, and registries. No automatic badges.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="p-2.5 w-fit rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Transparent Upfront Pricing
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Clear hourly or fixed quotes agreed beforehand. Providers cannot unilaterally append hidden fees.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="p-2.5 w-fit rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Human-Led Dispute Desk
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Disputes are adjudicated by trained human arbiters who review records, not automated algorithms.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="p-2.5 w-fit rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                100% Verified Reviews
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Reviews can only be written after an actual service is completed. Zero fake marketing testimonials.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICE CATEGORIES GRID */}
      <section className="py-16 sm:py-20 bg-slate-50/60 dark:bg-slate-950/40 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Service Categories
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Explore specialized domains with defined regulatory and licensing standards.
              </p>
            </div>
            <Link to="/explore" className="btn-secondary text-xs px-4 self-start sm:self-auto">
              <span>View All Listings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/explore?category=${cat.id}`}
                className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 group-hover:scale-110 transition-transform duration-200">
                      {getCategoryIcon(cat.iconName)}
                    </div>
                    {cat.requiresSpecialLicense && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800">
                        License Regulated
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-brand-600 dark:text-brand-400 font-semibold">
                  <span>{cat.activeListingCount || 8} Active Listings</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED VERIFIED PROVIDERS */}
      <section className="py-16 sm:py-20 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Featured Verified Professionals
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Evaluated on regulatory verification records, response timeliness, and real customer ratings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProviders.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                onBookClick={(p) => setBookingProvider(p)}
              />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/explore" className="btn-primary text-xs px-6 py-3">
              <span>Browse All Verified Professionals</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* HOW THE PLATFORM WORKS */}
      <section className="py-16 sm:py-20 bg-slate-50/70 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              How HumanHelp Protects You
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              A transparent, structured booking lifecycle from first discovery to verified completion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="relative text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-extrabold text-base flex items-center justify-center mx-auto shadow-md">
                1
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Discover & Compare
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Browse verified professionals with public licenses, verified skills, and transparent base rates.
              </p>
            </div>

            <div className="relative text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-extrabold text-base flex items-center justify-center mx-auto shadow-md">
                2
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Agree Upfront
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Select your service slot and review the exact pricing breakdown and cancellation policy before requesting.
              </p>
            </div>

            <div className="relative text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-extrabold text-base flex items-center justify-center mx-auto shadow-md">
                3
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Track & Confirm
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Stay connected through in-app messaging. Track appointment status from accepted to in-progress.
              </p>
            </div>

            <div className="relative text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-extrabold text-base flex items-center justify-center mx-auto shadow-md">
                4
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Verified Feedback
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Once work is finished, confirm completion and leave an authentic review to maintain community integrity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PROVIDER CTA */}
      <section className="py-16 bg-gradient-to-tr from-brand-900 via-navy-900 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl text-center lg:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                For Service Professionals
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Grow Your Reputation on a Platform Built for Real Craftsmanship
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Stop paying for fake leads and competing with unverified operators. HumanHelp validates your credentials, respects your pricing, and provides structured booking management.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <Link
                to="/provider/dashboard"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs text-center shadow-lg transition-all"
              >
                Open Provider Workspace
              </Link>
              <Link
                to="/safety"
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs text-center border border-white/20 transition-all"
              >
                Verification Standards
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-16 sm:py-20 bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Honest answers regarding how trust, payments, and verification are handled.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-4.5 text-left font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center justify-between gap-4"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-4.5 pb-4.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {bookingProvider && (
        <BookingModal
          provider={bookingProvider}
          onClose={() => setBookingProvider(null)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
};
