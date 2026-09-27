import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Chamado, User, UserProfile } from '../types';

const STORAGE_KEY_CHAMADOS = 'sistema_chamados_dados';
const STORAGE_KEY_CONFIG = 'sistema_chamados_supabase_config';
const STORAGE_KEY_USERS = 'sistema_chamados_usuarios_db';

export interface StoredUserAccount {
  id: string;
  login: string;
  nome: string;
  email?: string;
  senha?: string;
  perfil: UserProfile;
  criadoEm: string;
  origem?: 'local' | 'google' | 'supabase';
}

const DEFAULT_USERS: StoredUserAccount[] = [
  {
    id: 'usr-admin-01',
    login: 'admin',
    nome: 'Administrador TI',
    email: 'admin@empresa.com',
    senha: 'admin123',
    perfil: 'Administrador',
    criadoEm: new Date().toISOString(),
    origem: 'local'
  },
  {
    id: 'usr-tecnico-01',
    login: 'tecnico',
    nome: 'Eduardo (Técnico TI)',
    email: 'eduardo.tecnico@empresa.com',
    senha: 'tecnico01',
    perfil: 'Técnico',
    criadoEm: new Date().toISOString(),
    origem: 'local'
  },
  {
    id: 'usr-usuario-01',
    login: 'usuario',
    nome: 'Mariana Souza',
    email: 'mariana.souza@empresa.com',
    senha: 'usuario123',
    perfil: 'Usuário',
    criadoEm: new Date().toISOString(),
    origem: 'local'
  },
  {
    id: 'usr-operador-01',
    login: 'operador',
    nome: 'Carlos Mendes',
    email: 'carlos.operador@empresa.com',
    senha: 'operador123',
    perfil: 'Usuário',
    criadoEm: new Date().toISOString(),
    origem: 'local'
  }
];

// Initial realistic seed tickets for rich dashboard metrics
const DEFAULT_CHAMADOS: Chamado[] = [
  {
    id: 'CH-2601',
    solicitante: 'Mariana Souza',
    tipo_solicitacao: 'Incidente (Falha / Erro)',
    categoria: 'Impressoras & Periféricos',
    prioridade: 'Média',
    equipamento: 'Impressora HP LaserJet Pro M404dw',
    titulo: 'Impressora travando papel na bandeja 2',
    descricao_problema: 'A impressora do setor de RH travou durante a impressão da folha de pagamento. Apresenta luz de atenção piscando.',
    status: 'Aberto',
    data_abertura: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    prazo_horas: 24
  },
  {
    id: 'CH-2602',
    solicitante: 'Carlos Mendes',
    tipo_solicitacao: 'Incidente (Falha / Erro)',
    categoria: 'Hardware (Computadores/Monitores)',
    prioridade: 'Alta',
    equipamento: 'Desktop Dell OptiPlex 7090',
    titulo: 'Computador da contabilidade sem ligar após queda de energia',
    descricao_problema: 'A máquina não dá sinal de vida ao apertar o botão power. Suspeita de fonte queimada.',
    status: 'Em Atendimento',
    data_abertura: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    tecnico_responsavel: 'Eduardo (Técnico TI)',
    prazo_horas: 12
  },
  {
    id: 'CH-2599',
    solicitante: 'Roberto Vendas',
    tipo_solicitacao: 'Incidente (Falha / Erro)',
    categoria: 'Rede / Internet / Wi-Fi',
    prioridade: 'Crítica',
    equipamento: 'Switch Cisco Catalyst 2960X',
    titulo: 'Queda de conexão no setor comercial e CRM inoperante',
    descricao_problema: 'Equipe de vendas sem acesso à internet e sem comunicação com o servidor de banco de dados.',
    status: 'Aberto',
    // Aberto há mais de 36 horas para demonstrar Chamado Atrasado no dashboard
    data_abertura: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    prazo_horas: 8
  },
  {
    id: 'CH-2598',
    solicitante: 'Fernanda Lima',
    tipo_solicitacao: 'Acesso / Permissões',
    categoria: 'E-mail / Contas de Acesso',
    prioridade: 'Baixa',
    equipamento: 'Notebook Dell Latitude 3420',
    titulo: 'Liberação de credencial VPN e pasta de rede',
    descricao_problema: 'Solicitação de acesso à pasta do Financeiro e configuração do cliente VPN corporativo.',
    status: 'Encerrado',
    data_abertura: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    data_encerramento: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    tecnico_responsavel: 'Eduardo (Técnico TI)',
    descricao_servico: 'Criado usuário no grupo de segurança do Active Directory e enviado manual de instruções de acesso VPN com 2FA.',
    prazo_horas: 48
  },
  {
    id: 'CH-2595',
    solicitante: 'Lucas Martins',
    tipo_solicitacao: 'Instalação / Configuração',
    categoria: 'Software / Aplicativos',
    prioridade: 'Média',
    equipamento: 'Notebook Lenovo ThinkPad T14',
    titulo: 'Instalação de software de análise de dados',
    descricao_problema: 'Necessidade de instalação do pacote corporativo de auditoria e drivers atualizados.',
    status: 'Encerrado',
    data_abertura: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    data_encerramento: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    tecnico_responsavel: 'Eduardo (Técnico TI)',
    descricao_servico: 'Realizada a instalação remota do pacote de softwares e validação de funcionamento junto ao usuário.',
    prazo_horas: 24
  }
];

