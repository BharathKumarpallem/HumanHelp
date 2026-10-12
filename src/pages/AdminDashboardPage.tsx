import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { VerificationEvidence, Dispute, AuditLogItem } from '../types';
import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  FileCheck, 
  Scale, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  DollarSign, 
  ListCheck,
  History,
  Info
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user, role } = useAuth();

  const [metrics, setMetrics] = useState<any>(null);
  const [verificationQueue, setVerificationQueue] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'verifications' | 'disputes' | 'audit'>('verifications');

  // Review state
  const [reviewingEvidenceId, setReviewingEvidenceId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [badgeType, setBadgeType] = useState<any>('credentials_checked');

  // Dispute resolution state
  const [resolvingDisputeId, setResolvingDisputeId] = useState<string | null>(null);
  const [disputeDecision, setDisputeDecision] = useState('');
  const [disputeStatus, setDisputeStatus] = useState('resolved');

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [m, vQueue, dList, logs] = await Promise.all([
        api.admin.getMetrics(),
        api.verifications.getQueue(),
        api.disputes.getAll(),
        api.admin.getAuditLogs(),
      ]);
      setMetrics(m);
      setVerificationQueue(vQueue);
      setDisputes(dList);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load admin operations data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleReviewVerification = async (evidenceId: string, status: 'approved' | 'rejected') => {
    try {
      await api.verifications.review(evidenceId, {
        status,
        adminNotes: adminNotes || (status === 'approved' ? 'Verified against state licensing database.' : 'Missing renewal confirmation.'),
        badgeType: status === 'approved' ? badgeType : undefined,
        adminId: user?.id,
        adminName: user?.fullName,
      });
      setReviewingEvidenceId(null);
      setAdminNotes('');
      await loadAdminData();
    } catch (err: any) {
      alert('Error reviewing verification: ' + err.message);
    }
  };

  const handleResolveDispute = async (disputeId: string) => {
    if (!disputeDecision.trim()) {
      alert('Please enter your written administrative decision.');
      return;
    }

    try {
      await api.disputes.resolve(disputeId, {
        status: disputeStatus,
        adminDecision: disputeDecision,
        adminId: user?.id,
        adminName: user?.fullName,
      });
      setResolvingDisputeId(null);
      setDisputeDecision('');
      await loadAdminData();
    } catch (err: any) {
      alert('Error resolving dispute: ' + err.message);
    }
  };

  const handleResetDemo = async () => {
    if (window.confirm('Reset entire demo database to initial state?')) {
      try {
        await api.admin.resetDemo();
        window.location.reload();
      } catch (err) {
        alert('Failed to reset demo: ' + err);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 rounded-3xl bg-slate-900 text-white shadow-md">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Platform Compliance Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Administrator Compliance & Oversight
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Director Marcus Vance • Strict Role-Based Administrative Authority
          </p>
        </div>

        <button
          onClick={handleResetDemo}
          className="btn-secondary py-2.5 px-4 text-xs font-bold bg-white/10 hover:bg-white/20 text-white border-white/20 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Demo Database</span>
        </button>
      </div>

      {/* Operational Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Bookings</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{metrics.totalBookings}</div>
            <div className="text-[11px] text-emerald-600 font-medium">{metrics.completedBookings} completed</div>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Verified Providers</span>
            <div className="text-2xl font-black text-emerald-600">{metrics.verifiedProviders}</div>
            <div className="text-[11px] text-slate-400">of {metrics.totalProviders} registered</div>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Pending Verification</span>
            <div className="text-2xl font-black text-amber-500">{metrics.pendingVerifications}</div>
            <div className="text-[11px] text-slate-400">in review queue</div>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Open Disputes</span>
            <div className="text-2xl font-black text-rose-500">{metrics.openDisputes}</div>
            <div className="text-[11px] text-slate-400">requiring human ruling</div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('verifications')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'verifications'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Verification Queue ({verificationQueue.filter(v => v.status === 'pending').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('disputes')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'disputes'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Dispute Desk ({disputes.filter(d => ['submitted', 'under_review'].includes(d.status)).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'audit'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Compliance Audit Log ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: Verification Queue */}
      {activeTab === 'verifications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Provider Credential Applications & Regulatory Filings</span>
          </div>

          <div className="space-y-3">
            {verificationQueue.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.providerAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
                      alt={item.providerName}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {item.providerName}
                      </h3>
                      <p className="text-slate-500">
                        Document: <span className="font-mono text-slate-700 dark:text-slate-300">{item.documentName}</span> ({item.documentType})
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold self-start sm:self-auto ${
                    item.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : item.status === 'rejected'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {item.status.toUpperCase()}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-6 text-[11px] text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="text-slate-400 block">License / Cert Number:</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">{item.licenseNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Issuing Authority:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{item.issuingAuthority || 'Unspecified Board'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Submitted At:</span>
                    <span>{new Date(item.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {item.adminNotes && (
                  <p className="text-[11px] text-slate-500 italic">
                    Compliance Notes: {item.adminNotes}
                  </p>
                )}

                {/* Review action buttons */}
                {item.status === 'pending' && (
                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleReviewVerification(item.id, 'approved')}
                      className="btn-primary text-xs px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Grant Badge</span>
                    </button>
                    <button
                      onClick={() => handleReviewVerification(item.id, 'rejected')}
                      className="btn-secondary text-xs px-3.5 py-1.5 text-rose-600 hover:text-rose-700 border-rose-200"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject Application</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Dispute Desk */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          <div className="space-y-3">
            {disputes.map((disp) => (
              <div
                key={disp.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        Dispute on Booking {disp.bookingId}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
                        {disp.issueCategory.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-slate-500">
                      Filed by: <strong>{disp.customerName}</strong> against <strong>{disp.providerName}</strong>
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    {disp.status.toUpperCase()}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 leading-relaxed text-slate-700 dark:text-slate-300">
                  <span className="font-bold block mb-1">Customer Claim:</span>
                  {disp.description}
                </div>

                {disp.evidenceNotes && (
                  <div className="text-[11px] text-slate-500">
                    <strong>Evidence Note:</strong> {disp.evidenceNotes}
                  </div>
                )}

                {disp.adminDecision && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300">
                    <strong>Administrative Ruling:</strong> {disp.adminDecision}
                  </div>
                )}

                {/* Resolve Box */}
                {disp.status !== 'resolved' && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <span className="font-bold block">Issue Platform Ruling:</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={disputeDecision}
                        onChange={(e) => setDisputeDecision(e.target.value)}
                        placeholder="Ruling note: e.g. Customer issued full $89.25 escrow refund due to unauthorized fee."
                        className="input-field py-1.5"
                      />
                      <button
                        onClick={() => handleResolveDispute(disp.id)}
                        className="btn-primary px-4 py-1.5 text-xs whitespace-nowrap"
                      >
                        Enforce Ruling
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Audit Log */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Platform Event Log (Tamper-Resistant Audit Trail)</span>
              <span>{auditLogs.length} events logged</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{log.action}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600 dark:text-slate-300">{log.adminName}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{log.details}</p>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
