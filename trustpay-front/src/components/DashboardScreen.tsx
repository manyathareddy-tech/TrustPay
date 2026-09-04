import React, { useState } from 'react';
import {
  Send,
  ArrowUpRight,
  ShieldCheck,
  PhoneCall,
  Clock,
  Sparkles,
  AlertTriangle,
  RotateCw,
  Cpu,
  Plus,
  ArrowRight,
  Shield,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { TrustScoreGauge } from './TrustScoreGauge';
import { RiskBadge } from './RiskBadge';
import { getRiskBandForScore } from '../utils/colors';
import { Transaction } from '../types';

export const DashboardScreen: React.FC = () => {
  const {
    currentUser,
    balance,
    history,
    setCurrentScreen,
    refreshHistory,
    isLoading,
    setActiveTransaction,
    handleRunScenario,
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'flagged' | 'trusted'>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  if (!currentUser) return null;

  const avgScore = currentUser.averageTrustScore || 84;
  const avgRiskBand = getRiskBandForScore(avgScore);

  const filteredHistory = history.filter(tx => {
    if (filter === 'flagged') {
      return tx.riskBand === 'emergency' || tx.riskBand === 'suspicious' || tx.riskBand === 'review_pending';
    }
    if (filter === 'trusted') {
      return tx.riskBand === 'trusted' || tx.riskBand === 'slightly_suspicious';
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Bento Grid: 12-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0">
        
        {/* LEFT COLUMN (8 cols): Available Balance Bento Card + Transaction History Bento Card */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          
          {/* BENTO CARD 1: Available Balance Hero (Deep Navy #0F172A) */}
          <div className="bg-[#0F172A] text-white p-6 sm:p-8 rounded-[2rem] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between relative overflow-hidden border border-slate-800">
            {/* Content Left */}
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-slate-400 text-sm font-medium">Available Balance</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-[11px] font-mono text-slate-400">{currentUser.accountNumber}</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter text-white">
                ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => setCurrentScreen('send')}
                  className="px-6 py-3 bg-white text-[#0F172A] rounded-full font-bold text-sm hover:bg-slate-100 transition-colors shadow-sm cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Money</span>
                </button>
                <button
                  onClick={() => setCurrentScreen('notifications')}
                  className="px-6 py-3 bg-slate-800 text-white rounded-full font-bold text-sm border border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Alerts Feed</span>
                </button>
              </div>
            </div>

            {/* Content Right: Active Security Layer & Designated Contact */}
            <div className="relative z-10 text-left sm:text-right mt-6 sm:mt-0 space-y-3">
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">
                  Active Security Layer
                </p>
                <div className="bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl inline-flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-mono text-xs font-semibold tracking-wide">
                    PROTECTED BY LAYER-7
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 px-3.5 py-2 rounded-xl text-left sm:text-right">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Designated Contact
                </p>
                <p className="text-xs font-semibold text-slate-200 flex items-center sm:justify-end gap-1.5 mt-0.5">
                  <PhoneCall className="w-3 h-3 text-blue-400" />
                  <span>{currentUser.trustedContact.name} ({currentUser.trustedContact.relationship || 'Emergency'})</span>
                </p>
              </div>
            </div>

            {/* Subtle background ambient blur orb */}
            <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] pointer-events-none" />
          </div>

          {/* BENTO CARD 2: Transaction History (Clean White rounded-[2rem] with sub-cards) */}
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 sm:p-7 shadow-xs flex-1 flex flex-col min-h-0">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-bold text-lg text-slate-900 tracking-tight">
                    Transaction History
                  </h3>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-full">
                    {filteredHistory.length} total
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Evaluated in real time by continuous Layer 7 behavioral engine
                </p>
              </div>

              {/* Filter Tabs & Refresh */}
              <div className="flex items-center gap-2">
                <div className="inline-flex bg-slate-100 rounded-xl p-1 text-xs font-semibold text-slate-600">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      filter === 'all' ? 'bg-white text-[#0F172A] shadow-xs font-bold' : 'hover:text-slate-900'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('flagged')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                      filter === 'flagged' ? 'bg-white text-rose-700 shadow-xs font-bold' : 'hover:text-slate-900'
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3 text-rose-500" />
                    <span>Held / Warned</span>
                  </button>
                  <button
                    onClick={() => setFilter('trusted')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      filter === 'trusted' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'hover:text-slate-900'
                    }`}
                  >
                    Cleared
                  </button>
                </div>

                <button
                  onClick={refreshHistory}
                  disabled={isLoading}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors cursor-pointer"
                  title="Refresh transactions"
                >
                  <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-2.5 overflow-hidden">
              {filteredHistory.length === 0 ? (
                <div className="p-12 text-center">
                  <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No transactions match this filter</p>
                  <p className="text-xs text-slate-400 mt-1">Select 'All' to view complete transaction logs</p>
                </div>
              ) : (
                filteredHistory.map((tx: Transaction) => {
                  const initial = tx.recipient ? tx.recipient.charAt(0).toUpperCase() : 'T';
                  const isBlocked = tx.status === 'blocked';
                  const isCancelled = tx.status === 'cancelled';

                  return (
                    <motion.div
                      key={tx.id}
                      whileHover={{ scale: 1.005 }}
                      onClick={() => setSelectedTx(selectedTx?.id === tx.id ? null : tx)}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-300 transition-all cursor-pointer flex flex-col gap-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          {/* Circular Monogram / Status Avatar */}
                          <div
                            className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-sm shrink-0 ${
                              isBlocked
                                ? 'bg-rose-100 text-rose-700 border-rose-200'
                                : isCancelled
                                ? 'bg-amber-100 text-amber-700 border-amber-200'
                                : 'bg-white text-slate-800 border-slate-200 shadow-xs'
                            }`}
                          >
                            {isBlocked ? <AlertTriangle className="w-4 h-4 text-rose-600" /> : initial}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm text-slate-900">{tx.recipient}</p>
                              {isBlocked && (
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full">
                                  HELD
                                </span>
                              )}
                              {isCancelled && (
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                                  CANCELLED
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {tx.note || 'Payment'} • {tx.timestamp}
                            </p>
                          </div>
                        </div>

                        {/* Amount & Trust Score Pill */}
                        <div className="text-right flex flex-col items-end gap-1">
                          <p
                            className={`font-bold text-sm font-mono ${
                              isBlocked ? 'text-rose-600 line-through' : 'text-slate-900'
                            }`}
                          >
                            -₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <RiskBadge riskBand={tx.riskBand} score={tx.trustScore} size="sm" />
                        </div>
                      </div>

                      {/* Expanded Details Drawer */}
                      {selectedTx?.id === tx.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="pt-3 border-t border-slate-200/80 text-xs text-slate-600 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-700">Adaptive Screen Variant:</span>
                            <span className="font-mono uppercase font-bold text-blue-600">
                              {tx.interface}
                            </span>
                          </div>

                          {tx.naturalLanguageSummary && (
                            <div className="bg-white p-3 rounded-xl border border-slate-200 text-slate-700">
                              <span className="font-semibold block mb-0.5 text-slate-900">
                                AI Risk Analysis:
                              </span>
                              {tx.naturalLanguageSummary}
                            </div>
                          )}

                          {tx.layer7Warnings && tx.layer7Warnings.length > 0 && (
                            <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-200 text-rose-900 space-y-1">
                              <span className="font-semibold block">
                                Triggered Security Signals:
                              </span>
                              <ul className="list-disc pl-4 space-y-0.5">
                                {tx.layer7Warnings.map((w, idx) => (
                                  <li key={idx}>{w}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="flex justify-end pt-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTransaction(tx);
                                setCurrentScreen('confirmation');
                              }}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                            >
                              Re-inspect Adaptive Confirmation Screen <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (4 cols): Real-Time Trust Analysis Bento Card + Judge Demo Control Bento Card */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          
          {/* BENTO CARD 3: Real-Time Trust Analysis (White rounded-[2rem] with 2x2 grid stats) */}
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-xs flex flex-col items-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">
              Real-Time Trust Analysis
            </p>

            {/* Central Circular Gauge */}
            <div className="mb-5 flex justify-center">
              <TrustScoreGauge
                score={avgScore}
                riskBand={avgRiskBand}
                size="hero"
                showLabel={true}
                subtitle="Healthy Behavioral Baseline"
              />
            </div>

            {/* 2x2 Context Grid */}
            <div className="w-full grid grid-cols-2 gap-2.5 mb-3">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[9px] text-slate-400 font-bold uppercase">Device Context</p>
                <p className="text-xs font-bold text-emerald-600 mt-0.5">Authenticated</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[9px] text-slate-400 font-bold uppercase">Network IP</p>
                <p className="text-xs font-bold text-emerald-600 mt-0.5">Home Mesh</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[9px] text-slate-400 font-bold uppercase">Trusted Contact</p>
                <p className="text-xs font-bold text-blue-600 mt-0.5">Active Ready</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[9px] text-slate-400 font-bold uppercase">Active Hours</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">7:00AM – 11:30PM</p>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 italic text-center">
              Audited in real time via Layer 7 client telemetry
            </p>
          </div>

          {/* BENTO CARD 4: Judge Demo Control (Dark #0A0F1D Bento Card with Scenario Buttons & Gateway Status) */}
          <div className="bg-[#0A0F1D] rounded-[2rem] p-6 flex-1 flex flex-col border border-slate-800 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <h3 className="text-white font-bold text-sm tracking-wide font-mono">
                  JUDGE DEMO CONTROL
                </h3>
              </div>
              <button
                onClick={() => setCurrentScreen('demo_panel')}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono underline cursor-pointer"
              >
                Full Panel →
              </button>
            </div>

            {/* 1-Click Pitch Scenario Triggers */}
            <div className="space-y-2.5">
              {/* Scenario 1: Simran's Scam (Emergency) */}
              <button
                onClick={() => {
                  handleRunScenario({
                    id: 'scen_simran_scam',
                    name: "Simran's Urgent Scam",
                    tagline: 'Emergency Level — Remote Access Impersonation',
                    description: 'Simulate high-value account drainage with active screen-sharing and new recipient.',
                    amount: 48500.00,
                    recipient: 'Global Cyber Security Solutions Mumbai',
                    signals: {
                      screenSharingActive: true,
                      unusualTimeOfDay: true,
                      newRecipient: true,
                      highVelocity: true,
                      geoAnomaly: true,
                      rapidAmountEscalation: true,
                    },
                    expectedInterface: 'emergency',
                    trustScore: 12,
                    riskBand: 'emergency',
                  });
                }}
                className="w-full text-left p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/60 transition-all group cursor-pointer"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white text-xs font-bold group-hover:text-rose-400 transition-colors">
                    Simran's Tech Scam
                  </span>
                  <span className="text-[9px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                    CRITICAL
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Simulate urgent ₹48,500 transfer with active screen-sharing and new recipient.
                </p>
              </button>

              {/* Scenario 2: Trusted Regular (Safe) */}
              <button
                onClick={() => {
                  handleRunScenario({
                    id: 'scen_rent_cleared',
                    name: 'Trusted Regular Payment',
                    tagline: 'Trusted Level — Zero Anomaly',
                    description: 'Routine monthly maintenance transfer with recognized recipient and device match.',
                    amount: 18500.00,
                    recipient: 'Apex Heights Residency Society',
                    signals: {
                      screenSharingActive: false,
                      unusualTimeOfDay: false,
                      newRecipient: false,
                      highVelocity: false,
                      geoAnomaly: false,
                      rapidAmountEscalation: false,
                    },
                    expectedInterface: 'normal',
                    trustScore: 96,
                    riskBand: 'trusted',
                  });
                }}
                className="w-full text-left p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 transition-all group cursor-pointer"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white text-xs font-bold group-hover:text-emerald-400 transition-colors">
                    Trusted Regular
                  </span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                    SAFE
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Simulate monthly society rent of ₹18,500 with known biometric credentials.
                </p>
              </button>

              {/* Scenario 3: Unusual Time (Warn / Simplified) */}
              <button
                onClick={() => {
                  handleRunScenario({
                    id: 'scen_crypto_simplified',
                    name: 'Unusual Night Transfer',
                    tagline: 'Suspicious Level — Coercion Indicators',
                    description: 'Night transfer with screen capture to unverified cryptocurrency liquidation.',
                    amount: 9200.00,
                    recipient: 'Kavita Verma (Instant Crypto Exchange)',
                    signals: {
                      screenSharingActive: true,
                      unusualTimeOfDay: true,
                      newRecipient: true,
                      highVelocity: false,
                      geoAnomaly: false,
                      rapidAmountEscalation: false,
                    },
                    expectedInterface: 'simplified',
                    trustScore: 46,
                    riskBand: 'suspicious',
                  });
                }}
                className="w-full text-left p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/60 transition-all group cursor-pointer"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white text-xs font-bold group-hover:text-amber-400 transition-colors">
                    Unusual Time
                  </span>
                  <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                    WARN
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Initiated at 3:22 AM for ₹9,200 with screen capture and high-risk recipient.
                </p>
              </button>
            </div>

            {/* Terminal Gateway Status Footer */}
            <div className="mt-auto pt-4 border-t border-slate-800">
              <p className="text-[10px] font-mono text-slate-400 flex justify-between items-center">
                <span>GATEWAY_STATUS:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  LISTENING
                </span>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

