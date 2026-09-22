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
    id: 'usr-operador-01',
    login: 'operador',
    nome: 'Carlos Mendes',
    email: 'operador@empresa.com',
    senha: 'operador123',
    perfil: 'Usuário',
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
  }
];

// Load stored config or env variables
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

// Local Storage helpers for fallback persistence
function getLocalUsers(): StoredUserAccount[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_USERS);
    if (data) {
      const parsed: StoredUserAccount[] = JSON.parse(data);
      // Ensure defaults exist if list is empty
      if (parsed.length === 0) {
        saveLocalUsers(DEFAULT_USERS);
        return DEFAULT_USERS;
      }
      return parsed;
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
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Erro ao ler chamados do localStorage', e);
    return [];
  }
}

function saveLocalChamados(chamados: Chamado[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CHAMADOS, JSON.stringify(chamados));
  } catch (e) {
    console.error('Erro ao salvar chamados no localStorage', e);
  }
}

// Generate human-friendly ID like #CH-2601, #CH-2602
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
      return { success: true, message: 'Conexão com a tabela "chamados" no Supabase estabelecida com sucesso!' };
    } catch (err: any) {
      return { success: false, message: `Falha na conexão: ${err?.message || 'Erro desconhecido'}` };
    }
  },

  // -------------------------------------------------------------
  // USER & AUTH SERVICES
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
            perfil: (u.perfil === 'Técnico' ? 'Técnico' : 'Usuário') as UserProfile,
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

  // Public signup: Strictly only creates "Usuário" profile
  async registerPublicUser(data: { nome: string; login: string; email?: string; senha: string }): Promise<{ success: boolean; user?: User; error?: string }> {
    const cleanLogin = data.login.trim().toLowerCase();
    if (!cleanLogin || !data.nome.trim() || !data.senha) {
      return { success: false, error: 'Preencha todos os campos obrigatórios.' };
    }

    const currentUsers = getLocalUsers();
    if (currentUsers.some(u => u.login.toLowerCase() === cleanLogin)) {
      return { success: false, error: 'Este login já está cadastrado. Escolha outro.' };
    }

    const newAccount: StoredUserAccount = {
      id: `usr-${Date.now()}`,
      login: cleanLogin,
      nome: data.nome.trim(),
      email: data.email?.trim() || `${cleanLogin}@empresa.com`,
      senha: data.senha,
      perfil: 'Usuário', // Mandated by spec: public registration can only create 'Usuário'
      criadoEm: new Date().toISOString(),
      origem: 'local'
    };

    const updated = [newAccount, ...currentUsers];
    saveLocalUsers(updated);

    // Try sync to Supabase table 'usuarios' if available
    if (supabaseClient && currentConfig.enabled) {
      try {
        await supabaseClient.from('usuarios').insert([{
          id: newAccount.id,
          login: newAccount.login,
          nome: newAccount.nome,
          email: newAccount.email,
          senha: newAccount.senha,
          perfil: 'Usuário',
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

  // Technician creation: Allowed for creating other technicians
  async createTechnician(data: { nome: string; login: string; email?: string; senha: string }): Promise<{ success: boolean; user?: User; error?: string }> {
    const cleanLogin = data.login.trim().toLowerCase();
    if (!cleanLogin || !data.nome.trim() || !data.senha) {
      return { success: false, error: 'Preencha todos os campos obrigatórios.' };
    }

    const currentUsers = getLocalUsers();
    if (currentUsers.some(u => u.login.toLowerCase() === cleanLogin)) {
      return { success: false, error: 'Este login já está em uso.' };
    }

    const newTechAccount: StoredUserAccount = {
      id: `tech-${Date.now()}`,
      login: cleanLogin,
      nome: data.nome.trim(),
      email: data.email?.trim() || `${cleanLogin}@suporte.com`,
      senha: data.senha,
      perfil: 'Técnico', // Granted technician role
      criadoEm: new Date().toISOString(),
      origem: 'local'
    };

    const updated = [newTechAccount, ...currentUsers];
    saveLocalUsers(updated);

    if (supabaseClient && currentConfig.enabled) {
      try {
        await supabaseClient.from('usuarios').insert([{
          id: newTechAccount.id,
          login: newTechAccount.login,
          nome: newTechAccount.nome,
          email: newTechAccount.email,
          senha: newTechAccount.senha,
          perfil: 'Técnico',
          criado_em: newTechAccount.criadoEm,
          origem: 'local'
        }]);
      } catch (err) {
        console.warn('Erro ao inserir técnico no Supabase:', err);
      }
    }

    return {
      success: true,
      user: {
        id: newTechAccount.id,
        login: newTechAccount.login,
        nome: newTechAccount.nome,
        email: newTechAccount.email,
        perfil: newTechAccount.perfil
      }
    };
  },

  // Google Login / Cadastro com Google:
  async authenticateWithGoogle(googleEmail: string, googleName?: string): Promise<{ success: boolean; user: User }> {
    const cleanEmail = googleEmail.trim().toLowerCase();
    const displayName = googleName?.trim() || cleanEmail.split('@')[0];
    const generatedLogin = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');

    const currentUsers = getLocalUsers();
    let existing = currentUsers.find(u => u.email?.toLowerCase() === cleanEmail || u.login.toLowerCase() === generatedLogin);

    if (!existing) {
      // Create new Google account with default profile "Usuário"
      existing = {
        id: `google-${Date.now()}`,
        login: generatedLogin || `user_${Date.now().toString().slice(-4)}`,
        nome: displayName,
        email: cleanEmail,
        perfil: 'Usuário', // Default strictly to Usuário
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

        if (error) {
          console.warn('Supabase getChamados error, usando fallback local:', error.message);
          return getLocalChamados();
        }

        if (data) {
          // Keep local mirror updated
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
      tecnico_responsavel: null
    };

    // Save to local storage first
    const updated = [novoChamado, ...localList];
    saveLocalChamados(updated);

    // Try Supabase if connected
    if (supabaseClient && currentConfig.enabled) {
      try {
        const { data, error } = await supabaseClient
          .from('chamados')
          .insert([novoChamado])
          .select()
          .single();

        if (error) {
          console.error('Erro ao inserir chamado no Supabase:', error.message);
        } else if (data) {
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

        if (error) {
          console.error('Erro ao atualizar status no Supabase:', error.message);
        } else if (data) {
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

        if (error) {
          console.error('Erro ao encerrar chamado no Supabase:', error.message);
        } else if (data) {
          return data as Chamado;
        }
      } catch (err) {
        console.error('Falha ao encerrar no Supabase:', err);
      }
    }

    return updatedChamado;
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

