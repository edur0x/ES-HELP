import React, { useState, useEffect } from 'react';
import { Chamado, ChamadoPrioridade, User, ModeloFrequente, InventarioItem } from '../types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { ConfigOpcoesService } from '../services/configOpcoesService';
import { InventarioService } from '../services/inventarioService';
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
  Calendar,
  MessageSquare,
  Plus,
  Trash2,
  X,
  Zap,
  Bookmark
} from 'lucide-react';

interface OperadorViewProps {
  currentUser: User;
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
  onOpenChat?: (chamadoId: string) => void;
  isSubmitting?: boolean;
  initialEquipamento?: string;
}

const PRIORIDADES: ChamadoPrioridade[] = ['Baixa', 'Média', 'Alta', 'Crítica'];

export const OperadorView: React.FC<OperadorViewProps> = ({
  currentUser,
  chamados,
  onCreateChamado,
  onSelectChamado,
  onOpenChat,
  isSubmitting = false,
  initialEquipamento = ''
}) => {
  // STRICT ACCESS: Equipamento/patrimônio is only visible for Administrador and Técnico
  const isUsuarioComum = currentUser?.perfil === 'Usuário' || currentUser?.perfil === 'Operador';
  const canViewEquipamento = currentUser?.perfil === 'Administrador' || currentUser?.perfil === 'Técnico';

  // Dynamic options loaded from ConfigOpcoesService
  const [tiposSolicitacao, setTiposSolicitacao] = useState<string[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [modelosFrequentes, setModelosFrequentes] = useState<ModeloFrequente[]>([]);
  const [inventarioEquipamentos, setInventarioEquipamentos] = useState<InventarioItem[]>([]);

  // Form states
  const [solicitante, setSolicitante] = useState(currentUser?.nome || currentUser?.login || '');
  const [tipoSolicitacao, setTipoSolicitacao] = useState<string>('');
  const [categoria, setCategoria] = useState<string>('');
  const [prioridade, setPrioridade] = useState<ChamadoPrioridade>('Média');
  const [equipamento, setEquipamento] = useState(canViewEquipamento ? initialEquipamento : '');
  const [titulo, setTitulo] = useState('');
  const [descricaoProblema, setDescricaoProblema] = useState('');

  // Modals for adding/deleting dynamic options
  const [isAddTipoModalOpen, setIsAddTipoModalOpen] = useState(false);
  const [novoTipoInput, setNovoTipoInput] = useState('');
  
  const [isAddCategoriaModalOpen, setIsAddCategoriaModalOpen] = useState(false);
  const [novaCategoriaInput, setNovaCategoriaInput] = useState('');

  const [isAddModeloModalOpen, setIsAddModeloModalOpen] = useState(false);
  const [novoModeloTitulo, setNovoModeloTitulo] = useState('');
  const [novoModeloTipo, setNovoModeloTipo] = useState('');
  const [novoModeloCategoria, setNovoModeloCategoria] = useState('');
  const [novoModeloPrioridade, setNovoModeloPrioridade] = useState<ChamadoPrioridade>('Média');
  const [novoModeloDescricao, setNovoModeloDescricao] = useState('');
  const [novoModeloEquipamento, setNovoModeloEquipamento] = useState('');

  // Feedback states
  const [successChamado, setSuccessChamado] = useState<Chamado | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [optionActionMsg, setOptionActionMsg] = useState<string | null>(null);

  // Search & filter for ticket list
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Aberto' | 'Em Atendimento' | 'Encerrado'>('Todos');

  // Load dynamic options
  const carregarOpcoes = () => {
    const tipos = ConfigOpcoesService.getTipos();
    const cats = ConfigOpcoesService.getCategorias();
    const mods = ConfigOpcoesService.getModelos();

    setTiposSolicitacao(tipos);
    setCategorias(cats);
    setModelosFrequentes(mods);

    if (tipos.length > 0 && !tipoSolicitacao) setTipoSolicitacao(tipos[0]);
    if (cats.length > 0 && !categoria) setCategoria(cats[0]);
  };

  useEffect(() => {
    carregarOpcoes();
    if (canViewEquipamento) {
      setInventarioEquipamentos(InventarioService.getItens());
    }
  }, [canViewEquipamento]);

  useEffect(() => {
    if (canViewEquipamento && initialEquipamento) {
      setEquipamento(initialEquipamento);
    }
  }, [initialEquipamento, canViewEquipamento]);

  // Update solicitante if currentUser changes
  useEffect(() => {
    if (currentUser?.nome) {
      setSolicitante(currentUser.nome);
    }
  }, [currentUser]);

  // Handle adding new Tipo de Solicitação
  const handleAddTipo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTipoInput.trim()) return;
    const res = ConfigOpcoesService.addTipo(novoTipoInput.trim());
    if (res.success) {
      setTiposSolicitacao(res.list);
      setTipoSolicitacao(novoTipoInput.trim());
      setNovoTipoInput('');
      setIsAddTipoModalOpen(false);
      setOptionActionMsg(`Tipo de solicitação adicionado com sucesso!`);
      setTimeout(() => setOptionActionMsg(null), 3000);
    } else {
      setErrorMsg(res.error || 'Erro ao adicionar tipo.');
    }
  };

  // Handle deleting current Tipo de Solicitação
  const handleDeleteCurrentTipo = () => {
    if (!tipoSolicitacao) return;
    if (!window.confirm(`Deseja realmente excluir o tipo de solicitação "${tipoSolicitacao}"?`)) return;
    const res = ConfigOpcoesService.deleteTipo(tipoSolicitacao);
    if (res.success) {
      setTiposSolicitacao(res.list);
      setTipoSolicitacao(res.list[0] || '');
      setOptionActionMsg(`Tipo removido.`);
      setTimeout(() => setOptionActionMsg(null), 3000);
    } else {
      setErrorMsg(res.error || 'Não foi possível excluir.');
    }
  };

  // Handle adding new Categoria
  const handleAddCategoria = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaCategoriaInput.trim()) return;
    const res = ConfigOpcoesService.addCategoria(novaCategoriaInput.trim());
    if (res.success) {
      setCategorias(res.list);
      setCategoria(novaCategoriaInput.trim());
      setNovaCategoriaInput('');
      setIsAddCategoriaModalOpen(false);
      setOptionActionMsg(`Categoria adicionada com sucesso!`);
      setTimeout(() => setOptionActionMsg(null), 3000);
    } else {
      setErrorMsg(res.error || 'Erro ao adicionar categoria.');
    }
  };

  // Handle deleting current Categoria
  const handleDeleteCurrentCategoria = () => {
    if (!categoria) return;
    if (!window.confirm(`Deseja realmente excluir a categoria "${categoria}"?`)) return;
    const res = ConfigOpcoesService.deleteCategoria(categoria);
    if (res.success) {
      setCategorias(res.list);
      setCategoria(res.list[0] || '');
      setOptionActionMsg(`Categoria removida.`);
      setTimeout(() => setOptionActionMsg(null), 3000);
    } else {
      setErrorMsg(res.error || 'Não foi possível excluir.');
    }
  };

  // Handle adding new Modelo Frequente
  const handleAddModelo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoModeloTitulo.trim() || !novoModeloDescricao.trim()) return;
    const res = ConfigOpcoesService.addModelo({
      titulo: novoModeloTitulo.trim(),
      tipo_solicitacao: novoModeloTipo || tiposSolicitacao[0],
      categoria: novoModeloCategoria || categorias[0],
      prioridade: novoModeloPrioridade,
      equipamento_sugerido: novoModeloEquipamento.trim() || undefined,
      descricao_padrao: novoModeloDescricao.trim()
    });

    if (res.success) {
      setModelosFrequentes(res.list);
      setNovoModeloTitulo('');
      setNovoModeloDescricao('');
      setNovoModeloEquipamento('');
      setIsAddModeloModalOpen(false);
      setOptionActionMsg(`Modelo frequente cadastrado com sucesso!`);
      setTimeout(() => setOptionActionMsg(null), 3000);
    } else {
      setErrorMsg(res.error || 'Erro ao adicionar modelo.');
    }
  };

  // Handle deleting a Modelo Frequente
  const handleDeleteModelo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Deseja excluir este modelo frequente de solicitação?')) return;
    const res = ConfigOpcoesService.deleteModelo(id);
    if (res.success) {
      setModelosFrequentes(res.list);
      setOptionActionMsg(`Modelo frequente removido.`);
      setTimeout(() => setOptionActionMsg(null), 3000);
    } else {
      setErrorMsg(res.error || 'Não foi possível remover o modelo.');
    }
  };

  // Apply Frequent Model Template to Form
  const applyTemplate = (m: ModeloFrequente) => {
    setTipoSolicitacao(m.tipo_solicitacao);
    setCategoria(m.categoria);
    setPrioridade(m.prioridade);
    setTitulo(m.titulo);
    setDescricaoProblema(m.descricao_padrao);
    if (canViewEquipamento && m.equipamento_sugerido) {
      setEquipamento(m.equipamento_sugerido);
    } else {
      setEquipamento('');
    }
    setOptionActionMsg(`Modelo "${m.titulo}" aplicado ao formulário!`);
    setTimeout(() => setOptionActionMsg(null), 3000);
  };

  // Handle Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessChamado(null);

    if (!titulo.trim() || !descricaoProblema.trim()) {
      setErrorMsg('Título do chamado e descrição detalhada do problema são obrigatórios.');
      return;
    }

    try {
      const novo = await onCreateChamado({
        solicitante: solicitante.trim() || currentUser.nome,
        tipo_solicitacao: tipoSolicitacao || tiposSolicitacao[0],
        categoria: categoria || categorias[0],
        prioridade,
        equipamento: canViewEquipamento ? (equipamento.trim() || undefined) : undefined,
        titulo: titulo.trim(),
        descricao_problema: descricaoProblema.trim()
      });

      setSuccessChamado(novo);
      setTitulo('');
      setDescricaoProblema('');
      setEquipamento('');
    } catch (err: any) {
      setErrorMsg(`Erro ao registrar chamado: ${err?.message || 'Falha de comunicação'}`);
    }
  };

  // STRICT ACCESS ISOLATION:
  // "um perfil de Usuario onde o usuário possa abrir chamados e ao abrir chamado poder conversar no chatonline em tempo real e cada usuário tenha acessa apenas ao ambiente do sua acesso"
  // For 'Usuário' profile, filter chamados strictly to tickets requested by this user!
  const safeChamados = Array.isArray(chamados) ? chamados : [];
  const userNomeLower = (currentUser?.nome || '').toLowerCase();
  const userLoginLower = (currentUser?.login || '').toLowerCase();

  const meusChamados = safeChamados.filter(c => {
    if (!c) return false;
    if (!isUsuarioComum) return true; // Admin sees all
    const solicitanteLower = (c.solicitante || '').toLowerCase();

    return (userNomeLower && (solicitanteLower.includes(userNomeLower) || userNomeLower.includes(solicitanteLower))) ||
           (userLoginLower && solicitanteLower.includes(userLoginLower)) ||
           (!userNomeLower && !userLoginLower);
  });

  const chamadosFiltrados = meusChamados.filter((c) => {
    if (!c) return false;
    const matchesStatus = statusFilter === 'Todos' || c.status === statusFilter;
    const searchLower = (searchTerm || '').toLowerCase();
    const matchesSearch =
      (c.id || '').toLowerCase().includes(searchLower) ||
      (c.titulo || '').toLowerCase().includes(searchLower) ||
      (c.categoria || '').toLowerCase().includes(searchLower) ||
      (c.solicitante || '').toLowerCase().includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* ============================================================== */}
      {/* COLUNA ESQUERDA: FORMULÁRIO DE ABERTURA DE CHAMADO             */}
      {/* ============================================================== */}
      <div className="lg:col-span-5 bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        
        {/* Header do Formulário */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <PlusCircle size={22} />
              </div>
              <div>
                <h2 className="font-bold text-base text-white">Abertura de Chamado TI</h2>
                <p className="text-xs text-slate-300">
                  {isUsuarioComum ? 'Suporte ao Usuário Corporativo' : 'Central de Requisições'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Feedback Notifications */}
        {optionActionMsg && (
          <div className="m-4 p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 text-xs flex items-center gap-2">
            <CheckCircle size={15} className="text-indigo-600 shrink-0" />
            <span>{optionActionMsg}</span>
          </div>
        )}

        {/* Success Alert with Online Chat Quick Action */}
        {successChamado && (
          <div className="m-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <CheckCircle size={16} className="text-emerald-600 shrink-0" />
              <span>Chamado registrado com sucesso! Protocolo: {successChamado.id}</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Sua solicitação já está na fila de atendimento da equipe de TI. Você pode acompanhar o status ou iniciar uma conversa online em tempo real.
            </p>
            {onOpenChat && (
              <button
                type="button"
                onClick={() => onOpenChat(successChamado.id)}
                className="mt-1 inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs"
              >
                <MessageSquare size={14} />
                <span>Conversar no Chat Online agora</span>
              </button>
            )}
          </div>
        )}

        {errorMsg && (
          <div className="m-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* ============================================================== */}
          {/* SEÇÃO: MODELOS FREQUENTES DE SOLICITAÇÃO                       */}
          {/* (Com botão para adicionar mais itens e excluir item)          */}
          {/* ============================================================== */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Bookmark size={14} className="text-indigo-600" />
                <span>Modelos Frequentes de Solicitação ({modelosFrequentes.length})</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNovoModeloTipo(tiposSolicitacao[0] || '');
                  setNovoModeloCategoria(categorias[0] || '');
                  setIsAddModeloModalOpen(true);
                }}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-white px-2 py-0.5 rounded border border-indigo-200"
                title="Adicionar novo modelo frequente"
              >
                <Plus size={12} />
                <span>Novo Modelo</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 mb-2">
              Clique em um modelo para preencher o chamado instantaneamente:
            </p>

            <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
              {modelosFrequentes.map((m) => (
                <div
                  key={m.id}
                  onClick={() => applyTemplate(m)}
                  className="group cursor-pointer p-2 bg-white rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition-all flex items-center justify-between text-xs"
                >
                  <div className="truncate mr-2">
                    <span className="font-semibold text-slate-800 group-hover:text-indigo-900 block truncate">
                      {m.titulo}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {m.tipo_solicitacao} · {m.prioridade}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteModelo(m.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                    title="Excluir este modelo"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Solicitante */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nome do Solicitante <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <UserIcon size={15} />
              </div>
              <input
                type="text"
                required
                value={solicitante}
                onChange={(e) => setSolicitante(e.target.value)}
                placeholder="Ex: Mariana Souza (Recursos Humanos)"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* ============================================================== */}
          {/* TIPO DE SOLICITAÇÃO (COM BOTÕES PARA ADICIONAR E EXCLUIR ITEM) */}
          {/* ============================================================== */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tipo de Solicitação <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsAddTipoModalOpen(true)}
                  className="p-1 text-indigo-600 hover:bg-indigo-50 rounded text-xs flex items-center gap-1 font-semibold"
                  title="Adicionar mais itens ao Tipo de Solicitação"
                >
                  <Plus size={13} />
                  <span className="text-[10px]">Adicionar Tipo</span>
                </button>
                {tiposSolicitacao.length > 1 && (
                  <button
                    type="button"
                    onClick={handleDeleteCurrentTipo}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded text-xs"
                    title={`Excluir tipo selecionado: "${tipoSolicitacao}"`}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>

            <select
              value={tipoSolicitacao}
              onChange={(e) => setTipoSolicitacao(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {tiposSolicitacao.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* ============================================================== */}
          {/* CATEGORIA (COM BOTÕES PARA ADICIONAR E EXCLUIR ITEM)          */}
          {/* ============================================================== */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Categoria do Problema <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsAddCategoriaModalOpen(true)}
                  className="p-1 text-indigo-600 hover:bg-indigo-50 rounded text-xs flex items-center gap-1 font-semibold"
                  title="Adicionar mais itens à Categoria"
                >
                  <Plus size={13} />
                  <span className="text-[10px]">Adicionar Categoria</span>
                </button>
                {categorias.length > 1 && (
                  <button
                    type="button"
                    onClick={handleDeleteCurrentCategoria}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded text-xs"
                    title={`Excluir categoria selecionada: "${categoria}"`}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>

            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categorias.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Prioridade e Equipamento */}
          <div className={canViewEquipamento ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "grid grid-cols-1 gap-3"}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Prioridade Estimada
              </label>
              <select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as ChamadoPrioridade)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {PRIORIDADES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {canViewEquipamento && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Equipamento / Patrimônio
                  </label>
                  <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-medium border border-indigo-100">
                    Controle de Ativos TI
                  </span>
                </div>
                <input
                  type="text"
                  list="patrimonios-cadastrados-sugestoes"
                  value={equipamento}
                  onChange={(e) => setEquipamento(e.target.value)}
                  placeholder="Ex: NOTE-001, DESK-014 ou selecione do inventário"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {inventarioEquipamentos.length > 0 && (
                  <datalist id="patrimonios-cadastrados-sugestoes">
                    {inventarioEquipamentos.map(item => (
                      <option key={item.id} value={item.patrimonio}>
                        {item.nome} ({item.tipo} - {item.setor || 'Geral'})
                      </option>
                    ))}
                  </datalist>
                )}
                <p className="text-[10px] text-slate-500 mt-1">
                  Visível apenas para Administradores e Técnicos para controle patrimonial.
                </p>
              </div>
            )}
          </div>

          {/* Título do Chamado */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Título Resumido do Chamado <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Monitor secundário piscando e perdendo sinal HDMI"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Descrição Detalhada */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Descrição Detalhada do Problema <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={descricaoProblema}
              onChange={(e) => setDescricaoProblema(e.target.value)}
              placeholder="Descreva o que ocorreu, mensagens de erro exibidas e quando o problema iniciou..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          {/* Botão de Envio */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
          >
            <PlusCircle size={16} />
            <span>{isSubmitting ? 'Registrando Chamado...' : 'Abrir Chamado de TI'}</span>
          </button>

        </form>

      </div>

      {/* ============================================================== */}
      {/* COLUNA DIREITA: MEUS CHAMADOS (ISOLAMENTO DE AMBIENTE)         */}
      {/* ============================================================== */}
      <div className="lg:col-span-7 space-y-4">
        
        {/* Header da Lista de Chamados do Usuário */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <List size={17} className="text-indigo-600" />
              <span>{isUsuarioComum ? 'Meus Chamados Solicitados' : 'Fila Geral de Chamados'}</span>
              <span className="text-xs text-slate-400 font-normal">({chamadosFiltrados.length})</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isUsuarioComum
                ? 'Você tem acesso exclusivo aos seus chamados abertos e histórico de atendimento'
                : 'Visão completa dos chamados corporativos'}
            </p>
          </div>

          {/* Chat Online Launcher */}
          {onOpenChat && (
            <button
              onClick={() => onOpenChat('geral')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-bold transition-colors"
            >
              <MessageSquare size={14} />
              <span>Chat de Suporte Online</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por protocolo, título ou categoria..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            {(['Todos', 'Aberto', 'Em Atendimento', 'Encerrado'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets Cards List */}
        <div className="space-y-3">
          {chamadosFiltrados.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">Nenhum chamado encontrado</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isUsuarioComum
                  ? 'Você não possui chamados abertos nesta condição. Use o formulário à esquerda para solicitar suporte.'
                  : 'Fila limpa no momento.'}
              </p>
            </div>
          ) : (
            chamadosFiltrados.map((ch) => (
              <div
                key={ch.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-all space-y-2.5"
              >
                {/* Header do Card */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {ch.id}
                      </span>
                      <StatusBadge status={ch.status} />
                      <PriorityBadge priority={ch.prioridade} />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 mt-1">
                      {ch.titulo}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {onOpenChat && (
                      <button
                        onClick={() => onOpenChat(ch.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
                        title="Abrir chat online em tempo real deste chamado"
                      >
                        <MessageSquare size={13} />
                        <span className="hidden sm:inline">Chat</span>
                      </button>
                    )}

                    <button
                      onClick={() => onSelectChamado(ch)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <Eye size={13} />
                      <span>Detalhes</span>
                    </button>
                  </div>
                </div>

                {/* Problem description preview */}
                <p className="text-xs text-slate-600 line-clamp-2">
                  {ch.descricao_problema}
                </p>

                {/* Unboxed Metadata (Frontend design guidelines) */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                  <span>Categoria: <strong className="text-slate-700">{ch.categoria}</strong></span>
                  <span aria-hidden="true">·</span>
                  <span>Tipo: <strong className="text-slate-700">{ch.tipo_solicitacao}</strong></span>
                  {canViewEquipamento && ch.equipamento && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>Equipamento: <strong className="text-slate-700">{ch.equipamento}</strong></span>
                    </>
                  )}
                  {ch.tecnico_responsavel && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>Técnico: <strong className="text-indigo-700">{ch.tecnico_responsavel}</strong></span>
                    </>
                  )}
                </div>

              </div>
            ))
          )}
        </div>

      </div>

      {/* ============================================================== */}
      {/* MODAL: ADICIONAR TIPO DE SOLICITAÇÃO                           */}
      {/* ============================================================== */}
      {isAddTipoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full border border-slate-200 shadow-2xl">
            <h3 className="font-bold text-sm text-slate-900 mb-1">Adicionar Tipo de Solicitação</h3>
            <p className="text-xs text-slate-500 mb-3">
              Informe o novo tipo para disponibilizar no menu de chamados:
            </p>

            <form onSubmit={handleAddTipo} className="space-y-3">
              <input
                type="text"
                required
                value={novoTipoInput}
                onChange={(e) => setNovoTipoInput(e.target.value)}
                placeholder="Ex: Treinamento / Capacitação"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTipoModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  Adicionar Tipo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADICIONAR CATEGORIA                                    */}
      {/* ============================================================== */}
      {isAddCategoriaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full border border-slate-200 shadow-2xl">
            <h3 className="font-bold text-sm text-slate-900 mb-1">Adicionar Categoria de Chamado</h3>
            <p className="text-xs text-slate-500 mb-3">
              Informe a nova categoria para classificar as solicitações:
            </p>

            <form onSubmit={handleAddCategoria} className="space-y-3">
              <input
                type="text"
                required
                value={novaCategoriaInput}
                onChange={(e) => setNovaCategoriaInput(e.target.value)}
                placeholder="Ex: Banco de Dados / Relatórios"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCategoriaModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  Adicionar Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADICIONAR MODELO FREQUENTE                              */}
      {/* ============================================================== */}
      {isAddModeloModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full border border-slate-200 shadow-2xl">
            <h3 className="font-bold text-sm text-slate-900 mb-1">Criar Novo Modelo Frequente</h3>
            <p className="text-xs text-slate-500 mb-3">
              Configure um modelo rápido para facilitar a abertura de chamados repetitivos:
            </p>

            <form onSubmit={handleAddModelo} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Título do Modelo *</label>
                <input
                  type="text"
                  required
                  value={novoModeloTitulo}
                  onChange={(e) => setNovoModeloTitulo(e.target.value)}
                  placeholder="Ex: Troca de mouse ou teclado quebrado"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo</label>
                  <select
                    value={novoModeloTipo}
                    onChange={(e) => setNovoModeloTipo(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {tiposSolicitacao.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prioridade</label>
                  <select
                    value={novoModeloPrioridade}
                    onChange={(e) => setNovoModeloPrioridade(e.target.value as ChamadoPrioridade)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    {PRIORIDADES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Categoria</label>
                <select
                  value={novoModeloCategoria}
                  onChange={(e) => setNovoModeloCategoria(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categorias.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição Padrão *</label>
                <textarea
                  rows={2}
                  required
                  value={novoModeloDescricao}
                  onChange={(e) => setNovoModeloDescricao(e.target.value)}
                  placeholder="Texto padrão que será preenchido automaticamente..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModeloModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  Salvar Modelo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
