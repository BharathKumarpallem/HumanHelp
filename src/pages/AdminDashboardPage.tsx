import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { VerificationEvidence, Dispute, AuditLogItem, ServiceCategory } from '../types';
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
  Info,
  Layers,
  Plus,
  Trash2,
  Tag,
  ToggleLeft,
  ToggleRight,
  Globe,
  PlusCircle,
  X
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user, role } = useAuth();

  const [metrics, setMetrics] = useState<any>(null);
  const [verificationQueue, setVerificationQueue] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'verifications' | 'disputes' | 'categories' | 'audit'>('verifications');

  // Review state
  const [reviewingEvidenceId, setReviewingEvidenceId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [badgeType, setBadgeType] = useState<any>('credentials_checked');

  // Dispute resolution state
  const [resolvingDisputeId, setResolvingDisputeId] = useState<string | null>(null);
  const [disputeDecision, setDisputeDecision] = useState('');
  const [disputeStatus, setDisputeStatus] = useState('resolved');

  // Category management state
  const [newSubcatInput, setNewSubcatInput] = useState<{ [catId: string]: string }>({});
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Wrench');
  const [newCatIsRegulated, setNewCatIsRegulated] = useState(false);
  const [newCatNotice, setNewCatNotice] = useState('');
  const [newCatSubcats, setNewCatSubcats] = useState('');

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [m, vQueue, dList, logs, cats] = await Promise.all([
        api.admin.getMetrics(),
        api.verifications.getQueue(),
        api.disputes.getAll(),
        api.admin.getAuditLogs(),
        api.categories.getAll(),
      ]);
      setMetrics(m);
      setVerificationQueue(vQueue);
      setDisputes(dList);
      setAuditLogs(logs);
      setCategories(cats);
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

  const handleToggleCategoryActive = async (cat: ServiceCategory) => {
    try {
      const newStatus = cat.isActive === false ? true : false;
      await api.categories.update(cat.id, { isActive: newStatus });
      await loadAdminData();
    } catch (err: any) {
      alert('Failed to toggle category: ' + err.message);
    }
  };

  const handleToggleCategoryRegulated = async (cat: ServiceCategory) => {
    try {
      const nextReg = !cat.isRegulated;
      await api.categories.update(cat.id, { 
        isRegulated: nextReg,
        requiresSpecialLicense: nextReg
      });
      await loadAdminData();
    } catch (err: any) {
      alert('Failed to update regulatory rule: ' + err.message);
    }
  };

  const handleAddSubcategory = async (catId: string) => {
    const text = (newSubcatInput[catId] || '').trim();
    if (!text) return;
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;
    if (cat.subcategories.includes(text)) {
      alert('Subcategory already exists.');
      return;
    }
    try {
      const updated = [...cat.subcategories, text];
      await api.categories.update(catId, { subcategories: updated });
      setNewSubcatInput({ ...newSubcatInput, [catId]: '' });
      await loadAdminData();
    } catch (err: any) {
      alert('Failed to add subcategory: ' + err.message);
    }
  };

  const handleRemoveSubcategory = async (catId: string, subcatToRemove: string) => {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return;
    try {
      const updated = cat.subcategories.filter(s => s !== subcatToRemove);
      await api.categories.update(catId, { subcategories: updated });
      await loadAdminData();
    } catch (err: any) {
      alert('Failed to remove subcategory: ' + err.message);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !newCatDesc.trim()) {
      alert('Name and description are required.');
      return;
    }
    try {
      const subcats = newCatSubcats.split(',').map(s => s.trim()).filter(Boolean);
      await api.categories.create({
        name: newCatName.trim(),
        description: newCatDesc.trim(),
        iconName: newCatIcon,
        isRegulated: newCatIsRegulated,
        requiresSpecialLicense: newCatIsRegulated,
        regulatoryNotice: newCatNotice.trim() || undefined,
        subcategories: subcats.length > 0 ? subcats : ['General Services'],
        allowedDeliveryModes: ['home_visit', 'in_person']
      });
      setShowAddCatModal(false);
      setNewCatName('');
      setNewCatDesc('');
      setNewCatNotice('');
      setNewCatSubcats('');
      await loadAdminData();
    } catch (err: any) {
      alert('Failed to create category: ' + err.message);
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
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'categories'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Service Categories & Rules ({categories.length})</span>
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

      {/* TAB 3: Categories & Regulatory Configuration */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-600" />
                Configurable Service Categories & Statutory Rules
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Enable or disable categories dynamically without code rebuilds. Configure subcategories, delivery modes, and regional licensing requirements.
              </p>
            </div>
            <button
              onClick={() => setShowAddCatModal(true)}
              className="btn-primary py-2 px-4 text-xs font-bold shrink-0 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Service Category</span>
            </button>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`p-6 rounded-3xl border transition-all space-y-4 ${
                  cat.isActive === false
                    ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {cat.name}
                      </h3>
                      {cat.isRegulated ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          Regulated
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          Standard
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {cat.description}
                    </p>
                  </div>

                  {/* Active Toggle */}
                  <button
                    onClick={() => handleToggleCategoryActive(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors shrink-0 ${
                      cat.isActive === false
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                        : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    {cat.isActive === false ? 'Disabled' : 'Active'}
                  </button>
                </div>

                {/* Regulatory Policy Notice */}
                {cat.regulatoryNotice && (
                  <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>Statutory Rule:</strong> {cat.regulatoryNotice}</span>
                  </div>
                )}

                {/* Delivery Modes Allowed */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Authorized Delivery Modes
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {(cat.allowedDeliveryModes || ['home_visit', 'in_person']).map((dm) => (
                      <span
                        key={dm}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                      >
                        {dm === 'home_visit' && '🏠 Home Visit'}
                        {dm === 'online_consultation' && '💻 Online / Telehealth'}
                        {dm === 'delivery' && '📦 Express Delivery'}
                        {dm === 'in_person' && '📍 In-Person Facility'}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Subcategories Management */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-brand-500" />
                      Subcategories ({cat.subcategories?.length || 0})
                    </span>
                    <button
                      onClick={() => handleToggleCategoryRegulated(cat)}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 underline"
                    >
                      {cat.isRegulated ? 'Set as Unregulated' : 'Require Statutory License'}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(cat.subcategories || []).map((sub) => (
                      <span
                        key={sub}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                      >
                        <span>{sub}</span>
                        <button
                          onClick={() => handleRemoveSubcategory(cat.id, sub)}
                          className="hover:text-rose-500 transition-colors"
                          title="Remove subcategory"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add Subcategory input */}
                  <div className="flex items-center gap-2 pt-1.5">
                    <input
                      type="text"
                      placeholder="Add subcategory (e.g. Smart Locks, Drain Camera)..."
                      value={newSubcatInput[cat.id] || ''}
                      onChange={(e) => setNewSubcatInput({ ...newSubcatInput, [cat.id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubcategory(cat.id);
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                    <button
                      onClick={() => handleAddSubcategory(cat.id)}
                      className="btn-secondary py-1.5 px-3 text-xs font-bold"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Category Modal */}
          {showAddCatModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-brand-600" />
                    Create New Service Category
                  </h3>
                  <button
                    onClick={() => setShowAddCatModal(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Energy & Solar Audits"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Residential solar evaluations, battery storage, and smart thermostat auditing."
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Subcategories (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="Solar inspections, Battery backup, Inverter repair, Energy auditing"
                      value={newCatSubcats}
                      onChange={(e) => setNewCatSubcats(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <input
                      type="checkbox"
                      id="isRegulatedCheckbox"
                      checked={newCatIsRegulated}
                      onChange={(e) => setNewCatIsRegulated(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-600 cursor-pointer"
                    />
                    <label htmlFor="isRegulatedCheckbox" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                      Regulated Category (requires statutory professional license validation)
                    </label>
                  </div>

                  {newCatIsRegulated && (
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Regulatory Compliance Notice
                      </label>
                      <input
                        type="text"
                        placeholder="All providers must possess active state NABCEP solar or electrical certification."
                        value={newCatNotice}
                        onChange={(e) => setNewCatNotice(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAddCatModal(false)}
                      className="btn-secondary py-2 px-4"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary py-2 px-5 font-bold"
                    >
                      Create Category
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Audit Log */}
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
