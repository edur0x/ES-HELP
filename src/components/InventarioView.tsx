import React, { useState, useEffect } from 'react';
import { InventarioItem, InventarioCampoCustomizado, EquipamentoStatus, User } from '../types';
import { InventarioService } from '../services/inventarioService';
import {
  Laptop,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Settings,
  Server,
  Printer,
  Monitor,
  Cpu,
  CheckCircle,
  AlertTriangle,
  Clock,
  X,
  FileText,
  Building,
  User as UserIcon,
  Tag,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

interface InventarioViewProps {
  currentUser: User;
  onSelectEquipamentoParaChamado?: (equipamentoNome: string) => void;
}

export const InventarioView: React.FC<InventarioViewProps> = ({ currentUser, onSelectEquipamentoParaChamado }) => {
  const [itens, setItens] = useState<InventarioItem[]>([]);
  const [camposCustomizados, setCamposCustomizados] = useState<InventarioCampoCustomizado[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | EquipamentoStatus>('Todos');
  const [tipoFilter, setTipoFilter] = useState<string>('Todos');

  // Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventarioItem | null>(null);
  const [isCamposModalOpen, setIsCamposModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventarioItem | null>(null);

  // Form states for Item
  const [formPatrimonio, setFormPatrimonio] = useState('');
  const [formNome, setFormNome] = useState('');
  const [formTipo, setFormTipo] = useState('Notebook');
  const [formMarca, setFormMarca] = useState('');
  const [formModelo, setFormModelo] = useState('');
  const [formNumeroSerie, setFormNumeroSerie] = useState('');
  const [formStatus, setFormStatus] = useState<EquipamentoStatus>('Disponível');
  const [formResponsavel, setFormResponsavel] = useState('');
  const [formSetor, setFormSetor] = useState('');
  const [formLocalizacao, setFormLocalizacao] = useState('');
  const [formDataAquisicao, setFormDataAquisicao] = useState(new Date().toISOString().split('T')[0]);
  const [formValor, setFormValor] = useState<string>('');
  const [formObservacoes, setFormObservacoes] = useState('');
  const [formCustomVals, setFormCustomVals] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Form states for New Custom Field
  const [novoCampoLabel, setNovoCampoLabel] = useState('');
  const [novoCampoChave, setNovoCampoChave] = useState('');
  const [novoCampoTipo, setNovoCampoTipo] = useState<'texto' | 'numero' | 'selecao' | 'data'>('texto');
  const [novoCampoOpcoes, setNovoCampoOpcoes] = useState('');
  const [novoCampoPlaceholder, setNovoCampoPlaceholder] = useState('');
  const [campoError, setCampoError] = useState<string | null>(null);
  const [campoSuccess, setCampoSuccess] = useState<string | null>(null);

  // Load data
  const carregarDados = () => {
    const list = InventarioService.getItens();
    const campos = InventarioService.getCamposCustomizados();
    setItens(list);
    setCamposCustomizados(campos);
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const openCreateItemModal = () => {
    setEditingItem(null);
    setFormPatrimonio(`EQ-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormNome('');
    setFormTipo('Notebook');
    setFormMarca('');
    setFormModelo('');
    setFormNumeroSerie('');
    setFormStatus('Disponível');
    setFormResponsavel('Almoxarifado TI');
    setFormSetor('TI');
    setFormLocalizacao('Bancada Central');
    setFormDataAquisicao(new Date().toISOString().split('T')[0]);
    setFormValor('');
    setFormObservacoes('');
    setFormCustomVals({});
    setFormError(null);
    setIsItemModalOpen(true);
  };

  const openEditItemModal = (item: InventarioItem) => {
    setEditingItem(item);
    setFormPatrimonio(item.patrimonio);
    setFormNome(item.nome);
    setFormTipo(item.tipo);
    setFormMarca(item.marca);
    setFormModelo(item.modelo);
    setFormNumeroSerie(item.numero_serie);
    setFormStatus(item.status);
    setFormResponsavel(item.responsavel);
    setFormSetor(item.setor);
    setFormLocalizacao(item.localizacao);
    setFormDataAquisicao(item.data_aquisicao);
    setFormValor(item.valor_estimado ? String(item.valor_estimado) : '');
    setFormObservacoes(item.observacoes || '');
    setFormCustomVals(item.campos_customizados ? { ...item.campos_customizados } : {});
    setFormError(null);
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formPatrimonio.trim() || !formNome.trim() || !formTipo.trim()) {
      setFormError('Patrimônio, Nome e Tipo do equipamento são obrigatórios.');
      return;
    }

    const payload = {
      patrimonio: formPatrimonio.trim(),
      nome: formNome.trim(),
      tipo: formTipo.trim(),
      marca: formMarca.trim() || 'N/A',
      modelo: formModelo.trim() || 'N/A',
      numero_serie: formNumeroSerie.trim() || 'N/A',
      status: formStatus,
      responsavel: formResponsavel.trim() || 'TI',
      setor: formSetor.trim() || 'Geral',
      localizacao: formLocalizacao.trim() || 'Empresa',
      data_aquisicao: formDataAquisicao,
      valor_estimado: formValor ? parseFloat(formValor) : undefined,
      observacoes: formObservacoes.trim() || undefined,
      campos_customizados: formCustomVals
    };

    if (editingItem) {
      InventarioService.updateItem(editingItem.id, payload);
    } else {
      InventarioService.createItem(payload);
    }

    setIsItemModalOpen(false);
    carregarDados();
  };

  const handleDeleteItem = () => {
    if (!itemToDelete) return;
    InventarioService.deleteItem(itemToDelete.id);
    setItemToDelete(null);
    carregarDados();
  };

  const handleAddCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    setCampoError(null);
    setCampoSuccess(null);

    if (!novoCampoLabel.trim()) {
      setCampoError('O nome do campo é obrigatório.');
      return;
    }

    const opcoesArr = novoCampoTipo === 'selecao'
      ? novoCampoOpcoes.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    const res = InventarioService.addCampoCustomizado({
      label: novoCampoLabel.trim(),
      chave: novoCampoChave.trim(),
      tipo: novoCampoTipo,
      opcoes: opcoesArr,
      placeholder: novoCampoPlaceholder.trim() || undefined
    });

    if (!res.success) {
      setCampoError(res.error || 'Falha ao adicionar campo.');
      return;
    }

    setCampoSuccess(`Campo "${novoCampoLabel}" criado com sucesso!`);
    setNovoCampoLabel('');
    setNovoCampoChave('');
    setNovoCampoOpcoes('');
    setNovoCampoPlaceholder('');
    carregarDados();
  };

  const handleDeleteCustomField = (id: string, label: string) => {
    if (!window.confirm(`Deseja realmente excluir o campo "${label}"? Ele será removido de todos os itens cadastrados.`)) {
      return;
    }
    InventarioService.deleteCampoCustomizado(id);
    carregarDados();
  };

  // Filtering
  const tiposUnicos = Array.from(new Set(itens.map(i => i.tipo)));

  const itensFiltrados = itens.filter(item => {
    if (!item) return false;
    const matchesStatus = statusFilter === 'Todos' || item.status === statusFilter;
    const matchesTipo = tipoFilter === 'Todos' || item.tipo === tipoFilter;
    const searchLower = (searchTerm || '').toLowerCase();
    const matchesSearch =
      (item.nome || '').toLowerCase().includes(searchLower) ||
      (item.patrimonio || '').toLowerCase().includes(searchLower) ||
      (item.responsavel || '').toLowerCase().includes(searchLower) ||
      (item.setor || '').toLowerCase().includes(searchLower) ||
      (item.modelo || '').toLowerCase().includes(searchLower) ||
      (item.numero_serie || '').toLowerCase().includes(searchLower);

    return matchesStatus && matchesTipo && matchesSearch;
  });

  // Metrics
  const totalEquipamentos = itens.length;
  const emUsoCount = itens.filter(i => i.status === 'Em Uso').length;
  const disponivelCount = itens.filter(i => i.status === 'Disponível').length;
  const manutencaoCount = itens.filter(i => i.status === 'Em Manutenção').length;
  const descartadoCount = itens.filter(i => i.status === 'Descartado').length;

  return (
    <div className="space-y-6">
      
      {/* Top Header / Statistics Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Laptop className="w-6 h-6 text-indigo-600" />
            <span>Inventário de Equipamentos da Empresa</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Controle de computadores, servidores, impressoras, periféricos e campos personalizados
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCamposModalOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            title="Adicionar ou excluir novos campos personalizados no inventário"
          >
            <Settings size={15} className="text-slate-500" />
            <span>Gerenciar Campos ({camposCustomizados.length})</span>
          </button>

          <button
            onClick={openCreateItemModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <Plus size={16} />
            <span>Novo Equipamento</span>
          </button>
        </div>
      </div>

      {/* Metrics Row (Zero-Pill discipline: unboxed clean numbers) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Total de Ativos</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalEquipamentos}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Cadastrados no sistema</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-emerald-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Em Uso
          </div>
          <div className="text-2xl font-bold text-emerald-950 mt-1">{emUsoCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Com colaboradores/setor</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-blue-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Disponíveis
          </div>
          <div className="text-2xl font-bold text-blue-950 mt-1">{disponivelCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Prontos no estoque TI</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-amber-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Em Manutenção
          </div>
          <div className="text-2xl font-bold text-amber-950 mt-1">{manutencaoCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Em reparo ou revisão</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            Descartados
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{descartadoCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Baixados / Sucateados</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar patrimônio, modelo, responsável, setor..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Filter Controls (Buttons as functional segment controls) */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Segmented Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            {(['Todos', 'Em Uso', 'Disponível', 'Em Manutenção', 'Descartado'] as const).map((st) => (
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

          {/* Type Select */}
          {tiposUnicos.length > 0 && (
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="py-1 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Todos">Todos os Tipos</option>
              {tiposUnicos.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}
        </div>

      </div>

      {/* Equipment List / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {itensFiltrados.length === 0 ? (
          <div className="py-16 text-center">
            <Laptop className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Nenhum equipamento localizado</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Ajuste seus filtros de busca ou adicione um novo equipamento para enriquecer o inventário de TI.
            </p>
            <button
              onClick={openCreateItemModal}
              className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus size={14} />
              <span>Adicionar Primeiro Equipamento</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Patrimônio</th>
                  <th className="py-3 px-4">Equipamento / Modelo</th>
                  <th className="py-3 px-4">Tipo & Marca</th>
                  <th className="py-3 px-4">Responsável & Setor</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Campos Customizados</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {itensFiltrados.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* Patrimônio */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {item.patrimonio}
                    </td>

                    {/* Nome & Serial */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{item.nome}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        S/N: {item.numero_serie} {item.modelo ? `· ${item.modelo}` : ''}
                      </div>
                    </td>

                    {/* Tipo & Marca */}
                    <td className="py-3 px-4">
                      <div className="text-slate-900 font-medium">{item.tipo}</div>
                      <div className="text-[11px] text-slate-500">{item.marca}</div>
                    </td>

                    {/* Responsável & Setor */}
                    <td className="py-3 px-4">
                      <div className="text-slate-900 font-medium">{item.responsavel}</div>
                      <div className="text-[11px] text-slate-500">{item.setor} · {item.localizacao}</div>
                    </td>

                    {/* Status (Unboxed clean status indicator) */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-medium">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.status === 'Em Uso' ? 'bg-emerald-500' :
                            item.status === 'Disponível' ? 'bg-blue-500' :
                            item.status === 'Em Manutenção' ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'
                          }`}
                        ></span>
                        <span className={`text-xs ${
                          item.status === 'Em Uso' ? 'text-emerald-900' :
                          item.status === 'Disponível' ? 'text-blue-900' :
                          item.status === 'Em Manutenção' ? 'text-amber-900' : 'text-slate-600'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </td>

                    {/* Campos Customizados (Dynamic attributes) */}
                    <td className="py-3 px-4 max-w-xs">
                      {item.campos_customizados && Object.keys(item.campos_customizados).length > 0 ? (
                        <div className="flex flex-col gap-1 text-[11px] text-slate-600">
                          {Object.entries(item.campos_customizados).map(([k, v]) => {
                            const def = camposCustomizados.find(c => c.chave === k);
                            const label = def?.label || k;
                            return (
                              <div key={k} className="truncate">
                                <span className="font-semibold text-slate-700">{label}:</span>{' '}
                                <span className="font-mono text-slate-600">{v}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Nenhum campo extra</span>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditItemModal(item)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="Editar equipamento"
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          onClick={() => setItemToDelete(item)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Excluir equipamento do inventário"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: CADASTRAR OU EDITAR EQUIPAMENTO                       */}
      {/* ============================================================== */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Laptop className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm sm:text-base text-white">
                  {editingItem ? `Editar Equipamento (${editingItem.patrimonio})` : 'Novo Equipamento no Inventário'}
                </h3>
              </div>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveItem} className="p-5 overflow-y-auto space-y-4 flex-1">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Row 1: Patrimônio, Nome e Tipo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Patrimônio / Tag <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formPatrimonio}
                    onChange={(e) => setFormPatrimonio(e.target.value)}
                    placeholder="Ex: NOTE-001"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nome do Equipamento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    placeholder="Ex: Notebook Dell Latitude 3420 Core i7"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Row 2: Tipo, Marca, Modelo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tipo de Ativo
                  </label>
                  <input
                    type="text"
                    list="tipos-equipamento-sugestoes"
                    value={formTipo}
                    onChange={(e) => setFormTipo(e.target.value)}
                    placeholder="Notebook, Servidor, Switch..."
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <datalist id="tipos-equipamento-sugestoes">
                    <option value="Notebook" />
                    <option value="Desktop" />
                    <option value="Monitor" />
                    <option value="Servidor" />
                    <option value="Impressora" />
                    <option value="Switch" />
                    <option value="Roteador" />
                    <option value="Telefone IP" />
                    <option value="Periférico" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Marca / Fabricante
                  </label>
                  <input
                    type="text"
                    value={formMarca}
                    onChange={(e) => setFormMarca(e.target.value)}
                    placeholder="Ex: Dell, Lenovo, HP, Cisco"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Modelo
                  </label>
                  <input
                    type="text"
                    value={formModelo}
                    onChange={(e) => setFormModelo(e.target.value)}
                    placeholder="Ex: Latitude 3420"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Row 3: Número de Série & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Número de Série (S/N)
                  </label>
                  <input
                    type="text"
                    value={formNumeroSerie}
                    onChange={(e) => setFormNumeroSerie(e.target.value)}
                    placeholder="Ex: BR-849204-DL"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status Operacional
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as EquipamentoStatus)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Disponível">Disponível (Pronto para Uso)</option>
                    <option value="Em Uso">Em Uso (Alocado)</option>
                    <option value="Em Manutenção">Em Manutenção (Com Defeito / Reparo)</option>
                    <option value="Descartado">Descartado / Sucateado</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Responsável, Setor, Localização */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Responsável / Usuário
                  </label>
                  <input
                    type="text"
                    value={formResponsavel}
                    onChange={(e) => setFormResponsavel(e.target.value)}
                    placeholder="Ex: Mariana Souza ou TI"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Setor / Departamento
                  </label>
                  <input
                    type="text"
                    value={formSetor}
                    onChange={(e) => setFormSetor(e.target.value)}
                    placeholder="Ex: Recursos Humanos, Financeiro"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Localização Física
                  </label>
                  <input
                    type="text"
                    value={formLocalizacao}
                    onChange={(e) => setFormLocalizacao(e.target.value)}
                    placeholder="Ex: Prédio A - Sala 204"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Row 5: Data Aquisição e Valor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Data de Aquisição
                  </label>
                  <input
                    type="date"
                    value={formDataAquisicao}
                    onChange={(e) => setFormDataAquisicao(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Valor Estimado (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formValor}
                    onChange={(e) => setFormValor(e.target.value)}
                    placeholder="Ex: 4800.00"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* ============================================================== */}
              {/* SEÇÃO DINÂMICA: CAMPOS PERSONALIZADOS DO INVENTÁRIO            */}
              {/* ============================================================== */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Layers size={14} className="text-indigo-600" />
                    <span className="text-xs font-bold text-slate-800">
                      Campos Personalizados do Inventário ({camposCustomizados.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCamposModalOpen(true)}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    + Criar ou excluir campos
                  </button>
                </div>

                {camposCustomizados.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    Nenhum campo personalizado cadastrado. Clique no botão acima para adicionar campos como IP, MAC ou Garantia.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
                    {camposCustomizados.map((campo) => (
                      <div key={campo.id}>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          {campo.label}
                        </label>
                        {campo.tipo === 'selecao' && campo.opcoes ? (
                          <select
                            value={formCustomVals[campo.chave] || ''}
                            onChange={(e) => setFormCustomVals({ ...formCustomVals, [campo.chave]: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">Selecione uma opção...</option>
                            {campo.opcoes.map(op => (
                              <option key={op} value={op}>{op}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={campo.tipo === 'numero' ? 'number' : campo.tipo === 'data' ? 'date' : 'text'}
                            value={formCustomVals[campo.chave] || ''}
                            onChange={(e) => setFormCustomVals({ ...formCustomVals, [campo.chave]: e.target.value })}
                            placeholder={campo.placeholder || `Informe ${campo.label.toLowerCase()}`}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Observações */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Observações e Histórico Técnico
                </label>
                <textarea
                  rows={2}
                  value={formObservacoes}
                  onChange={(e) => setFormObservacoes(e.target.value)}
                  placeholder="Informações adicionais sobre garantia, upgrades de memória, defeitos anteriores..."
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  {editingItem ? 'Salvar Alterações' : 'Cadastrar Equipamento'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: GERENCIAR CAMPOS PERSONALIZADOS DO INVENTÁRIO        */}
      {/* (Atende diretamente: "onde eu possa adicionar novos campos e itens ou excluir") */}
      {/* ============================================================== */}
      {isCamposModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Settings className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    Gerenciar Campos do Inventário
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Adicione ou exclua atributos extras para as fichas de equipamentos
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCamposModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              
              {/* Form to add a new custom field */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
                  <Plus size={14} className="text-indigo-600" />
                  Adicionar Novo Campo Personalizado
                </h4>

                {campoError && (
                  <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                    <AlertTriangle size={14} className="shrink-0" />
                    <span>{campoError}</span>
                  </div>
                )}

                {campoSuccess && (
                  <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle size={14} className="shrink-0" />
                    <span>{campoSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleAddCustomField} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Nome / Rótulo do Campo <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={novoCampoLabel}
                        onChange={(e) => setNovoCampoLabel(e.target.value)}
                        placeholder="Ex: Endereço MAC, Licença Antivírus"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Tipo de Dado
                      </label>
                      <select
                        value={novoCampoTipo}
                        onChange={(e) => setNovoCampoTipo(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="texto">Texto Curto</option>
                        <option value="numero">Número</option>
                        <option value="data">Data</option>
                        <option value="selecao">Seleção (Múltiplas Opções)</option>
                      </select>
                    </div>
                  </div>

                  {novoCampoTipo === 'selecao' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Opções (separadas por vírgula)
                      </label>
                      <input
                        type="text"
                        value={novoCampoOpcoes}
                        onChange={(e) => setNovoCampoOpcoes(e.target.value)}
                        placeholder="Ex: 8 GB, 16 GB, 32 GB, 64 GB"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Texto de Ajuda / Placeholder <span className="text-slate-400 font-normal">(Opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={novoCampoPlaceholder}
                      onChange={(e) => setNovoCampoPlaceholder(e.target.value)}
                      placeholder="Ex: 00:1B:44:11:3A:B7"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-2xs flex items-center gap-1.5"
                    >
                      <Plus size={14} />
                      <span>Cadastrar Campo</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* List of existing custom fields */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                  Campos Personalizados Ativos ({camposCustomizados.length})
                </h4>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {camposCustomizados.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      Nenhum campo personalizado existente.
                    </div>
                  ) : (
                    camposCustomizados.map((c) => (
                      <div key={c.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div>
                          <div className="font-semibold text-xs text-slate-900">{c.label}</div>
                          <div className="text-[11px] text-slate-500">
                            Chave: <span className="font-mono">{c.chave}</span> · Tipo: {c.tipo}
                            {c.opcoes && ` · Opções: (${c.opcoes.join(', ')})`}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteCustomField(c.id, c.label)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title={`Excluir campo "${c.label}"`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsCamposModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Concluir
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: CONFIRMAÇÃO DE EXCLUSÃO DE EQUIPAMENTO                */}
      {/* ============================================================== */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <Trash2 size={20} />
              </div>
              <h3 className="font-bold text-base text-slate-900">Excluir Equipamento</h3>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              Tem certeza que deseja remover o equipamento <strong className="text-slate-900">{itemToDelete.patrimonio} - {itemToDelete.nome}</strong> do inventário da empresa?
            </p>

            <div className="flex items-center justify-end gap-2.5 mt-5">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteItem}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors shadow-xs"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
