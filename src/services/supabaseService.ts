import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Chamado, ChamadoStatus } from '../types';

const STORAGE_KEY_CHAMADOS = 'sistema_chamados_dados';
const STORAGE_KEY_CONFIG = 'sistema_chamados_supabase_config';

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

// Generate human-friendly ID like #CH-1001, #CH-1002
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
