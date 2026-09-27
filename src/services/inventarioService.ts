import { InventarioItem, InventarioCampoCustomizado, EquipamentoStatus } from '../types';

const STORAGE_KEY_INVENTARIO = 'sistema_chamados_inventario_itens';
const STORAGE_KEY_CAMPOS = 'sistema_chamados_inventario_campos';

const DEFAULT_CAMPOS_CUSTOMIZADOS: InventarioCampoCustomizado[] = [
  {
    id: 'campo-1',
    chave: 'endereco_ip',
    label: 'Endereço IP',
    tipo: 'texto',
    placeholder: 'Ex: 192.168.1.105'
  },
  {
    id: 'campo-2',
    chave: 'endereco_mac',
    label: 'Endereço MAC',
    tipo: 'texto',
    placeholder: 'Ex: 00:1B:44:11:3A:B7'
  },
  {
    id: 'campo-3',
    chave: 'memoria_ram',
    label: 'Memória RAM',
    tipo: 'selecao',
    opcoes: ['8 GB DDR4', '16 GB DDR4', '32 GB DDR4', '64 GB DDR5', 'Outro']
  },
  {
    id: 'campo-4',
    chave: 'garantia_ate',
    label: 'Garantia até',
    tipo: 'data',
    placeholder: 'YYYY-MM-DD'
  }
];

