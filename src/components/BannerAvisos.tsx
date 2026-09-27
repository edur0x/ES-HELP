import React, { useState } from 'react';
import { AvisoBanner, User } from '../types';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  X,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Settings
} from 'lucide-react';

interface BannerAvisosProps {
  avisos?: AvisoBanner[];
  currentUser?: User | null;
  onOpenManageAvisos?: () => void;
}

export const BannerAvisos: React.FC<BannerAvisosProps> = ({
  avisos = [],
  currentUser,
  onOpenManageAvisos
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  // Filter out dismissed notices in current session with safe checks
  const safeList = Array.isArray(avisos) ? avisos : [];
  const visibleAvisos = safeList.filter(a => a && typeof a === 'object' && a.id && !dismissedIds.includes(a.id));

  if (!visibleAvisos || visibleAvisos.length === 0) {
    return null;
  }

  // Bound index safely
  const activeIndex = (currentIndex >= 0 && currentIndex < visibleAvisos.length) ? currentIndex : 0;
  const currentAviso = visibleAvisos[activeIndex];

  if (!currentAviso) {
    return null;
  }

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => [...prev, id]);
    if (currentIndex >= visibleAvisos.length - 1) {
      setCurrentIndex(Math.max(0, visibleAvisos.length - 2));
    }
  };

  const handleNext = () => {
    if (visibleAvisos.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % visibleAvisos.length);
  };

  const handlePrev = () => {
    if (visibleAvisos.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + visibleAvisos.length) % visibleAvisos.length);
  };

  const canManage = currentUser?.perfil === 'Administrador' || currentUser?.perfil === 'Técnico';

  // Styling based on severity type
  const isUrgente = currentAviso.tipo === 'urgente';
  const isAviso = currentAviso.tipo === 'aviso';
  const isSucesso = currentAviso.tipo === 'sucesso';

  const borderStyles = isUrgente
    ? 'border-rose-300 bg-rose-50/90 text-rose-950'
    : isAviso
    ? 'border-amber-300 bg-amber-50/90 text-amber-950'
    : isSucesso
    ? 'border-emerald-300 bg-emerald-50/90 text-emerald-950'
    : 'border-blue-300 bg-blue-50/90 text-blue-950';

  const badgeText = isUrgente
    ? 'ALERTA CRÍTICO TI'
    : isAviso
    ? 'AVISO DE MANUTENÇÃO'
    : isSucesso
    ? 'COMUNICADO CONCLUÍDO'
    : 'COMUNICADO TI';

  const badgeColor = isUrgente
    ? 'text-rose-700 bg-rose-100 border-rose-200'
    : isAviso
    ? 'text-amber-800 bg-amber-100 border-amber-200'
    : isSucesso
    ? 'text-emerald-800 bg-emerald-100 border-emerald-200'
    : 'text-blue-800 bg-blue-100 border-blue-200';

  return (
    <div
      role="region"
      aria-label="Avisos e comunicados da equipe de TI"
      className={`w-full border-b transition-all duration-200 shadow-2xs ${borderStyles}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Main Notice Content */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="shrink-0 mt-0.5">
              {isUrgente && <AlertTriangle size={18} className="text-rose-600 animate-pulse" />}
              {isAviso && <AlertCircle size={18} className="text-amber-600" />}
              {isSucesso && <CheckCircle2 size={18} className="text-emerald-600" />}
              {!isUrgente && !isAviso && !isSucesso && <Info size={18} className="text-blue-600" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${badgeColor}`}>
                  {badgeText}
                </span>

                <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                  {currentAviso.titulo || 'Comunicado TI'}
                </h4>

                {currentAviso.criadoPor && (
                  <span className="text-[11px] text-slate-500 hidden md:inline">
                    · Publicado por {currentAviso.criadoPor}
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs text-slate-700 leading-relaxed max-w-4xl">
                {currentAviso.mensagem || ''}
              </p>
            </div>
          </div>

          {/* Right Controls: Pagination, Manage link & Dismiss */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            
            {/* If more than 1 notice, show pagination buttons */}
            {visibleAvisos.length > 1 && (
              <div className="flex items-center gap-1 text-xs text-slate-500 mr-2 bg-white/70 px-2 py-0.5 rounded-md border border-slate-200">
                <button
                  onClick={handlePrev}
                  className="p-0.5 hover:text-slate-900 transition-colors"
                  title="Aviso anterior"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-[11px] font-semibold text-slate-700">
                  {activeIndex + 1} de {visibleAvisos.length}
                </span>
                <button
                  onClick={handleNext}
                  className="p-0.5 hover:text-slate-900 transition-colors"
                  title="Próximo aviso"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}

            {/* Quick Admin/Tech shortcut to open notices manager */}
            {canManage && onOpenManageAvisos && (
              <button
                onClick={onOpenManageAvisos}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-indigo-700 bg-white/80 hover:bg-white px-2.5 py-1 rounded-md border border-slate-300 transition-colors shadow-2xs"
                title="Gerenciar e publicar novos comunicados corporativos"
              >
                <Settings size={12} />
                <span className="hidden sm:inline">Gerenciar</span>
              </button>
            )}

            {/* Dismiss notice button */}
            <button
              onClick={() => handleDismiss(currentAviso.id)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-white/60 transition-colors"
              title="Dispensar aviso nesta sessão"
              aria-label="Dispensar aviso"
            >
              <X size={16} />
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};
