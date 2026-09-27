import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, ShieldCheck, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturou erro não tratado:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetLocalData = () => {
    try {
      localStorage.removeItem('sistema_chamados_auth_user');
      localStorage.removeItem('sistema_chamados_avisos_banners');
      localStorage.removeItem('sistema_chamados_dados');
      localStorage.removeItem('sistema_chamados_tipos_solicitacao');
      localStorage.removeItem('sistema_chamados_categorias');
      localStorage.removeItem('sistema_chamados_modelos_frequentes');
      localStorage.removeItem('sistema_chamados_inventario_itens');
      localStorage.removeItem('sistema_chamados_inventario_campos');
    } catch (e) {
      console.warn('Erro ao limpar localStorage:', e);
    }
    window.location.reload();
  };

  private handleLoginAsAdmin = () => {
    try {
      const defaultAdmin = {
        id: 'usr-admin-01',
        login: 'admin',
        nome: 'Administrador TI',
        email: 'admin@empresa.com',
        perfil: 'Administrador'
      };
      localStorage.setItem('sistema_chamados_auth_user', JSON.stringify(defaultAdmin));
    } catch (e) {
      console.warn('Erro ao definir admin:', e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
          <div className="bg-slate-800 border border-slate-700 max-w-lg w-full rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30 shadow-inner">
              <AlertTriangle size={28} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {this.props.fallbackTitle || 'Recuperação do Sistema HelpDesk TI'}
              </h2>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Ocorreu uma inconsistência no carregamento da tela. Seus dados e configurações continuam seguros. Escolha uma das opções abaixo para restaurar o acesso:
              </p>
            </div>

            {/* Error Message Details */}
            {this.state.error && (
              <div className="text-left bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-rose-300 max-h-28 overflow-y-auto">
                <span className="font-bold text-rose-400 block mb-0.5">Detalhe técnico:</span>
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/30"
              >
                <RefreshCw size={14} />
                <span>Recarregar Tela</span>
              </button>

              <button
                onClick={this.handleResetLocalData}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-300 bg-slate-700/80 hover:bg-slate-700 hover:text-white transition-colors border border-slate-600"
                title="Limpa chaves corrompidas do cache e reinicia os dados de demonstração"
              >
                <Trash2 size={14} className="text-rose-400" />
                <span>Limpar Cache & Reiniciar</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Atalho rápido:</span>
              <button
                onClick={this.handleLoginAsAdmin}
                className="text-indigo-400 hover:text-indigo-300 font-semibold underline flex items-center gap-1"
              >
                <ShieldCheck size={13} />
                <span>Acessar como Administrador</span>
              </button>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
