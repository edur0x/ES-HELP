import React, { useState, useEffect, useCallback } from 'react';
import { User, Chamado, ChamadoPrioridade, AvisoBanner } from './types';
import { SupabaseService } from './services/supabaseService';
import { AvisosService } from './services/avisosService';
import { Header, MainNavTab } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { OperadorView } from './components/OperadorView';
import { TecnicoView } from './components/TecnicoView';
import { InventarioView } from './components/InventarioView';
import { DashboardView } from './components/DashboardView';
import { BannerAvisos } from './components/BannerAvisos';
import { GerenciarAvisosModal } from './components/GerenciarAvisosModal';
import { GerenciarUsuariosModal } from './components/GerenciarUsuariosModal';
import { DockerConfigModal } from './components/DockerConfigModal';
import { ChamadoDetailsModal } from './components/ChamadoDetailsModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { OnlineChatModal } from './components/OnlineChatModal';
import { ChatFloatingLauncher } from './components/ChatFloatingLauncher';

const STORAGE_KEY_AUTH = 'sistema_chamados_auth_user';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTH);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && (parsed.login || parsed.nome)) {
          return parsed;
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<MainNavTab>('chamados');
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Avisos & Comunicados in Banner
  const [avisos, setAvisos] = useState<AvisoBanner[]>(() => {
    try {
      return AvisosService.getActiveAvisos() || [];
    } catch {
      return [];
    }
  });
  const [isAvisosModalOpen, setIsAvisosModalOpen] = useState<boolean>(false);

  // Admin view mode toggle when in 'chamados' tab: 'atendimento' or 'novo_chamado'
  const [adminChamadosMode, setAdminChamadosMode] = useState<'atendimento' | 'novo_chamado'>('atendimento');

  // Modals state
  const [selectedChamadoForDetails, setSelectedChamadoForDetails] = useState<Chamado | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [isDockerModalOpen, setIsDockerModalOpen] = useState<boolean>(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [activeChatChamadoId, setActiveChatChamadoId] = useState<string>('geral');

  // Handle opening chat
  const handleOpenChat = (chamadoId?: string) => {
    setActiveChatChamadoId(chamadoId || 'geral');
    setIsChatOpen(true);
  };

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

  // Subscribe to real-time avisos updates
  useEffect(() => {
    const updateActiveAvisos = () => {
      setAvisos(AvisosService.getActiveAvisos());
    };
    updateActiveAvisos();
    const unsubscribe = AvisosService.subscribe(() => {
      updateActiveAvisos();
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
    } catch (e) {
      console.error('Erro ao salvar sessão de login', e);
    }
    // If ordinary user, always route to 'chamados'
    if (user.perfil === 'Usuário' || user.perfil === 'Operador') {
      setActiveTab('chamados');
    }
    fetchChamados();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('chamados');
    try {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    } catch (e) {
      console.error('Erro ao limpar sessão', e);
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
        />
      ) : (
        <>
          {/* Main Application Header with Navigation Tabs, User info & Actions */}
          <Header
            user={currentUser}
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab)}
            onLogout={handleLogout}
            onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
            onOpenDockerConfig={() => setIsDockerModalOpen(true)}
            onOpenUserManagement={() => setIsUserManagementOpen(true)}
            onOpenManageAvisos={() => setIsAvisosModalOpen(true)}
            activeAvisosCount={avisos.length}
            onRefresh={() => fetchChamados(true)}
            onOpenChat={() => handleOpenChat('geral')}
            isRefreshing={isRefreshing}
            isSupabaseActive={isSupabaseActive}
          />

          {/* Corporate Issue & Maintenance Announcements Banner (Visible for all users) */}
          <BannerAvisos
            avisos={avisos}
            currentUser={currentUser}
            onOpenManageAvisos={() => setIsAvisosModalOpen(true)}
          />

          {/* Main Content Area based on Profile & Selected Tab */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-xs font-semibold text-slate-500">
                  Carregando informações do sistema...
                </p>
              </div>
            ) : currentUser.perfil === 'Usuário' || currentUser.perfil === 'Operador' ? (
              /* STRICT ENVIRONMENT ISOLATION FOR ORDINARY USERS */
              <OperadorView
                currentUser={currentUser}
                chamados={chamados}
                onCreateChamado={handleCreateChamado}
                onSelectChamado={(ch) => setSelectedChamadoForDetails(ch)}
                onOpenChat={handleOpenChat}
                isSubmitting={isSubmitting}
              />
            ) : (
              /* PRIVILEGED PROFILES (ADMINISTRADOR & TÉCNICO) */
              <>
                {/* TAB 1: CHAMADOS */}
                {activeTab === 'chamados' && (
                  <div className="space-y-4">
                    {/* Admin Switch between Queue and Opening form */}
                    {currentUser.perfil === 'Administrador' && (
                      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                        <div className="text-xs font-bold text-slate-700">
                          Visão do Administrador:
                        </div>
                        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
                          <button
                            onClick={() => setAdminChamadosMode('atendimento')}
                            className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                              adminChamadosMode === 'atendimento'
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Atender Fila Técnica
                          </button>
                          <button
                            onClick={() => setAdminChamadosMode('novo_chamado')}
                            className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                              adminChamadosMode === 'novo_chamado'
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Abrir Chamado / Modelos Frequentes
                          </button>
                        </div>
                      </div>
                    )}

                    {currentUser.perfil === 'Administrador' && adminChamadosMode === 'novo_chamado' ? (
                      <OperadorView
                        currentUser={currentUser}
                        chamados={chamados}
                        onCreateChamado={handleCreateChamado}
                        onSelectChamado={(ch) => setSelectedChamadoForDetails(ch)}
                        onOpenChat={handleOpenChat}
                        isSubmitting={isSubmitting}
                      />
                    ) : (
                      <TecnicoView
                        user={currentUser}
                        chamados={chamados}
                        onUpdateStatusEmAtendimento={handleUpdateStatusEmAtendimento}
                        onEncerrarChamado={handleEncerrarChamado}
                        onSelectChamado={(ch) => setSelectedChamadoForDetails(ch)}
                        onOpenChat={handleOpenChat}
                        isProcessing={isSubmitting}
                      />
                    )}
                  </div>
                )}

                {/* TAB 2: INVENTÁRIO DE EQUIPAMENTOS */}
                {activeTab === 'inventario' && (
                  <InventarioView
                    currentUser={currentUser}
                    onSelectEquipamentoParaChamado={(eqNome) => {
                      setActiveTab('chamados');
                      setAdminChamadosMode('novo_chamado');
                    }}
                  />
                )}

                {/* TAB 3: DASHBOARD INTERATIVO */}
                {activeTab === 'dashboard' && (
                  <DashboardView
                    currentUser={currentUser}
                    chamados={chamados}
                    onSelectChamado={(ch) => setSelectedChamadoForDetails(ch)}
                    onOpenChat={handleOpenChat}
                    onNavigateToInventario={() => setActiveTab('inventario')}
                  />
                )}
              </>
            )}
          </main>

          {/* Floating Online Chat Launcher */}
          <ChatFloatingLauncher
            currentUser={currentUser}
            onOpenChat={handleOpenChat}
          />
        </>
      )}

      {/* Global Details Modal */}
      <ChamadoDetailsModal
        chamado={selectedChamadoForDetails}
        onClose={() => setSelectedChamadoForDetails(null)}
        onOpenChat={handleOpenChat}
      />

      {/* Online Chat Modal with Attachment Support */}
      {currentUser && (
        <OnlineChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          currentUser={currentUser}
          chamados={chamados}
          initialChamadoId={activeChatChamadoId}
        />
      )}

      {/* User Management Modal for Administrator */}
      {currentUser && currentUser.perfil === 'Administrador' && (
        <GerenciarUsuariosModal
          isOpen={isUserManagementOpen}
          onClose={() => setIsUserManagementOpen(false)}
          currentUser={currentUser}
          onUsersUpdated={() => fetchChamados()}
        />
      )}

      {/* Corporate Announcements & Banner Manager (Admin & Técnico) */}
      {currentUser && (currentUser.perfil === 'Administrador' || currentUser.perfil === 'Técnico') && (
        <GerenciarAvisosModal
          isOpen={isAvisosModalOpen}
          onClose={() => setIsAvisosModalOpen(false)}
          currentUser={currentUser}
          onAvisosChanged={() => setAvisos(AvisosService.getActiveAvisos())}
        />
      )}

      {/* Docker Local Database Guide & Test Modal */}
      <DockerConfigModal
        isOpen={isDockerModalOpen}
        onClose={() => setIsDockerModalOpen(false)}
      />

      {/* Supabase Connection & SQL DDL Modal */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onRefreshData={() => fetchChamados()}
      />

    </div>
  );
}
