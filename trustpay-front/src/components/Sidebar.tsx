import React, { useState } from 'react';
import {
  ShieldCheck,
  Send,
  LayoutDashboard,
  Bell,
  Cpu,
  User as UserIcon,
  ChevronDown,
  Globe,
  CheckCircle2,
  ExternalLink,
  X,
  PhoneCall,
  Menu,
  Sparkles,
  Shield,
  Activity,
  LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    currentUser,
    users,
    handleSelectUser,
    currentScreen,
    setCurrentScreen,
    notifications,
    backendUrl,
    isLiveApi,
    updateBackendUrl,
  } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tempUrl, setTempUrl] = useState(backendUrl);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSaveBackendUrl = async () => {
    setIsTesting(true);
    setTestStatus('Testing endpoint connection...');
    const result = await updateBackendUrl(tempUrl);
    setTestStatus(result.message);
    setIsTesting(false);
    if (result.ok) {
      setTimeout(() => setShowConfigModal(false), 1200);
    }
  };

  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: LayoutDashboard,
      color: 'text-blue-400',
    },
    {
      id: 'send' as const,
      label: 'Send Money',
      icon: Send,
      color: 'text-emerald-400',
    },
    {
      id: 'notifications' as const,
      label: 'Notifications',
      icon: Bell,
      color: 'text-amber-400',
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      id: 'demo_panel' as const,
      label: 'Demo Scenarios',
      icon: Cpu,
      color: 'text-indigo-400',
      pulse: true,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4 sm:p-5 text-white">
      {/* Top section: Brand & Navigation */}
      <div className="space-y-6">
        {/* Brand Logo & Badges */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setCurrentScreen('dashboard');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 group text-left cursor-pointer"
          >
            <div className="w-10 h-10 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center group-hover:border-blue-500 transition-colors shadow-sm shrink-0">
              <div className="w-5 h-5 border-2 border-white rounded-xs rotate-45 flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-sans">
                  TrustPay
                </span>
                <span className="px-1.5 py-0.5 bg-slate-800 text-[10px] font-bold uppercase tracking-widest rounded-md text-slate-300 border border-slate-700">
                  Build
                </span>
              </div>
              <p className="text-[10px] text-blue-400 font-mono font-semibold tracking-wider uppercase">
                Layer 7 Fraud Shield
              </p>
            </div>
          </button>

          {/* Close button for mobile drawer */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Main Menu
          </p>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentScreen(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${item.color} ${item.pulse ? 'animate-pulse' : ''}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
                {item.pulse && !item.badge && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                    Pitch
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bento Widget 1: Single Designated Trusted Contact */}
        {currentUser?.trustedContact && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <PhoneCall className="w-3 h-3 text-blue-400" />
                Trusted Contact (1 Only)
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Active Protection" />
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">
                {currentUser.trustedContact.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">
                  {currentUser.trustedContact.name}
                </p>
                <p className="text-[10px] text-slate-400">
                  {currentUser.trustedContact.relationship || 'Emergency'} • {currentUser.trustedContact.phone}
                </p>
              </div>
            </div>

            <div className="pt-1.5 border-t border-slate-800/80">
              <p className="text-[9px] text-emerald-400 font-medium">
                ✓ Auto-alerted on high-risk transfers
              </p>
            </div>
          </div>
        )}

        {/* Bento Widget 2: Security Posture & API Connection Status */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Security Posture
            </span>
            <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Resilient
            </span>
          </div>

          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isLiveApi ? 'bg-emerald-400' : 'bg-blue-400'}`} />
              <span className="text-[11px] text-slate-300">{isLiveApi ? 'Live API' : 'Demo API'}</span>
            </div>
            <button
              onClick={() => {
                setTempUrl(backendUrl);
                setShowConfigModal(true);
              }}
              className="text-[10px] font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
            >
              Config →
            </button>
          </div>
        </div>
      </div>

      {/* Bottom section: Active User Profile & Switcher */}
      <div className="pt-4 border-t border-slate-800">
        <div className="relative">
          {currentUser ? (
            <div>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-[#0F172A] font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                    {currentUser.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate leading-tight">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-emerald-400 font-mono leading-tight mt-0.5">
                      ₹{currentUser.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
              </button>

              {/* User switcher popup */}
              {showUserDropdown && (
                <div className="absolute bottom-full left-0 mb-2 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50">
                  <div className="px-2.5 py-1.5 border-b border-slate-800 mb-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Switch Demo User
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Each user has 1 trusted contact
                    </p>
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {users.map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          handleSelectUser(u);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors cursor-pointer ${
                          currentUser?.id === u.id
                            ? 'bg-blue-600/20 text-white border border-blue-500/30'
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-700 shrink-0">
                            <img
                              src={u.avatarUrl}
                              alt={u.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-semibold text-white truncate">{u.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">
                              Contact: {u.trustedContact.name}
                            </p>
                          </div>
                        </div>
                        {currentUser?.id === u.id && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-slate-800 mt-1.5 pt-1.5">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        setCurrentScreen('login');
                      }}
                      className="w-full text-center py-1 text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                    >
                      + Register New User
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setCurrentScreen('login')}
              className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer text-center"
            >
              Select User Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden bg-[#0F172A] border-b border-slate-800 px-4 py-3 text-white flex items-center justify-between sticky top-0 z-40">
        <button
          onClick={() => setCurrentScreen('dashboard')}
          className="flex items-center gap-2.5"
        >
          <div className="w-8 h-8 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rounded-xs rotate-45 flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full" />
            </div>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">TrustPay</span>
          <span className="px-1.5 py-0.5 bg-slate-800 text-[9px] font-bold uppercase rounded text-slate-300 border border-slate-700">
            Build
          </span>
        </button>

        <div className="flex items-center gap-2">
          {currentUser && (
            <span className="text-xs font-bold text-emerald-400 font-mono">
              ₹{currentUser.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          )}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Desktop Persistent Left Sidebar (260px width) */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-[#0F172A] border-r border-slate-800 shrink-0 sticky top-0 h-screen overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide out from left) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-[#0F172A] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Backend API Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setShowConfigModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">External REST API Settings</h3>
                <p className="text-xs text-slate-400">Configure your deployed Manus backend endpoint</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Backend API Base URL
                </label>
                <input
                  type="text"
                  value={tempUrl}
                  onChange={e => setTempUrl(e.target.value)}
                  placeholder="https://your-deployed-manus-backend.com"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 font-mono"
                />
                <p className="text-xs text-slate-400 mt-1.5">
                  Every request uses client-side <code className="text-blue-300">fetch()</code> to this endpoint (e.g. <code className="text-blue-300">/api/transactions</code>, <code className="text-blue-300">/api/users</code>).
                </p>
              </div>

              {testStatus && (
                <div
                  className={`p-3 rounded-lg text-xs font-medium border ${
                    testStatus.toLowerCase().includes('connected') || testStatus.toLowerCase().includes('switched')
                      ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                      : 'bg-amber-950/50 border-amber-500/40 text-amber-300'
                  }`}
                >
                  {testStatus}
                </div>
              )}

              <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 text-xs text-slate-300 space-y-1">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Resilient Fallback Mode Active
                </p>
                <p className="text-slate-400">
                  If the endpoint is empty, offline, or returns CORS/404 errors during a live pitch, TrustPay seamlessly falls back to high-fidelity deterministic responses so judges never see an empty screen.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setTempUrl('');
                    updateBackendUrl('');
                    setShowConfigModal(false);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
                >
                  Reset to Local Simulation
                </button>
                <button
                  onClick={handleSaveBackendUrl}
                  disabled={isTesting}
                  className="px-5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isTesting ? 'Connecting...' : 'Save & Connect'}
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
