import React from 'react';
import { BookOpen, UserCheck, ShieldCheck, X } from 'lucide-react';
import { UserProfile } from '../types';

interface DidacticGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserProfile?: UserProfile | null;
  onQuickSwitchRole?: (role: 'operador' | 'tecnico') => void;
}

const FLOW_STEPS = [
  {
    step: 1,
    actor: 'Operador',
    title: 'Login como Operador',
    description: 'Acesse o sistema com as credenciais de operador (login: operador | senha: operador123).',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    step: 2,
    actor: 'Operador',
    title: 'Abrir Novo Chamado',
    description: 'Preencha o solicitante, tipo, categoria, prioridade, título e descrição. O chamado é gravado no Supabase com status "Aberto".',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    step: 3,
    actor: 'Operador',
    title: 'Fazer Logout',
    description: 'Clique no botão "Sair" na barra superior para encerrar a sessão do Operador.',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200'
  },
  {
    step: 4,
    actor: 'Técnico',
    title: 'Login como Técnico',
    description: 'Acesse o sistema com as credenciais de técnico (login: tecnico | senha: tecnico123).',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200'
  },
  {
    step: 5,
    actor: 'Técnico',
    title: 'Visualizar Chamado na Fila',
    description: 'O técnico consulta o painel de chamados pendentes e localiza o chamado recém-aberto pelo operador.',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200'
  },
  {
    step: 6,
    actor: 'Técnico',
    title: 'Iniciar Atendimento',
    description: 'Altera o status do chamado de "Aberto" para "Em Atendimento", assumindo a responsabilidade técnica.',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  {
    step: 7,
    actor: 'Técnico',
    title: 'Descrever Serviço Realizado',
    description: 'Preenche o campo obrigatório "Descrição do serviço realizado" com o diagnóstico e ações executadas.',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200'
  },
  {
    step: 8,
    actor: 'Técnico',
    title: 'Encerrar Chamado',
    description: 'Clica em "Encerrar Chamado". O sistema salva o laudo, registra data/hora de conclusão e muda status para "Encerrado".',
    badgeClass: 'bg-green-100 text-green-800 border-green-200'
  },
  {
    step: 9,
    actor: 'Técnico',
    title: 'Fazer Logout',
    description: 'Clique no botão "Sair" para encerrar a sessão do Técnico.',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200'
  },
  {
    step: 10,
    actor: 'Operador',
    title: 'Operador Consulta Chamado Encerrado',
    description: 'O operador faz login novamente e consulta a lista, confirmando o status "Encerrado" com o laudo do técnico.',
    badgeClass: 'bg-green-100 text-green-800 border-green-200'
  }
];

export const DidacticGuideModal: React.FC<DidacticGuideModalProps> = ({
  isOpen,
  onClose,
  currentUserProfile,
  onQuickSwitchRole
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="modal-didactic-guide"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-xl max-w-3xl w-full shadow-lg border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <BookOpen size={16} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Roteiro Didático de Demonstração (10 Passos)
              </h3>
              <p className="text-xs text-slate-400">
                Fluxo completo: Operador Abre → Técnico Atende → Técnico Encerra → Operador Consulta
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm p-1.5 rounded-md hover:bg-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Quick role jump if available */}
          {onQuickSwitchRole && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs font-semibold text-slate-700">
                Perfil atual: <strong className="text-indigo-700">{currentUserProfile || 'Nenhum (Tela de Login)'}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onQuickSwitchRole('operador');
                    onClose();
                  }}
                  className="px-2.5 py-1 text-xs font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300 rounded-md transition-colors inline-flex items-center gap-1"
                >
                  <UserCheck size={13} />
                  <span>Alternar para Operador</span>
                </button>

                <button
                  onClick={() => {
                    onQuickSwitchRole('tecnico');
                    onClose();
                  }}
                  className="px-2.5 py-1 text-xs font-bold bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-300 rounded-md transition-colors inline-flex items-center gap-1"
                >
                  <ShieldCheck size={13} />
                  <span>Alternar para Técnico</span>
                </button>
              </div>
            </div>
          )}

          {/* 10 Step List */}
          <div className="space-y-3">
            {FLOW_STEPS.map((s) => (
              <div
                key={s.step}
                id={`guide-step-${s.step}`}
                className="p-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-start gap-3.5"
              >
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-300">
                  {s.step}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${s.badgeClass}`}>
                      {s.actor}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {s.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-md transition-colors border border-slate-200"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
