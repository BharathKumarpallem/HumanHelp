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
  Zap,
  Activity,
  Truck,
  Navigation,
  Car,
  Briefcase,
  PawPrint,
  ShieldAlert,
  Clock,
  Heart,
  Stethoscope,
  Hammer,
  AlertTriangle
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [featuredProviders, setFeaturedProviders] = useState<ProviderProfile[]>([]);
  const [homeProviders, setHomeProviders] = useState<ProviderProfile[]>([]);
  const [healthProviders, setHealthProviders] = useState<ProviderProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [locationText, setLocationText] = useState('Metropolitan Area');
  const [bookingProvider, setBookingProvider] = useState<ProviderProfile | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, allProvs, homeList, healthList] = await Promise.all([
          api.categories.getAll(),
          api.providers.search({ sort: 'rating' }),
          api.providers.search({ category: 'cat-home' }),
          api.providers.search({ category: 'cat-health' }),
        ]);
        setCategories(cats);
        setFeaturedProviders(allProvs.slice(0, 3));
        setHomeProviders(homeList.slice(0, 3));
        setHealthProviders(healthList.slice(0, 3));
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

  const getCategoryTheme = (slug: string, iconName: string) => {
    switch (iconName) {
      case 'Wrench':
        return {
          icon: <Wrench className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
          accentBg: 'bg-blue-50 dark:bg-blue-950/50',
          badgeText: 'Home Trade',
          badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800'
        };
      case 'Activity':
        return {
          icon: <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
          accentBg: 'bg-emerald-50 dark:bg-emerald-950/50',
          badgeText: 'Medical Licensed',
          badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
        };
      case 'Truck':
        return {
          icon: <Truck className="w-5 h-5 text-teal-600 dark:text-teal-400" />,
          accentBg: 'bg-teal-50 dark:bg-teal-950/50',
          badgeText: 'Pharmacy Delivery',
          badgeClass: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800'
        };
      case 'GraduationCap':
        return {
          icon: <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
          accentBg: 'bg-indigo-50 dark:bg-indigo-950/50',
          badgeText: 'Academic / Skills',
          badgeClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
        };
      case 'Laptop':
        return {
          icon: <Laptop className="w-5 h-5 text-sky-600 dark:text-sky-400" />,
          accentBg: 'bg-sky-50 dark:bg-sky-950/50',
          badgeText: 'Tech Certified',
          badgeClass: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800'
        };
      case 'Package':
        return {
          icon: <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
          accentBg: 'bg-amber-50 dark:bg-amber-950/50',
          badgeText: 'Assistance',
          badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
        };
      case 'Navigation':
        return {
          icon: <Navigation className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
          accentBg: 'bg-cyan-50 dark:bg-cyan-950/50',
          badgeText: 'Transit Authority',
          badgeClass: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
        };
      case 'Sparkles':
        return {
          icon: <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
          accentBg: 'bg-purple-50 dark:bg-purple-950/50',
          badgeText: 'Wellness / LMT',
          badgeClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800'
        };
      case 'Car':
        return {
          icon: <Car className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
          accentBg: 'bg-orange-50 dark:bg-orange-950/50',
          badgeText: 'ASE Master',
          badgeClass: 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800'
        };
      case 'Briefcase':
        return {
          icon: <Briefcase className="w-5 h-5 text-slate-700 dark:text-slate-300" />,
          accentBg: 'bg-slate-100 dark:bg-slate-800',
          badgeText: 'CPA / Legal',
          badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
        };
      case 'PawPrint':
        return {
          icon: <PawPrint className="w-5 h-5 text-teal-700 dark:text-teal-400" />,
          accentBg: 'bg-teal-50 dark:bg-teal-950/50',
          badgeText: 'Vet Certified',
          badgeClass: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800'
        };
      case 'ShieldAlert':
        return {
          icon: <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
          accentBg: 'bg-rose-50 dark:bg-rose-950/50',
          badgeText: 'Pediatric CPR Clear',
          badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800'
        };
      default:
        return {
          icon: <Wrench className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
          accentBg: 'bg-brand-50 dark:bg-brand-950/50',
          badgeText: 'Verified',
          badgeClass: 'bg-brand-50 text-brand-700 border-brand-200'
        };
    }
  };

  const faqs = [
    {
      q: 'How does HumanHelp verify service providers?',
      a: 'We review official state trade licenses, professional medical and technical certificates, and verified government IDs. Unlike directory apps that award badges for paying subscription fees, our compliance desk audits public registry data and displays exactly what credential was validated.'
    },
    {
      q: 'Are prices guaranteed or subject to surprise charges?',
      a: 'Providers publish upfront rates (hourly or fixed) along with a transparent 5% platform escrow fee. Any scope expansion requires written customer approval before additional costs can be applied. Unauthorized surcharges can be flagged immediately via our dispute desk.'
    },
    {
      q: 'How does HumanHelp protect healthcare and medical service requests?',
      a: 'All healthcare providers must be verified licensed professionals (MD, DO, RN, PT). Our AI matcher never provides medical diagnosis or prescriptions. HumanHelp is strictly for scheduled home visits and non-emergency consultations. In an emergency, dial 911 or 112 immediately.'
    },
    {
      q: 'How are customer reviews authenticated?',
      a: 'Only authenticated customers with completed, paid bookings can submit reviews. We strictly prohibit fake reviews, solicited testimonial trades, or competitor manipulation.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-800 dark:text-[#F8FAFC]">
      {/* 1. HERO SECTION: Pale blue-to-white gradient with Navy headings & Teal accents */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-[#F4F8FF] via-teal-50/20 to-[#F8FAFC] dark:from-[#0F172A] dark:via-[#132238] dark:to-[#0F172A] border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-[#1E293B] text-[#0D9488] dark:text-[#22D3EE] border border-teal-200/80 dark:border-teal-800/60 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#0D9488] dark:text-[#22D3EE]" />
              <span>A Principled Multi-Service Marketplace</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#16324F] dark:text-white leading-[1.12]">
              Find the Right Help. <br />
              <span className="text-[#0D9488] dark:text-[#22D3EE]">
                With Greater Confidence.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Connecting you with verified professionals for home repairs, healthcare visits, prescription deliveries, education, and technical support — backed by transparent pricing and real human accountability.
            </p>

            {/* SEARCH BOX: Clean pure-white card with soft shadow and Teal CTA */}
            <form
              onSubmit={handleSearchSubmit}
              className="mt-8 p-3 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-700/80 shadow-md shadow-slate-200/50 dark:shadow-none flex flex-col sm:flex-row items-center gap-2 text-left"
            >
              {/* Query Input */}
              <div className="flex-1 w-full flex items-center gap-3 px-3.5 py-2.5">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What service do you need? (e.g. Electrician, Doctor visit, Carpentry, AC repair)"
                  className="w-full bg-transparent text-sm text-[#16324F] dark:text-slate-100 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-slate-700" />

              {/* Category Selector */}
              <div className="w-full sm:w-48 px-3.5 py-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="all">All 12 Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-slate-700" />

              {/* Location Input */}
              <div className="w-full sm:w-44 flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <MapPin className="w-4 h-4 text-[#0D9488] shrink-0" />
                <input
                  type="text"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  placeholder="City / Area"
                  className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              {/* Submit CTA (Teal button with white text) */}
              <button
                type="submit"
                className="w-full sm:w-auto btn-primary py-3 px-6 text-sm font-bold rounded-xl sm:rounded-2xl"
              >
                <span>Find Help</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Category Tags with Domain Accents */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-400">Popular:</span>
              
              {/* Home Services: Blue Accents */}
              <button 
                onClick={() => { setSearchQuery('Electrician'); navigate('/explore?category=cat-home&subcategory=Electricians'); }} 
                className="px-2.5 py-1 rounded-full bg-blue-50/80 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800 transition-colors"
              >
                ⚡ Electricians
              </button>
              <button 
                onClick={() => { setSearchQuery('Carpenters'); navigate('/explore?category=cat-home&subcategory=Carpenters'); }} 
                className="px-2.5 py-1 rounded-full bg-blue-50/80 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800 transition-colors"
              >
                🔨 Carpentry
              </button>
              <button 
                onClick={() => { setSearchQuery('House cleaning'); navigate('/explore?category=cat-home&subcategory=House+cleaning'); }} 
                className="px-2.5 py-1 rounded-full bg-blue-50/80 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800 transition-colors"
              >
                🧹 Deep Cleaning
              </button>

              {/* Healthcare: Mint-Green Accents */}
              <button 
                onClick={() => { setSearchQuery('Doctor'); navigate('/explore?category=cat-health'); }} 
                className="px-2.5 py-1 rounded-full bg-emerald-50/80 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 transition-colors"
              >
                🏥 Doctor Visits
              </button>
              <button 
                onClick={() => { setSearchQuery('Nurse'); navigate('/explore?category=cat-health'); }} 
                className="px-2.5 py-1 rounded-full bg-emerald-50/80 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 transition-colors"
              >
                🩺 Home Nursing
              </button>

              {/* Pharmacy Delivery */}
              <button 
                onClick={() => { setSearchQuery('Prescription'); navigate('/explore?category=cat-pharmacy'); }} 
                className="px-2.5 py-1 rounded-full bg-teal-50/80 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800 transition-colors"
              >
                💊 Pharmacy Delivery
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE VALUE PILLARS (Trust Before Growth) — White cards on #F8FAFC canvas */}
      <section className="py-12 bg-white dark:bg-[#1E293B] border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A]/70 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="p-2.5 w-fit rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#16324F] dark:text-white">
                Verified Credentials Only
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                We inspect real trade licenses, medical registries, and insurance. Zero pay-to-play automated badges.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A]/70 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="p-2.5 w-fit rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#16324F] dark:text-white">
                Transparent Upfront Pricing
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Itemized quotes agreed before arrival with a 5% trust escrow fee. Zero surprise trip or dispatch fees.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A]/70 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="p-2.5 w-fit rounded-xl bg-teal-100 dark:bg-teal-950/60 text-[#0D9488] dark:text-[#22D3EE]">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#16324F] dark:text-white">
                Human-Led Dispute Desk
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Every grievance is reviewed by trained human arbiters who examine photographic evidence and initial quotes.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A]/70 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="p-2.5 w-fit rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#16324F] dark:text-white">
                100% Completed Booking Reviews
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Reviews are unlocked only after an authenticated service is marked completed by both parties.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 3. DUAL SHOWCASE: HOME SERVICES (Blue accents) & HEALTHCARE (Mint-Green accents) */}
      <section className="py-14 sm:py-18 bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#16324F] dark:text-white">
              Essential Care for Your Home & Family
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Balanced, trustworthy standards across skilled residential trades and registered healthcare professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* SPOTLIGHT 1: HOME SERVICES (Blue Accents) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-blue-100 dark:border-blue-900/60 shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    <Hammer className="w-3.5 h-3.5 text-blue-600" />
                    <span>Home Services & Trades</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">9 Specialized Subcategories</span>
                </div>

                <h3 className="text-xl font-bold text-[#16324F] dark:text-white">
                  Licensed Tradesmen You Can Invite Home With Peace of Mind
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  From Master Electricians and Journeyman Plumbers to fine finish Carpenters, EPA-certified Pest Control, and HVAC AC specialists. All providers have active liability coverage on record.
                </p>

                {/* Subcategories tags */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {['Electricians', 'Plumbers', 'Carpenters', 'House Cleaning', 'Appliance Repair', 'Painting', 'Pest Control', 'AC Repair', 'Landscaping'].map((sub) => (
                    <span key={sub} className="px-2.5 py-1 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 font-medium">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Starting from <strong className="text-slate-900 dark:text-white">$45/hr</strong> with zero trip fees
                </div>
                <Link to="/explore?category=cat-home" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                  <span>Browse Home Services</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* SPOTLIGHT 2: HEALTHCARE & DELIVERY (Mint-Green Accents) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-emerald-100 dark:border-emerald-900/60 shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Clinical Healthcare & Pharmacy</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">Board-Validated</span>
                </div>

                <h3 className="text-xl font-bold text-[#16324F] dark:text-white">
                  Board-Certified Doctors, Visiting Nurses & Prescription Delivery
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Scheduled clinical doctor visits, post-operative wound dressing, vital checks, and authorized pharmacy medication dispatch. Every medical professional is authenticated against State Licensing Boards.
                </p>

                {/* Statutory safety notice */}
                <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Non-Emergency Platform Notice:</strong> HumanHelp is for scheduled visits only. For acute, life-threatening symptoms, dial 911 or 112 immediately.
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Prescription delivery from <strong className="text-slate-900 dark:text-white">$15</strong>
                </div>
                <Link to="/explore?category=cat-health" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                  <span>Browse Healthcare Services</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. ALL 12 SERVICE CATEGORIES CATALOG */}
      <section className="py-16 sm:py-20 bg-white dark:bg-[#1E293B] border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/50 text-[#0D9488] border border-teal-200/60 dark:border-teal-800/60 mb-2">
                <span>Complete Catalog</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#16324F] dark:text-white">
                All 12 Service Categories
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Configured with explicit licensing requirements, transparent fee structures, and authorized delivery formats.
              </p>
            </div>
            <Link to="/explore" className="btn-secondary text-xs px-4 self-start sm:self-auto">
              <span>View All 21 Providers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => {
              const theme = getCategoryTheme(cat.slug, cat.iconName);
              return (
                <Link
                  key={cat.id}
                  to={`/explore?category=${cat.id}`}
                  className="group p-6 rounded-3xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 hover:border-[#0D9488] dark:hover:border-[#0D9488] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3.5 rounded-2xl ${theme.accentBg} group-hover:scale-110 transition-transform duration-200`}>
                        {theme.icon}
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${theme.badgeClass}`}>
                        {theme.badgeText}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#16324F] dark:text-white group-hover:text-[#0D9488] dark:group-hover:text-[#22D3EE] transition-colors">
                      {cat.name}
                    </h3>
                    
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                      {cat.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs text-[#0D9488] dark:text-[#22D3EE] font-semibold">
                    <span>{cat.subcategories?.length || 5} Subcategories</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. FEATURED VERIFIED PROVIDERS */}
      <section className="py-16 sm:py-20 bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#16324F] dark:text-white">
              Featured Verified Professionals
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Evaluated on regulatory verification records, response timeliness, transparent base pricing, and real customer feedback.
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
            <Link to="/explore" className="btn-primary text-xs px-6 py-3 font-bold">
              <span>Browse All Verified Professionals</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. HOW THE PLATFORM WORKS (Stepped Lifecycle) */}
      <section className="py-16 sm:py-20 bg-white dark:bg-[#1E293B] border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#16324F] dark:text-white">
              How HumanHelp Protects You
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              A transparent, structured booking lifecycle from first discovery to verified completion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            <div className="p-6 rounded-3xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#0D9488] text-white font-black text-base flex items-center justify-center mx-auto shadow-sm">
                1
              </div>
              <h3 className="font-bold text-sm text-[#16324F] dark:text-white">
                Discover & Compare
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Browse verified professionals with public licenses, verified skills, and transparent base rates.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#0D9488] text-white font-black text-base flex items-center justify-center mx-auto shadow-sm">
                2
              </div>
              <h3 className="font-bold text-sm text-[#16324F] dark:text-white">
                Agree Upfront
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Review the exact pricing breakdown, escrow trust fee, and cancellation policy before booking.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#0D9488] text-white font-black text-base flex items-center justify-center mx-auto shadow-sm">
                3
              </div>
              <h3 className="font-bold text-sm text-[#16324F] dark:text-white">
                Track & Communicate
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Stay connected through in-app booking chat. Track appointment status from accepted to in-progress.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#0D9488] text-white font-black text-base flex items-center justify-center mx-auto shadow-sm">
                4
              </div>
              <h3 className="font-bold text-sm text-[#16324F] dark:text-white">
                Verified Review
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Once work is completed, confirm satisfaction and leave an authentic review to maintain trust.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 7. PROVIDER WORKSPACE CTA: Deep Navy #16324F Banner */}
      <section className="py-16 bg-gradient-to-r from-[#16324F] via-[#102a45] to-[#0F766E] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl text-center lg:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                For Service Professionals & Clinicians
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Grow Your Reputation on a Platform Built for Real Craftsmanship
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Stop paying for fake leads or competing with unverified operators. HumanHelp validates your credentials, respects your pricing, and provides structured booking management with dispute protection.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <Link
                to="/provider/dashboard"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2dd4bf] hover:bg-[#14b8a6] text-[#16324F] font-bold text-xs text-center shadow-lg transition-all"
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

      {/* 8. FAQ ACCORDION */}
      <section className="py-16 sm:py-20 bg-[#F8FAFC] dark:bg-[#0F172A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#16324F] dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Clear answers regarding how trust, payments, healthcare safeguards, and dispute resolution work.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E293B] shadow-xs overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-4.5 text-left font-bold text-sm text-[#16324F] dark:text-slate-100 flex items-center justify-between gap-4"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-4.5 pb-4.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
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
