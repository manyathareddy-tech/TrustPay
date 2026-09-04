import React, { useEffect, useState } from 'react';
import {
  Cpu,
  Play,
  Sparkles,
  ShieldCheck,
  AlertOctagon,
  Terminal,
  Activity,
  Globe,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Smartphone,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { TrustPayApiService } from '../services/api';
import { DemoScenario } from '../types';
import { RiskBadge } from './RiskBadge';
import { RISK_COLOR_MAP } from '../utils/colors';

export const DemoPanelScreen: React.FC = () => {
  const {
    handleRunScenario,
    isLoading,
    backendUrl,
    isLiveApi,
    updateBackendUrl,
    setCurrentScreen,
  } = useApp();

  const [scenarios, setScenarios] = useState<DemoScenario[]>([]);
  const [loadingScenarios, setLoadingScenarios] = useState(true);
  const [editingUrl, setEditingUrl] = useState(backendUrl);
  const [pingStatus, setPingStatus] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  useEffect(() => {
    TrustPayApiService.getDemoScenarios().then(res => {
      setScenarios(res);
      setLoadingScenarios(false);
    });
  }, []);

  const handlePingTest = async () => {
    setIsPinging(true);
    setPingStatus('Testing connection to backend API...');
    const result = await TrustPayApiService.testConnection();
    setPingStatus(result.message);
    setIsPinging(false);
  };

  const handleSaveUrl = async () => {
    setIsPinging(true);
    const res = await updateBackendUrl(editingUrl);
    setPingStatus(res.message);
    setIsPinging(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0F172A] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header with Technical Badge */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-indigo-400">
                <Cpu className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-white tracking-tight">
                    DEMO CONTROL PANEL
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Judge Pitch Mode
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Deterministic fraud scenarios & telemetry simulation for live judging pitch.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentScreen('dashboard')}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-full border border-slate-700 transition-colors cursor-pointer"
            >
              ← Exit to Dashboard
            </button>
          </div>
        </div>

        {/* Backend API Connection Inspector (Bento Card) */}
        <div className="bg-slate-900/90 rounded-[2rem] border border-slate-800 p-6 sm:p-7 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Active REST API Target Endpoint:
              </h3>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold ${
                  isLiveApi
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                    : 'bg-blue-950 text-blue-300 border border-blue-500/30'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isLiveApi ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`} />
                {isLiveApi ? 'Connected to Manus Backend' : 'Demo Simulation Fallback'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePingTest}
                disabled={isPinging}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                <span>Test Endpoint</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={editingUrl}
              onChange={e => setEditingUrl(e.target.value)}
              placeholder="Paste your deployed Manus API base URL (e.g. https://your-backend.run.app)"
              className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-full text-xs font-mono text-white placeholder-slate-600 focus:outline-hidden focus:border-indigo-500"
            />
            <button
              onClick={handleSaveUrl}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-full shadow-sm transition-colors cursor-pointer shrink-0"
            >
              Update Endpoint
            </button>
          </div>

          {pingStatus && (
            <p className="text-xs font-mono text-indigo-300 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              &gt; {pingStatus}
            </p>
          )}
        </div>

        {/* 1-Click Pre-Built Judge Scenarios Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                One-Click Hackathon Pitch Scenarios
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any scenario button to trigger transaction and jump directly to the adaptive confirmation screen.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {scenarios.length} Scenarios Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {scenarios.map(scenario => {
              const color = RISK_COLOR_MAP[scenario.riskBand];
              const isEmergency = scenario.expectedInterface === 'emergency';

              return (
                <motion.div
                  key={scenario.id}
                  whileHover={{ scale: 1.015, y: -2 }}
                  className={`rounded-[2rem] p-6 border flex flex-col justify-between transition-all bg-slate-900 shadow-xl ${
                    isEmergency
                      ? 'border-rose-500/70 hover:border-rose-400'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Expected Interface Badge & Score */}
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase border bg-slate-800 text-slate-300 border-slate-700">
                        {scenario.expectedInterface.replace(/_/g, ' ')}
                      </span>
                      <span
                        className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                        style={{ color: color.gaugeColor, backgroundColor: 'rgba(255,255,255,0.05)' }}
                      >
                        Score: {scenario.trustScore}/100
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">
                        {scenario.name}
                      </h3>
                      <p className="text-xs font-medium text-indigo-400 mt-0.5">
                        {scenario.tagline}
                      </p>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        {scenario.description}
                      </p>
                    </div>

                    {/* Threat Signals List */}
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-1.5 text-[11px]">
                      <div className="flex justify-between text-slate-400">
                        <span>Recipient:</span>
                        <span className="text-slate-200 font-bold truncate max-w-[150px]">
                          {scenario.recipient}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Amount:</span>
                        <span className="text-emerald-400 font-bold font-mono">
                          ₹{scenario.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Active Telemetry:</span>
                        <span className="text-amber-400 font-semibold">
                          {Object.values(scenario.signals).filter(Boolean).length} flags
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Instant Pitch Trigger Button (Bento Pill) */}
                  <div className="pt-4 mt-4 border-t border-slate-800">
                    <button
                      onClick={() => handleRunScenario(scenario)}
                      disabled={isLoading}
                      className={`w-full py-3.5 px-5 rounded-full text-xs font-bold tracking-wide uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                        isEmergency
                          ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isEmergency ? "Trigger Simran's Scam Now" : 'Run Scenario Pitch'}</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Architecture & Telemetry Pipeline Explanation Card */}
        <div className="bg-slate-900/60 rounded-[2rem] border border-slate-800 p-6 sm:p-7 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            TrustPay Continuous Multi-Layer Decision Engine
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-indigo-400 font-bold block mb-1">01. Inbound Intercept</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Pre-clearing hook intercepts bank transfer payload before ledger commitment.
              </p>
            </div>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-blue-400 font-bold block mb-1">02. Layer 7 Signals</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Screen-sharing detection, velocity spikes, diurnal deviations, and IP entropy.
              </p>
            </div>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-amber-400 font-bold block mb-1">03. 0–100 Score</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Continuous score replaces binary reject/accept with 5 proportional friction tiers.
              </p>
            </div>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-rose-400 font-bold block mb-1">04. Trusted Contact</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Automated SMS dispatch to user's designated family member for high-risk attacks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