// Helper to check if a ticket is overdue
export function isChamadoAtrasado(chamado?: Chamado | null): boolean {
  if (!chamado || chamado.status === 'Encerrado') return false;
  if (!chamado.data_abertura) return false;
  const openedTime = new Date(chamado.data_abertura).getTime();
  if (isNaN(openedTime)) return false;
  const now = Date.now();
  const hoursElapsed = (now - openedTime) / (1000 * 60 * 60);

  // If specific SLA hours is configured, use it; otherwise standard SLA by priority
  const slaHours = chamado.prazo_horas || (
    chamado.prioridade === 'Crítica' ? 6 :
    chamado.prioridade === 'Alta' ? 12 :
    chamado.prioridade === 'Média' ? 24 : 48
  );

  return hoursElapsed > slaHours;
}

function getInitialConfig() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  try {
    const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        url: parsed.url || envUrl,
        anonKey: parsed.anonKey || envKey,
        enabled: parsed.enabled ?? (Boolean(envUrl && envKey))
      };
    }
  } catch (e) {
    console.error('Erro ao ler config do Supabase do localStorage', e);
  }

  return {
    url: envUrl,
    anonKey: envKey,
    enabled: Boolean(envUrl && envKey && envUrl.startsWith('http'))
  };
}

let currentConfig = getInitialConfig();
let supabaseClient: SupabaseClient | null = null;

if (currentConfig.enabled && currentConfig.url && currentConfig.anonKey) {
  try {
    supabaseClient = createClient(currentConfig.url, currentConfig.anonKey);
  } catch (err) {
    console.warn('Erro ao inicializar cliente Supabase:', err);
  }
}

function getLocalUsers(): StoredUserAccount[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_USERS);
    if (data) {
      const parsed: StoredUserAccount[] = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const validUsers = parsed.filter(u => u && typeof u === 'object' && u.login);
        if (validUsers.length > 0) {
          // Ensure admin user exists in list
          if (!validUsers.some(u => u.perfil === 'Administrador')) {
            const withAdmin = [DEFAULT_USERS[0], ...validUsers];
            saveLocalUsers(withAdmin);
            return withAdmin;
          }
          return validUsers;
        }
      }
    }
  } catch (e) {
    console.error('Erro ao ler usuários do localStorage', e);
  }
  saveLocalUsers(DEFAULT_USERS);
  return DEFAULT_USERS;
}

function saveLocalUsers(users: StoredUserAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Erro ao salvar usuários no localStorage', e);
  }
}

function getLocalChamados(): Chamado[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_CHAMADOS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const valid = parsed.filter(c => c && typeof c === 'object' && c.id && c.titulo);
        if (valid.length > 0) return valid;
      }
    }
  } catch (e) {
    console.error('Erro ao ler chamados do localStorage', e);
  }
  saveLocalChamados(DEFAULT_CHAMADOS);
  return DEFAULT_CHAMADOS;
}

function saveLocalChamados(chamados: Chamado[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CHAMADOS, JSON.stringify(chamados));
  } catch (e) {
    console.error('Erro ao salvar chamados no localStorage', e);
  }
}

