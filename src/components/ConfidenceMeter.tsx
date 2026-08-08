import React from 'react';

interface ConfidenceMeterProps {
  confidence: number; // 0 to 1
  showLabel?: boolean;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  confidence,
  showLabel = true
}) => {
  const percentage = Math.round(confidence * 100);

  const getBarColor = () => {
    if (percentage >= 85) return 'bg-emerald-500 shadow-emerald-500/50';
    if (percentage >= 70) return 'bg-amber-500 shadow-amber-500/50';
    return 'bg-orange-500 shadow-orange-500/50';
  };

  return (
    <div className="flex items-center gap-2.5 w-full">
      <div className="flex-1 bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/50 p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out shadow-xs ${getBarColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-mono font-semibold text-slate-300 min-w-[38px] text-right">
          {percentage}%
        </span>
      )}
    </div>
  );
};
