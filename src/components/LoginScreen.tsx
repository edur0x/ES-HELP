import React, { useState } from 'react';
import { User, UserProfile } from '../types';
import { SupabaseService } from '../services/supabaseService';
import {
  LogIn,
  UserPlus,
  UserCheck,
  ShieldCheck,
  KeyRound,
  User as UserIcon,
  Mail,
  AlertCircle,
  Laptop,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  onOpenGuide?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'google'>('login');

  // Form states for login
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  // Form states for registration (Public: always creates 'Usuário')
  const [regNome, setRegNome] = useState('');
  const [regLogin, setRegLogin] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regSenha, setRegSenha] = useState('');
  const [regConfirmaSenha, setRegConfirmaSenha] = useState('');

  // Form states for Google Auth modal / input
  const [googleEmail, setGoogleEmail] = useState('usuario.empresa@gmail.com');
  const [googleName, setGoogleName] = useState('Usuário Google');

  // Feedback states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle standard Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!loginInput.trim() || !passwordInput) {
      setErrorMessage('Informe o login e a senha.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await SupabaseService.authenticateUser(loginInput, passwordInput);
      if (res.success && res.user) {
        onLogin(res.user);
      } else {
        setErrorMessage(res.error || 'Credenciais inválidas.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Falha ao autenticar.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Public Registration (Strictly creates Perfil: Usuário)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regNome.trim() || !regLogin.trim() || !regSenha) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (regSenha !== regConfirmaSenha) {
      setErrorMessage('A confirmação de senha não coincide com a senha digitada.');
      return;
    }

    if (regSenha.length < 4) {
      setErrorMessage('A senha deve conter no mínimo 4 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await SupabaseService.registerPublicUser({
        nome: regNome.trim(),
        login: regLogin.trim().toLowerCase(),
        email: regEmail.trim() || undefined,
        senha: regSenha
      });

      if (res.success && res.user) {
        setSuccessMessage('Conta de Usuário criada com sucesso! Acessando sistema...');
        setTimeout(() => {
          onLogin(res.user!);
        }, 600);
      } else {
        setErrorMessage(res.error || 'Falha ao criar conta.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro ao registrar usuário.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Sign-in / Signup
  const handleGoogleAuth = async (emailToUse: string, nameToUse?: string) => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const res = await SupabaseService.authenticateWithGoogle(emailToUse, nameToUse);
      if (res.success && res.user) {
        onLogin(res.user);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro no login com Google.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        
        {/* Brand Header */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-3 border border-blue-400/30">
          <Laptop className="w-7 h-7" />
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Sistema de Chamados TI
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
          Plataforma de abertura e atendimento técnico com controle de perfis
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl rounded-2xl">
          
          {/* Navigation Tabs: Entrar vs Criar Conta */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 mb-6">
            <button
              id="tab-auth-login"
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'login'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn size={14} />
              <span>Entrar</span>
            </button>

            <button
              id="tab-auth-register"
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus size={14} />
              <span>Criar Conta</span>
            </button>
          </div>

          {/* Feedback alerts */}
          {errorMessage && (
            <div
              id="auth-error-alert"
              className="mb-4 p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center gap-2"
            >
              <AlertCircle size={16} className="shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div
              id="auth-success-alert"
              className="mb-4 p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs flex items-center gap-2"
            >
              <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              
              {/* Google One-Click Action */}
              <button
                id="btn-google-login"
                type="button"
                onClick={() => handleGoogleAuth(googleEmail, googleName)}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs sm:text-sm font-semibold transition-all border border-slate-300 shadow-sm"
              >
                {/* SVG Google Logo */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continuar com o Google</span>
              </button>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-slate-800 w-full"></div>
                <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                  ou com login e senha
                </span>
                <div className="border-t border-slate-800 w-full"></div>
              </div>

              {/* Standard Login Form */}
              <form id="form-login" onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label htmlFor="input-login" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Login ou E-mail
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
                      placeholder="operador, tecnico ou seu email"
                      required
                      className="block w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                      className="block w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <button
                  id="btn-submit-login"
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 disabled:opacity-50"
                >
                  <LogIn size={16} />
                  <span>{isLoading ? 'Entrando...' : 'Entrar no Sistema'}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: CRIAR CONTA (CADASTRO PÚBLICO) */}
          {activeTab === 'register' && (
            <div className="space-y-4">
              
              {/* Profile Notice */}
              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/60 text-xs text-blue-300">
                <div className="flex items-start gap-2">
                  <Sparkles size={16} className="text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">Perfil Automático: </span>
                    O cadastro público cria contas com nível de <strong>Usuário</strong> (abertura e acompanhamento de chamados). O perfil <strong>Técnico</strong> é gerenciado internamente pela equipe de TI.
                  </div>
                </div>
              </div>

              {/* Google signup option */}
              <button
                id="btn-google-signup"
                type="button"
                onClick={() => handleGoogleAuth(googleEmail, googleName)}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-2 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-semibold transition-all border border-slate-300 shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Cadastrar com o Google (Perfil Usuário)</span>
              </button>

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-800 w-full"></div>
                <span className="bg-slate-900 px-3 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  ou preencha o formulário
                </span>
                <div className="border-t border-slate-800 w-full"></div>
              </div>

              <form id="form-cadastro-usuario" onSubmit={handleRegisterSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nome Completo <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="input-reg-nome"
                    type="text"
                    required
                    value={regNome}
                    onChange={(e) => setRegNome(e.target.value)}
                    placeholder="Ex: Fernanda Lima"
                    className="block w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Login de Acesso <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="input-reg-login"
                      type="text"
                      required
                      value={regLogin}
                      onChange={(e) => setRegLogin(e.target.value)}
                      placeholder="Ex: fernanda.lima"
                      className="block w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      E-mail <span className="text-slate-500 font-normal">(Opcional)</span>
                    </label>
                    <input
                      id="input-reg-email"
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="fernanda@empresa.com"
                      className="block w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Senha <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="input-reg-senha"
                      type="password"
                      required
                      value={regSenha}
                      onChange={(e) => setRegSenha(e.target.value)}
                      placeholder="Mínimo 4 dígitos"
                      className="block w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Confirmar Senha <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="input-reg-confirma"
                      type="password"
                      required
                      value={regConfirmaSenha}
                      onChange={(e) => setRegConfirmaSenha(e.target.value)}
                      placeholder="Repita a senha"
                      className="block w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  id="btn-submit-cadastro"
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 disabled:opacity-50"
                >
                  <UserPlus size={16} />
                  <span>{isLoading ? 'Criando Conta...' : 'Cadastrar e Acessar'}</span>
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Production Footer */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <span>HelpDesk Corporativo • Acesso Seguro ao Sistema de Chamados</span>
        </div>
      </div>
    </div>
  );
};

