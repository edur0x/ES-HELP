import React from 'react';
import { User, UserProfile } from '../types';
import {
  LogOut,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  Database,
  Laptop,
  RefreshCw,
  MessageSquare,
  BarChart3,
  Server,
  Users,
  Layers,
  Inbox,
  Megaphone
} from 'lucide-react';

export type MainNavTab = 'chamados' | 'inventario' | 'dashboard' | 'usuarios' | 'docker';

interface HeaderProps {
  user: User;
  activeTab: MainNavTab;
  onTabChange: (tab: MainNavTab) => void;
  onLogout: () => void;
  onOpenSupabaseConfig: () => void;
  onOpenDockerConfig: () => void;
  onOpenUserManagement: () => void;
  onOpenManageAvisos?: () => void;
  activeAvisosCount?: number;
  onRefresh: () => void;
  onOpenChat?: () => void;
  isRefreshing?: boolean;
  isSupabaseActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  onTabChange,
  onLogout,
  onOpenSupabaseConfig,
  onOpenDockerConfig,
  onOpenUserManagement,
  onOpenManageAvisos,
  activeAvisosCount = 0,
  onRefresh,
  onOpenChat,
  isRefreshing = false,
  isSupabaseActive = false
}) => {
  const isAdmin = user?.perfil === 'Administrador';
  const isTecnico = user?.perfil === 'Técnico';
  const isUsuario = !isAdmin && !isTecnico;
  const userNome = user?.nome || user?.login || 'Usuário';

  return (
    <header id="app-main-header" className="bg-slate-900 text-white shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 gap-3 border-b border-slate-800/80">
          
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-inner text-white font-bold">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  HelpDesk TI Corporativo
                </h1>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  Produção
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Chamados · Inventário de Equipamentos · Chat Online · Docker DB
              </p>
            </div>
          </div>

          {/* User Info and Controls */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 sm:gap-3">
            
            {/* User identification */}
            <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 text-xs">
              <span className="text-slate-400 hidden sm:inline">Logado:</span>
              <span className="font-semibold text-white">{userNome}</span>
              
              <div className="h-3 w-px bg-slate-700 mx-1"></div>

              {/* Profile Badge */}
              {user.perfil === 'Administrador' ? (
                <span className="inline-flex items-center gap-1 font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded text-[11px] border border-indigo-500/30">
                  <ShieldAlert size={12} />
                  Admin
                </span>
              ) : user.perfil === 'Técnico' ? (
                <span className="inline-flex items-center gap-1 font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded text-[11px] border border-amber-500/30">
                  <ShieldCheck size={12} />
                  Técnico
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded text-[11px] border border-emerald-500/30">
                  <UserCheck size={12} />
                  Usuário
                </span>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5">
              
              {/* Refresh button */}
              <button
                id="btn-refresh-chamados"
                onClick={onRefresh}
                title="Atualizar dados"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <RefreshCw size={15} className={isRefreshing ? 'animate-spin text-blue-400' : ''} />
              </button>

              {/* Chat Online with real-time indicator */}
              {onOpenChat && (
                <button
                  id="btn-header-open-chat"
                  onClick={onOpenChat}
                  title="Abrir Chat Online com envio de anexos"
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-indigo-600/30 text-indigo-200 hover:text-white hover:bg-indigo-600 border border-indigo-500/40 transition-colors shadow-2xs font-semibold"
                >
                  <MessageSquare size={13} className="text-indigo-400" />
                  <span className="hidden sm:inline">Chat Online</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </button>
              )}

              {/* Avisos & Comunicados Launcher for Admin and Tech */}
              {(isAdmin || isTecnico) && onOpenManageAvisos && (
                <button
                  id="btn-header-open-avisos"
                  onClick={onOpenManageAvisos}
                  title="Gerenciar e publicar avisos em banner para os usuários"
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-200 hover:text-white hover:bg-amber-600 border border-amber-500/30 transition-colors font-semibold shadow-2xs"
                >
                  <Megaphone size={13} className="text-amber-400" />
                  <span className="hidden sm:inline">Avisos & Banners</span>
                  {activeAvisosCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px]">
                      {activeAvisosCount}
                    </span>
                  )}
                </button>
              )}

              {/* Docker / Local DB Quick Launcher */}
              {(isAdmin || isTecnico) && (
                <button
                  onClick={onOpenDockerConfig}
                  title="Configuração do Banco de Dados Docker Local"
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors"
                >
                  <Server size={13} className="text-blue-400" />
                  <span className="hidden md:inline">Docker DB</span>
                </button>
              )}

              {/* Supabase connection status */}
              <button
                id="btn-open-supabase-modal"
                onClick={onOpenSupabaseConfig}
                title="Banco de Dados Supabase"
                className={`p-1.5 rounded-lg border transition-colors ${
                  isSupabaseActive
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <Database size={14} className={isSupabaseActive ? 'text-emerald-400' : 'text-slate-400'} />
              </button>

              {/* Logout Button */}
              <button
                id="btn-logout"
                onClick={onLogout}
                title="Encerrar sessão"
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/30 transition-colors"
              >
                <LogOut size={13} />
                <span>Sair</span>
              </button>
            </div>

          </div>

        </div>

        {/* Bottom Navigation Tabs Bar */}
        <nav className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none text-xs">
          
          {/* Aba: Chamados (Visible for all profiles) */}
          <button
            onClick={() => onTabChange('chamados')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'chamados'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Inbox size={14} />
            <span>{isUsuario ? 'Meus Chamados' : 'Fila de Chamados'}</span>
          </button>

          {/* Aba: Inventário (Visible for Admin and Técnico) */}
          {(isAdmin || isTecnico) && (
            <button
              onClick={() => onTabChange('inventario')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === 'inventario'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Laptop size={14} />
              <span>Inventário de Equipamentos</span>
            </button>
          )}

          {/* Aba: Dashboard Interativo (Visible for Admin and Técnico) */}
          {(isAdmin || isTecnico) && (
            <button
              onClick={() => onTabChange('dashboard')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 size={14} />
              <span>Dashboard Interativo</span>
            </button>
          )}

          {/* Aba: Gestão de Usuários (Acesso exclusivo Administrador) */}
          {isAdmin && (
            <button
              onClick={onOpenUserManagement}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all whitespace-nowrap"
            >
              <Users size={14} />
              <span>Gestão de Usuários</span>
            </button>
          )}

          {/* Aba: Avisos & Comunicados em Banner (Admin e Técnico) */}
          {(isAdmin || isTecnico) && onOpenManageAvisos && (
            <button
              onClick={onOpenManageAvisos}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all whitespace-nowrap"
            >
              <Megaphone size={14} />
              <span>Avisos em Banner</span>
              {activeAvisosCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px]">
                  {activeAvisosCount}
                </span>
              )}
            </button>
          )}

          {/* Aba: Docker / Banco Local (Atalho direto) */}
          {(isAdmin || isTecnico) && (
            <button
              onClick={onOpenDockerConfig}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all whitespace-nowrap"
            >
              <Server size={14} />
              <span>Docker & Banco Local</span>
            </button>
          )}

        </nav>

      </div>
    </header>
  );
};