const DEFAULT_ITENS: InventarioItem[] = [
  {
    id: 'inv-001',
    patrimonio: 'NOTE-001',
    nome: 'Notebook Dell Latitude 3420',
    tipo: 'Notebook',
    marca: 'Dell',
    modelo: 'Latitude 3420 Core i7',
    numero_serie: 'DL-77291-BR',
    status: 'Em Uso',
    responsavel: 'Mariana Souza',
    setor: 'Recursos Humanos',
    localizacao: 'Prédio A - Sala 204',
    data_aquisicao: '2023-04-12',
    valor_estimado: 4800,
    observacoes: 'Equipamento em excelente estado. Utilizado com dockstation corporativo.',
    campos_customizados: {
      endereco_ip: '192.168.10.45',
      endereco_mac: 'A4:BB:6D:88:21:40',
      memoria_ram: '16 GB DDR4',
      garantia_ate: '2026-04-12'
    },
    criado_em: '2023-04-12T10:00:00.000Z'
  },
  {
    id: 'inv-002',
    patrimonio: 'DESK-014',
    nome: 'Desktop Dell OptiPlex 7090',
    tipo: 'Desktop',
    marca: 'Dell',
    modelo: 'OptiPlex 7090 Micro',
    numero_serie: 'DL-90812-SP',
    status: 'Em Manutenção',
    responsavel: 'Carlos Mendes',
    setor: 'Contabilidade',
    localizacao: 'Bancada TI - Lab 01',
    data_aquisicao: '2022-09-18',
    valor_estimado: 3950,
    observacoes: 'Apresentou falha na porta de rede cabeada e superaquecimento. Em reparo preventivo.',
    campos_customizados: {
      endereco_ip: '192.168.10.60',
      endereco_mac: '00:14:22:01:23:45',
      memoria_ram: '16 GB DDR4',
      garantia_ate: '2025-09-18'
    },
    criado_em: '2022-09-18T14:30:00.000Z'
  },
  {
    id: 'inv-003',
    patrimonio: 'NOTE-008',
    nome: 'Notebook Lenovo ThinkPad T14',
    tipo: 'Notebook',
    marca: 'Lenovo',
    modelo: 'ThinkPad T14 Gen 3',
    numero_serie: 'LN-55219-RJ',
    status: 'Disponível',
    responsavel: 'Almoxarifado TI',
    setor: 'Tecnologia da Informação',
    localizacao: 'Armário Seguro TI - Prateleira 2',
    data_aquisicao: '2024-01-20',
    valor_estimado: 6200,
    observacoes: 'Notebook reserva configurado com imagem padrão Windows 11 Pro para novas contratações.',
    campos_customizados: {
      endereco_ip: '192.168.10.150',
      endereco_mac: 'E0:D5:5E:44:88:99',
      memoria_ram: '32 GB DDR4',
      garantia_ate: '2027-01-20'
    },
    criado_em: '2024-01-20T09:15:00.000Z'
  },
  {
    id: 'inv-004',
    patrimonio: 'IMP-002',
    nome: 'Impressora HP LaserJet Pro M404dw',
    tipo: 'Impressora',
    marca: 'HP',
    modelo: 'LaserJet Pro M404dw',
    numero_serie: 'HP-33291-PR',
    status: 'Em Uso',
    responsavel: 'Equipe Financeiro',
    setor: 'Financeiro',
    localizacao: 'Prédio B - Sala 102',
    data_aquisicao: '2023-08-05',
    valor_estimado: 2400,
    observacoes: 'Impressora laser duplex de alto volume. Conexão por rede cabeada.',
    campos_customizados: {
      endereco_ip: '192.168.10.200',
      endereco_mac: '3C:52:82:11:22:33',
      garantia_ate: '2025-08-05'
    },
    criado_em: '2023-08-05T11:00:00.000Z'
  },
  {
    id: 'inv-005',
    patrimonio: 'SRV-001',
    nome: 'Servidor Dell PowerEdge R650',
    tipo: 'Servidor',
    marca: 'Dell',
    modelo: 'PowerEdge R650 1U Rack',
    numero_serie: 'DL-SRV-9941',
    status: 'Em Uso',
    responsavel: 'Eduardo (Técnico TI)',
    setor: 'Tecnologia da Informação',
    localizacao: 'Data Center - Rack 03 U18',
    data_aquisicao: '2023-02-10',
    valor_estimado: 28000,
    observacoes: 'Servidor de virtualização de produção e banco de dados corporativo.',
    campos_customizados: {
      endereco_ip: '192.168.1.10',
      endereco_mac: '74:86:7A:00:11:22',
      memoria_ram: '64 GB DDR5',
      garantia_ate: '2028-02-10'
    },
    criado_em: '2023-02-10T08:00:00.000Z'
  },
  {
    id: 'inv-006',
    patrimonio: 'SW-001',
    nome: 'Switch Cisco Catalyst 2960X 48P',
    tipo: 'Switch',
    marca: 'Cisco',
    modelo: 'Catalyst 2960X-48FPS-L PoE+',
    numero_serie: 'CS-88910-MG',
    status: 'Em Uso',
    responsavel: 'Equipe de Infraestrutura',
    setor: 'Tecnologia da Informação',
    localizacao: 'Rack de Telecom - Andar 2',
    data_aquisicao: '2021-11-15',
    valor_estimado: 8900,
    observacoes: 'Switch central de distribuição dos pontos de rede e telefonia IP.',
    campos_customizados: {
      endereco_ip: '192.168.1.2',
      endereco_mac: '00:27:0D:33:44:55',
      garantia_ate: '2026-11-15'
    },
    criado_em: '2021-11-15T10:00:00.000Z'
  },
  {
    id: 'inv-007',
    patrimonio: 'NOTE-002',
    nome: 'Notebook Dell Inspiron 15 (Antigo)',
    tipo: 'Notebook',
    marca: 'Dell',
    modelo: 'Inspiron 15 3567',
    numero_serie: 'DL-11092-RS',
    status: 'Descartado',
    responsavel: 'TI / Descarte Sustentável',
    setor: 'Tecnologia da Informação',
    localizacao: 'Depósito de Sucata TI',
    data_aquisicao: '2018-05-10',
    valor_estimado: 0,
    observacoes: 'Placa-mãe danificada e carcaça trincada. Baixado do patrimônio e enviado para reciclagem de eletrônicos.',
    campos_customizados: {
      memoria_ram: '8 GB DDR4'
    },
    criado_em: '2018-05-10T15:00:00.000Z'
  }
];

