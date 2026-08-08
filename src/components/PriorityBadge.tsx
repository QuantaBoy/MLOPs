import React from 'react';
import type { Priority } from '../types';
import { AlertTriangle, AlertCircle, Clock, CheckCircle } from 'lucide-react';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  pulse?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'md',
  showIcon = true,
  pulse = false
}) => {
  const getBadgeStyle = () => {
    switch (priority) {
      case 'critical':
        return {
          bg: 'bg-red-50 text-red-800 border-red-200',
          dot: 'bg-red-700',
          icon: AlertTriangle,
          label: 'Critical'
        };
      case 'high':
        return {
          bg: 'bg-orange-50 text-orange-800 border-orange-200',
          dot: 'bg-orange-600',
          icon: AlertCircle,
          label: 'High'
        };
      case 'medium':
        return {
          bg: 'bg-teal-50 text-teal-800 border-teal-200',
          dot: 'bg-teal-700',
          icon: Clock,
          label: 'Medium'
        };
      case 'low':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-600',
          icon: CheckCircle,
          label: 'Low'
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-500',
          icon: Clock,
          label: priority
        };
    }
  };

  const style = getBadgeStyle();
  const IconComponent = style.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] font-semibold gap-1',
    md: 'px-2.5 py-1 text-xs font-semibold gap-1.5',
    lg: 'px-3 py-1.5 text-xs font-bold gap-2'
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border ${style.bg} ${sizeClasses[size]} tracking-wider uppercase transition-all duration-150 ${
        pulse && priority === 'critical' ? 'pulse-critical' : ''
      }`}
    >
      {showIcon && (
        <IconComponent className={size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      )}
      <span>{style.label}</span>
    </span>
  );
};
