import { AvisoBanner, AvisoTipo, UserProfile } from '../types';

const STORAGE_KEY_AVISOS = 'sistema_chamados_avisos_banners';
const BROADCAST_AVISOS_CHANNEL = 'sistema_chamados_avisos_broadcast';

const DEFAULT_AVISOS: AvisoBanner[] = [
  {
    id: 'aviso-001',
    titulo: 'Instabilidade Temporária no Link de Internet e Wi-Fi',
    mensagem: 'Identificamos oscilações no provedor de fibra principal. O tráfego corporativo foi transferido para o link reserva de contingência. A operadora foi acionada com protocolo de urgência #98124.',
    tipo: 'urgente',
    ativo: true,
    criadoPor: 'Administrador TI',
    perfilAutor: 'Administrador',
    criadoEm: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
  },
  {
    id: 'aviso-002',
    titulo: 'Manutenção Programada nos Servidores de Rede',
    mensagem: 'Neste final de semana (sábado das 14h às 18h), será realizada atualização de segurança nos servidores de arquivos e ERP. O acesso poderá apresentar interrupções pontuais.',
    tipo: 'aviso',
    ativo: true,
    criadoPor: 'Eduardo (Técnico TI)',
    perfilAutor: 'Técnico',
    criadoEm: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  }
];

let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(BROADCAST_AVISOS_CHANNEL);
  }
} catch (e) {
  console.warn('BroadcastChannel não disponível para avisos:', e);
}

type AvisosListener = (avisos: AvisoBanner[]) => void;
const listeners: Set<AvisosListener> = new Set();

if (broadcastChannel) {
  broadcastChannel.onmessage = (event) => {
    try {
      if (event && event.data && event.data.type === 'AVISOS_UPDATED') {
        const updated = AvisosService.getAvisos();
        listeners.forEach(l => {
          try { l(updated); } catch (err) { console.error(err); }
        });
      }
    } catch (e) {
      console.warn('Erro ao processar broadcast de avisos:', e);
    }
  };
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    try {
      if (event.key === STORAGE_KEY_AVISOS) {
        const updated = AvisosService.getAvisos();
        listeners.forEach(l => {
          try { l(updated); } catch (err) { console.error(err); }
        });
      }
    } catch (e) {
      console.warn('Erro ao processar storage event de avisos:', e);
    }
  });
}

function notifyChange(): void {
  try {
    const current = AvisosService.getAvisos();
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ type: 'AVISOS_UPDATED' });
      } catch (e) {
        console.warn('Erro ao disparar broadcast de avisos:', e);
      }
    }
    listeners.forEach(l => {
      try {
        l(current);
      } catch (err) {
        console.error('Erro no listener de avisos:', err);
      }
    });
  } catch (e) {
    console.error('Erro ao notificar mudanças de avisos:', e);
  }
}

export const AvisosService = {
  getAvisos(): AvisoBanner[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_AVISOS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.filter(a => a && typeof a === 'object' && a.id && a.titulo);
          if (valid.length > 0) return valid;
        }
      }
    } catch (e) {
      console.error('Erro ao ler avisos do localStorage:', e);
    }
    try {
      this.saveAvisos(DEFAULT_AVISOS);
    } catch (e) {
      // ignore
    }
    return DEFAULT_AVISOS;
  },

  getActiveAvisos(): AvisoBanner[] {
    try {
      const all = this.getAvisos();
      if (!Array.isArray(all)) return DEFAULT_AVISOS;
      const todayStr = new Date().toISOString().split('T')[0];

      return all.filter(a => {
        if (!a || typeof a !== 'object') return false;
        if (!a.ativo) return false;
        if (a.expiraEm && a.expiraEm < todayStr) return false;
        return true;
      });
    } catch (err) {
      console.error('Erro ao obter avisos ativos:', err);
      return DEFAULT_AVISOS;
    }
  },

  saveAvisos(avisos: AvisoBanner[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_AVISOS, JSON.stringify(avisos));
    } catch (e) {
      console.error('Erro ao salvar avisos no localStorage:', e);
    }
  },

  createAviso(payload: {
    titulo: string;
    mensagem: string;
    tipo: AvisoTipo;
    ativo: boolean;
    criadoPor: string;
    perfilAutor: UserProfile;
    expiraEm?: string;
    linkAcao?: string;
    textoAcao?: string;
  }): AvisoBanner {
    const id = `aviso-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const novoAviso: AvisoBanner = {
      ...payload,
      id,
      titulo: (payload.titulo || '').trim(),
      mensagem: (payload.mensagem || '').trim(),
      criadoEm: new Date().toISOString()
    };

    const current = this.getAvisos();
    const updated = [novoAviso, ...current];
    this.saveAvisos(updated);
    notifyChange();
    return novoAviso;
  },

  updateAviso(id: string, updates: Partial<AvisoBanner>): AvisoBanner | null {
    const current = this.getAvisos();
    const index = current.findIndex(a => a.id === id);
    if (index === -1) return null;

    const updatedAviso: AvisoBanner = {
      ...current[index],
      ...updates
    };

    current[index] = updatedAviso;
    this.saveAvisos(current);
    notifyChange();
    return updatedAviso;
  },

  toggleAvisoStatus(id: string): AvisoBanner | null {
    const current = this.getAvisos();
    const index = current.findIndex(a => a.id === id);
    if (index === -1) return null;

    current[index].ativo = !current[index].ativo;
    this.saveAvisos(current);
    notifyChange();
    return current[index];
  },

  deleteAviso(id: string): boolean {
    const current = this.getAvisos();
    const filtered = current.filter(a => a.id !== id);
    if (filtered.length === current.length) return false;

    this.saveAvisos(filtered);
    notifyChange();
    return true;
  },

  subscribe(listener: AvisosListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }
};
