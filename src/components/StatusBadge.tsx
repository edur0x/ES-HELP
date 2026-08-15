import React from 'react';
import { ChamadoStatus } from '../types';
import { Clock, PlayCircle, CheckCircle2 } from 'lucide-react';

interface StatusBadgeProps {
  status: ChamadoStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold'
  };

  const iconSize = size === 'sm' ? 12 : size === 'md' ? 14 : 16;

  if (status === 'Aberto') {
    return (
      <span
        id={`status-badge-aberto-${size}`}
        className={`inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 text-amber-800 ${sizeClasses[size]}`}
      >
        <Clock size={iconSize} className="text-amber-600 animate-pulse" />
        <span className="whitespace-nowrap">Aberto</span>
      </span>
    );
  }

  if (status === 'Em Atendimento') {
    return (
      <span
        id={`status-badge-atendimento-${size}`}
        className={`inline-flex items-center gap-1.5 rounded-full border border-blue-300 bg-blue-50 text-blue-800 ${sizeClasses[size]}`}
      >
        <PlayCircle size={iconSize} className="text-blue-600" />
        <span className="whitespace-nowrap">Em Atendimento</span>
      </span>
    );
  }

  return (
    <span
      id={`status-badge-encerrado-${size}`}
      className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-800 ${sizeClasses[size]}`}
    >
      <CheckCircle2 size={iconSize} className="text-emerald-600" />
      <span className="whitespace-nowrap">Encerrado</span>
    </span>
  );
};
