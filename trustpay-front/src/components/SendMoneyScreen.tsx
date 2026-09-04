import React, { useState } from 'react';
import {
  Send,
  ShieldAlert,
  Smartphone,
  Moon,
  UserPlus,
  Zap,
  Globe,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Info,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { TransactionSignals } from '../types';

export const SendMoneyScreen: React.FC = () => {
  const { currentUser, balance, handleInitiateTransaction, isLoading, setCurrentScreen } = useApp();

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  // Demo Controls: Device & Context Signals
  const [signals, setSignals] = useState<TransactionSignals>({
    screenSharingActive: false,
    unusualTimeOfDay: false,
    newRecipient: true,
    highVelocity: false,
    geoAnomaly: false,
    rapidAmountEscalation: false,
  });

  const toggleSignal = (key: keyof TransactionSignals) => {
    setSignals(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleQuickAmount = (val: number) => {
    setAmount(val.toString());
  };

  const handlePresetFill = (type: 'legit' | 'scam' | 'late') => {
    if (type === 'legit') {
      setRecipient('Apex Heights Residency Society');
      setAmount('18500');
      setNote('Monthly Maintenance & Rent');
      setSignals({
        screenSharingActive: false,
        unusualTimeOfDay: false,
        newRecipient: false,
        highVelocity: false,
        geoAnomaly: false,
        rapidAmountEscalation: false,
      });
    } else if (type === 'scam') {
      setRecipient('Global Cyber Security Solutions Mumbai');
      setAmount('48500');
      setNote('Urgent Device Security Fee');
      setSignals({
        screenSharingActive: true,
        unusualTimeOfDay: true,
        newRecipient: true,
        highVelocity: true,
        geoAnomaly: true,
        rapidAmountEscalation: true,
      });
    } else if (type === 'late') {
      setRecipient('Kavita Verma (Instant Crypto Exchange)');
      setAmount('9200');
      setNote('Immediate IMPS Transfer');
      setSignals({
        screenSharingActive: true,
        unusualTimeOfDay: true,
        newRecipient: true,
        highVelocity: false,
        geoAnomaly: false,
        rapidAmountEscalation: false,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!recipient.trim() || isNaN(numericAmount) || numericAmount <= 0) return;

    await handleInitiateTransaction({
      recipient: recipient.trim(),
      amount: numericAmount,
      note: note.trim() || 'Wire Transfer',
      signals,
    });
  };

  const activeSignalsCount = Object.values(signals).filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Send Money
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            TrustPay automatically intercepts this transaction to calculate continuous trust
          </p>
        </div>

        {/* Quick Demo Pre-fill Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1">
            Quick Fill:
          </span>
          <button
            type="button"
            onClick={() => handlePresetFill('legit')}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            Safe Transfer
          </button>
          <button
            type="button"
            onClick={() => handlePresetFill('late')}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
          >
            Suspicious Late-Night
          </button>
          <button
            type="button"
            onClick={() => handlePresetFill('scam')}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            Simran's Scam (Emergency)
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Payment Inputs Bento Card */}
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-xs border border-slate-200 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Recipient */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Recipient Name, UPI ID or Account
              </label>
              <input
                type="text"
                required
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                placeholder="e.g. Kavita Verma, rahul@okaxis, Landlord Society"
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-hidden focus:border-blue-500 font-medium"
              />
            </div>

            {/* Transfer Amount */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Amount (₹ INR)
                </label>
                <span className="text-xs text-slate-500 font-medium">
                  Balance: ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-3 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-hidden focus:border-blue-500 font-bold text-slate-900"
                />
              </div>

              {/* Quick Amount Pills */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {[500, 2500, 10000, 18500, 48500].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickAmount(val)}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    ₹{val.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reference / Note */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Payment Reference or Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. Invoice #29381, Rent for September"
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>

        {/* Demo Controls Section (Bento Dark #0F172A Card) */}
        <div className="bg-[#0F172A] text-white rounded-[2rem] p-6 sm:p-8 shadow-xl border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Demo Controls — Simulated Device & Context Signals
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Toggle signals to simulate real-world device telemetry for the live pitch.
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-medium text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{activeSignalsCount} active threat indicators</span>
            </div>
          </div>

          {/* Signals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-5">
            {/* 1. Screen sharing */}
            <div
              onClick={() => toggleSignal('screenSharingActive')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                signals.screenSharingActive
                  ? 'bg-rose-950/40 border-rose-500/60 text-white'
                  : 'bg-slate-800/60 border-slate-700 hover:border-slate-600 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl ${signals.screenSharingActive ? 'bg-rose-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                  <Smartphone className="w-4 h-4" />
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  signals.screenSharingActive ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-400'
                }`}>
                  {signals.screenSharingActive ? 'Active' : 'Off'}
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold">Screen-sharing app active</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">AnyDesk, TeamViewer, Zoom screen mirroring</p>
              </div>
            </div>

            {/* 2. Unusual time */}
            <div
              onClick={() => toggleSignal('unusualTimeOfDay')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                signals.unusualTimeOfDay
                  ? 'bg-amber-950/40 border-amber-500/60 text-white'
                  : 'bg-slate-800/60 border-slate-700 hover:border-slate-600 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl ${signals.unusualTimeOfDay ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-300'}`}>
                  <Moon className="w-4 h-4" />
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  signals.unusualTimeOfDay ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-400'
                }`}>
                  {signals.unusualTimeOfDay ? 'Active' : 'Off'}
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold">Unusual time of day</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Late-night (02:00 AM – 05:00 AM window)</p>
              </div>
            </div>

            {/* 3. New Recipient */}
            <div
              onClick={() => toggleSignal('newRecipient')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                signals.newRecipient
                  ? 'bg-blue-950/40 border-blue-500/60 text-white'
                  : 'bg-slate-800/60 border-slate-700 hover:border-slate-600 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl ${signals.newRecipient ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                  <UserPlus className="w-4 h-4" />
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  signals.newRecipient ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'
                }`}>
                  {signals.newRecipient ? 'New' : 'Known'}
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold">First-time recipient</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Account has zero prior transaction record</p>
              </div>
            </div>

            {/* 4. High Velocity */}
            <div
              onClick={() => toggleSignal('highVelocity')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                signals.highVelocity
                  ? 'bg-amber-950/40 border-amber-500/60 text-white'
                  : 'bg-slate-800/60 border-slate-700 hover:border-slate-600 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl ${signals.highVelocity ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-300'}`}>
                  <Zap className="w-4 h-4" />
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  signals.highVelocity ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-400'
                }`}>
                  {signals.highVelocity ? 'Active' : 'Off'}
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold">High transaction velocity</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Multiple consecutive payments in under 10m</p>
              </div>
            </div>

            {/* 5. Geographic Anomaly */}
            <div
              onClick={() => toggleSignal('geoAnomaly')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                signals.geoAnomaly
                  ? 'bg-indigo-950/40 border-indigo-500/60 text-white'
                  : 'bg-slate-800/60 border-slate-700 hover:border-slate-600 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl ${signals.geoAnomaly ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                  <Globe className="w-4 h-4" />
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  signals.geoAnomaly ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'
                }`}>
                  {signals.geoAnomaly ? 'Active' : 'Off'}
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold">Geographic anomaly / VPN</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Foreign IP routing deviation from resident device</p>
              </div>
            </div>

            {/* 6. Rapid Escalation */}
            <div
              onClick={() => toggleSignal('rapidAmountEscalation')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                signals.rapidAmountEscalation
                  ? 'bg-rose-950/40 border-rose-500/60 text-white'
                  : 'bg-slate-800/60 border-slate-700 hover:border-slate-600 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl ${signals.rapidAmountEscalation ? 'bg-rose-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  signals.rapidAmountEscalation ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-400'
                }`}>
                  {signals.rapidAmountEscalation ? 'Active' : 'Off'}
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold">Rapid amount escalation</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Amount spike &gt; 3x user 30-day baseline</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => setCurrentScreen('dashboard')}
            className="px-6 py-3 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel & Return to Dashboard
          </button>

          <button
            type="submit"
            disabled={isLoading || !recipient.trim() || !amount}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-full shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Evaluating Trust via Layer 7...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Evaluate Trust & Submit Transfer
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