function generateChamadoId(existingChamados: Chamado[]): string {
  const prefix = 'CH-';
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${year}${randomSuffix}`;
}

export const SupabaseService = {
  getConfig() {
    return {
      url: currentConfig.url,
      anonKey: currentConfig.anonKey,
      isConfigured: Boolean(currentConfig.url && currentConfig.anonKey && currentConfig.url.startsWith('http')),
      isEnabled: currentConfig.enabled
    };
  },

  updateConfig(url: string, anonKey: string, enabled: boolean) {
    currentConfig = { url: url.trim(), anonKey: anonKey.trim(), enabled };
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(currentConfig));

    if (enabled && currentConfig.url && currentConfig.anonKey) {
      try {
        supabaseClient = createClient(currentConfig.url, currentConfig.anonKey);
      } catch (e) {
        supabaseClient = null;
        console.error('Erro ao reconfigurar Supabase:', e);
      }
    } else {
      supabaseClient = null;
    }
  },

  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!supabaseClient) {
      return { success: false, message: 'Cliente Supabase não configurado.' };
    }
    try {
      const { data, error } = await supabaseClient
        .from('chamados')
        .select('id')
        .limit(1);

      if (error) {
        return { success: false, message: `Erro do Supabase: ${error.message}` };
      }
      return { success: true, message: 'Conexão com o banco estabelecida com sucesso!' };
    } catch (err: any) {
      return { success: false, message: `Falha na conexão: ${err?.message || 'Erro desconhecido'}` };
    }
  },

  // -------------------------------------------------------------
  // USER & AUTH SERVICES (COM PERFIS ADMINISTRADOR, TÉCNICO E USUÁRIO)
  // -------------------------------------------------------------
  async getUsers(): Promise<StoredUserAccount[]> {
    if (supabaseClient && currentConfig.enabled) {
      try {
        const { data, error } = await supabaseClient
          .from('usuarios')
          .select('*')
          .order('criado_em', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: StoredUserAccount[] = data.map((u: any) => ({
            id: u.id,
            login: u.login,
            nome: u.nome,
            email: u.email,
            senha: u.senha,
            perfil: (u.perfil === 'Administrador' ? 'Administrador' : u.perfil === 'Técnico' ? 'Técnico' : 'Usuário') as UserProfile,
            criadoEm: u.criado_em || new Date().toISOString(),
            origem: u.origem || 'supabase'
          }));
          return mapped;
        }
      } catch (err) {
        console.warn('Erro ao buscar usuários do Supabase, usando local:', err);
      }
    }
    return getLocalUsers();
  },

  async authenticateUser(loginInput: string, passwordInput: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const cleanLogin = loginInput.trim().toLowerCase();
    const users = await this.getUsers();

    const matched = users.find(u => 
      u.login.toLowerCase() === cleanLogin || 
      (u.email && u.email.toLowerCase() === cleanLogin)
    );

    if (!matched) {
      return {
        success: false,
        error: 'Usuário não encontrado. Cadastre-se ou confira as credenciais.'
      };
    }

    if (matched.senha && matched.senha !== passwordInput) {
      return {
        success: false,
        error: 'Senha incorreta. Verifique os dados digitados.'
      };
    }

    return {
      success: true,
      user: {
        id: matched.id,
        login: matched.login,
        nome: matched.nome,
        email: matched.email,
        perfil: matched.perfil
      }
    };
  },

  // Criação de Usuário pelo Administrador (qualquer perfil: Administrador, Técnico ou Usuário)
  async createUserByAdmin(data: {
    nome: string;
    login: string;
    email?: string;
    senha: string;
    perfil: UserProfile;
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    const cleanLogin = data.login.trim().toLowerCase();
    if (!cleanLogin || !data.nome.trim() || !data.senha) {
      return { success: false, error: 'Por favor, preencha todos os campos obrigatórios.' };
    }

    const currentUsers = getLocalUsers();
    if (currentUsers.some(u => u.login.toLowerCase() === cleanLogin)) {
      return { success: false, error: 'Este login já está cadastrado no sistema. Escolha outro.' };
    }

    const newAccount: StoredUserAccount = {
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      login: cleanLogin,
      nome: data.nome.trim(),
      email: data.email?.trim() || `${cleanLogin}@empresa.com`,
      senha: data.senha,
      perfil: data.perfil,
      criadoEm: new Date().toISOString(),
      origem: 'local'
    };

    const updated = [newAccount, ...currentUsers];
    saveLocalUsers(updated);

    if (supabaseClient && currentConfig.enabled) {
      try {
        await supabaseClient.from('usuarios').insert([{
          id: newAccount.id,
          login: newAccount.login,
          nome: newAccount.nome,
          email: newAccount.email,
          senha: newAccount.senha,
          perfil: newAccount.perfil,
          criado_em: newAccount.criadoEm,
          origem: 'local'
        }]);
      } catch (err) {
        console.warn('Erro ao sincronizar usuário no Supabase:', err);
      }
    }

    return {
      success: true,
      user: {
        id: newAccount.id,
        login: newAccount.login,
        nome: newAccount.nome,
        email: newAccount.email,
        perfil: newAccount.perfil
      }
    };
  },

  // Alias for backward compatibility with CadastrarTecnicoModal
  async createTechnician(data: { nome: string; login: string; email?: string; senha: string }): Promise<{ success: boolean; user?: User; error?: string }> {
    return this.createUserByAdmin({ ...data, perfil: 'Técnico' });
  },

  // Atualizar usuário (Admin pode trocar nome, perfil ou redefinir senha)
  async updateUserByAdmin(id: string, updates: Partial<StoredUserAccount>): Promise<{ success: boolean; user?: User; error?: string }> {
    const currentUsers = getLocalUsers();
    const index = currentUsers.findIndex(u => u.id === id);
    if (index === -1) {
      return { success: false, error: 'Usuário não localizado.' };
    }

    const updatedAccount: StoredUserAccount = {
      ...currentUsers[index],
      ...updates
    };

    currentUsers[index] = updatedAccount;
    saveLocalUsers(currentUsers);

    return {
      success: true,
      user: {
        id: updatedAccount.id,
        login: updatedAccount.login,
        nome: updatedAccount.nome,
        email: updatedAccount.email,
        perfil: updatedAccount.perfil
      }
    };
  },

  // Excluir usuário pelo Administrador
  async deleteUserByAdmin(id: string): Promise<{ success: boolean; error?: string }> {
    const currentUsers = getLocalUsers();
    const filtered = currentUsers.filter(u => u.id !== id);
    if (filtered.length === currentUsers.length) {
      return { success: false, error: 'Usuário não encontrado.' };
    }
    saveLocalUsers(filtered);
    return { success: true };
  },

  // Public signup: cria 'Usuário'
  async registerPublicUser(data: { nome: string; login: string; email?: string; senha: string }): Promise<{ success: boolean; user?: User; error?: string }> {
    return this.createUserByAdmin({
      ...data,
      perfil: 'Usuário'
    });
  },

  // Google Login / Cadastro com Google:
  async authenticateWithGoogle(googleEmail: string, googleName?: string): Promise<{ success: boolean; user: User }> {
    const cleanEmail = googleEmail.trim().toLowerCase();
    const displayName = googleName?.trim() || cleanEmail.split('@')[0];
    const generatedLogin = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');

    const currentUsers = getLocalUsers();
    let existing = currentUsers.find(u => u.email?.toLowerCase() === cleanEmail || u.login.toLowerCase() === generatedLogin);

    if (!existing) {
      existing = {
        id: `google-${Date.now()}`,
        login: generatedLogin || `user_${Date.now().toString().slice(-4)}`,
        nome: displayName,
        email: cleanEmail,
        perfil: 'Usuário',
        criadoEm: new Date().toISOString(),
        origem: 'google'
      };
      saveLocalUsers([existing, ...currentUsers]);

      if (supabaseClient && currentConfig.enabled) {
        try {
          await supabaseClient.from('usuarios').insert([{
            id: existing.id,
            login: existing.login,
            nome: existing.nome,
            email: existing.email,
            perfil: 'Usuário',
            criado_em: existing.criadoEm,
            origem: 'google'
          }]);
        } catch (e) {
          console.warn('Erro ao gravar conta google no Supabase:', e);
        }
      }
    }

    return {
      success: true,
      user: {
        id: existing.id,
        login: existing.login,
        nome: existing.nome,
        email: existing.email,
        perfil: existing.perfil
      }
    };
  },

  // -------------------------------------------------------------
  // CHAMADOS SERVICES
  // -------------------------------------------------------------
  async getChamados(): Promise<Chamado[]> {
    if (supabaseClient && currentConfig.enabled) {
      try {
        const { data, error } = await supabaseClient
          .from('chamados')
          .select('*')
          .order('data_abertura', { ascending: false });

        if (!error && data) {
          saveLocalChamados(data as Chamado[]);
          return data as Chamado[];
        }
      } catch (err) {
        console.warn('Erro ao buscar do Supabase, usando local:', err);
      }
    }
    return getLocalChamados();
  },

  async createChamado(payload: {
    solicitante: string;
    tipo_solicitacao: string;
    categoria: string;
    prioridade: Chamado['prioridade'];
    equipamento?: string;
    titulo: string;
    descricao_problema: string;
    prazo_horas?: number;
  }): Promise<Chamado> {
    const localList = getLocalChamados();
    const newId = generateChamadoId(localList);
    const nowIso = new Date().toISOString();

    const novoChamado: Chamado = {
      id: newId,
      solicitante: payload.solicitante.trim(),
      tipo_solicitacao: payload.tipo_solicitacao,
      categoria: payload.categoria,
      prioridade: payload.prioridade,
      equipamento: payload.equipamento?.trim() || 'N/A',
      titulo: payload.titulo.trim(),
      descricao_problema: payload.descricao_problema.trim(),
      status: 'Aberto',
      data_abertura: nowIso,
      descricao_servico: null,
      data_encerramento: null,
      tecnico_responsavel: null,
      prazo_horas: payload.prazo_horas || (
        payload.prioridade === 'Crítica' ? 6 :
        payload.prioridade === 'Alta' ? 12 :
        payload.prioridade === 'Média' ? 24 : 48
      )
    };

    const updated = [novoChamado, ...localList];
    saveLocalChamados(updated);

    if (supabaseClient && currentConfig.enabled) {
      try {
        const { data, error } = await supabaseClient
          .from('chamados')
          .insert([novoChamado])
          .select()
          .single();

        if (!error && data) {
          return data as Chamado;
        }
      } catch (err) {
        console.error('Falha de rede ao inserir no Supabase:', err);
      }
    }

    return novoChamado;
  },

  async updateStatusEmAtendimento(id: string, tecnicoNome: string): Promise<Chamado | null> {
    const localList = getLocalChamados();
    const index = localList.findIndex(c => c.id === id);
    if (index === -1) return null;

    const updatedChamado: Chamado = {
      ...localList[index],
      status: 'Em Atendimento',
      tecnico_responsavel: tecnicoNome
    };

    localList[index] = updatedChamado;
    saveLocalChamados(localList);

    if (supabaseClient && currentConfig.enabled) {
      try {
        const { data, error } = await supabaseClient
          .from('chamados')
          .update({
            status: 'Em Atendimento',
            tecnico_responsavel: tecnicoNome
          })
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          return data as Chamado;
        }
      } catch (err) {
        console.error('Falha ao atualizar no Supabase:', err);
      }
    }

    return updatedChamado;
  },

  async encerrarChamado(id: string, descricaoServico: string, tecnicoNome: string): Promise<Chamado | null> {
    const localList = getLocalChamados();
    const index = localList.findIndex(c => c.id === id);
    if (index === -1) return null;

    const nowIso = new Date().toISOString();
    const updatedChamado: Chamado = {
      ...localList[index],
      status: 'Encerrado',
      descricao_servico: descricaoServico.trim(),
      data_encerramento: nowIso,
      tecnico_responsavel: tecnicoNome || localList[index].tecnico_responsavel
    };

    localList[index] = updatedChamado;
    saveLocalChamados(localList);

    if (supabaseClient && currentConfig.enabled) {
      try {
        const { data, error } = await supabaseClient
          .from('chamados')
          .update({
            status: 'Encerrado',
            descricao_servico: descricaoServico.trim(),
            data_encerramento: nowIso,
            tecnico_responsavel: tecnicoNome || localList[index].tecnico_responsavel
          })
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          return data as Chamado;
        }
      } catch (err) {
        console.error('Falha ao encerrar no Supabase:', err);
      }
    }

    return updatedChamado;
  },

  async deleteChamado(id: string): Promise<boolean> {
    const localList = getLocalChamados();
    const filtered = localList.filter(c => c.id !== id);
    if (filtered.length === localList.length) return false;
    saveLocalChamados(filtered);

    if (supabaseClient && currentConfig.enabled) {
      try {
        await supabaseClient.from('chamados').delete().eq('id', id);
      } catch (e) {
        console.warn('Erro ao deletar chamado no Supabase:', e);
      }
    }
    return true;
  },

  async clearAllData(): Promise<void> {
    saveLocalChamados([]);
    if (supabaseClient && currentConfig.enabled) {
      try {
        await supabaseClient.from('chamados').delete().neq('id', '___');
      } catch (e) {
        console.warn('Erro ao limpar Supabase:', e);
      }
    }
  }
};
