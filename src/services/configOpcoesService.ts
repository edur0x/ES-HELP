import { ModeloFrequente, ChamadoPrioridade } from '../types';

const STORAGE_KEY_TIPOS = 'sistema_chamados_tipos_solicitacao';
const STORAGE_KEY_CATEGORIAS = 'sistema_chamados_categorias';
const STORAGE_KEY_MODELOS = 'sistema_chamados_modelos_frequentes';

const DEFAULT_TIPOS: string[] = [
  'Incidente (Falha / Erro)',
  'Requisição de Serviço',
  'Dúvida / Orientação',
  'Acesso / Permissões',
  'Instalação / Configuração',
  'Manutenção Preventiva'
];

const DEFAULT_CATEGORIAS: string[] = [
  'Hardware (Computadores/Monitores)',
  'Software / Aplicativos',
  'Rede / Internet / Wi-Fi',
  'E-mail / Contas de Acesso',
  'Impressoras & Periféricos',
  'Telefonia / Comunicação',
  'Servidores & Armazenamento',
  'Segurança / Antivírus',
  'Outros'
];

const DEFAULT_MODELOS: ModeloFrequente[] = [
  {
    id: 'mod-1',
    titulo: 'Impressora travada ou sem papel',
    tipo_solicitacao: 'Incidente (Falha / Erro)',
    categoria: 'Impressoras & Periféricos',
    prioridade: 'Média',
    equipamento_sugerido: 'Impressora HP LaserJet Pro',
    descricao_padrao: 'A impressora apresentou erro de alimentação de folhas / cartucho travado e não está imprimindo documentos da equipe.',
    icone: 'Printer'
  },
  {
    id: 'mod-2',
    titulo: 'Computador sem acesso à internet / rede',
    tipo_solicitacao: 'Incidente (Falha / Erro)',
    categoria: 'Rede / Internet / Wi-Fi',
    prioridade: 'Alta',
    equipamento_sugerido: 'Desktop Dell OptiPlex',
    descricao_padrao: 'A estação de trabalho perdeu conexão de rede cabeada/Wi-Fi e não consegue acessar pastas corporativas nem o sistema ERP.',
    icone: 'Wifi'
  },
  {
    id: 'mod-3',
    titulo: 'Solicitação de acesso / Liberação de VPN',
    tipo_solicitacao: 'Acesso / Permissões',
    categoria: 'E-mail / Contas de Acesso',
    prioridade: 'Baixa',
    equipamento_sugerido: 'Notebook Corporativo',
    descricao_padrao: 'Solicito a criação/liberação de acesso ao serviço de VPN corporativa e permissão no diretório compartilhado do departamento.',
    icone: 'Key'
  },
  {
    id: 'mod-4',
    titulo: 'Notebook lento, travando ou reiniciando',
    tipo_solicitacao: 'Incidente (Falha / Erro)',
    categoria: 'Hardware (Computadores/Monitores)',
    prioridade: 'Crítica',
    equipamento_sugerido: 'Notebook Lenovo ThinkPad',
    descricao_padrao: 'O equipamento apresenta travamentos constantes, lentidão extrema e telas de reinicialização inesperada durante o trabalho.',
    icone: 'Laptop'
  },
  {
    id: 'mod-5',
    titulo: 'Instalação e configuração de novo software',
    tipo_solicitacao: 'Instalação / Configuração',
    categoria: 'Software / Aplicativos',
    prioridade: 'Média',
    equipamento_sugerido: 'Estação de Trabalho',
    descricao_padrao: 'Necessito da instalação da licença corporativa de software e configuração dos pacotes padrão para as atividades diárias.',
    icone: 'Download'
  }
];

