import React, { useState, useMemo } from 'react';
import { Chamado, User, InventarioItem } from '../types';
import { isChamadoAtrasado } from '../services/supabaseService';
import { InventarioService } from '../services/inventarioService';
import {
  BarChart3,
  Clock,
  AlertTriangle,
  PlayCircle,
  CheckCircle2,
  Laptop,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Filter,
  Eye,
  MessageSquare,
  ShieldCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface DashboardViewProps {
  currentUser: User;
  chamados: Chamado[];
  onSelectChamado: (chamado: Chamado) => void;
  onOpenChat?: (chamadoId: string) => void;
  onNavigateToInventario?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  chamados,
  onSelectChamado,
  onOpenChat,
  onNavigateToInventario
}) => {
  const [periodoFilter, setPeriodoFilter] = useState<'todos' | '7dias' | '30dias'>('todos');
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<'todos' | 'novos' | 'atrasados' | 'em_atendimento' | 'finalizados'>('todos');

  // Load inventory items for the unified inventory view
  const inventarioItens = useMemo(() => {
    return InventarioService.getItens() || [];
  }, []);

  const safeChamados = useMemo(() => Array.isArray(chamados) ? chamados : [], [chamados]);

  // Filter chamados by period
  const filteredChamados = useMemo(() => {
    if (periodoFilter === 'todos') return safeChamados;
    const now = Date.now();
    const days = periodoFilter === '7dias' ? 7 : 30;
    const cutoff = now - days * 24 * 60 * 60 * 1000;
    return safeChamados.filter(c => c && c.data_abertura && new Date(c.data_abertura).getTime() >= cutoff);
  }, [safeChamados, periodoFilter]);

  // Metric calculations
  const totalChamados = filteredChamados.length;
  const chamadosNovos = filteredChamados.filter(c => c.status === 'Aberto');
  const chamadosEmAtendimento = filteredChamados.filter(c => c.status === 'Em Atendimento');
  const chamadosFinalizados = filteredChamados.filter(c => c.status === 'Encerrado');
  const chamadosAtrasados = filteredChamados.filter(c => isChamadoAtrasado(c));

  const taxaResolucao = totalChamados > 0
    ? Math.round((chamadosFinalizados.length / totalChamados) * 100)
    : 100;

  // Inventory metrics
  const totalEquipamentos = inventarioItens.length;
  const equipEmUso = inventarioItens.filter(i => i.status === 'Em Uso').length;
  const equipDisponiveis = inventarioItens.filter(i => i.status === 'Disponível').length;
  const equipManutencao = inventarioItens.filter(i => i.status === 'Em Manutenção').length;
  const equipDescartados = inventarioItens.filter(i => i.status === 'Descartado').length;

  // Distribution by Category
  const categoriasMap = useMemo(() => {
    const map: Record<string, number> = {};
    filteredChamados.forEach(c => {
      map[c.categoria] = (map[c.categoria] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredChamados]);

  // Distribution by Priority
  const prioridadeMap = useMemo(() => {
    return {
      Crítica: filteredChamados.filter(c => c.prioridade === 'Crítica').length,
      Alta: filteredChamados.filter(c => c.prioridade === 'Alta').length,
      Média: filteredChamados.filter(c => c.prioridade === 'Média').length,
      Baixa: filteredChamados.filter(c => c.prioridade === 'Baixa').length
    };
  }, [filteredChamados]);

  // Inventory by Type
  const tiposInventarioMap = useMemo(() => {
    const map: Record<string, number> = {};
    inventarioItens.forEach(i => {
      map[i.tipo] = (map[i.tipo] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [inventarioItens]);

  // Active tickets to display in the interactive table based on quick filter
  const displayedChamados = useMemo(() => {
    if (selectedQuickFilter === 'novos') return chamadosNovos;
    if (selectedQuickFilter === 'atrasados') return chamadosAtrasados;
    if (selectedQuickFilter === 'em_atendimento') return chamadosEmAtendimento;
    if (selectedQuickFilter === 'finalizados') return chamadosFinalizados;
    return filteredChamados;
  }, [selectedQuickFilter, chamadosNovos, chamadosAtrasados, chamadosEmAtendimento, chamadosFinalizados, filteredChamados]);

  return (
    <div className="space-y-6">
      
      {/* Top Header & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            <span>Dashboard Interativo de Chamados & Inventário</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Visão gerencial consolidada: chamados novos, atrasados, em atendimento, finalizados e ativos de TI
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs self-start sm:self-auto">
          <button
            onClick={() => setPeriodoFilter('todos')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              periodoFilter === 'todos' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todo o Histórico
          </button>
          <button
            onClick={() => setPeriodoFilter('30dias')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              periodoFilter === '30dias' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Últimos 30 dias
          </button>
          <button
            onClick={() => setPeriodoFilter('7dias')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              periodoFilter === '7dias' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Últimos 7 dias
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: OS 4 CARDS PRINCIPAIS DE CHAMADOS                   */}
      {/* (Novos, Atrasados, Em Atendimento, Finalizados)               */}
      {/* ============================================================== */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Painel Executivo de Chamados
          </h3>
          <span className="text-[11px] text-slate-500">
            Taxa de Resolução: <strong className="text-emerald-700 font-bold">{taxaResolucao}%</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Chamados Novos */}
          <div
            onClick={() => setSelectedQuickFilter(selectedQuickFilter === 'novos' ? 'todos' : 'novos')}
            className={`cursor-pointer bg-white p-4 rounded-xl border transition-all shadow-2xs hover:shadow-xs ${
              selectedQuickFilter === 'novos' ? 'ring-2 ring-blue-500 border-blue-300' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-900">Chamados Novos</span>
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock size={16} />
              </span>
            </div>
            <div className="text-3xl font-extrabold text-blue-950 mt-2">
              {chamadosNovos.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span>Aguardando atendimento</span>
              <ArrowUpRight size={13} className="text-blue-500" />
            </div>
          </div>

          {/* 2. Chamados Atrasados (Fora do SLA / Alerta) */}
          <div
            onClick={() => setSelectedQuickFilter(selectedQuickFilter === 'atrasados' ? 'todos' : 'atrasados')}
            className={`cursor-pointer bg-white p-4 rounded-xl border transition-all shadow-2xs hover:shadow-xs ${
              chamadosAtrasados.length > 0 ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200'
            } ${selectedQuickFilter === 'atrasados' ? 'ring-2 ring-rose-500' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-rose-900">Chamados Atrasados</span>
                {chamadosAtrasados.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                )}
              </div>
              <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle size={16} />
              </span>
            </div>
            <div className="text-3xl font-extrabold text-rose-950 mt-2">
              {chamadosAtrasados.length}
            </div>
            <div className="text-[11px] text-rose-700 mt-1 font-medium">
              {chamadosAtrasados.length > 0 ? 'Excederam o tempo de SLA previsto' : 'Nenhum chamado atrasado'}
            </div>
          </div>

          {/* 3. Chamados Em Atendimento */}
          <div
            onClick={() => setSelectedQuickFilter(selectedQuickFilter === 'em_atendimento' ? 'todos' : 'em_atendimento')}
            className={`cursor-pointer bg-white p-4 rounded-xl border transition-all shadow-2xs hover:shadow-xs ${
              selectedQuickFilter === 'em_atendimento' ? 'ring-2 ring-amber-500 border-amber-300' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-900">Em Atendimento</span>
              <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <PlayCircle size={16} />
              </span>
            </div>
            <div className="text-3xl font-extrabold text-amber-950 mt-2">
              {chamadosEmAtendimento.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Com técnico alocado em análise
            </div>
          </div>

          {/* 4. Chamados Finalizados */}
          <div
            onClick={() => setSelectedQuickFilter(selectedQuickFilter === 'finalizados' ? 'todos' : 'finalizados')}
            className={`cursor-pointer bg-white p-4 rounded-xl border transition-all shadow-2xs hover:shadow-xs ${
              selectedQuickFilter === 'finalizados' ? 'ring-2 ring-emerald-500 border-emerald-300' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-900">Finalizados</span>
              <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={16} />
              </span>
            </div>
            <div className="text-3xl font-extrabold text-emerald-950 mt-2">
              {chamadosFinalizados.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Resolvidos com laudo técnico emitido
            </div>
          </div>

        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 2: VISÃO DE TODO O INVENTÁRIO DE EQUIPAMENTOS          */}
      {/* ============================================================== */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Laptop size={17} className="text-indigo-600" />
              <span>Visão Consolidada do Inventário de Equipamentos</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Status operacional de todos os ativos cadastrados na empresa
            </p>
          </div>

          {onNavigateToInventario && (
            <button
              onClick={onNavigateToInventario}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Acessar Inventário Completo</span>
              <ArrowUpRight size={14} />
            </button>
          )}
        </div>

        {/* 4 Inventory Metric Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500">Total de Ativos</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{totalEquipamentos}</div>
            <div className="text-[10px] text-slate-400">100% dos ativos TI</div>
          </div>

          <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
            <div className="text-[11px] font-medium text-emerald-800">Em Uso (Alocados)</div>
            <div className="text-2xl font-bold text-emerald-950 mt-0.5">{equipEmUso}</div>
            <div className="text-[10px] text-emerald-700">
              {totalEquipamentos > 0 ? `${Math.round((equipEmUso / totalEquipamentos) * 100)}% do parque` : '0%'}
            </div>
          </div>

          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
            <div className="text-[11px] font-medium text-blue-800">Disponíveis (Estoque TI)</div>
            <div className="text-2xl font-bold text-blue-950 mt-0.5">{equipDisponiveis}</div>
            <div className="text-[10px] text-blue-700">Prontos para entrega</div>
          </div>

          <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100">
            <div className="text-[11px] font-medium text-amber-800">Em Manutenção / Reparo</div>
            <div className="text-2xl font-bold text-amber-950 mt-0.5">{equipManutencao}</div>
            <div className="text-[10px] text-amber-700">Necessitam assistência</div>
          </div>
        </div>

        {/* Types Bar Distribution */}
        {tiposInventarioMap.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-700 mb-2">
              Distribuição por Tipo de Ativo
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {tiposInventarioMap.slice(0, 4).map(([tipo, qtd]) => (
                <div key={tipo} className="flex items-center justify-between text-xs py-1 px-2.5 bg-slate-50 rounded-md">
                  <span className="text-slate-600">{tipo}</span>
                  <span className="font-bold text-slate-900">{qtd}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* SECTION 3: GRÁFICOS INTERATIVOS POR CATEGORIA E PRIORIDADE     */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Gráfico de Barras: Distribuição por Categoria */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between">
            <span>Distribuição de Chamados por Categoria</span>
            <span className="text-[11px] text-slate-400 font-normal">Total: {totalChamados}</span>
          </h3>

          {categoriasMap.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Nenhum chamado no período selecionado.
            </div>
          ) : (
            <div className="space-y-2.5">
              {categoriasMap.map(([cat, qtd]) => {
                const percent = totalChamados > 0 ? Math.round((qtd / totalChamados) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-700 truncate font-medium">{cat}</span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {qtd} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Gráfico de Distribuição por Prioridade */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between">
            <span>Volume de Chamados por Prioridade</span>
            <span className="text-[11px] text-slate-400 font-normal">SLA Crítico & Alertas</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 mb-4">
            
            {/* Crítica */}
            <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-800">Crítica</span>
                <span className="text-[10px] text-rose-600">SLA 6h</span>
              </div>
              <div className="text-2xl font-extrabold text-rose-950 mt-1">
                {prioridadeMap.Crítica}
              </div>
              <div className="text-[11px] text-rose-700 mt-0.5">Parada geral / Urgente</div>
            </div>

            {/* Alta */}
            <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-800">Alta</span>
                <span className="text-[10px] text-orange-600">SLA 12h</span>
              </div>
              <div className="text-2xl font-extrabold text-orange-950 mt-1">
                {prioridadeMap.Alta}
              </div>
              <div className="text-[11px] text-orange-700 mt-0.5">Impacto operacional alto</div>
            </div>

            {/* Média */}
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-800">Média</span>
                <span className="text-[10px] text-blue-600">SLA 24h</span>
              </div>
              <div className="text-2xl font-extrabold text-blue-950 mt-1">
                {prioridadeMap.Média}
              </div>
              <div className="text-[11px] text-blue-700 mt-0.5">Dificuldade parcial</div>
            </div>

            {/* Baixa */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Baixa</span>
                <span className="text-[10px] text-slate-500">SLA 48h</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {prioridadeMap.Baixa}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Dúvidas ou requisições</div>
            </div>

          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 p-2.5 bg-slate-50 rounded-lg">
            <AlertCircle size={14} className="text-indigo-600 shrink-0" />
            <span>
              Chamados de prioridade <strong>Crítica</strong> e <strong>Alta</strong> disparam alertas sonoros e SLA prioritário na fila técnica.
            </span>
          </div>

        </div>

      </div>

      {/* ============================================================== */}
      {/* SECTION 4: TABELA INTERATIVA DE CHAMADOS EM DESTAQUE          */}
      {/* ============================================================== */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <span>Fila Dinâmica de Atendimento</span>
              {selectedQuickFilter !== 'todos' && (
                <span className="text-[11px] font-semibold text-indigo-600 normal-case">
                  (Filtrando por: {selectedQuickFilter})
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Clique nos cards superiores para alternar entre Novos, Atrasados, Em Atendimento ou Finalizados
            </p>
          </div>

          {selectedQuickFilter !== 'todos' && (
            <button
              onClick={() => setSelectedQuickFilter('todos')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
            >
              Mostrar Todos ({totalChamados})
            </button>
          )}
        </div>

        {displayedChamados.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Nenhum chamado encontrado para este filtro.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Protocolo</th>
                  <th className="py-2.5 px-4">Título & Solicitante</th>
                  <th className="py-2.5 px-4">Categoria</th>
                  <th className="py-2.5 px-4">Prioridade</th>
                  <th className="py-2.5 px-4">Status & SLA</th>
                  <th className="py-2.5 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {displayedChamados.slice(0, 8).map((ch) => {
                  const atrasado = isChamadoAtrasado(ch);
                  return (
                    <tr key={ch.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {ch.id}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 max-w-sm truncate">
                          {ch.titulo}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {ch.solicitante} {ch.equipamento ? `· ${ch.equipamento}` : ''}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        {ch.categoria}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`font-semibold text-[11px] ${
                          ch.prioridade === 'Crítica' ? 'text-rose-700' :
                          ch.prioridade === 'Alta' ? 'text-orange-700' :
                          ch.prioridade === 'Média' ? 'text-blue-700' : 'text-slate-600'
                        }`}>
                          {ch.prioridade}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${
                            ch.status === 'Encerrado' ? 'bg-emerald-500' :
                            ch.status === 'Em Atendimento' ? 'bg-amber-500' : 'bg-blue-500'
                          }`}></span>
                          <span className="font-medium text-xs text-slate-900">{ch.status}</span>
                        </div>
                        {atrasado && (
                          <div className="text-[10px] text-rose-600 font-bold flex items-center gap-1 mt-0.5">
                            <AlertTriangle size={11} />
                            <span>Atrasado (fora do SLA)</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {onOpenChat && (
                            <button
                              onClick={() => onOpenChat(ch.id)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                              title="Conversar no chat online"
                            >
                              <MessageSquare size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => onSelectChamado(ch)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                          >
                            <Eye size={12} />
                            <span>Ver</span>
                          </button>
                        </div>
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
  );
};
