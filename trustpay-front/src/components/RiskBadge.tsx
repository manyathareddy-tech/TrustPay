import React from 'react';
import { RiskBand } from '../types';
import { RISK_COLOR_MAP } from '../utils/colors';

interface RiskBadgeProps {
  riskBand: RiskBand;
  score?: number;
  size?: 'sm' | 'md';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ riskBand, score, size = 'sm' }) => {
  const style = RISK_COLOR_MAP[riskBand];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${style.badgeBg} ${style.badgeText} ${style.badgeBorder} ${
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: style.gaugeColor }}
      />
      <span>{style.label}</span>
      {typeof score === 'number' && (
        <span className="font-mono font-bold opacity-80 ml-0.5">({score})</span>
      )}
    </span>
  );
};
