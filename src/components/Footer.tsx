import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, AlertTriangle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export const Footer: React.FC = () => {
  const handleResetDemo = async () => {
    if (window.confirm('Reset demo database to fresh default state? All created test bookings will revert to default.')) {
      try {
        await api.admin.resetDemo();
        window.location.reload();
      } catch (err) {
        alert('Failed to reset demo: ' + err);
      }
    }
  };

  return (
    <footer className="w-full bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80 pt-12 pb-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Emergency Notice Banner */}
        <div className="mb-10 p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 flex items-start sm:items-center gap-3.5 text-xs text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <div className="flex-1 leading-relaxed">
            <strong>Important Safety Notice:</strong> HumanHelp facilitates connections between clients and independent verified professionals. HumanHelp is not an emergency response or law enforcement agency. In cases of immediate medical danger, active fire, or physical threat, contact your local emergency services (e.g. 911, 112, or 999) without delay.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-xs">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                Human<span className="text-brand-600 dark:text-brand-400">Help</span>
              </span>
            </Link>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              A trusted human services platform connecting people with real-world verified professionals. Built upon transparent upfront pricing, credential checking, and honest customer feedback.
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Verified Escrow & Dispute Resolution Protocols
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
              Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li><Link to="/explore?category=cat-home" className="hover:text-brand-600 dark:hover:text-brand-400">Home & Electrical</Link></li>
              <li><Link to="/explore?category=cat-home" className="hover:text-brand-600 dark:hover:text-brand-400">Plumbing & Heating</Link></li>
              <li><Link to="/explore?category=cat-edu" className="hover:text-brand-600 dark:hover:text-brand-400">STEM & Math Tutoring</Link></li>
              <li><Link to="/explore?category=cat-tech" className="hover:text-brand-600 dark:hover:text-brand-400">Tech & Wi-Fi Defense</Link></li>
              <li><Link to="/explore?category=cat-care" className="hover:text-brand-600 dark:hover:text-brand-400">Senior Assistance</Link></li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
              Trust & Safety
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li><Link to="/safety" className="hover:text-brand-600 dark:hover:text-brand-400">How Verification Works</Link></li>
              <li><Link to="/safety" className="hover:text-brand-600 dark:hover:text-brand-400">Dispute Arbitration Desk</Link></li>
              <li><Link to="/safety" className="hover:text-brand-600 dark:hover:text-brand-400">Report Abusive Listing</Link></li>
              <li><Link to="/safety" className="hover:text-brand-600 dark:hover:text-brand-400">Transparent Pricing Policy</Link></li>
            </ul>
          </div>

          {/* Developer / Demo tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
              Demo Workspace
            </h4>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <p className="text-[11px] text-slate-500">
                Operating with active local persistence and simulated Supabase schema.
              </p>
              <button
                onClick={handleResetDemo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-medium transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Demo State</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-500">
          <div>
            © 2026 HumanHelp Technologies. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Trust before growth</span>
            <span>•</span>
            <span>Zero Fake Reviews</span>
            <span>•</span>
            <span>Human in the Loop</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
