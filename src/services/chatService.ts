import { ChatMessage, ChatAttachment, UserProfile } from '../types';
import { SupabaseService } from './supabaseService';

const STORAGE_KEY_CHAT = 'sistema_chamados_chat_messages';
const BROADCAST_CHANNEL_NAME = 'sistema_chamados_chat_channel';

// Default initial sample messages for demonstration
const INITIAL_DEMO_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-demo-1',
    chamadoId: 'geral',
    senderId: 'usr-tecnico-01',
    senderName: 'Eduardo (Técnico TI)',
    senderPerfil: 'Técnico',
    mensagem: 'Olá! Seja bem-vindo ao suporte técnico de TI online. Como posso ajudar com seus chamados ou equipamentos hoje?',
    criadoEm: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    lida: true
  },
  {
    id: 'msg-demo-2',
    chamadoId: 'geral',
    senderId: 'usr-operador-01',
    senderName: 'Carlos Mendes',
    senderPerfil: 'Usuário',
    mensagem: 'Olá Eduardo! Abri um chamado para a impressora do financeiro que está travando o papel.',
    criadoEm: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    lida: true
  },
  {
    id: 'msg-demo-3',
    chamadoId: 'geral',
    senderId: 'usr-tecnico-01',
    senderName: 'Eduardo (Técnico TI)',
    senderPerfil: 'Técnico',
    mensagem: 'Perfeito! Se você puder anexar uma foto do painel de erro ou da mensagem exibida, agilizará o diagnóstico.',
    criadoEm: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    lida: true
  }
];

let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel não disponível:', e);
}

// Active listeners
type MessageListener = (newMessage: ChatMessage) => void;
const listeners: Set<MessageListener> = new Set();

if (broadcastChannel) {
  broadcastChannel.onmessage = (event) => {
    if (event.data && event.data.type === 'NEW_MESSAGE' && event.data.payload) {
      listeners.forEach((listener) => listener(event.data.payload));
    }
  };
}

// Also listen to storage events across different tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY_CHAT && event.newValue) {
      try {
        const msgs: ChatMessage[] = JSON.parse(event.newValue);
        if (msgs.length > 0) {
          const latest = msgs[msgs.length - 1];
          listeners.forEach((listener) => listener(latest));
        }
      } catch (err) {
        console.error('Erro ao processar storage event de chat:', err);
      }
    }
  });
}

function getStoredMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHAT);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Erro ao ler mensagens do chat no localStorage:', e);
  }

  // Pre-seed demo
  saveStoredMessages(INITIAL_DEMO_MESSAGES);
  return INITIAL_DEMO_MESSAGES;
}

function saveStoredMessages(messages: ChatMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(messages));
  } catch (e) {
    console.error('Erro ao salvar mensagens do chat no localStorage:', e);
  }
}

export const ChatService = {
  getMessages(chamadoId?: string): ChatMessage[] {
    const all = getStoredMessages();
    if (!chamadoId || chamadoId === 'todos') {
      return all;
    }
    return all.filter((m) => m.chamadoId === chamadoId);
  },

  async sendMessage(payload: {
    chamadoId: string;
    senderId: string;
    senderName: string;
    senderPerfil: UserProfile;
    mensagem: string;
    anexo?: ChatAttachment | null;
  }): Promise<ChatMessage> {
    const nowIso = new Date().toISOString();
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      chamadoId: payload.chamadoId || 'geral',
      senderId: payload.senderId,
      senderName: payload.senderName,
      senderPerfil: payload.senderPerfil,
      mensagem: payload.mensagem.trim(),
      criadoEm: nowIso,
      anexo: payload.anexo || null,
      lida: false
    };

    const current = getStoredMessages();
    const updated = [...current, newMsg];
    saveStoredMessages(updated);

    // Broadcast across tabs
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ type: 'NEW_MESSAGE', payload: newMsg });
      } catch (e) {
        console.warn('Erro ao disparar broadcast de mensagem:', e);
      }
    }

    // Notify in-tab listeners
    listeners.forEach((listener) => {
      try {
        listener(newMsg);
      } catch (e) {
        console.error('Erro no listener de chat:', e);
      }
    });

    return newMsg;
  },

  subscribe(listener: MessageListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  markAsRead(chamadoId: string, currentUserId: string): void {
    const current = getStoredMessages();
    let changed = false;

    const updated = current.map((m) => {
      if (m.chamadoId === chamadoId && m.senderId !== currentUserId && !m.lida) {
        changed = true;
        return { ...m, lida: true };
      }
      return m;
    });

    if (changed) {
      saveStoredMessages(updated);
    }
  },

  getUnreadCount(currentUserId: string, chamadoId?: string): number {
    const all = getStoredMessages();
    return all.filter((m) => {
      if (m.senderId === currentUserId) return false;
      if (m.lida) return false;
      if (chamadoId && m.chamadoId !== chamadoId) return false;
      return true;
    }).length;
  },

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  },

  // Helper to convert browser File to base64 ChatAttachment
  fileToAttachment(file: File): Promise<ChatAttachment> {
    return new Promise((resolve, reject) => {
      // 5MB limit check
      const MAX_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        reject(new Error('O arquivo excede o limite máximo de 5MB.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const extension = file.name.split('.').pop()?.toLowerCase() || '';

        resolve({
          id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          nome: file.name,
          tipo: file.type || 'application/octet-stream',
          tamanho: file.size,
          url: result,
          extensao: extension
        });
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }
};
