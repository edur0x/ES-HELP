import React from 'react';
import { User } from '../types';
import { LogOut, UserCheck, ShieldCheck, Database, Laptop, RefreshCw, MessageSquare } from 'lucide-react';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onOpenSupabaseConfig: () => void;
  onRefresh: () => void;
  onOpenChat?: () => void;
  isRefreshing?: boolean;
  isSupabaseActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  onOpenSupabaseConfig,
  onRefresh,
  onOpenChat,
  isRefreshing = false,
  isSupabaseActive = false
}) => {
  return (
    <header id="app-main-header" className="bg-slate-900 text-white shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 gap-3">
          
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-inner text-white font-bold">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  HelpDesk TI
                </h1>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                  Produção
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sistema de Abertura & Atendimento de Chamados
              </p>
            </div>
          </div>

          {/* User Info and Controls */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 sm:gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
            
            {/* Required info display */}
            <div className="flex items-center gap-2 sm:gap-3 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <div className="text-xs">
                <span className="text-slate-400 block sm:inline mr-1">Usuário logado:</span>
                <span className="font-semibold text-white">{user.nome}</span>
              </div>
              
              <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-xs hidden sm:inline">Perfil:</span>
                {user.perfil === 'Técnico' ? (
                  <span
                    id="user-profile-badge"
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  >
                    <ShieldCheck size={12} />
                    Técnico
                  </span>
                ) : (
                  <span
                    id="user-profile-badge"
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  >
                    <UserCheck size={12} />
                    {user.perfil === 'Operador' ? 'Operador' : 'Usuário'}
                  </span>
                )}
              </div>
            </div>

            {/* Action Tools */}
            <div className="flex items-center gap-1.5">
              {/* Refresh button */}
              <button
                id="btn-refresh-chamados"
                onClick={onRefresh}
                title="Atualizar chamados"
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-blue-400' : ''} />
              </button>

              {/* Chat Online with Client/Support */}
              {onOpenChat && (
                <button
                  id="btn-header-open-chat"
                  onClick={onOpenChat}
                  title="Abrir Chat Online com envio de anexos"
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-indigo-600/25 text-indigo-200 hover:text-white hover:bg-indigo-600 border border-indigo-500/40 transition-colors shadow-2xs"
                >
                  <MessageSquare size={14} className="text-indigo-400" />
                  <span className="hidden sm:inline font-semibold">Chat Online</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </button>
              )}

              {/* Supabase Status / Config */}
              <button
                id="btn-open-supabase-modal"
                onClick={onOpenSupabaseConfig}
                title="Configuração do Banco Supabase"
                className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                  isSupabaseActive
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/50 hover:bg-emerald-900/50'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <Database size={14} className={isSupabaseActive ? 'text-emerald-400' : 'text-slate-400'} />
                <span className="hidden md:inline">Supabase</span>
                {isSupabaseActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                )}
              </button>

              {/* Logout Button */}
              <button
                id="btn-logout"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/30 transition-colors"
              >
                <LogOut size={14} />
                <span>Sair</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
