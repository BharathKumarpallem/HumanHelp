import React, { useState } from 'react';
import { Booking } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { X, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface DisputeModalProps {
  booking: Booking;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({ booking, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [issueCategory, setIssueCategory] = useState<string>('unauthorized_fee');
  const [description, setDescription] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [requestedResolution, setRequestedResolution] = useState('partial_refund');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const categories = [
    { value: 'unauthorized_fee', label: 'Surprise or Unauthorized Fee' },
    { value: 'poor_quality', label: 'Unsatisfactory Quality or Incomplete Work' },
    { value: 'no_show', label: 'Provider Did Not Show Up' },
    { value: 'property_damage', label: 'Accidental Property Damage' },
    { value: 'harassment', label: 'Unprofessional or Abusive Conduct' },
    { value: 'other', label: 'Other Issue' },
  ];

  const resolutions = [
    { value: 'partial_refund', label: 'Partial Refund of Service Fee' },
    { value: 'full_refund', label: 'Full Refund of Escrow Deposit' },
    { value: 'service_redo', label: 'Provider Re-visits to Correct Work' },
    { value: 'formal_warning', label: 'Formal Policy Warning on Provider Record' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!description.trim()) {
      setErrorMessage('Please describe the dispute details.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await api.disputes.create({
        bookingId: booking.id,
        customerId: user.id,
        issueCategory,
        description,
        evidenceNotes: evidenceNotes || undefined,
        requestedResolution,
      });

      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to file dispute.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                File a Booking Dispute
              </h3>
              <p className="text-xs text-slate-500">
                Booking Reference: {booking.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Dispute Case Registered
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Your dispute has been escalated to our human compliance desk. A compliance manager will independently inspect provider communications and records within 24 hours.
              </p>
              <button onClick={onClose} className="btn-primary text-xs px-5 mt-4">
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Issue Category
                </label>
                <select
                  value={issueCategory}
                  onChange={(e) => setIssueCategory(e.target.value)}
                  className="input-field"
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Desired Resolution
                </label>
                <select
                  value={requestedResolution}
                  onChange={(e) => setRequestedResolution(e.target.value)}
                  className="input-field"
                >
                  {resolutions.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Detailed Explanation
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what occurred, what was agreed upon, and why this deviates from the confirmed booking..."
                  className="input-field"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Supporting Evidence & Notes
                </label>
                <input
                  type="text"
                  value={evidenceNotes}
                  onChange={(e) => setEvidenceNotes(e.target.value)}
                  placeholder="e.g. Chat message timestamp, invoice discrepancy, photo link"
                  className="input-field"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Consequential dispute decisions are evaluated by human compliance officers, not automated algorithms.</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button type="button" onClick={onClose} className="btn-secondary px-4">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary px-5 bg-rose-600 hover:bg-rose-700 text-white"
                >
                  {isSubmitting ? 'Filing...' : 'Submit Dispute'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
