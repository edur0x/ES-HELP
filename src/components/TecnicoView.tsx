import React, { useState } from 'react';
import { Chamado, User } from '../types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { CadastrarTecnicoModal } from './CadastrarTecnicoModal';
import {
  Wrench,
  CheckCircle2,
  Clock,
  PlayCircle,
  Search,
  AlertCircle,
  Sparkles,
  Info,
  UserPlus,
  MessageSquare
} from 'lucide-react';

interface TecnicoViewProps {
  user: User;
  chamados: Chamado[];
  onUpdateStatusEmAtendimento: (id: string, tecnicoNome: string) => Promise<Chamado | null>;
  onEncerrarChamado: (id: string, descricaoServico: string, tecnicoNome: string) => Promise<Chamado | null>;
  onSelectChamado: (chamado: Chamado) => void;
  onOpenChat?: (chamadoId: string) => void;
  isProcessing?: boolean;
}

const QUICK_RESOLUTIONS = [
  'Realizada a substituição do cartucho de toner e limpeza do rolete de tração de papel. Teste de impressão realizado com sucesso.',
  'Identificado cabo de rede desconectado no patch panel. Reconectado na porta do switch e redefinido IP via DHCP.',
  'Diagnóstico de falha na memória RAM. Realizada a substituição do módulo DDR4 e teste de estresse térmico.',
  'Usuário cadastrado no grupo de segurança VPN do Active Directory e geradas credenciais com 2FA.',
  'Executada limpeza de temporários, atualização de drivers e antivírus corporativo. Problema sanado.'
];

