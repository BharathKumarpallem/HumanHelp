import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Booking, BookingStatus } from '../types';
import { ReviewModal } from '../components/ReviewModal';
import { DisputeModal } from '../components/DisputeModal';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  MessageSquare, 
  Star, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  DollarSign
} from 'lucide-react';

export const MyBookingsPage: React.FC = () => {
  const { user, role, providerProfile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [disputeBooking, setDisputeBooking] = useState<Booking | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const params: any = {};
      if (role === 'provider' && providerProfile) {
        params.providerId = providerProfile.id;
      } else {
        params.customerId = user.id;
      }
      const data = await api.bookings.getAll(params);
      setBookings(data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user, role, providerProfile]);

  const handleUpdateStatus = async (bookingId: string, status: BookingStatus, notes?: string) => {
    setActionInProgress(bookingId);
    try {
      await api.bookings.updateStatus(bookingId, { status, notes });
      await fetchBookings();
    } catch (err: any) {
      alert('Error updating booking: ' + err.message);
    } finally {
      setActionInProgress(null);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return <span className="badge-verified bg-emerald-50 text-emerald-700 border-emerald-200">Confirmed Appointment</span>;
      case 'in_progress':
        return <span className="badge-verified bg-cyan-50 text-cyan-700 border-cyan-200">In Progress</span>;
      case 'completed':
        return <span className="badge-verified bg-emerald-50 text-emerald-800 border-emerald-300">Completed Service</span>;
      case 'requested':
        return <span className="badge-pending bg-amber-50 text-amber-700 border-amber-200">Awaiting Provider</span>;
      case 'accepted':
        return <span className="badge-pending bg-indigo-50 text-indigo-700 border-indigo-200">Accepted by Provider</span>;
      case 'disputed':
        return <span className="badge-unverified bg-rose-50 text-rose-700 border-rose-200 font-bold">Dispute Under Review</span>;
      case 'cancelled':
        return <span className="badge-unverified bg-slate-100 text-slate-600 border-slate-200">Cancelled</span>;
      case 'declined':
        return <span className="badge-unverified bg-rose-50 text-rose-600 border-rose-200">Declined</span>;
      default:
        return <span className="badge-unverified">{status}</span>;
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return ['requested', 'accepted', 'confirmed', 'in_progress'].includes(b.status);
    if (activeTab === 'completed') return b.status === 'completed';
    if (activeTab === 'disputed') return b.status === 'disputed' || b.status === 'cancelled';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {role === 'provider' ? 'Provider Bookings & Appointments' : 'My Service Bookings'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track status, confirm dates, communicate, and leave verified reviews.
          </p>
        </div>

        <Link to="/explore" className="btn-primary text-xs self-start sm:self-auto px-4 py-2.5">
          <span>Find Another Service</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-6 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'All Bookings', count: bookings.length },
          { id: 'active', label: 'Active & Upcoming', count: bookings.filter(b => ['requested', 'accepted', 'confirmed', 'in_progress'].includes(b.status)).length },
          { id: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length },
          { id: 'disputed', label: 'Disputes & Cancelled', count: bookings.filter(b => ['disputed', 'cancelled'].includes(b.status)).length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="text-center py-20 text-xs text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-600 mx-auto mb-2" />
          <span>Loading booking records...</span>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto stroke-1" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            No bookings found in this view
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === 'all'
              ? 'You have not submitted or received any booking requests yet.'
              : `No bookings currently match the "${activeTab}" filter.`}
          </p>
          <Link to="/explore" className="btn-secondary text-xs px-4 mt-2">
            Explore Services
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((bk) => (
            <div
              key={bk.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-sm transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-start sm:items-center gap-4">
                  <img
                    src={bk.providerAvatar}
                    alt={bk.providerName}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {bk.serviceTitle}
                      </h3>
                      {getStatusBadge(bk.status)}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {role === 'provider' ? `Customer: ${bk.customerName}` : `Provider: ${bk.providerName}`} • Ref: <span className="font-mono">{bk.id}</span>
                    </p>
                  </div>
                </div>

                <div className="text-left lg:text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Agreed Total</span>
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    ${bk.totalAmount}
                    <span className="text-xs font-normal text-slate-500 ml-1">
                      (incl. ${bk.platformFee} fee)
                    </span>
                  </div>
                </div>
              </div>

              {/* Booking Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <Calendar className="w-4 h-4 text-brand-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Scheduled Date</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{bk.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <Clock className="w-4 h-4 text-brand-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Time Slot</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{bk.timeSlot}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 block">Location</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">{bk.serviceAddress || 'In-Person'}</span>
                  </div>
                </div>
              </div>

              {/* Problem Description & Status Notes */}
              <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 text-xs mb-4">
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Problem Notes:</span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {bk.problemDescription}
                </p>
                {bk.statusNotes && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-brand-700 dark:text-brand-300 font-medium">
                    Status Update: {bk.statusNotes}
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS (Context-Aware) */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <Link
                  to="/messages"
                  className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Message {role === 'provider' ? 'Customer' : 'Provider'}</span>
                </Link>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Provider Actions */}
                  {role === 'provider' && bk.status === 'requested' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(bk.id, 'accepted', 'Provider accepted booking request.')}
                        disabled={actionInProgress === bk.id}
                        className="btn-primary text-xs px-4 py-2"
                      >
                        Accept Booking
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(bk.id, 'declined', 'Provider cannot accommodate requested time.')}
                        disabled={actionInProgress === bk.id}
                        className="btn-secondary text-xs px-3.5 py-2 text-rose-600 hover:text-rose-700"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {role === 'provider' && bk.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(bk.id, 'in_progress', 'Provider arrived on site / started work.')}
                      disabled={actionInProgress === bk.id}
                      className="btn-primary text-xs px-4 py-2 bg-indigo-600 hover:bg-indigo-700"
                    >
                      Mark In Progress
                    </button>
                  )}

                  {role === 'provider' && (bk.status === 'in_progress' || bk.status === 'accepted') && (
                    <button
                      onClick={() => handleUpdateStatus(bk.id, 'completed', 'Work completed satisfactorily.')}
                      disabled={actionInProgress === bk.id}
                      className="btn-primary text-xs px-4 py-2 bg-emerald-600 hover:bg-emerald-700"
                    >
                      Mark Completed
                    </button>
                  )}

                  {/* Customer Actions */}
                  {role === 'customer' && bk.status === 'requested' && (
                    <button
                      onClick={() => handleUpdateStatus(bk.id, 'cancelled', 'Cancelled by customer before confirmation.')}
                      disabled={actionInProgress === bk.id}
                      className="btn-secondary text-xs px-3.5 py-2 text-slate-500 hover:text-rose-600"
                    >
                      Cancel Request
                    </button>
                  )}

                  {role === 'customer' && bk.status === 'completed' && (
                    <>
                      {!bk.isReviewed ? (
                        <button
                          onClick={() => setReviewBooking(bk)}
                          className="btn-primary text-xs px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1.5 shadow-xs"
                        >
                          <Star className="w-3.5 h-3.5 fill-white" />
                          <span>Leave Verified Review</span>
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Review Submitted
                        </span>
                      )}
                    </>
                  )}

                  {/* Dispute Action for Customer or Provider if in progress or completed */}
                  {['confirmed', 'in_progress', 'completed'].includes(bk.status) && (
                    <button
                      onClick={() => setDisputeBooking(bk)}
                      className="btn-secondary text-xs px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Dispute Issue</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSuccess={() => fetchBookings()}
        />
      )}

      {/* Dispute Modal */}
      {disputeBooking && (
        <DisputeModal
          booking={disputeBooking}
          onClose={() => setDisputeBooking(null)}
          onSuccess={() => fetchBookings()}
        />
      )}
    </div>
  );
};
