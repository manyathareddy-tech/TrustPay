import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertOctagon,
  HelpCircle,
  KeyRound,
  CheckCircle2,
  XCircle,
  PhoneCall,
  UserCheck,
  Lock,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Shield,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TrustScoreGauge } from './TrustScoreGauge';
import { RiskBadge } from './RiskBadge';
import { InterfaceVariant, RiskBand, Transaction } from '../types';
import { RISK_COLOR_MAP, getRiskBandForScore } from '../utils/colors';

export const ConfirmationScreen: React.FC = () => {
  const {
    currentUser,
    activeTransaction,
    setActiveTransaction,
    handleCompleteActiveTransaction,
    handleVerifyActiveTransaction,
    handleCancelActiveTransaction,
    setCurrentScreen,
    isLoading,
  } = useApp();

  // Local OTP state for normal_with_extra
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState(false);

  // Simplified agreement checkbox
  const [acknowledgedRisks, setAcknowledgedRisks] = useState(false);

  // Fallback transaction if navigated directly without an active transaction
  const tx: Transaction = activeTransaction || {
    id: 'tx_demo_preview',
    userId: currentUser?.id || 'usr_demo',
    amount: 18500.00,
    recipient: 'Apex Heights Residency Society',
    recipientAccount: 'HDFC0001234 9876543210',
    timestamp: 'Just now',
    trustScore: 94,
    riskBand: 'trusted',
    interface: 'normal',
    status: 'pending',
    layer7Warnings: [],
    naturalLanguageSummary: 'Standard recognized recipient. Biometric credentials confirmed.',
  };

  const trustedContactName = currentUser?.trustedContact.name || 'Ananya Sharma';
  const trustedContactPhone = currentUser?.trustedContact.phone || '+91 98765 43210';

  // Quick variant switcher for judges
  const setVariantForDemo = (variant: InterfaceVariant) => {
    const scoreMap: Record<InterfaceVariant, number> = {
      normal: 94,
      normal_with_extra: 74,
      simplified: 46,
      emergency: 14,
      review_pending: 52,
    };
    const riskMap: Record<InterfaceVariant, RiskBand> = {
      normal: 'trusted',
      normal_with_extra: 'slightly_suspicious',
      simplified: 'suspicious',
      emergency: 'emergency',
      review_pending: 'review_pending',
    };

    const warningsMap: Record<InterfaceVariant, string[]> = {
      normal: [],
      normal_with_extra: ['Transaction amount (₹12,500.00) exceeds habitual discretionary purchase threshold by 3.2x'],
      simplified: [
        'Screen capture or cast stream active on local device during payment entry',
        'Transaction initiated at 03:22 AM local time (outside habitual active hours)',
        'Destination account categorized as instant cryptocurrency liquidation portal',
      ],
      emergency: [
        'Active screen-sharing software (AnyDesk / TeamViewer) detected during authorization',
        'Recipient account created < 48 hours ago with rapid immediate liquidation pattern',
        'Sudden high-velocity account drainage of ₹48,500.00',
      ],
      review_pending: [
        'Hardware canvas fingerprint does not match registered device token',
        'Inbound connection routed through an overseas Tor/VPN exit node',
      ],
    };

    const summariesMap: Record<InterfaceVariant, string> = {
      normal: 'Transaction verified against normal behavioral baselines, recognized recipient, and valid device telemetry.',
      normal_with_extra: 'Your payment details and device look secure. Since this transfer exceeds your 30-day single transfer average, please enter the SMS passkey sent to your device.',
      simplified: 'We noticed multiple unusual risk indicators, including screen-sharing activity and an atypical time of day. We have simplified this confirmation screen so you can verify who is viewing your device before funds leave your balance.',
      emergency: 'TrustPay halted this transaction because an active remote desktop session was running concurrently with a critical account drain to an unverified recipient. This precisely matches remote-access impersonation scams. Your funds remain 100% safe in your account.',
      review_pending: 'This transaction was flagged for manual review because it originated from a brand-new device signature connecting through an anonymous proxy. Your transfer is paused safely in escrow while we verify your identity.',
    };

    if (activeTransaction) {
      setActiveTransaction({
        ...activeTransaction,
        interface: variant,
        riskBand: riskMap[variant],
        trustScore: scoreMap[variant],
        layer7Warnings: warningsMap[variant],
        naturalLanguageSummary: summariesMap[variant],
        trustedContactNotified: variant === 'emergency',
      });
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newCode = [...otpCode];
    newCode[index] = value;
    setOtpCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleAutoFillOtp = () => {
    setOtpCode(['4', '8', '2', '9', '1', '0']);
    setOtpError(false);
  };

  const currentVariant = tx.interface || 'normal';
  const riskColor = RISK_COLOR_MAP[tx.riskBand];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Judge Pitch Switcher Bar (Bento Pill Bar) */}
      <div className="bg-[#0F172A] text-slate-300 p-4 rounded-[2rem] border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Demo Pitch Switcher:
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Compare all 5 adaptive interface states live
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {(['normal', 'normal_with_extra', 'simplified', 'emergency', 'review_pending'] as InterfaceVariant[]).map(v => {
            const labels: Record<InterfaceVariant, string> = {
              normal: '1. Normal',
              normal_with_extra: '2. Normal + OTP',
              simplified: '3. Simplified',
              emergency: '4. Emergency',
              review_pending: '5. Review Pending',
            };
            const isActive = currentVariant === v;
            return (
              <button
                key={v}
                onClick={() => setVariantForDemo(v)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {labels[v]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Adaptive Screen Render Area with Smooth Motion */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentVariant}
          initial={{ opacity: 0, y: 8, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.99 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="space-y-6"
        >
          {/* ========================================================= */}
          {/* VARIANT 1: NORMAL (Clean, minimal confirmation, single button) */}
          {/* ========================================================= */}
          {currentVariant === 'normal' && (
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-xs border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Standard Low-Friction Transfer
                  </span>
                  <h2 className="text-2xl font-bold text-[#0F172A] mt-1">
                    Confirm Transfer
                  </h2>
                </div>

                {/* Score Display */}
                <div className="flex items-center gap-4 bg-emerald-50/70 border border-emerald-200 px-4 py-2.5 rounded-2xl">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                      Trust Score
                    </span>
                    <p className="text-xs text-emerald-800 font-semibold">Zero Anomaly Detected</p>
                  </div>
                  <TrustScoreGauge
                    score={tx.trustScore}
                    riskBand="trusted"
                    size="sm"
                    showLabel={false}
                  />
                </div>
              </div>

              {/* Transaction Details */}
              <div className="py-6 space-y-4">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Recipient</span>
                    <span className="font-bold text-slate-900">{tx.recipient}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Account / Routing</span>
                    <span className="font-mono text-slate-700">{tx.recipientAccount || 'GB82 APEX 0092 1109 22'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Transfer Note</span>
                    <span className="text-slate-700">{tx.note || 'Monthly Rent'}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Total Transfer</span>
                    <span className="text-2xl font-extrabold font-mono text-slate-900">
                      ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified against habitual payment schedule and recognized mobile device.</span>
                </div>
              </div>

              {/* Single Action Button (Bento Pill) */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setCurrentScreen('dashboard')}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteActiveTransaction}
                  disabled={isLoading}
                  className="px-8 py-3 bg-[#0F172A] hover:bg-slate-800 text-white text-sm font-semibold rounded-full shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  {isLoading ? 'Sending...' : 'Confirm Transfer'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VARIANT 2: NORMAL WITH EXTRA (OTP step-up passkey verification) */}
          {/* ========================================================= */}
          {currentVariant === 'normal_with_extra' && (
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-xs border border-amber-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4" /> Additional Step-up Verification
                  </span>
                  <h2 className="text-2xl font-bold text-[#0F172A] mt-1">
                    Confirm High-Tier Payment
                  </h2>
                </div>

                {/* Score Display */}
                <div className="flex items-center gap-4 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-2xl">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">
                      Trust Score
                    </span>
                    <p className="text-xs text-amber-800 font-semibold">Step-up Passkey Required</p>
                  </div>
                  <TrustScoreGauge
                    score={tx.trustScore}
                    riskBand="slightly_suspicious"
                    size="sm"
                    showLabel={false}
                  />
                </div>
              </div>

              {/* Details + Security Note */}
              <div className="py-6 space-y-5">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Recipient</span>
                    <span className="font-bold text-slate-900">{tx.recipient}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Amount</span>
                    <span className="text-xl font-extrabold font-mono text-slate-900">
                      ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Security Note */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-950 block mb-0.5">
                      Security Verification Notice
                    </span>
                    {tx.naturalLanguageSummary ||
                      'This payment exceeds your customary 30-day discretionary purchase threshold. We have sent a 6-digit one-time passkey to your registered phone.'}
                  </div>
                </div>

                {/* Lightweight OTP Input */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Enter 6-Digit SMS Passkey
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoFillOtp}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline cursor-pointer"
                    >
                      Demo: Auto-fill Code (482910)
                    </button>
                  </div>

                  <div className="flex justify-center gap-2 sm:gap-3">
                    {otpCode.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(idx, e.target.value)}
                        className="w-11 h-12 text-center text-lg font-bold font-mono bg-white border border-slate-300 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-hidden"
                      />
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Code expires in 4:45. Sent to registered mobile ending in •••• 5678
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setCurrentScreen('dashboard')}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteActiveTransaction}
                  disabled={isLoading || otpCode.some(c => !c)}
                  className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-full shadow-md transition-all cursor-pointer disabled:opacity-40 flex items-center gap-2"
                >
                  {isLoading ? 'Verifying...' : 'Verify Passkey & Transfer'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VARIANT 3: SIMPLIFIED (Larger buttons, high-visibility warnings, Gemini explanation) */}
          {/* ========================================================= */}
          {currentVariant === 'simplified' && (
            <div className="bg-white rounded-[2rem] p-6 sm:p-9 shadow-lg border-2 border-orange-300 space-y-6">
              {/* Header with High Contrast Warning */}
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
                <AlertOctagon className="w-7 h-7 text-orange-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-base font-extrabold text-orange-950">
                      Suspicious Activity Detected — High Clarity Mode
                    </h3>
                    <RiskBadge riskBand="suspicious" score={tx.trustScore} />
                  </div>
                  <p className="text-xs text-orange-900 mt-1">
                    This screen has been simplified with high-visibility warnings to protect against guided coercion or remote screen takeover.
                  </p>
                </div>
              </div>

              {/* Large Central Numeric Score Gauge */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center justify-around gap-4 text-center sm:text-left">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Live Trust Assessment: {tx.trustScore} / 100
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 max-w-xs">
                    Multiple behavioral deviations triggered security intervention.
                  </p>
                </div>
                <TrustScoreGauge
                  score={tx.trustScore}
                  riskBand="suspicious"
                  size="md"
                  showLabel={false}
                />
              </div>

              {/* Specific Triggered-Signal Warnings from Layer 7 Output */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-orange-600" />
                  Layer 7 Triggered Threat Signals ({tx.layer7Warnings?.length || 2}):
                </h4>
                <div className="space-y-2">
                  {(tx.layer7Warnings && tx.layer7Warnings.length > 0
                    ? tx.layer7Warnings
                    : [
                        'Screen-sharing application actively streaming on this device',
                        'Transaction initiated at unusual late-night hour (3:22 AM)',
                      ]
                  ).map((warning, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-orange-50/80 border border-orange-200 rounded-xl text-xs font-medium text-orange-950 flex items-start gap-2.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-1.5 shrink-0" />
                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clearly Separated "Why We're Asking" Explanation Area (Gemini naturalLanguageSummary) */}
              <div className="p-5 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-2xl border border-blue-200 text-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Why we're asking (AI Security Explanation)
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {tx.naturalLanguageSummary ||
                    'We noticed multiple unusual risk indicators, including screen-sharing activity and an atypical time of day. We have magnified this confirmation screen so you can independently verify that you are not being coached by an external caller.'}
                </p>
              </div>

              {/* Simplified Clear Transaction Summary */}
              <div className="p-5 bg-[#0F172A] text-white rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 uppercase font-semibold">
                    You Are Sending To:
                  </span>
                  <p className="text-lg font-bold text-white mt-0.5">{tx.recipient}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 uppercase font-semibold">
                    Total Debit
                  </span>
                  <p className="text-2xl font-black font-mono text-orange-400">
                    ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Explicit Acknowledgment Checkbox */}
              <label className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acknowledgedRisks}
                  onChange={e => setAcknowledgedRisks(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                />
                <span>
                  I confirm that no unknown caller or remote-support agent instructed me to perform this transfer.
                </span>
              </label>

              {/* Larger Action Buttons (Bento Pills) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  onClick={handleCancelActiveTransaction}
                  className="py-4 px-6 bg-slate-200 hover:bg-slate-300 text-slate-800 text-base font-bold rounded-full transition-all shadow-xs cursor-pointer text-center"
                >
                  Cancel & Safeguard Funds
                </button>
                <button
                  onClick={handleCompleteActiveTransaction}
                  disabled={isLoading || !acknowledgedRisks}
                  className="py-4 px-6 bg-orange-600 hover:bg-orange-500 text-white text-base font-bold rounded-full transition-all shadow-md cursor-pointer disabled:opacity-40 text-center"
                >
                  {isLoading ? 'Submitting...' : 'Proceed Despite Warnings'}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VARIANT 4: EMERGENCY (Full-width red banner, Held status, Money Safe reassurance, Trusted Contact Alert) */}
          {/* ========================================================= */}
          {currentVariant === 'emergency' && (
            <div className="rounded-[2rem] shadow-xl overflow-hidden border-2 border-rose-500 bg-white">
              {/* Full-width Red Warning Banner */}
              <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-red-700 text-white p-6 sm:p-7">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                      <AlertOctagon className="w-7 h-7 text-white animate-bounce" />
                    </div>
                    <div>
                      <span className="text-[11px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                        Emergency Protection Intercept
                      </span>
                      <h2 className="text-2xl font-black tracking-tight text-white mt-1">
                        Transaction Held & Blocked
                      </h2>
                    </div>
                  </div>

                  {/* Circular Trust Score Gauge in Red */}
                  <div className="bg-black/30 backdrop-blur-xs rounded-2xl px-4 py-2 flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-rose-200">
                        Critical Risk
                      </span>
                      <p className="text-xs text-white font-mono font-bold">Score: {tx.trustScore}/100</p>
                    </div>
                    <TrustScoreGauge
                      score={tx.trustScore}
                      riskBand="emergency"
                      size="sm"
                      showLabel={false}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {/* PROMINENT REASSURANCE LINE (Explicitly required by prompt) */}
                <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-emerald-950 flex items-center gap-3 shadow-xs">
                  <ShieldCheck className="w-7 h-7 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-extrabold text-emerald-900">
                      Your money is safe — nothing has been sent yet
                    </h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Your current balance of ₹{currentUser?.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })} is completely intact.
                    </p>
                  </div>
                </div>

                {/* TRUSTED CONTACT ALERTED CALL-TO-ACTION (Explicitly required by prompt) */}
                <div className="p-5 bg-gradient-to-br from-[#0F172A] to-slate-900 text-white rounded-2xl border border-slate-800 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center shrink-0 text-blue-400">
                        <PhoneCall className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">
                          Automatic Family Safeguard
                        </span>
                        <h4 className="text-base font-bold text-white mt-0.5">
                          We've alerted {trustedContactName}
                        </h4>
                        <p className="text-xs text-slate-300 mt-0.5">
                          An urgent SMS notification was dispatched to {trustedContactPhone} detailing this held transfer.
                        </p>
                      </div>
                    </div>

                    <a
                      href={`tel:${trustedContactPhone.replace(/[^0-9+]/g, '')}`}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center gap-2 shadow-md transition-all shrink-0 cursor-pointer"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Call {trustedContactName}</span>
                    </a>
                  </div>
                </div>

                {/* Specific Risk Signals Breakdown */}
                <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4 text-rose-600" />
                    Why TrustPay Blocked This Transaction:
                  </h4>
                  <ul className="space-y-2 text-xs text-rose-900">
                    {(tx.layer7Warnings && tx.layer7Warnings.length > 0
                      ? tx.layer7Warnings
                      : [
                          'Active screen-sharing tool (AnyDesk / TeamViewer) detected during high-value transfer',
                          'Recipient opened < 48 hours ago with immediate account drain characteristics',
                          'Urgent transfer pattern matching remote-access tech support impersonation',
                        ]
                    ).map((warning, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>

                  {tx.naturalLanguageSummary && (
                    <div className="pt-2 border-t border-rose-200 text-xs text-rose-800">
                      <span className="font-semibold block mb-0.5">Security Intelligence Summary:</span>
                      <p>{tx.naturalLanguageSummary}</p>
                    </div>
                  )}
                </div>

                {/* Blocked Transaction Data */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500">Attempted Recipient:</span>
                    <p className="font-bold text-slate-800 text-sm">{tx.recipient}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500">Amount Stopped:</span>
                    <p className="font-mono font-bold text-rose-600 line-through text-base">
                      ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {/* Emergency Action Buttons (Bento Pills) */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <button
                    onClick={handleCancelActiveTransaction}
                    className="w-full sm:w-auto px-7 py-3.5 bg-[#0F172A] hover:bg-slate-800 text-white text-sm font-bold rounded-full shadow-md transition-all cursor-pointer text-center"
                  >
                    Confirm & Keep Funds Safe
                  </button>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => setCurrentScreen('notifications')}
                      className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-full cursor-pointer"
                    >
                      View Dispatched Alerts
                    </button>
                    <button
                      onClick={() => setCurrentScreen('dashboard')}
                      className="px-5 py-2.5 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                    >
                      Return to Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VARIANT 5: REVIEW PENDING (Distinct purple/blue-gray, Identity verification, Cancel) */}
          {/* ========================================================= */}
          {currentVariant === 'review_pending' && (
            <div className="bg-white rounded-[2rem] p-6 sm:p-9 shadow-md border-2 border-indigo-200 space-y-6">
              {/* Header with Distinct Neutral Purple / Blue-Gray tone */}
              <div className="bg-gradient-to-r from-indigo-900 to-[#0F172A] text-white rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-indigo-300" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                      Uncertain / Review Paused
                    </span>
                    <h2 className="text-2xl font-bold text-white mt-1">
                      Transaction Paused for Verification
                    </h2>
                    <p className="text-xs text-indigo-200 mt-1">
                      Not marked as fraudulent, but placed in temporary hold pending identity authentication.
                    </p>
                  </div>
                </div>

                {/* Score Gauge in Purple */}
                <div className="bg-slate-800/80 border border-indigo-500/30 rounded-2xl px-4 py-2 flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-indigo-300">
                      Trust Level
                    </span>
                    <p className="text-xs text-white font-mono font-bold">{tx.trustScore} / 100</p>
                  </div>
                  <TrustScoreGauge
                    score={tx.trustScore}
                    riskBand="review_pending"
                    size="sm"
                    showLabel={false}
                  />
                </div>
              </div>

              {/* Explanation of Paused State */}
              <div className="p-5 bg-indigo-50/70 border border-indigo-200 rounded-2xl text-xs text-indigo-950 space-y-2">
                <span className="font-bold uppercase tracking-wider text-indigo-900 block">
                  Why is this transaction on hold?
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {tx.naturalLanguageSummary ||
                    'We detected an unrecognized network routing environment and a novel device signature. Your transfer of funds has been secured in escrow while we confirm your identity.'}
                </p>
              </div>

              {/* Signals */}
              {tx.layer7Warnings && tx.layer7Warnings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Verification Triggers:
                  </h4>
                  {tx.layer7Warnings.map((w, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-center gap-2"
                    >
                      <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Transaction Recap */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex items-center justify-between text-sm">
                <div>
                  <span className="text-xs text-slate-500 uppercase font-semibold">Intended Recipient</span>
                  <p className="font-bold text-slate-900 text-base">{tx.recipient}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 uppercase font-semibold">Held Amount</span>
                  <p className="text-xl font-bold font-mono text-slate-900">
                    ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Required Actions (Bento Pills) */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
                <button
                  onClick={handleCancelActiveTransaction}
                  disabled={isLoading}
                  className="w-full sm:w-auto px-6 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-full transition-all cursor-pointer"
                >
                  Cancel Transaction
                </button>

                <button
                  onClick={handleVerifyActiveTransaction}
                  disabled={isLoading}
                  className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-full shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{isLoading ? 'Verifying...' : 'Verify Identity via Challenge'}</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
