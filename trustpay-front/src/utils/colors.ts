import { RiskBand, InterfaceVariant } from '../types';

export interface RiskColorStyle {
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  ringColor: string;
  gaugeColor: string;
  glowColor: string;
}

export const RISK_COLOR_MAP: Record<RiskBand, RiskColorStyle> = {
  trusted: {
    label: 'Trusted / Low Risk',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    accentBg: 'bg-emerald-600',
    accentText: 'text-emerald-600',
    accentBorder: 'border-emerald-500',
    ringColor: 'ring-emerald-500/20',
    gaugeColor: '#10B981', // emerald-500
    glowColor: 'rgba(16, 185, 129, 0.15)',
  },
  slightly_suspicious: {
    label: 'Slightly Suspicious',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200',
    accentBg: 'bg-amber-500',
    accentText: 'text-amber-600',
    accentBorder: 'border-amber-400',
    ringColor: 'ring-amber-500/20',
    gaugeColor: '#F59E0B', // amber-500
    glowColor: 'rgba(245, 158, 11, 0.15)',
  },
  suspicious: {
    label: 'Suspicious',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-700',
    badgeBorder: 'border-orange-200',
    accentBg: 'bg-orange-600',
    accentText: 'text-orange-600',
    accentBorder: 'border-orange-500',
    ringColor: 'ring-orange-500/20',
    gaugeColor: '#EA580C', // orange-600
    glowColor: 'rgba(234, 88, 12, 0.15)',
  },
  emergency: {
    label: 'High Risk / Emergency',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
    accentBg: 'bg-rose-600',
    accentText: 'text-rose-600',
    accentBorder: 'border-rose-500',
    ringColor: 'ring-rose-500/20',
    gaugeColor: '#E11D48', // rose-600
    glowColor: 'rgba(225, 29, 72, 0.2)',
  },
  review_pending: {
    label: 'Review Pending (Uncertain)',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
    accentBg: 'bg-indigo-600',
    accentText: 'text-indigo-600',
    accentBorder: 'border-indigo-500',
    ringColor: 'ring-indigo-500/20',
    gaugeColor: '#6366F1', // indigo-500
    glowColor: 'rgba(99, 102, 241, 0.15)',
  },
};

export function getRiskBandForScore(score: number, variant?: InterfaceVariant): RiskBand {
  if (variant === 'review_pending') return 'review_pending';
  if (score >= 85) return 'trusted';
  if (score >= 65) return 'slightly_suspicious';
  if (score >= 40) return 'suspicious';
  return 'emergency';
}
