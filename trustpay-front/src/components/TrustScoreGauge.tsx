import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { RiskBand } from '../types';
import { RISK_COLOR_MAP } from '../utils/colors';

interface TrustScoreGaugeProps {
  score: number;
  riskBand: RiskBand;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showLabel?: boolean;
  subtitle?: string;
  animate?: boolean;
}

export const TrustScoreGauge: React.FC<TrustScoreGaugeProps> = ({
  score,
  riskBand,
  size = 'md',
  showLabel = true,
  subtitle,
  animate = true,
}) => {
  const [displayedScore, setDisplayedScore] = useState(animate ? 0 : score);
  const colorStyle = RISK_COLOR_MAP[riskBand];

  useEffect(() => {
    if (!animate) {
      setDisplayedScore(score);
      return;
    }

    let start = 0;
    const duration = 900;
    const startTime = performance.now();

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (score - start) * ease);
      setDisplayedScore(current);

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        setDisplayedScore(score);
      }
    };

    requestAnimationFrame(frame);
  }, [score, animate]);

  // Dimension settings
  const config = {
    sm: { size: 64, stroke: 6, textClass: 'text-lg font-bold', labelClass: 'text-xs' },
    md: { size: 104, stroke: 8, textClass: 'text-3xl font-extrabold', labelClass: 'text-xs font-semibold' },
    lg: { size: 148, stroke: 11, textClass: 'text-4xl font-extrabold tracking-tight', labelClass: 'text-sm font-semibold' },
    hero: { size: 180, stroke: 13, textClass: 'text-5xl font-black tracking-tight', labelClass: 'text-sm font-semibold' },
  }[size];

  const radius = (config.size - config.stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative flex items-center justify-center" style={{ width: config.size, height: config.size }}>
        {/* SVG Arc */}
        <svg
          width={config.size}
          height={config.size}
          className="transform -rotate-90"
        >
          {/* Track */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={config.stroke}
            fill="transparent"
            strokeLinecap="round"
          />
          {/* Active Meter */}
          <motion.circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            stroke={colorStyle.gaugeColor}
            strokeWidth={config.stroke}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
        </svg>

        {/* Center Numbers */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`${config.textClass} font-mono`}
            style={{ color: colorStyle.gaugeColor }}
          >
            {displayedScore}
          </span>
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            / 100
          </span>
        </div>
      </div>

      {showLabel && (
        <div className="mt-2.5 flex flex-col items-center">
          <div
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorStyle.badgeBg} ${colorStyle.badgeText} ${colorStyle.badgeBorder}`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full mr-1.5"
              style={{ backgroundColor: colorStyle.gaugeColor }}
            />
            {colorStyle.label}
          </div>
          {subtitle && (
            <span className="text-xs text-slate-500 mt-1">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
};
