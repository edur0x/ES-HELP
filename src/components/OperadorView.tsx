import React, { useState, useEffect } from 'react';
import { Chamado, TipoSolicitacao, CategoriaChamado, ChamadoPrioridade } from '../types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import {
  PlusCircle,
  List,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Search,
  Eye,
  FileText,
  Laptop,
  User as UserIcon,
  Tag,
  AlertTriangle,
  Layers,
  Calendar
} from 'lucide-react';

interface OperadorViewProps {
  chamados: Chamado[];
  onCreateChamado: (payload: {
    solicitante: string;
    tipo_solicitacao: string;
    categoria: string;
    prioridade: ChamadoPrioridade;
    equipamento?: string;
    titulo: string;
    descricao_problema: string;
  }) => Promise<Chamado>;
  onSelectChamado: (chamado: Chamado) => void;
  isSubmitting?: boolean;
}

const TIPOS_SOLICITACAO: TipoSolicitacao[] = [
  'Incidente (Falha / Erro)',
  'Requisição de Serviço',
  'Dúvida / Orientação',
  'Acesso / Permissões',
  'Instalação / Configuração'
];

const CATEGORIAS: CategoriaChamado[] = [
  'Hardware (Computadores/Monitores)',
  'Software / Aplicativos',
  'Rede / Internet / Wi-Fi',
  'E-mail / Contas de Acesso',
  'Impressoras & Periféricos',
  'Telefonia / Comunicação',
  'Outros'
];

const PRIORIDADES: ChamadoPrioridade[] = ['Baixa', 'Média', 'Alta', 'Crítica'];

// Quick templates for fast, realistic live demonstration
const QUICK_TEMPLATES = [
  {
    label: '🖨️ Impressora Travada',
    solicitante: 'Mariana Souza (Recursos Humanos)',
    tipo: 'Incidente (Falha / Erro)',
    categoria: 'Impressoras & Periféricos',
    prioridade: 'Média' as ChamadoPrioridade,
    equipamento: 'Impressora HP LaserJet Pro - Sala RH 204',
    titulo: 'Impressora não puxa papel e apresenta luz vermelha piscando',
    descricao: 'A impressora do setor de RH travou durante a impressão da folha de ponto. O display acusa erro de alimentação de papel, porém a bandeja está cheia.'
  },
  {
    label: '🌐 Sem Acesso à Internet',
    solicitante: 'Carlos Eduardo (Contabilidade)',
    tipo: 'Incidente (Falha / Erro)',
    categoria: 'Rede / Internet / Wi-Fi',
    prioridade: 'Alta' as ChamadoPrioridade,
    equipamento: 'Desktop Dell OptiPlex #14',
    titulo: 'Computador sem conexão de rede e acesso ao sistema ERP',
    descricao: 'O computador da mesa 03 perdeu conexão com a rede cabeada após o almoço. O ícone de rede exibe triângulo amarelo de conectividade limitada.'
  },
  {
    label: '💻 Notebook Lento / Travando',
    solicitante: 'Fernanda Lima (Gerência Comercial)',
    tipo: 'Incidente (Falha / Erro)',
    categoria: 'Hardware (Computadores/Monitores)',
    prioridade: 'Crítica' as ChamadoPrioridade,
    equipamento: 'Notebook Lenovo ThinkPad T14',
    titulo: 'Notebook reiniciando sozinho com tela azul frequente',
    descricao: 'Durante apresentações para clientes, o notebook apresentou 3 telas azuis (BSOD) em sequência com superaquecimento na ventoinha.'
  },
  {
    label: '🔑 Solicitação de Acesso VPN',
    solicitante: 'Lucas Martins (Auditoria)',
    tipo: 'Acesso / Permissões',
    categoria: 'E-mail / Contas de Acesso',
    prioridade: 'Baixa' as ChamadoPrioridade,
    equipamento: 'Notebook Corporativo #08',
    titulo: 'Liberação de usuário para VPN de trabalho remoto',
    descricao: 'Solicito a criação e envio do token de acesso seguro VPN para viagens corporativas agendadas para a próxima semana.'
  }
];

