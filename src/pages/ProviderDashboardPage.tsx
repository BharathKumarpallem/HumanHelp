import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ProviderProfile, Booking, ProviderService } from '../types';
import { VerificationBadge } from '../components/VerificationBadge';
import { 
  Briefcase, 
  Calendar, 
  Clock, 
  DollarSign, 
  Plus, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Upload, 
  Star, 
  Settings,
  MessageSquare,
  RefreshCw,
  Power,
  AlertCircle
} from 'lucide-react';

export const ProviderDashboardPage: React.FC = () => {
  const { user, providerProfile, refreshUser } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isSubmittingDoc, setIsSubmittingDoc] = useState(false);
  const [docType, setDocType] = useState('trade_license');
  const [docName, setDocName] = useState('');
  const [licenseNum, setLicenseNum] = useState('');
  const [issuingAuth, setIssuingAuth] = useState('');
  const [docSuccess, setDocSuccess] = useState(false);
  const [newServiceOpen, setNewServiceOpen] = useState(false);
  const [newServiceTitle, setNewServiceTitle] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServicePrice, setNewServicePrice] = useState(85);
  const [newServiceDuration, setNewServiceDuration] = useState(60);
  const [isAccepting, setIsAccepting] = useState(providerProfile?.isAcceptingBookings ?? true);

  const provider = providerProfile;

  const fetchProviderBookings = async () => {
    if (!provider) return;
    try {
      const data = await api.bookings.getAll({ providerId: provider.id });
      setBookings(data);
    } catch (err) {
      console.error('Failed to load provider bookings:', err);
    }
  };

  useEffect(() => {
    fetchProviderBookings();
  }, [provider]);

  const handleToggleAccepting = async () => {
    if (!provider) return;
    const nextVal = !isAccepting;
    setIsAccepting(nextVal);
    try {
      await api.providers.update(provider.id, { isAcceptingBookings: nextVal });
      refreshUser();
    } catch (err) {
      setIsAccepting(!nextVal);
      alert('Error updating status: ' + err);
    }
  };

  const handleDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !docName.trim()) return;

    try {
      await api.verifications.submit({
        providerId: provider.id,
        documentType: docType,
        documentName: docName,
        licenseNumber: licenseNum,
        issuingAuthority: issuingAuth,
      });
      setDocSuccess(true);
      setIsSubmittingDoc(false);
      refreshUser();
    } catch (err) {
      alert('Error submitting document: ' + err);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !newServiceTitle.trim()) return;

    try {
      await api.providers.addService(provider.id, {
        title: newServiceTitle,
        description: newServiceDesc,
        categoryId: provider.categories[0] || 'cat-home',
        pricingModel: 'hourly',
        basePrice: newServicePrice,
        durationMinutes: newServiceDuration,
      });
      setNewServiceOpen(false);
      setNewServiceTitle('');
      setNewServiceDesc('');
      refreshUser();
    } catch (err) {
      alert('Error creating service: ' + err);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: any, notes?: string) => {
    try {
      await api.bookings.updateStatus(bookingId, { status, notes });
      fetchProviderBookings();
    } catch (err) {
      alert('Error updating status: ' + err);
    }
  };

  if (!provider) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Provider Profile Inactive</h2>
        <p className="text-xs text-slate-500">
          Switch to the Provider demo persona ("Elena Chen") in the top menu bar to view this workspace.
        </p>
      </div>
    );
  }

  const requestedBookings = bookings.filter(b => b.status === 'requested');
  const activeBookings = bookings.filter(b => ['accepted', 'confirmed', 'in_progress'].includes(b.status));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={provider.avatarUrl}
            alt={provider.businessName}
            className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shadow-2xs"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {provider.businessName}
              </h1>
              <VerificationBadge
                status={provider.verificationStatus}
                label={provider.verificationBadgeLabel}
                details={provider.verificationDetails}
              />
            </div>
            <p className="text-xs text-slate-500">{provider.tagline}</p>
          </div>
        </div>

        {/* Status Toggle & Submission Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleAccepting}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all ${
              isAccepting
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isAccepting ? 'Accepting Bookings' : 'Bookings Paused'}</span>
          </button>

          <button
            onClick={() => setIsSubmittingDoc(true)}
            className="btn-primary text-xs px-4 py-2"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Submit Verification Proof</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Completed Jobs</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{provider.completedBookingsCount}</div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Rating</span>
          <div className="text-2xl font-extrabold text-amber-500 flex items-center gap-1">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span>{provider.rating}</span>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Response Speed</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">~{provider.responseTimeMinutes}m</div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Starting Rate</span>
          <div className="text-2xl font-extrabold text-brand-600 dark:text-brand-400">${provider.startingRate}/hr</div>
        </div>
      </div>

      {/* Verification submission modal */}
      {isSubmittingDoc && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Submit Official Verification Documents</h3>
              <button onClick={() => setIsSubmittingDoc(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleDocSubmit} className="space-y-3.5">
              <div>
                <label className="block font-semibold mb-1">Document Category</label>
                <select value={docType} onChange={(e) => setDocType(e.target.value)} className="input-field">
                  <option value="trade_license">State Trade / Master License</option>
                  <option value="certification">Professional Certificate</option>
                  <option value="insurance">General Liability Insurance Certificate</option>
                  <option value="government_id">Government Photo Identification</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Document File Name / Reference</label>
                <input
                  type="text"
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Master_Electrician_License_2026.pdf"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">License or Certificate Number</label>
                <input
                  type="text"
                  value={licenseNum}
                  onChange={(e) => setLicenseNum(e.target.value)}
                  placeholder="e.g. EL-894231"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Issuing Board / Authority</label>
                <input
                  type="text"
                  value={issuingAuth}
                  onChange={(e) => setIssuingAuth(e.target.value)}
                  placeholder="e.g. State Board of Electrical Examiners"
                  className="input-field"
                />
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-500">
                Documents are routed to platform compliance administrators. Never upload sensitive tax files or credit numbers.
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsSubmittingDoc(false)} className="btn-secondary px-4">Cancel</button>
                <button type="submit" className="btn-primary px-5">Submit for Review</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Requests Pipeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <span>Pending Booking Requests ({requestedBookings.length})</span>
          </h2>
        </div>

        {requestedBookings.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-400 text-center">
            No pending booking requests awaiting review right now.
          </div>
        ) : (
          <div className="space-y-3">
            {requestedBookings.map((bk) => (
              <div
                key={bk.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{bk.serviceTitle}</span>
                    <span className="text-xs text-slate-500">from {bk.customerName}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">"{bk.problemDescription}"</p>
                  <div className="text-[11px] text-slate-500 flex items-center gap-3 pt-1">
                    <span>{bk.date}</span>
                    <span>•</span>
                    <span>{bk.timeSlot}</span>
                    <span>•</span>
                    <span className="font-bold text-slate-900 dark:text-white">${bk.totalAmount}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => handleUpdateBookingStatus(bk.id, 'accepted', 'Provider accepted booking.')}
                    className="btn-primary text-xs px-4 py-2"
                  >
                    Accept Booking
                  </button>
                  <button
                    onClick={() => handleUpdateBookingStatus(bk.id, 'declined', 'Provider cannot accommodate this request.')}
                    className="btn-secondary text-xs px-3.5 py-2 text-rose-600 hover:text-rose-700"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Service Listings Manager */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-brand-600" />
            <span>Published Service Listings ({(provider.services || []).length})</span>
          </h2>
          <button
            onClick={() => setNewServiceOpen(true)}
            className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Service Package</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(provider.services || []).map((srv) => (
            <div
              key={srv.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{srv.title}</h3>
                <span className="font-extrabold text-brand-600 dark:text-brand-400">${srv.basePrice} {srv.pricingModel === 'hourly' ? '/hr' : 'flat'}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 line-clamp-2">{srv.description}</p>
              <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between">
                <span>Duration: {srv.durationMinutes || 60}m</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active in Directory</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add service package modal */}
      {newServiceOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Publish New Service Package</h3>
              <button onClick={() => setNewServiceOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAddService} className="space-y-3.5">
              <div>
                <label className="block font-semibold mb-1">Package Title</label>
                <input
                  type="text"
                  required
                  value={newServiceTitle}
                  onChange={(e) => setNewServiceTitle(e.target.value)}
                  placeholder="e.g. Sub-Panel Inspection & Circuit Breaker Test"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Package Description</label>
                <textarea
                  rows={3}
                  required
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  placeholder="What is included, equipment tested, and expected deliverable..."
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Base Price ($)</label>
                  <input
                    type="number"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(Number(e.target.value))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(Number(e.target.value))}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setNewServiceOpen(false)} className="btn-secondary px-4">Cancel</button>
                <button type="submit" className="btn-primary px-5">Publish Package</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
