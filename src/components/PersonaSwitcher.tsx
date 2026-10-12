import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Users, Check, Shield, Briefcase, UserCheck, ChevronDown } from 'lucide-react';

export const PersonaSwitcher: React.FC = () => {
  const { user, switchPersona, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const personas: Array<{
    role: UserRole;
    name: string;
    title: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    {
      role: 'customer',
      name: 'Alex Rivera',
      title: 'City Resident & Customer',
      icon: <Users className="w-4 h-4 text-emerald-600" />,
      color: 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20',
    },
    {
      role: 'provider',
      name: 'Elena Chen',
      title: 'Licensed Master Electrician',
      icon: <Briefcase className="w-4 h-4 text-cyan-600" />,
      color: 'border-cyan-500/30 bg-cyan-50/50 dark:bg-cyan-950/20',
    },
    {
      role: 'admin',
      name: 'Marcus Vance',
      title: 'Trust & Compliance Director',
      icon: <Shield className="w-4 h-4 text-indigo-600" />,
      color: 'border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/20',
    },
  ];

  const currentRole = user?.role || 'customer';

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-2xs"
        title="Switch Demo Role"
      >
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-slate-500 dark:text-slate-400">Demo Persona:</span>
        <span className="font-semibold text-slate-900 dark:text-slate-100">{user?.fullName || 'Alex Rivera'}</span>
        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          {currentRole}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
          <div className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1">
            <strong>Switch Perspective (Demo Mode)</strong>
            <p className="text-[11px] text-slate-400 mt-0.5">Test booking, provider management, and admin compliance in real time.</p>
          </div>

          <div className="space-y-1">
            {personas.map(p => {
              const isActive = currentRole === p.role;
              return (
                <button
                  key={p.role}
                  onClick={() => {
                    switchPersona(p.role);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all ${
                    isActive 
                      ? 'bg-slate-100 dark:bg-slate-800 font-semibold text-slate-900 dark:text-slate-100' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-white dark:bg-slate-950 shadow-2xs border border-slate-100 dark:border-slate-800">
                      {p.icon}
                    </div>
                    <div>
                      <div className="text-slate-900 dark:text-slate-100 font-medium">{p.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{p.title}</div>
                    </div>
                  </div>
                  {isActive && <Check className="w-4 h-4 text-brand-600 dark:text-brand-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