export const OperadorView: React.FC<OperadorViewProps> = ({
  chamados,
  onCreateChamado,
  onSelectChamado,
  isSubmitting = false
}) => {
  const [activeTab, setActiveTab] = useState<'abrir' | 'listar'>('abrir');

  // Form states
  const [solicitante, setSolicitante] = useState('');
  const [tipoSolicitacao, setTipoSolicitacao] = useState<string>(TIPOS_SOLICITACAO[0]);
  const [categoria, setCategoria] = useState<string>(CATEGORIAS[0]);
  const [prioridade, setPrioridade] = useState<ChamadoPrioridade>('Média');
  const [equipamento, setEquipamento] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descricaoProblema, setDescricaoProblema] = useState('');

  // Live time for preview
  const [currentTime, setCurrentTime] = useState<string>('');

  // UI state
  const [validationError, setValidationError] = useState<string | null>(null);
  const [lastCreatedTicket, setLastCreatedTicket] = useState<Chamado | null>(null);

  // Search & filter in list
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Aberto' | 'Em Atendimento' | 'Encerrado'>('Todos');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleApplyTemplate = (tmpl: typeof QUICK_TEMPLATES[0]) => {
    setSolicitante(tmpl.solicitante);
    setTipoSolicitacao(tmpl.tipo);
    setCategoria(tmpl.categoria);
    setPrioridade(tmpl.prioridade);
    setEquipamento(tmpl.equipamento);
    setTitulo(tmpl.titulo);
    setDescricaoProblema(tmpl.descricao);
    setValidationError(null);
  };

  const handleClearForm = () => {
    setSolicitante('');
    setTipoSolicitacao(TIPOS_SOLICITACAO[0]);
    setCategoria(CATEGORIAS[0]);
    setPrioridade('Média');
    setEquipamento('');
    setTitulo('');
    setDescricaoProblema('');
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!solicitante.trim()) {
      setValidationError('Por favor, informe o Nome do Solicitante.');
      return;
    }
    if (!titulo.trim()) {
      setValidationError('Por favor, informe o Título do chamado.');
      return;
    }
    if (!descricaoProblema.trim()) {
      setValidationError('Por favor, descreva detalhadamente o problema.');
      return;
    }

    try {
      const created = await onCreateChamado({
        solicitante: solicitante.trim(),
        tipo_solicitacao: tipoSolicitacao,
        categoria,
        prioridade,
        equipamento: equipamento.trim() || 'Não especificado',
        titulo: titulo.trim(),
        descricao_problema: descricaoProblema.trim()
      });

      setLastCreatedTicket(created);
      handleClearForm();
    } catch (err: any) {
      setValidationError(`Falha ao abrir chamado: ${err?.message || 'Tente novamente.'}`);
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

  const totalAbertos = chamados.filter(c => c.status === 'Aberto').length;
  const totalEmAtendimento = chamados.filter(c => c.status === 'Em Atendimento').length;
  const totalEncerrados = chamados.filter(c => c.status === 'Encerrado').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner Navigation & Summary */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-xs border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                Painel do Operador
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Abertura e Acompanhamento de Chamados
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Registre incidentes e requisições de usuários para atendimento pela equipe técnica.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 shrink-0">
            <button
              id="tab-btn-abrir-chamado"
              onClick={() => setActiveTab('abrir')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'abrir'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlusCircle size={15} />
              <span>Abrir Novo Chamado</span>
            </button>
            <button
              id="tab-btn-meus-chamados"
              onClick={() => setActiveTab('listar')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'listar'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List size={15} />
              <span>Lista de Chamados</span>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold">
                {chamados.length}
              </span>
            </button>
          </div>
        </div>

        {/* Counter Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Registrados</span>
            <span className="text-xl font-bold text-slate-800">{chamados.length}</span>
          </div>
          <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">Aguardando (Aberto)</span>
            <span className="text-xl font-bold text-blue-800">{totalAbertos}</span>
          </div>
          <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Em Atendimento</span>
            <span className="text-xl font-bold text-amber-800">{totalEmAtendimento}</span>
          </div>
          <div className="bg-green-50/50 p-3 rounded-lg border border-green-100">
            <span className="text-[11px] font-bold text-green-700 uppercase tracking-wider block">Encerrados</span>
            <span className="text-xl font-bold text-green-800">{totalEncerrados}</span>
          </div>
        </div>
      </div>

      {/* Success banner if ticket was just created */}
      {lastCreatedTicket && (
        <div
          id="alert-chamado-sucesso"
          className="bg-green-50 border border-green-200 p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-green-900 text-sm sm:text-base">
                  Chamado {lastCreatedTicket.id} aberto com sucesso!
                </h4>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-green-200 text-green-800">
                  Status: Aberto
                </span>
              </div>
              <p className="text-xs sm:text-sm text-green-700 mt-0.5">
                Solicitante: <span className="font-semibold">{lastCreatedTicket.solicitante}</span> • Título: <span className="italic">"{lastCreatedTicket.titulo}"</span>
              </p>
              <p className="text-xs text-green-600 mt-0.5">
                Gravado no banco de dados e pronto para atendimento pelo perfil Técnico.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                onSelectChamado(lastCreatedTicket);
              }}
              className="px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold rounded-md transition-colors shadow-xs"
            >
              Ver Detalhes
            </button>
            <button
              onClick={() => {
                setActiveTab('listar');
                setLastCreatedTicket(null);
              }}
              className="px-3 py-1.5 bg-white border border-green-300 text-green-800 hover:bg-green-50 text-xs font-semibold rounded-md transition-colors"
            >
              Ir para Lista
            </button>
            <button
              onClick={() => setLastCreatedTicket(null)}
              className="text-xs text-green-700 hover:text-green-900 px-2 py-1"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: FORMULÁRIO ABRIR CHAMADO */}
      {activeTab === 'abrir' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          
          {/* Header of the Form */}
          <div className="bg-slate-800 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
                <FileText size={16} className="text-indigo-400" />
                Formulário de Abertura de Chamado
              </h3>
              <p className="text-xs text-slate-300">
                Preencha as informações do incidente ou solicitação do usuário.
              </p>
            </div>

            {/* Live Timestamp & Auto-Status */}
            <div className="flex items-center gap-3 text-xs bg-slate-900/60 px-3 py-1.5 rounded-md border border-slate-700">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Calendar size={12} className="text-indigo-400" />
                <span>{currentTime || 'Carregando data...'}</span>
              </div>
              <span className="text-slate-600">|</span>
              <span className="text-blue-300 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                Status: Aberto
              </span>
            </div>
          </div>

          {/* Quick Demo Fill Buttons */}
          <div className="bg-indigo-50/40 border-b border-indigo-100 px-6 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900">
                <Sparkles size={14} className="text-indigo-600" />
                <span>Exemplos Didáticos Rápidos (1-clique para preencher):</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {QUICK_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  id={`btn-template-${idx}`}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="px-2.5 py-1 rounded-md bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-900 border border-indigo-200 text-xs font-medium transition-colors shadow-xs"
                >
                  {tmpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Validation Alert */}
          {validationError && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="text-red-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Form */}
          <form id="form-abrir-chamado" onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Solicitante */}
              <div>
                <label htmlFor="input-solicitante" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Nome do Solicitante <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserIcon size={15} />
                  </div>
                  <input
                    id="input-solicitante"
                    type="text"
                    required
                    value={solicitante}
                    onChange={(e) => setSolicitante(e.target.value)}
                    placeholder="Ex: Ana Paula - Departamento Financeiro"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Equipamento / Dispositivo */}
              <div>
                <label htmlFor="input-equipamento" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Equipamento / Patrimônio <span className="text-slate-400 font-normal">(Opcional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Laptop size={15} />
                  </div>
                  <input
                    id="input-equipamento"
                    type="text"
                    value={equipamento}
                    onChange={(e) => setEquipamento(e.target.value)}
                    placeholder="Ex: Notebook Dell Vostro #04 / Impressora RH"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Tipo de Solicitação */}
              <div>
                <label htmlFor="select-tipo-solicitacao" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Tipo de Solicitação <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Layers size={15} />
                  </div>
                  <select
                    id="select-tipo-solicitacao"
                    value={tipoSolicitacao}
                    onChange={(e) => setTipoSolicitacao(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    {TIPOS_SOLICITACAO.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Categoria */}
              <div>
                <label htmlFor="select-categoria" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Categoria do Chamado <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Tag size={15} />
                  </div>
                  <select
                    id="select-categoria"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    {CATEGORIAS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            {/* Prioridade Picker */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Prioridade do Chamado <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRIORIDADES.map((p) => {
                  const isSelected = prioridade === p;
                  return (
                    <button
                      key={p}
                      id={`btn-prioridade-${p.toLowerCase()}`}
                      type="button"
                      onClick={() => setPrioridade(p)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                        isSelected
                          ? p === 'Crítica'
                            ? 'bg-red-50 border-red-300 text-red-700 shadow-xs'
                            : p === 'Alta'
                            ? 'bg-red-50 border-red-200 text-red-600 shadow-xs'
                            : p === 'Média'
                            ? 'bg-amber-50 border-amber-200 text-amber-800 shadow-xs'
                            : 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <AlertTriangle size={13} className={isSelected ? 'text-inherit' : 'text-slate-400'} />
                      <span>{p}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Título do Chamado */}
            <div>
              <label htmlFor="input-titulo" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Título do Chamado <span className="text-red-500">*</span>
              </label>
              <input
                id="input-titulo"
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Monitor principal piscando e desligando sozinho"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Descrição do Problema */}
            <div>
              <label htmlFor="textarea-descricao" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Descrição Detalhada do Problema <span className="text-red-500">*</span>
              </label>
              <textarea
                id="textarea-descricao"
                rows={4}
                required
                value={descricaoProblema}
                onChange={(e) => setDescricaoProblema(e.target.value)}
                placeholder="Descreva com detalhes o que aconteceu, mensagens de erro apresentadas ou ações realizadas pelo usuário..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={handleClearForm}
                className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors"
              >
                Limpar Formulário
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  id="btn-abrir-chamado-submit"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-xs shadow-indigo-100 disabled:opacity-50"
                >
                  <PlusCircle size={16} />
                  <span>{isSubmitting ? 'Registrando Chamado...' : 'Abrir Chamado'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: LISTA DE CHAMADOS ABERTOS */}
      {activeTab === 'listar' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
          
          {/* Filter and Search Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={15} />
              </div>
              <input
                id="input-search-operador"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por protocolo, solicitante ou título..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Status Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(['Todos', 'Aberto', 'Em Atendimento', 'Encerrado'] as const).map((st) => (
                <button
                  key={st}
                  id={`filter-operador-${st.toLowerCase().replace(' ', '-')}`}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    statusFilter === st
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* List of Tickets */}
          {filteredChamados.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
                <FileText size={22} />
              </div>
              <h4 className="text-base font-bold text-slate-700">Nenhum chamado encontrado</h4>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                {chamados.length === 0
                  ? 'Ainda não há chamados registrados no sistema. Use a aba "Abrir Novo Chamado" para criar o primeiro.'
                  : 'Nenhum chamado corresponde aos filtros pesquisados.'}
              </p>
              {chamados.length === 0 && (
                <button
                  onClick={() => setActiveTab('abrir')}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  <PlusCircle size={15} />
                  <span>Abrir Primeiro Chamado</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <tr>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Protocolo</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Solicitante</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Título</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Prioridade</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredChamados.map((chamado) => (
                    <tr
                      key={chamado.id}
                      id={`chamado-row-${chamado.id}`}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-indigo-600 text-xs">
                        {chamado.id}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900 text-xs sm:text-sm">
                        {chamado.solicitante}
                      </td>
                      <td className="px-4 py-3 text-slate-700 text-xs sm:text-sm max-w-xs truncate">
                        {chamado.titulo}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={chamado.status} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge prioridade={chamado.prioridade} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          id={`btn-view-chamado-${chamado.id}`}
                          onClick={() => onSelectChamado(chamado)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition-colors border border-slate-200"
                        >
                          <Eye size={13} />
                          <span>Detalhes</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
