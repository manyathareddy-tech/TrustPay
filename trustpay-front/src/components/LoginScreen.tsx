import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  UserPlus,
  PhoneCall,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { User } from '../types';

export const LoginScreen: React.FC = () => {
  const { users, handleSelectUser, handleCreateUser, isLoading, error } = useApp();
  const [activeTab, setActiveTab] = useState<'pick' | 'create'>('pick');

  // New profile form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [trustedName, setTrustedName] = useState('');
  const [trustedPhone, setTrustedPhone] = useState('');
  const [relationship, setRelationship] = useState('Family Member');

  const onSubmitNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !trustedName.trim() || !trustedPhone.trim()) return;
    handleCreateUser({
      name: newName.trim(),
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '')}@banking.com`,
      trustedContactName: trustedName.trim(),
      trustedContactPhone: trustedPhone.trim(),
      relationship,
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAFC] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full mx-auto">
        {/* Header Branding with Bento Mark */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-14 h-14 rounded-2xl bg-[#0F172A] border border-slate-700 text-white flex items-center justify-center mx-auto shadow-lg mb-3"
          >
            <div className="w-6 h-6 border-2 border-white rounded-xs rotate-45 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
          </motion.div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
              TrustPay
            </h1>
            <span className="px-2 py-0.5 bg-slate-200 text-[10px] font-bold uppercase tracking-widest rounded-md text-slate-600">
              Build Mode
            </span>
          </div>
          <p className="text-sm font-medium text-slate-600 mt-1">
            Continuous Adaptive Fraud Prevention Layer
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1.5">
            Select a verified demo profile or create an account with a designated trusted contact.
          </p>
        </div>

        {/* Bento Card Container */}
        <div className="bg-white rounded-[2rem] shadow-xs border border-slate-200 overflow-hidden">
          {/* Tab Bar */}
          <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50/70 p-2 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('pick')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-full transition-all cursor-pointer ${
                activeTab === 'pick'
                  ? 'bg-[#0F172A] text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4 text-blue-400" />
              <span>Select Demo Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-full transition-all cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-[#0F172A] text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-4 h-4 text-indigo-400" />
              <span>Register New User</span>
            </button>
          </div>

          <div className="p-6 sm:p-7">
            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {error}
              </div>
            )}

            {activeTab === 'pick' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1 mb-1">
                  <span>Pre-configured Demo Accounts</span>
                  <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Ready for Live Judging
                  </span>
                </div>

                {users.map((user: User) => (
                  <motion.div
                    key={user.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSelectUser(user)}
                    className="group p-4 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-slate-50/50 transition-all cursor-pointer bg-white shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                              {user.name}
                            </h3>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                              Score: {user.averageTrustScore}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">
                            {user.accountNumber} • Balance: ₹{user.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="hidden sm:block text-right">
                          <p className="text-[11px] font-semibold text-slate-700 flex items-center gap-1 justify-end">
                            <PhoneCall className="w-3 h-3 text-emerald-600" />
                            {user.trustedContact.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Trusted Contact (1 Only • {user.trustedContact.relationship || 'Emergency'})
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-[#0F172A] group-hover:text-white text-slate-400 flex items-center justify-center transition-colors">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <form onSubmit={onSubmitNewUser} className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    User Credentials
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Legal Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="e.g. Rahul Verma"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Account Email
                      </label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={e => setNewEmail(e.target.value)}
                        placeholder="e.g. rahul.verma@banking.in"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                      Designated Trusted Contact (1 Only)
                    </h4>
                    <span className="text-[11px] text-slate-600 font-medium">Alerted on High Risk</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        required
                        value={trustedName}
                        onChange={e => setTrustedName(e.target.value)}
                        placeholder="e.g. Sneha Verma"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={trustedPhone}
                        onChange={e => setTrustedPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Relationship
                      </label>
                      <select
                        value={relationship}
                        onChange={e => setRelationship(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-blue-500"
                      >
                        <option value="Family Member">Family Member</option>
                        <option value="Spouse / Partner">Spouse / Partner</option>
                        <option value="Adult Child">Adult Child</option>
                        <option value="Designated Attorney / Advisor">Designated Advisor</option>
                        <option value="Close Friend">Close Friend</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-blue-900 flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    Your designated trusted contact will receive automated SMS / push alerts only when high-risk or emergency anomalies (e.g. unauthorized remote desktop sessions) are detected.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 bg-[#0F172A] hover:bg-slate-800 text-white rounded-full text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Creating User via API...' : 'Enter Banking App with Trust Shield'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* Footer Security Badges */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Dynamic 0–100 Trust Scoring
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              Layer 7 Behavioral Telemetry
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              Real-time Trusted Contact Alerts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
