import React from 'react';
import { Chamado } from '../types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { Clock, CheckCircle2, User, Laptop, Tag, Layers, FileText, Wrench, X } from 'lucide-react';

interface ChamadoDetailsModalProps {
  chamado: Chamado | null;
  onClose: () => void;
}

export const ChamadoDetailsModal: React.FC<ChamadoDetailsModalProps> = ({ chamado, onClose }) => {
  if (!chamado) return null;

  return (
    <div
      id="modal-chamado-details"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-lg border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-indigo-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-700">
              {chamado.id}
            </span>
            <StatusBadge status={chamado.status} size="sm" />
            <PriorityBadge prioridade={chamado.prioridade} />
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm p-1.5 rounded-md hover:bg-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">{chamado.titulo}</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <Clock size={13} />
              Aberto em {new Date(chamado.data_abertura).toLocaleString('pt-BR')}
            </p>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div className="flex items-start gap-2">
              <User size={15} className="text-slate-400 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Solicitante</span>
                <strong className="text-slate-900 text-xs sm:text-sm">{chamado.solicitante}</strong>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Layers size={15} className="text-slate-400 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Tipo de Solicitação</span>
                <strong className="text-slate-900">{chamado.tipo_solicitacao}</strong>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Tag size={15} className="text-slate-400 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Categoria</span>
                <strong className="text-slate-900">{chamado.categoria}</strong>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Laptop size={15} className="text-slate-400 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Equipamento / Patrimônio</span>
                <strong className="text-slate-900">{chamado.equipamento || 'Não informado'}</strong>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <FileText size={14} className="text-indigo-600" />
              Descrição do Problema
            </span>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
              {chamado.descricao_problema}
            </div>
          </div>

          {/* Service Description (if any) */}
          {chamado.status === 'Encerrado' && (
            <div className="p-4 bg-green-50/60 border border-green-200 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-green-900 font-bold text-sm">
                <CheckCircle2 size={16} className="text-green-600" />
                <span>Laudo do Serviço Realizado pelo Técnico</span>
              </div>
              <p className="text-xs sm:text-sm text-green-950 bg-white p-3 rounded-md border border-green-200 whitespace-pre-wrap italic">
                "{chamado.descricao_servico || 'Nenhum detalhe informado.'}"
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-green-800 pt-2 border-t border-green-200">
                <div>
                  Encerramento:{' '}
                  <strong className="text-green-950">
                    {chamado.data_encerramento
                      ? new Date(chamado.data_encerramento).toLocaleString('pt-BR')
                      : 'N/A'}
                  </strong>
                </div>
                <div>
                  Técnico Responsável:{' '}
                  <strong className="text-green-950">
                    {chamado.tecnico_responsavel || 'Técnico TI'}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {chamado.status === 'Em Atendimento' && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-2">
              <Wrench size={16} className="text-amber-600 shrink-0" />
              <span>
                Este chamado está atualmente <strong>Em Atendimento</strong> pelo técnico{' '}
                <strong>{chamado.tecnico_responsavel || 'da equipe de TI'}</strong>.
              </span>
            </div>
          )}

          {chamado.status === 'Aberto' && (
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-center gap-2">
              <Clock size={16} className="text-blue-600 shrink-0" />
              <span>
                Este chamado está <strong>Aberto</strong> na fila aguardando início de atendimento por um técnico.
              </span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-md transition-colors border border-slate-200"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
