import React, { useState } from 'react';
import { ShieldCheck, Award, UserCheck, Clock, AlertCircle, Info } from 'lucide-react';
import { VerificationStatus } from '../types';

interface VerificationBadgeProps {
  status: VerificationStatus;
  label?: string;
  details?: string;
  showExplanation?: boolean;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status,
  label,
  details,
  showExplanation = true
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getBadgeConfig = () => {
    switch (status) {
      case 'credentials_checked':
        return {
          icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
          classes: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
          defaultLabel: 'Credentials Checked',
          title: 'Official Trade License or Certification Validated',
          description: 'Our compliance staff inspected and verified state or board credentials, registration numbers, and public licensing registries.',
          disclaimer: 'Verification confirms regulatory credential validity at the time of review. Customers should still verify scope of work.'
        };
      case 'category_verified':
        return {
          icon: <Award className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />,
          classes: 'bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800',
          defaultLabel: 'Category Verified',
          title: 'Specialized Category Standards Passed',
          description: 'Specialized background or skill assessments required for regulated services (such as elder assistance or skilled trades) have been verified.',
          disclaimer: 'Confirms category compliance. HumanHelp does not guarantee individual service outcomes.'
        };
      case 'identity_checked':
        return {
          icon: <UserCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />,
          classes: 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
          defaultLabel: 'Identity Checked',
          title: 'Government Identity Confirmed',
          description: 'The provider has submitted government-issued identification verified against public identification standards.',
          disclaimer: 'Identity verification does not certify specialized trade licensing for this particular category.'
        };
      case 'verification_pending':
        return {
          icon: <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
          classes: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
          defaultLabel: 'Verification Pending Review',
          title: 'Documents Under Administrative Review',
          description: 'Credentials or identity files have been submitted and are currently in the human verification queue.',
          disclaimer: 'This provider is not yet approved as verified. Proceed with normal personal discretion.'
        };
      default:
        return {
          icon: <AlertCircle className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />,
          classes: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
          defaultLabel: 'Not Verified',
          title: 'Standard Unverified Listing',
          description: 'This provider has not submitted verified documentation or credentials.',
          disclaimer: 'We encourage hiring verified providers for safety-critical residential or technical tasks.'
        };
    }
  };

  const config = getBadgeConfig();
  const displayLabel = label || config.defaultLabel;

  return (
    <div className="relative inline-block">
      <div 
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border cursor-help transition-all hover:shadow-xs ${config.classes}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
      >
        {config.icon}
        <span>{displayLabel}</span>
        {showExplanation && <Info className="w-3 h-3 opacity-60 hover:opacity-100 ml-0.5" />}
      </div>

      {showExplanation && showTooltip && (
        <div className="absolute z-50 left-0 top-full mt-2 w-72 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl text-left text-xs text-slate-700 dark:text-slate-300 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
            {config.icon}
            {config.title}
          </div>
          <p className="mb-2 leading-relaxed text-slate-600 dark:text-slate-400">
            {details || config.description}
          </p>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-500 leading-tight">
            <strong>Platform Note:</strong> {config.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
};
