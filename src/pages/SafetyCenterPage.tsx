import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileCheck, 
  Lock, 
  Scale, 
  PhoneCall, 
  Send, 
  CheckCircle2, 
  Info,
  ExternalLink
} from 'lucide-react';

export const SafetyCenterPage: React.FC = () => {
  const { user } = useAuth();
  const [reportTarget, setReportTarget] = useState('');
  const [reportReason, setReportReason] = useState('safety_violation');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const handleSafetyReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDescription.trim() || !user) return;

    setIsSubmitting(true);
    try {
      await api.safety.report({
        reporterId: user.id,
        reportedUserId: reportTarget || 'unspecified_user',
        reason: reportReason,
        description: reportDescription,
      });
      setReportSuccess(true);
      setReportDescription('');
      setReportTarget('');
    } catch (err) {
      alert('Failed to submit report: ' + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Page Header */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Trust & Safety Foundation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Safety Center & Trust Architecture
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          HumanHelp is engineered with strict real-world safeguards. We believe transparent pricing, genuine credential checks, and impartial human arbitration come before platform growth.
        </p>
      </div>

      {/* Emergency Alert Banner */}
      <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 shrink-0">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div className="space-y-1 text-xs">
            <h3 className="font-bold text-sm text-amber-950 dark:text-amber-200">
              Emergency Guidance Clarification
            </h3>
            <p className="text-amber-900/80 dark:text-amber-300/80 leading-relaxed max-w-2xl">
              HumanHelp is a service marketplace, not an emergency medical, fire, or police dispatch service. If you or anyone at your location is in immediate danger or experiencing an acute crisis, contact emergency responders immediately.
            </p>
          </div>
        </div>
        <div className="font-mono font-bold text-xs px-3.5 py-2 rounded-xl bg-amber-200/60 dark:bg-amber-900 text-amber-950 dark:text-amber-100 shrink-0">
          Call 911 / 112
        </div>
      </div>

      {/* 4 Trust Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="p-3 w-fit rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
            <FileCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            How Provider Verification Works
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            We require proof of state license registration, trade certificates, and government ID. Our compliance team verifies credential numbers against public databases before granting status badges. We never award generic "100% Guaranteed" claims or fake badges.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="p-3 w-fit rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            In-Platform Escrow & Payment Protection
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Keep all bookings and message records within HumanHelp. Never agree to off-platform wire transfers or unverified cash deposits. All agreed prices are locked in writing to protect you against surprise surcharges.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="p-3 w-fit rounded-2xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
            <Scale className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Human-Centered Dispute Resolution
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            If work is incomplete or deviates from agreed terms, open a dispute directly from your booking card. An impartial platform arbitrator reviews messages, quotes, and photos to render a fair binding decision.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="p-3 w-fit rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Zero Fake Reviews Policy
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Reviews are allowed only from authentic accounts with verified completed bookings. Providers cannot pay to remove negative reviews, and competitors cannot submit unsolicited attacks.
          </p>
        </div>
      </div>

      {/* Safety Reporting Form */}
      <section className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs max-w-2xl mx-auto space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Submit a Safety or Compliance Incident
          </h2>
          <p className="text-xs text-slate-500">
            Our trust & compliance team investigates safety reports within 12 hours.
          </p>
        </div>

        {reportSuccess ? (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-100">Report Logged Successfully</h4>
            <p className="text-xs text-emerald-800 dark:text-emerald-300">
              Our safety director has received your inquiry. All investigation details are maintained in secure compliance records.
            </p>
            <button
              onClick={() => setReportSuccess(false)}
              className="btn-secondary text-xs px-4 mt-2"
            >
              Submit Another Report
            </button>
          </div>
        ) : (
          <form onSubmit={handleSafetyReport} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target User or Provider Business Name
              </label>
              <input
                type="text"
                value={reportTarget}
                onChange={(e) => setReportTarget(e.target.value)}
                placeholder="Name or booking identifier"
                className="input-field"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Incident Category
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="input-field"
              >
                <option value="safety_violation">Safety or Code Protocol Violation</option>
                <option value="harassment">Harassment or Abusive Communication</option>
                <option value="fraud">Fraudulent Off-Platform Payment Solicitations</option>
                <option value="misrepresentation">Misrepresented Licenses or Identity</option>
                <option value="other">Other Incident</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Detailed Incident Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Please describe what transpired with times, dates, and locations..."
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !reportDescription.trim()}
              className="btn-primary text-xs px-6 py-2.5 font-bold shadow-xs"
            >
              {isSubmitting ? 'Transmitting...' : 'Submit Confidential Report'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
};
