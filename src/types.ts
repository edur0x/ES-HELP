export type UserProfile = 'Operador' | 'Técnico';

export interface User {
  login: string;
  nome: string;
  perfil: UserProfile;
}

export type ChamadoStatus = 'Aberto' | 'Em Atendimento' | 'Encerrado';

export type ChamadoPrioridade = 'Baixa' | 'Média' | 'Alta' | 'Crítica';

export type TipoSolicitacao = 
  | 'Incidente (Falha / Erro)'
  | 'Requisição de Serviço'
  | 'Dúvida / Orientação'
  | 'Acesso / Permissões'
  | 'Instalação / Configuração';

export type CategoriaChamado = 
  | 'Hardware (Computadores/Monitores)'
  | 'Software / Aplicativos'
  | 'Rede / Internet / Wi-Fi'
  | 'E-mail / Contas de Acesso'
  | 'Impressoras & Periféricos'
  | 'Telefonia / Comunicação'
  | 'Outros';

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
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  useLiveSupabase: boolean;
}