export const ConfigOpcoesService = {
  // -------------------------------------------------------------
  // TIPOS DE SOLICITAÇÃO
  // -------------------------------------------------------------
  getTipos(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TIPOS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Erro ao ler tipos de solicitação:', e);
    }
    this.saveTipos(DEFAULT_TIPOS);
    return DEFAULT_TIPOS;
  },

  saveTipos(tipos: string[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_TIPOS, JSON.stringify(tipos));
    } catch (e) {
      console.error('Erro ao salvar tipos de solicitação:', e);
    }
  },

  addTipo(novoTipo: string): { success: boolean; list: string[]; error?: string } {
    const trimmed = novoTipo.trim();
    if (!trimmed) {
      return { success: false, list: this.getTipos(), error: 'O nome do tipo de solicitação não pode ser vazio.' };
    }
    const current = this.getTipos();
    if (current.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
      return { success: false, list: current, error: 'Este tipo de solicitação já existe na lista.' };
    }
    const updated = [...current, trimmed];
    this.saveTipos(updated);
    return { success: true, list: updated };
  },

  deleteTipo(tipoParaRemover: string): { success: boolean; list: string[]; error?: string } {
    const current = this.getTipos();
    if (current.length <= 1) {
      return { success: false, list: current, error: 'Deve haver pelo menos um tipo de solicitação cadastrado.' };
    }
    const updated = current.filter(t => t !== tipoParaRemover);
    this.saveTipos(updated);
    return { success: true, list: updated };
  },

  // -------------------------------------------------------------
  // CATEGORIAS DE CHAMADO
  // -------------------------------------------------------------
  getCategorias(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CATEGORIAS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Erro ao ler categorias de chamado:', e);
    }
    this.saveCategorias(DEFAULT_CATEGORIAS);
    return DEFAULT_CATEGORIAS;
  },

  saveCategorias(categorias: string[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIAS, JSON.stringify(categorias));
    } catch (e) {
      console.error('Erro ao salvar categorias:', e);
    }
  },

  addCategoria(novaCategoria: string): { success: boolean; list: string[]; error?: string } {
    const trimmed = novaCategoria.trim();
    if (!trimmed) {
      return { success: false, list: this.getCategorias(), error: 'O nome da categoria não pode ser vazio.' };
    }
    const current = this.getCategorias();
    if (current.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      return { success: false, list: current, error: 'Esta categoria já existe na lista.' };
    }
    const updated = [...current, trimmed];
    this.saveCategorias(updated);
    return { success: true, list: updated };
  },

  deleteCategoria(categoriaParaRemover: string): { success: boolean; list: string[]; error?: string } {
    const current = this.getCategorias();
    if (current.length <= 1) {
      return { success: false, list: current, error: 'Deve haver pelo menos uma categoria cadastrada.' };
    }
    const updated = current.filter(c => c !== categoriaParaRemover);
    this.saveCategorias(updated);
    return { success: true, list: updated };
  },

  // -------------------------------------------------------------
  // MODELOS FREQUENTES DE SOLICITAÇÃO (TEMPLATES)
  // -------------------------------------------------------------
  getModelos(): ModeloFrequente[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_MODELOS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Erro ao ler modelos frequentes:', e);
    }
    this.saveModelos(DEFAULT_MODELOS);
    return DEFAULT_MODELOS;
  },

  saveModelos(modelos: ModeloFrequente[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_MODELOS, JSON.stringify(modelos));
    } catch (e) {
      console.error('Erro ao salvar modelos frequentes:', e);
    }
  },

  addModelo(modelo: Omit<ModeloFrequente, 'id'>): { success: boolean; list: ModeloFrequente[]; novo?: ModeloFrequente; error?: string } {
    if (!modelo.titulo.trim() || !modelo.descricao_padrao.trim()) {
      return { success: false, list: this.getModelos(), error: 'Título e descrição padrão são obrigatórios.' };
    }
    const newId = `mod-${Date.now()}`;
    const novoModelo: ModeloFrequente = {
      ...modelo,
      id: newId,
      titulo: modelo.titulo.trim(),
      descricao_padrao: modelo.descricao_padrao.trim(),
      equipamento_sugerido: modelo.equipamento_sugerido?.trim() || undefined
    };
    const current = this.getModelos();
    const updated = [novoModelo, ...current];
    this.saveModelos(updated);
    return { success: true, list: updated, novo: novoModelo };
  },

  deleteModelo(id: string): { success: boolean; list: ModeloFrequente[]; error?: string } {
    const current = this.getModelos();
    if (current.length <= 1) {
      return { success: false, list: current, error: 'Deve haver pelo menos um modelo frequente cadastrado.' };
    }
    const updated = current.filter(m => m.id !== id);
    this.saveModelos(updated);
    return { success: true, list: updated };
  },

  resetDefaults(): void {
    this.saveTipos(DEFAULT_TIPOS);
    this.saveCategorias(DEFAULT_CATEGORIAS);
    this.saveModelos(DEFAULT_MODELOS);
  }
};
