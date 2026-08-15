import React, { useState, useEffect, useCallback } from 'react';
import { User, Chamado, ChamadoPrioridade } from './types';
import { SupabaseService } from './services/supabaseService';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { OperadorView } from './components/OperadorView';
import { TecnicoView } from './components/TecnicoView';
import { ChamadoDetailsModal } from './components/ChamadoDetailsModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { DidacticGuideModal } from './components/DidacticGuideModal';

const STORAGE_KEY_AUTH = 'sistema_chamados_auth_user';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTH);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Modals state
  const [selectedChamadoForDetails, setSelectedChamadoForDetails] = useState<Chamado | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);

  // Check Supabase connection state
  const supabaseCfg = SupabaseService.getConfig();
  const isSupabaseActive = supabaseCfg.isEnabled && supabaseCfg.isConfigured;

  // Load tickets
  const fetchChamados = useCallback(async (showRefreshingSpinner = false) => {
    if (showRefreshingSpinner) setIsRefreshing(true);
    try {
      const data = await SupabaseService.getChamados();
      setChamados(data);
    } catch (err) {
      console.error('Erro ao carregar chamados:', err);
    } finally {
      setIsLoading(false);
      if (showRefreshingSpinner) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchChamados();
  }, [fetchChamados]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
    } catch (e) {
      console.error('Erro ao salvar sessão de login', e);
    }
    fetchChamados();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    } catch (e) {
      console.error('Erro ao limpar sessão', e);
    }
  };

  const handleQuickSwitchRole = (role: 'operador' | 'tecnico') => {
    if (role === 'operador') {
      handleLogin({
        login: 'operador',
        nome: 'Carlos Mendes (Operador)',
        perfil: 'Operador'
      });
    } else {
      handleLogin({
        login: 'tecnico',
        nome: 'Rafael Silva (Técnico TI)',
        perfil: 'Técnico'
      });
    }
  };

  const handleCreateChamado = async (payload: {
    solicitante: string;
    tipo_solicitacao: string;
    categoria: string;
    prioridade: ChamadoPrioridade;
    equipamento?: string;
    titulo: string;
    descricao_problema: string;
  }) => {
    setIsSubmitting(true);
    try {
      const novo = await SupabaseService.createChamado(payload);
      await fetchChamados();
      return novo;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatusEmAtendimento = async (id: string, tecnicoNome: string) => {
    setIsSubmitting(true);
    try {
      const updated = await SupabaseService.updateStatusEmAtendimento(id, tecnicoNome);
      await fetchChamados();
      return updated;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEncerrarChamado = async (id: string, descricaoServico: string, tecnicoNome: string) => {
    setIsSubmitting(true);
    try {
      const updated = await SupabaseService.encerrarChamado(id, descricaoServico, tecnicoNome);
      await fetchChamados();
      return updated;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-indigo-600 selection:text-white">
      
      {/* If not authenticated, render Login Screen */}
      {!currentUser ? (
        <LoginScreen
          onLogin={handleLogin}
          onOpenGuide={() => setIsGuideOpen(true)}
        />
      ) : (
        <>
          {/* Main Application Header with User info, Profile badge & Logout button */}
          <Header
            user={currentUser}
            onLogout={handleLogout}
            onOpenGuide={() => setIsGuideOpen(true)}
            onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
            onRefresh={() => fetchChamados(true)}
            isRefreshing={isRefreshing}
            isSupabaseActive={isSupabaseActive}
          />

          {/* Main View Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-xs font-semibold text-slate-500">
                  Carregando chamados...
                </p>
              </div>
            ) : currentUser.perfil === 'Operador' ? (
              <OperadorView
                chamados={chamados}
                onCreateChamado={handleCreateChamado}
                onSelectChamado={(ch) => setSelectedChamadoForDetails(ch)}
                isSubmitting={isSubmitting}
              />
            ) : (
              <TecnicoView
                user={currentUser}
                chamados={chamados}
                onUpdateStatusEmAtendimento={handleUpdateStatusEmAtendimento}
                onEncerrarChamado={handleEncerrarChamado}
                onSelectChamado={(ch) => setSelectedChamadoForDetails(ch)}
                isProcessing={isSubmitting}
              />
            )}
          </main>
        </>
      )}

      {/* Global Details Modal */}
      <ChamadoDetailsModal
        chamado={selectedChamadoForDetails}
        onClose={() => setSelectedChamadoForDetails(null)}
      />

      {/* Supabase Connection & SQL DDL Modal */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onRefreshData={() => fetchChamados()}
      />

      {/* Interactive Didactic Flow 10-Step Guide */}
      <DidacticGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        currentUserProfile={currentUser?.perfil}
        onQuickSwitchRole={handleQuickSwitchRole}
      />

    </div>
  );
}
