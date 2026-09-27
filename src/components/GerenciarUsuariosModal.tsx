import React, { useState, useEffect } from 'react';
import { User, UserProfile } from '../types';
import { SupabaseService, StoredUserAccount } from '../services/supabaseService';
import {
  Users,
  UserPlus,
  Trash2,
  Edit2,
  ShieldCheck,
  UserCheck,
  ShieldAlert,
  KeyRound,
  X,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  User as UserIcon,
  Search
} from 'lucide-react';

interface GerenciarUsuariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUsersUpdated?: () => void;
}

export const GerenciarUsuariosModal: React.FC<GerenciarUsuariosModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUsersUpdated
}) => {
  const [users, setUsers] = useState<StoredUserAccount[]>([]);
  const [filterPerfil, setFilterPerfil] = useState<'Todos' | UserProfile>('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [nome, setNome] = useState('');
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [perfil, setPerfil] = useState<UserProfile>('Usuário');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<StoredUserAccount | null>(null);

  const carregarUsuarios = async () => {
    const list = await SupabaseService.getUsers();
    setUsers(list);
  };

  useEffect(() => {
    if (isOpen) {
      carregarUsuarios();
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!nome.trim() || !login.trim() || !senha) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    if (senha !== confirmaSenha) {
      setError('A confirmação de senha não coincide com a senha digitada.');
      return;
    }

    if (senha.length < 4) {
      setError('A senha deve conter no mínimo 4 dígitos.');
      return;
    }

    setLoading(true);
    try {
      const res = await SupabaseService.createUserByAdmin({
        nome: nome.trim(),
        login: login.trim().toLowerCase(),
        email: email.trim() || `${login.trim().toLowerCase()}@empresa.com`,
        senha,
        perfil
      });

      if (!res.success || !res.user) {
        setError(res.error || 'Não foi possível cadastrar o usuário.');
      } else {
        setSuccessMsg(`Usuário ${res.user.nome} criado com perfil "${res.user.perfil}"!`);
        setNome('');
        setLogin('');
        setEmail('');
        setSenha('');
        setConfirmaSenha('');
        setPerfil('Usuário');
        await carregarUsuarios();
        if (onUsersUpdated) onUsersUpdated();
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao criar usuário.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    if (userToDelete.id === currentUser.id || userToDelete.login === currentUser.login) {
      setError('Não é permitido excluir o usuário que está atualmente logado.');
      setUserToDelete(null);
      return;
    }

    try {
      await SupabaseService.deleteUserByAdmin(userToDelete.id);
      setSuccessMsg(`Acesso do usuário ${userToDelete.nome} excluído.`);
      setUserToDelete(null);
      await carregarUsuarios();
      if (onUsersUpdated) onUsersUpdated();
    } catch (e: any) {
      setError('Erro ao remover usuário.');
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!u) return false;
    const matchesPerfil = filterPerfil === 'Todos' || u.perfil === filterPerfil;
    const searchLower = (searchTerm || '').toLowerCase();
    const matchesSearch =
      (u.nome || '').toLowerCase().includes(searchLower) ||
      (u.login || '').toLowerCase().includes(searchLower) ||
      (u.email ? u.email.toLowerCase().includes(searchLower) : false);
    return matchesPerfil && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Users size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                Gestão e Criação de Acessos de Usuários
              </h3>
              <p className="text-[11px] text-slate-400">
                Acesso exclusivo para Administradores: crie e gerencie contas Administrador, Técnico e Usuário
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* Feedback Alerts */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 size={15} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form to create new user account */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
              <UserPlus size={15} className="text-indigo-600" />
              Criar Novo Acesso de Usuário
            </h4>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Gabriela Costa"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Login de Acesso <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    placeholder="Ex: gabriela.costa"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Perfil de Acesso <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={perfil}
                    onChange={(e) => setPerfil(e.target.value as UserProfile)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Usuário">Usuário (Abre chamados e chat)</option>
                    <option value="Técnico">Técnico (Atendimento e laudos)</option>
                    <option value="Administrador">Administrador (Acesso total)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    E-mail Corporativo
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="gabriela@empresa.com"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Senha <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Mínimo 4 dígitos"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Confirmar Senha <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmaSenha}
                    onChange={(e) => setConfirmaSenha(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <UserPlus size={14} />
                  <span>{loading ? 'Cadastrando...' : 'Cadastrar Acesso'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* List of Registered Users */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Usuários Cadastrados ({users.length})
              </h4>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar usuário..."
                    className="pl-8 pr-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <select
                  value={filterPerfil}
                  onChange={(e) => setFilterPerfil(e.target.value as any)}
                  className="py-1 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
                >
                  <option value="Todos">Todos os Perfis</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Técnico">Técnico</option>
                  <option value="Usuário">Usuário</option>
                </select>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4">Nome & Login</th>
                    <th className="py-2.5 px-4">E-mail</th>
                    <th className="py-2.5 px-4">Perfil</th>
                    <th className="py-2.5 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredUsers.map((u) => {
                    const isSelf = u.id === currentUser.id || u.login === currentUser.login;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-4">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span>{u.nome}</span>
                            {isSelf && (
                              <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
                                Você
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">@{u.login}</div>
                        </td>

                        <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                          {u.email || '—'}
                        </td>

                        <td className="py-2.5 px-4">
                          <span className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                            u.perfil === 'Administrador' ? 'text-indigo-700' :
                            u.perfil === 'Técnico' ? 'text-amber-700' : 'text-slate-700'
                          }`}>
                            {u.perfil === 'Administrador' && <ShieldAlert size={12} />}
                            {u.perfil === 'Técnico' && <ShieldCheck size={12} />}
                            {u.perfil === 'Usuário' && <UserCheck size={12} />}
                            {u.perfil}
                          </span>
                        </td>

                        <td className="py-2.5 px-4 text-right">
                          {!isSelf ? (
                            <button
                              onClick={() => setUserToDelete(u)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title={`Excluir acesso de ${u.nome}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Sessão ativa</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>

      {/* Confirmation modal for delete user */}
      {userToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full border border-slate-200 shadow-2xl">
            <h4 className="font-bold text-sm text-slate-900 mb-2">Excluir Acesso de Usuário</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Confirma a exclusão do acesso de <strong>{userToDelete.nome}</strong> (@{userToDelete.login})? Ele perderá imediatamente acesso ao sistema.
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 rounded-lg hover:bg-rose-700"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