export const InventarioService = {
  // -------------------------------------------------------------
  // ITENS DO INVENTÁRIO
  // -------------------------------------------------------------
  getItens(): InventarioItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_INVENTARIO);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.filter(i => i && typeof i === 'object' && i.id && i.patrimonio);
          if (valid.length > 0) return valid;
        }
      }
    } catch (e) {
      console.error('Erro ao ler inventário no localStorage:', e);
    }
    this.saveItens(DEFAULT_ITENS);
    return DEFAULT_ITENS;
  },

  saveItens(itens: InventarioItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_INVENTARIO, JSON.stringify(itens));
    } catch (e) {
      console.error('Erro ao salvar inventário no localStorage:', e);
    }
  },

  createItem(item: Omit<InventarioItem, 'id' | 'criado_em'>): InventarioItem {
    const id = `inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const novoItem: InventarioItem = {
      ...item,
      id,
      patrimonio: item.patrimonio.trim().toUpperCase(),
      nome: item.nome.trim(),
      tipo: item.tipo.trim(),
      marca: item.marca.trim(),
      modelo: item.modelo.trim(),
      numero_serie: item.numero_serie.trim().toUpperCase(),
      responsavel: item.responsavel.trim(),
      setor: item.setor.trim(),
      localizacao: item.localizacao.trim(),
      criado_em: new Date().toISOString()
    };

    const current = this.getItens();
    const updated = [novoItem, ...current];
    this.saveItens(updated);
    return novoItem;
  },

  updateItem(id: string, updates: Partial<InventarioItem>): InventarioItem | null {
    const current = this.getItens();
    const index = current.findIndex(i => i.id === id);
    if (index === -1) return null;

    const updatedItem: InventarioItem = {
      ...current[index],
      ...updates,
      atualizado_em: new Date().toISOString()
    };

    current[index] = updatedItem;
    this.saveItens(current);
    return updatedItem;
  },

  deleteItem(id: string): boolean {
    const current = this.getItens();
    const filtered = current.filter(i => i.id !== id);
    if (filtered.length === current.length) return false;
    this.saveItens(filtered);
    return true;
  },

  // -------------------------------------------------------------
  // CAMPOS CUSTOMIZADOS DO INVENTÁRIO
  // -------------------------------------------------------------
  getCamposCustomizados(): InventarioCampoCustomizado[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CAMPOS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.filter(c => c && typeof c === 'object' && c.id && c.chave);
          if (valid.length > 0) return valid;
        }
      }
    } catch (e) {
      console.error('Erro ao ler campos customizados:', e);
    }
    this.saveCamposCustomizados(DEFAULT_CAMPOS_CUSTOMIZADOS);
    return DEFAULT_CAMPOS_CUSTOMIZADOS;
  },

  saveCamposCustomizados(campos: InventarioCampoCustomizado[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_CAMPOS, JSON.stringify(campos));
    } catch (e) {
      console.error('Erro ao salvar campos customizados:', e);
    }
  },

  addCampoCustomizado(campo: Omit<InventarioCampoCustomizado, 'id'>): { success: boolean; campo?: InventarioCampoCustomizado; error?: string } {
    const label = campo.label.trim();
    if (!label) {
      return { success: false, error: 'O nome (rótulo) do campo é obrigatório.' };
    }

    const chave = (campo.chave || label)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    const current = this.getCamposCustomizados();
    if (current.some(c => c.chave === chave)) {
      return { success: false, error: `Já existe um campo com o identificador "${chave}".` };
    }

    const novoCampo: InventarioCampoCustomizado = {
      ...campo,
      id: `campo-${Date.now()}`,
      chave,
      label,
      placeholder: campo.placeholder?.trim() || undefined
    };

    const updated = [...current, novoCampo];
    this.saveCamposCustomizados(updated);
    return { success: true, campo: novoCampo };
  },

  deleteCampoCustomizado(id: string): { success: boolean; error?: string } {
    const current = this.getCamposCustomizados();
    const campo = current.find(c => c.id === id);
    if (!campo) {
      return { success: false, error: 'Campo não encontrado.' };
    }

    const updated = current.filter(c => c.id !== id);
    this.saveCamposCustomizados(updated);

    // Clean up this custom field key from stored equipment items
    const itens = this.getItens();
    const cleanedItens = itens.map(item => {
      if (item.campos_customizados && campo.chave in item.campos_customizados) {
        const copy = { ...item.campos_customizados };
        delete copy[campo.chave];
        return { ...item, campos_customizados: copy };
      }
      return item;
    });
    this.saveItens(cleanedItens);

    return { success: true };
  }
};
