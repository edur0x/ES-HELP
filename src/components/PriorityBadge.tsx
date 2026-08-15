import React from 'react';
import { ChamadoPrioridade } from '../types';
import { AlertTriangle, AlertCircle, ArrowDown, ArrowUp } from 'lucide-react';

interface PriorityBadgeProps {
  prioridade: ChamadoPrioridade;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ prioridade }) => {
  const getBadgeConfig = () => {
    switch (prioridade) {
      case 'Crítica':
        return {
          bg: 'bg-rose-50 border-rose-300 text-rose-800',
          icon: <AlertTriangle size={13} className="text-rose-600" />
        };
      case 'Alta':
        return {
          bg: 'bg-orange-50 border-orange-300 text-orange-800',
          icon: <ArrowUp size={13} className="text-orange-600" />
        };
      case 'Média':
        return {
          bg: 'bg-amber-50 border-amber-300 text-amber-800',
          icon: <AlertCircle size={13} className="text-amber-600" />
        };
      case 'Baixa':
      default:
        return {
          bg: 'bg-slate-100 border-slate-300 text-slate-700',
          icon: <ArrowDown size={13} className="text-slate-500" />
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span
      id={`priority-badge-${prioridade.toLowerCase()}`}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${config.bg}`}
    >
      {config.icon}
      <span className="whitespace-nowrap">{prioridade}</span>
    </span>
  );
};
