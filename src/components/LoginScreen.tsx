import React, { useState } from 'react';
import { User, UserProfile } from '../types';
import { LogIn, UserCheck, ShieldCheck, KeyRound, User as UserIcon, AlertCircle, Laptop, Check } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  onOpenGuide: () => void;
}

const FIXED_USERS: Record<string, { pass: string; user: User }> = {
  operador: {
    pass: 'operador123',
    user: {
      login: 'operador',
      nome: 'Carlos Mendes (Operador)',
      perfil: 'Operador'
    }
  },
  tecnico: {
    pass: 'tecnico123',
    user: {
      login: 'tecnico',
      nome: 'Rafael Silva (Técnico TI)',
      perfil: 'Técnico'
    }
  }
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onOpenGuide }) => {
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanLogin = loginInput.trim().toLowerCase();
    const userConfig = FIXED_USERS[cleanLogin];

    if (!userConfig) {
      setErrorMessage('Usuário não encontrado. Utilize "operador" ou "tecnico".');
      return;
    }

    if (passwordInput !== userConfig.pass) {
      setErrorMessage('Senha incorreta. Confira as credenciais da demonstração abaixo.');
      return;
    }

    onLogin(userConfig.user);
  };

  const handleQuickLogin = (role: 'operador' | 'tecnico') => {
    const config = FIXED_USERS[role];
    setLoginInput(role);
    setPasswordInput(config.pass);
    setErrorMessage(null);
    onLogin(config.user);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        
        {/* Brand Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-4 border border-blue-400/30">
          <Laptop className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Sistema de Chamados TI
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Ambiente didático para simulação do ciclo de abertura e atendimento
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 sm:px-8 shadow-2xl rounded-2xl">
          
          {/* Main Form */}
          <form id="form-login" onSubmit={handleSubmit} className="space-y-5">
            {errorMessage && (
              <div
                id="login-error-alert"
                className="p-3 bg-rose-950/50 border border-rose-800 rounded-lg text-rose-300 text-xs flex items-center gap-2"
              >
                <AlertCircle size={16} className="shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label htmlFor="input-login" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Usuário / Login
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <UserIcon size={16} />
                </div>
                <input
                  id="input-login"
                  type="text"
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder="operador ou tecnico"
                  required
                  className="block w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="input-senha" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <KeyRound size={16} />
                </div>
                <input
                  id="input-senha"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="block w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              id="btn-submit-login"
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
            >
              <LogIn size={16} />
              <span>Acessar Sistema</span>
            </button>
          </form>

          {/* Quick 1-Click Login Cards for Demonstrations */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Acesso Rápido para Demonstração
              </span>
              <button
                type="button"
                onClick={onOpenGuide}
                className="text-xs text-blue-400 hover:text-blue-300 underline"
              >
                Ver Roteiro
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Operador Card */}
              <button
                id="btn-quick-login-operador"
                type="button"
                onClick={() => handleQuickLogin('operador')}
                className="flex flex-col items-start p-3 bg-slate-950 hover:bg-slate-800/80 border border-amber-500/30 hover:border-amber-400 rounded-xl text-left transition-all group"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400">
                    <UserCheck size={14} />
                    Operador
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                    1-clique
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Login: <span className="font-mono text-slate-200">operador</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Senha: <span className="font-mono text-slate-200">operador123</span>
                </div>
                <p className="mt-1 text-[10px] text-amber-300/80">
                  Abre chamados e acompanha status.
                </p>
              </button>

              {/* Tecnico Card */}
              <button
                id="btn-quick-login-tecnico"
                type="button"
                onClick={() => handleQuickLogin('tecnico')}
                className="flex flex-col items-start p-3 bg-slate-950 hover:bg-slate-800/80 border border-indigo-500/30 hover:border-indigo-400 rounded-xl text-left transition-all group"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400">
                    <ShieldCheck size={14} />
                    Técnico
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                    1-clique
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Login: <span className="font-mono text-slate-200">tecnico</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Senha: <span className="font-mono text-slate-200">tecnico123</span>
                </div>
                <p className="mt-1 text-[10px] text-indigo-300/80">
                  Atende chamados e encerra com laudo.
                </p>
              </button>

            </div>
          </div>

        </div>

        {/* Footer didactic notice */}
        <div className="mt-4 text-center text-xs text-slate-500">
          Fluxo didático: <span className="text-slate-400">Operador abre</span> → <span className="text-slate-400">Técnico atende</span> → <span className="text-slate-400">Técnico encerra</span>
        </div>
      </div>
    </div>
  );
};
