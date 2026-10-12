import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PersonaSwitcher } from './PersonaSwitcher';
import { 
  ShieldCheck, 
  Search, 
  Calendar, 
  MessageSquare, 
  ShieldAlert, 
  Sparkles, 
  LayoutDashboard, 
  Sun, 
  Moon, 
  Menu, 
  X,
  Bell,
  CheckCircle2
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { role, theme, toggleTheme, user, notifications, unreadNotifsCount, markNotificationRead } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { label: 'Explore Services', path: '/explore', icon: Search },
    { label: 'My Bookings', path: '/bookings', icon: Calendar },
    { label: 'Messages', path: '/messages', icon: MessageSquare },
    { label: 'AI Matcher', path: '/ai-assistant', icon: Sparkles, badge: 'Smart' },
    { label: 'Safety & Trust', path: '/safety', icon: ShieldAlert },
  ];

  const getDashboardLink = () => {
    if (role === 'admin') return { label: 'Admin Desk', path: '/admin' };
    if (role === 'provider') return { label: 'Provider Hub', path: '/provider/dashboard' };
    return { label: 'My Dashboard', path: '/dashboard' };
  };

  const dashboardLink = getDashboardLink();

  return (
    <header className="sticky top-0 z-40 w-full glass-header transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white leading-none">
                  Human<span className="text-brand-600 dark:text-brand-400">Help</span>
                </span>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                  Verified Services
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 ml-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                      active
                        ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 opacity-75" />
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Persona Switcher for easy testing */}
            <div className="hidden sm:block">
              <PersonaSwitcher />
            </div>

            {/* Role-specific Dashboard shortcut */}
            <Link
              to={dashboardLink.path}
              className={`hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive(dashboardLink.path)
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 hover:bg-brand-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{dashboardLink.label}</span>
            </Link>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Notifications</span>
                    <span className="text-[11px] text-slate-400">{notifications.length} total</span>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center">No notifications yet.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                            n.isRead ? 'bg-transparent text-slate-500' : 'bg-brand-50/60 dark:bg-brand-950/30 text-slate-800 dark:text-slate-200 font-medium'
                          }`}
                        >
                          <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                            <span>{n.title}</span>
                            {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-slate-400 block mt-1">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200 dark:border-slate-800 space-y-2 animate-in slide-in-from-top-2">
            <div className="mb-3 px-2">
              <PersonaSwitcher />
            </div>

            <Link
              to={dashboardLink.path}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{dashboardLink.label}</span>
            </Link>

            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