export const TecnicoView: React.FC<TecnicoViewProps> = ({
  user,
  chamados,
  onUpdateStatusEmAtendimento,
  onEncerrarChamado,
  onOpenChat,
  isProcessing = false
}) => {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    chamados.length > 0 ? chamados[0].id : null
  );
  const [descricaoServico, setDescricaoServico] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Aberto' | 'Em Atendimento' | 'Encerrado'>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isCadastrarTecnicoOpen, setIsCadastrarTecnicoOpen] = useState(false);

  const selectedTicket = chamados.find(c => c.id === selectedTicketId) || chamados[0] || null;

  const handleSelectTicket = (chamado: Chamado) => {
    setSelectedTicketId(chamado.id);
    setDescricaoServico(chamado.descricao_servico || '');
    setActionError(null);
    setActionSuccess(null);
  };

  const handleIniciarAtendimento = async (chamado: Chamado) => {
    setActionError(null);
    try {
      const updated = await onUpdateStatusEmAtendimento(chamado.id, user.nome);
      if (updated) {
        setActionSuccess(`Chamado ${updated.id} colocado Em Atendimento!`);
      }
    } catch (err: any) {
      setActionError(`Erro ao iniciar atendimento: ${err?.message || 'Falha ao atualizar'}`);
    }
  };

  const handleEncerrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    if (!descricaoServico.trim()) {
      setActionError('Por favor, preencha a "Descrição do serviço realizado" antes de encerrar o chamado.');
      return;
    }

    setActionError(null);
    try {
      const updated = await onEncerrarChamado(
        selectedTicket.id,
        descricaoServico.trim(),
        user.nome
      );
      if (updated) {
        setActionSuccess(`Chamado ${updated.id} encerrado com sucesso! Dados sincronizados no Supabase.`);
      }
    } catch (err: any) {
      setActionError(`Erro ao encerrar chamado: ${err?.message || 'Falha ao gravar encerramento'}`);
    }
  };

  const filteredChamados = chamados.filter((ch) => {
    const matchesSearch =
      ch.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ch.solicitante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ch.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ch.categoria.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'Todos' || ch.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAtivos = chamados.filter(c => c.status !== 'Encerrado').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Filter Summary */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              Painel do Técnico
            </span>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <span>Fila de Chamados</span>
              <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {totalAtivos} Ativos
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Selecione um chamado da fila para iniciar o atendimento ou emitir o laudo técnico de encerramento.
          </p>
        </div>

        {/* Action button to create new technicians & Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Button to open technician registration modal */}
          <button
            id="btn-open-cadastrar-tecnico"
            type="button"
            onClick={() => setIsCadastrarTecnicoOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 shadow-xs transition-colors"
          >
            <UserPlus size={14} />
            <span>Cadastrar Novo Técnico</span>
          </button>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-xs">
            {(['Todos', 'Aberto', 'Em Atendimento', 'Encerrado'] as const).map((st) => (
              <button
                key={st}
                id={`filter-tecnico-${st.toLowerCase().replace(' ', '-')}`}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid matching the "Professional Polish" layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Tickets Table */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Search bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={15} />
            </div>
            <input
              id="input-search-tecnico"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por protocolo, solicitante ou problema..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-xs"
            />
          </div>

          {/* Table Card */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
            {filteredChamados.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-2">
                  <Wrench size={20} />
                </div>
                <h4 className="text-sm font-bold text-slate-700">Nenhum chamado encontrado</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {chamados.length === 0
                    ? 'Ainda não há chamados registrados. Acesse com o perfil Usuário para abrir o primeiro chamado.'
                    : 'Nenhum chamado corresponde aos filtros atuais.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <tr>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">ID</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Solicitante</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Título</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Prioridade</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-right">Chat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredChamados.map((chamado) => {
                      const isCurrentSelected = selectedTicket?.id === chamado.id;
                      return (
                        <tr
                          key={chamado.id}
                          id={`tecnico-row-${chamado.id}`}
                          onClick={() => handleSelectTicket(chamado)}
                          className={`cursor-pointer transition-colors ${
                            isCurrentSelected
                              ? 'bg-indigo-50/40 border-l-4 border-indigo-500'
                              : 'hover:bg-slate-50'
                          } ${chamado.status === 'Encerrado' ? 'opacity-65' : ''}`}
                        >
                          <td className="px-4 py-3 font-mono font-bold text-indigo-600 text-xs whitespace-nowrap">
                            {chamado.id}
                          </td>
                          <td className="px-4 py-3 text-xs font-medium text-slate-900 whitespace-nowrap">
                            {chamado.solicitante}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-700 font-medium max-w-[200px] truncate">
                            {chamado.titulo}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <StatusBadge status={chamado.status} size="sm" />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <PriorityBadge prioridade={chamado.prioridade} />
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            {onOpenChat && (
                              <button
                                id={`btn-tecnico-chat-row-${chamado.id}`}
                                onClick={() => onOpenChat(chamado.id)}
                                title="Abrir chat online com o solicitante"
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-md border border-indigo-200 transition-colors"
                              >
                                <MessageSquare size={13} />
                                <span className="hidden xl:inline">Chat</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Attendance & Resolution Card */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {selectedTicket ? (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
              
              {/* Header Box (Dark Slate Archetype) */}
              <div className="bg-slate-800 text-white p-5">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    {selectedTicket.status === 'Encerrado' ? 'Chamado Encerrado' : 'Atendimento Atual'}
                  </span>
                  <span className="text-slate-400 text-xs">
                    {new Date(selectedTicket.data_abertura).toLocaleString('pt-BR')}
                  </span>
                </div>
                <h3 className="text-lg font-bold">Chamado {selectedTicket.id}</h3>
                <p className="text-slate-300 text-sm mt-0.5">
                  Solicitante: <span className="font-semibold text-white">{selectedTicket.solicitante}</span>
                </p>
                {selectedTicket.tecnico_responsavel && (
                  <p className="text-slate-400 text-xs mt-0.5">
                    Técnico: <span className="text-indigo-300 font-medium">{selectedTicket.tecnico_responsavel}</span>
                  </p>
                )}
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col gap-4 bg-white">
                
                {/* Chat Online Action Banner */}
                {onOpenChat && (
                  <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-lg flex items-center justify-between gap-2 text-xs text-indigo-900">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-indigo-600 text-white shrink-0">
                        <MessageSquare size={15} />
                      </div>
                      <div>
                        <span className="font-bold block">Chat Online com Solicitante</span>
                        <span className="text-[11px] text-indigo-700">Tire dúvidas e solicite prints ou fotos</span>
                      </div>
                    </div>

                    <button
                      id="btn-tecnico-card-open-chat"
                      type="button"
                      onClick={() => onOpenChat(selectedTicket.id)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-md transition-colors shadow-2xs shrink-0 flex items-center gap-1.5"
                    >
                      <MessageSquare size={13} />
                      <span>Abrir Chat</span>
                    </button>
                  </div>
                )}

                {/* Alerts */}
                {actionSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-xs flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                    <span>{actionSuccess}</span>
                  </div>
                )}
                {actionError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-600 shrink-0" />
                    <span>{actionError}</span>
                  </div>
                )}

                {/* Problem Description */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1 tracking-wider">
                    Descrição do Problema
                  </label>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200 italic">
                    "{selectedTicket.descricao_problema}"
                  </p>
                </div>

                {/* Category & Priority Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                      Categoria
                    </label>
                    <div className="text-xs font-medium border border-slate-200 p-2 rounded-md bg-slate-50 text-slate-800 truncate">
                      {selectedTicket.categoria}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                      Prioridade
                    </label>
                    <div className="text-xs font-bold border border-slate-200 p-2 rounded-md bg-slate-50 text-slate-800">
                      {selectedTicket.prioridade}
                    </div>
                  </div>
                </div>

                {/* Equipment (if exists) */}
                {selectedTicket.equipamento && selectedTicket.equipamento !== 'N/A' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                      Equipamento
                    </label>
                    <div className="text-xs font-medium border border-slate-200 p-2 rounded-md bg-slate-50 text-slate-800">
                      {selectedTicket.equipamento}
                    </div>
                  </div>
                )}

                {/* Action Area: Description of Service & Buttons */}
                {selectedTicket.status !== 'Encerrado' ? (
                  <form onSubmit={handleEncerrar} className="space-y-3 mt-auto">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="textarea-servico" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          Descrição do Serviço Realizado <span className="text-red-500">*</span>
                        </label>
                      </div>

                      {/* Quick snippet templates */}
                      <div className="mb-2">
                        <span className="text-[10px] font-semibold text-indigo-700 flex items-center gap-1 mb-1">
                          <Sparkles size={11} className="text-indigo-600" />
                          Preenchimento rápido de laudo:
                        </span>
                        <div className="space-y-1">
                          {QUICK_RESOLUTIONS.slice(0, 2).map((res, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setDescricaoServico(res)}
                              className="text-left w-full text-[10px] p-1.5 rounded bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 transition-colors line-clamp-1"
                            >
                              • {res}
                            </button>
                          ))}
                        </div>
                      </div>

                      <textarea
                        id="textarea-servico"
                        rows={3}
                        value={descricaoServico}
                        onChange={(e) => setDescricaoServico(e.target.value)}
                        placeholder="Descreva as ações tomadas para resolver o problema..."
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none bg-slate-50/50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <button
                        id="btn-iniciar-atendimento-card"
                        type="button"
                        onClick={() => handleIniciarAtendimento(selectedTicket)}
                        disabled={isProcessing || selectedTicket.status === 'Em Atendimento'}
                        className={`font-bold py-2.5 rounded-lg text-xs transition-colors border ${
                          selectedTicket.status === 'Em Atendimento'
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                            : 'bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-200'
                        }`}
                      >
                        {selectedTicket.status === 'Em Atendimento' ? 'Em Atendimento' : 'Iniciar Atendimento'}
                      </button>

                      <button
                        id="btn-encerrar-chamado-card"
                        type="submit"
                        disabled={isProcessing}
                        className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-2.5 rounded-lg text-xs shadow-xs shadow-indigo-100 transition-colors"
                      >
                        {isProcessing ? 'Gravando...' : 'Encerrar Chamado'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-green-50/60 border border-green-200 p-3.5 rounded-lg space-y-2">
                    <div className="flex items-center gap-1.5 text-green-800 text-xs font-bold">
                      <CheckCircle2 size={14} className="text-green-600" />
                      <span>Chamado Encerrado</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase block">
                        Laudo Técnico Registrado:
                      </span>
                      <p className="text-xs text-slate-800 italic mt-0.5">
                        "{selectedTicket.descricao_servico}"
                      </p>
                    </div>
                    {selectedTicket.data_encerramento && (
                      <div className="text-[10px] text-green-700 pt-1 border-t border-green-200">
                        Encerrado em: {new Date(selectedTicket.data_encerramento).toLocaleString('pt-BR')}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
              Selecione um chamado na tabela para visualizar detalhes.
            </div>
          )}

          {/* Didactic Tip Box matching Design reference */}
          <div className="bg-indigo-900 rounded-xl p-5 text-white flex items-center gap-4 relative overflow-hidden shadow-xs">
            <div className="flex-1 relative z-10">
              <p className="text-xs text-indigo-300 font-semibold mb-1">Dica Didática</p>
              <p className="text-xs leading-relaxed text-slate-100">
                Ao clicar em <strong>Iniciar Atendimento</strong>, o status é gravado no banco como <em>Em Atendimento</em>. Em seguida, digite o laudo e clique em <strong>Encerrar Chamado</strong> para finalizar o ciclo.
              </p>
            </div>
            <div className="bg-white/10 p-2.5 rounded-full relative z-10 shrink-0">
              <Info className="w-5 h-5 text-white" />
            </div>
          </div>

        </div>

      </div>

      {/* Cadastrar Técnico Modal */}
      <CadastrarTecnicoModal
        isOpen={isCadastrarTecnicoOpen}
        onClose={() => setIsCadastrarTecnicoOpen(false)}
        onCreated={(newTecnico) => {
          setActionSuccess(`Novo técnico "${newTecnico.nome}" cadastrado com sucesso!`);
        }}
      />

    </div>
  );
};

