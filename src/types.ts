export type UserProfile = 'Administrador' | 'Técnico' | 'Usuário' | 'Operador';

export interface User {
  id?: string;
  login: string;
  nome: string;
  email?: string;
  perfil: UserProfile;
  criadoEm?: string;
}

export type ChamadoStatus = 'Aberto' | 'Em Atendimento' | 'Encerrado';

export type ChamadoPrioridade = 'Baixa' | 'Média' | 'Alta' | 'Crítica';

export type TipoSolicitacao = string;

export type CategoriaChamado = string;

export interface Chamado {
  id: string;
  solicitante: string;
  tipo_solicitacao: string;
  categoria: string;
  prioridade: ChamadoPrioridade;
  equipamento?: string;
  titulo: string;
  descricao_problema: string;
  status: ChamadoStatus;
  data_abertura: string; // ISO date string
  descricao_servico?: string | null;
  data_encerramento?: string | null;
  tecnico_responsavel?: string | null;
  // SLA / Atraso: prazo estimado em horas baseado na prioridade ou data estipulada
  prazo_horas?: number;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  useLiveSupabase: boolean;
}

export interface ChatAttachment {
  id: string;
  nome: string;
  tipo: string; // MIME type
  tamanho: number; // bytes
  url: string; // Base64 data URL
  extensao?: string;
}

export interface ChatMessage {
  id: string;
  chamadoId: string; // Protocolo do chamado (ex: 'CH-2601') ou 'geral'
  senderId: string;
  senderName: string;
  senderPerfil: UserProfile;
  mensagem: string;
  criadoEm: string; // ISO date string
  anexo?: ChatAttachment | null;
  lida?: boolean;
}

// -------------------------------------------------------------
// INVENTÁRIO DE EQUIPAMENTOS
// -------------------------------------------------------------
export type EquipamentoStatus = 'Disponível' | 'Em Uso' | 'Em Manutenção' | 'Descartado';

export interface InventarioItem {
  id: string;
  patrimonio: string; // Ex: 'PAT-0042', 'NOTE-014'
  nome: string; // Ex: 'Notebook Dell Latitude 3420'
  tipo: string; // Ex: 'Notebook', 'Desktop', 'Monitor', 'Servidor', 'Impressora', 'Switch', 'Roteador'
  marca: string; // Ex: 'Dell', 'Lenovo', 'HP', 'Cisco'
  modelo: string; // Ex: 'Latitude 3420'
  numero_serie: string; // Ex: 'BR-849204-DL'
  status: EquipamentoStatus;
  responsavel: string; // Usuário ou setor (Ex: 'Mariana Souza' ou 'Almoxarifado TI')
  setor: string; // Ex: 'Recursos Humanos', 'TI', 'Financeiro', 'Vendas'
  localizacao: string; // Ex: 'Prédio A - Sala 204'
  data_aquisicao: string; // YYYY-MM-DD
  valor_estimado?: number;
  observacoes?: string;
  // Campos dinâmicos/personalizados configurados pelo usuário
  campos_customizados?: Record<string, string>;
  criado_em: string;
  atualizado_em?: string;
}

export interface InventarioCampoCustomizado {
  id: string;
  chave: string; // Ex: 'ip_address', 'ram_gb', 'mac_address'
  label: string; // Ex: 'Endereço IP', 'Memória RAM', 'MAC Address'
  tipo: 'texto' | 'numero' | 'selecao' | 'data';
  opcoes?: string[]; // Opções caso tipo seja 'selecao'
  obrigatorio?: boolean;
  placeholder?: string;
}

// -------------------------------------------------------------
// MODELOS FREQUENTES DE SOLICITAÇÃO (TEMPLATES RÁPIDOS)
// -------------------------------------------------------------
export interface ModeloFrequente {
  id: string;
  titulo: string;
  tipo_solicitacao: string;
  categoria: string;
  prioridade: ChamadoPrioridade;
  equipamento_sugerido?: string;
  descricao_padrao: string;
  icone?: string;
}

// Configuração do Docker Local
export interface DockerDbConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password?: string;
  status: 'offline' | 'running' | 'connected';
  lastChecked?: string;
}

// -------------------------------------------------------------
// AVISOS E BANNERS INFORMATIVOS (COMUNICADOS TI)
// -------------------------------------------------------------
export type AvisoTipo = 'urgente' | 'aviso' | 'info' | 'sucesso';

export interface AvisoBanner {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: AvisoTipo;
  ativo: boolean;
  criadoPor: string;
  perfilAutor: UserProfile;
  criadoEm: string; // ISO date string
  expiraEm?: string; // YYYY-MM-DD
  linkAcao?: string;
  textoAcao?: string;
}
