import React, { useState, useEffect } from 'react';
import { AvisoBanner, AvisoTipo, User } from '../types';
import { AvisosService } from '../services/avisosService';
import {
  Megaphone,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  Eye,
  Power,
  Calendar,
  User as UserIcon,
  Sparkles
} from 'lucide-react';

interface GerenciarAvisosModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onAvisosChanged?: () => void;
}

export const GerenciarAvisosModal: React.FC<GerenciarAvisosModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAvisosChanged
}) => {
  const [avisos, setAvisos] = useState<AvisoBanner[]>([]);
  const [editingAviso, setEditingAviso] = useState<AvisoBanner | null>(null);

  // Form states
  const [formTitulo, setFormTitulo] = useState('');
  const [formTipo, setFormTipo] = useState<AvisoTipo>('aviso');
  const [formMensagem, setFormMensagem] = useState('');
  const [formAtivo, setFormAtivo] = useState(true);
  const [formExpiraEm, setFormExpiraEm] = useState('');

  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [avisoToDelete, setAvisoToDelete] = useState<AvisoBanner | null>(null);

  const carregarAvisos = () => {
    const list = AvisosService.getAvisos();
    setAvisos(list);
  };

  useEffect(() => {
    if (isOpen) {
      carregarAvisos();
      setFeedbackSuccess(null);
      setFeedbackError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setEditingAviso(null);
    setFormTitulo('');
    setFormTipo('aviso');
    setFormMensagem('');
    setFormAtivo(true);
    setFormExpiraEm('');
    setFeedbackError(null);
  };

  const handleEditClick = (aviso: AvisoBanner) => {
    setEditingAviso(aviso);
    setFormTitulo(aviso.titulo);
    setFormTipo(aviso.tipo);
    setFormMensagem(aviso.mensagem);
    setFormAtivo(aviso.ativo);
    setFormExpiraEm(aviso.expiraEm || '');
    setFeedbackSuccess(null);
    setFeedbackError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError(null);
    setFeedbackSuccess(null);

    if (!formTitulo.trim() || !formMensagem.trim()) {
      setFeedbackError('Título do comunicado e a mensagem descritiva são obrigatórios.');
      return;
    }

    if (editingAviso) {
      AvisosService.updateAviso(editingAviso.id, {
        titulo: formTitulo.trim(),
        tipo: formTipo,
        mensagem: formMensagem.trim(),
        ativo: formAtivo,
        expiraEm: formExpiraEm || undefined
      });
      setFeedbackSuccess('Aviso atualizado com sucesso e sincronizado para todos os usuários!');
    } else {
      AvisosService.createAviso({
        titulo: formTitulo.trim(),
        tipo: formTipo,
        mensagem: formMensagem.trim(),
        ativo: formAtivo,
        criadoPor: currentUser.nome,
        perfilAutor: currentUser.perfil,
        expiraEm: formExpiraEm || undefined
      });
      setFeedbackSuccess('Novo comunicado publicado com sucesso! Já está visível na tela dos usuários.');
    }

    resetForm();
    carregarAvisos();
    if (onAvisosChanged) onAvisosChanged();
  };

  const handleToggleStatus = (id: string) => {
    AvisosService.toggleAvisoStatus(id);
    carregarAvisos();
    if (onAvisosChanged) onAvisosChanged();
  };

  const handleDelete = () => {
    if (!avisoToDelete) return;
    AvisosService.deleteAviso(avisoToDelete.id);
    setAvisoToDelete(null);
    setFeedbackSuccess('Comunicado excluído.');
    carregarAvisos();
    if (onAvisosChanged) onAvisosChanged();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Megaphone size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                Gerenciador de Avisos & Banners Informativos
              </h3>
              <p className="text-[11px] text-slate-400">
                Avisos cadastrados por Técnicos e Administradores são exibidos no topo para todos os usuários comuns
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
          
          {feedbackSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
              <span>{feedbackSuccess}</span>
            </div>
          )}

          {feedbackError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{feedbackError}</span>
            </div>
          )}

          {/* Form to Create or Edit Notice */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Megaphone size={14} className="text-indigo-600" />
                <span>{editingAviso ? 'Editar Comunicado' : 'Publicar Novo Aviso para Usuários'}</span>
              </h4>
              {editingAviso && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  Cancelar Edição
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Título */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Título do Aviso / Problema <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitulo}
                    onChange={(e) => setFormTitulo(e.target.value)}
                    placeholder="Ex: Instabilidade no link de internet / Manutenção no ERP"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                  />
                </div>

                {/* Tipo de Alerta */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tipo de Comunicado
                  </label>
                  <select
                    value={formTipo}
                    onChange={(e) => setFormTipo(e.target.value as AvisoTipo)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                  >
                    <option value="urgente">🚨 Urgente (Problema / Falha)</option>
                    <option value="aviso">⚠️ Aviso (Manutenção Programada)</option>
                    <option value="info">ℹ️ Informativo (Geral / Orientação)</option>
                    <option value="sucesso">✅ Sucesso (Problema Resolvido)</option>
                  </select>
                </div>

              </div>

              {/* Mensagem detalhada */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mensagem Explicativa para os Usuários <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={formMensagem}
                  onChange={(e) => setFormMensagem(e.target.value)}
                  placeholder="Explique o motivo, o setor afetado, prazo estimado de resolução ou recomendações para os colaboradores..."
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                ></textarea>
              </div>

              {/* Controls: Ativo & Expiração */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={formAtivo}
                      onChange={(e) => setFormAtivo(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span className="font-semibold">Exibir banner imediatamente na tela</span>
                  </label>

                  <div className="flex items-center gap-1.5">
                    <label className="text-slate-500 text-[11px]">Expira em (opcional):</label>
                    <input
                      type="date"
                      value={formExpiraEm}
                      onChange={(e) => setFormExpiraEm(e.target.value)}
                      className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-700"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 self-end"
                >
                  <Plus size={14} />
                  <span>{editingAviso ? 'Salvar Alterações' : 'Publicar Comunicado'}</span>
                </button>
              </div>
            </form>

            {/* Live Preview Card */}
            {formTitulo.trim() && (
              <div className="mt-4 pt-3 border-t border-slate-200">
                <div className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                  <Eye size={12} />
                  <span>Pré-visualização do Banner para o Usuário Comum:</span>
                </div>
                <div className={`p-3 rounded-lg border text-xs ${
                  formTipo === 'urgente' ? 'bg-rose-50 border-rose-200 text-rose-950' :
                  formTipo === 'aviso' ? 'bg-amber-50 border-amber-200 text-amber-950' :
                  formTipo === 'sucesso' ? 'bg-emerald-50 border-emerald-200 text-emerald-950' :
                  'bg-blue-50 border-blue-200 text-blue-950'
                }`}>
                  <div className="flex items-center gap-2 font-bold">
                    {formTipo === 'urgente' && <AlertTriangle size={15} className="text-rose-600" />}
                    {formTipo === 'aviso' && <AlertCircle size={15} className="text-amber-600" />}
                    {formTipo === 'sucesso' && <CheckCircle2 size={15} className="text-emerald-600" />}
                    {formTipo === 'info' && <Info size={15} className="text-blue-600" />}
                    <span>{formTitulo}</span>
                  </div>
                  <p className="mt-1 text-slate-700 text-[11px] leading-relaxed">
                    {formMensagem || 'A mensagem descritiva será exibida aqui para todos os usuários...'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* List of Existing Notices */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center justify-between">
              <span>Comunicados Cadastrados ({avisos.length})</span>
              <span className="text-[11px] text-slate-500 font-normal">
                Ativos no momento: <strong className="text-emerald-700">{avisos.filter(a => a.ativo).length}</strong>
              </span>
            </h4>

            {avisos.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-xl">
                Nenhum comunicado cadastrado no momento.
              </div>
            ) : (
              <div className="space-y-2.5">
                {avisos.map((aviso) => (
                  <div
                    key={aviso.id}
                    className={`p-3.5 rounded-xl border bg-white transition-all shadow-2xs ${
                      aviso.ativo ? 'border-slate-200' : 'border-slate-100 opacity-60 bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 shrink-0">
                          {aviso.tipo === 'urgente' && <AlertTriangle size={16} className="text-rose-600" />}
                          {aviso.tipo === 'aviso' && <AlertCircle size={16} className="text-amber-600" />}
                          {aviso.tipo === 'sucesso' && <CheckCircle2 size={16} className="text-emerald-600" />}
                          {aviso.tipo === 'info' && <Info size={16} className="text-blue-600" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{aviso.titulo}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                              aviso.tipo === 'urgente' ? 'text-rose-700 bg-rose-50 border-rose-200' :
                              aviso.tipo === 'aviso' ? 'text-amber-800 bg-amber-50 border-amber-200' :
                              aviso.tipo === 'sucesso' ? 'text-emerald-800 bg-emerald-50 border-emerald-200' :
                              'text-blue-800 bg-blue-50 border-blue-200'
                            }`}>
                              {aviso.tipo}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                            {aviso.mensagem}
                          </p>
                          <div className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-400">
                            <span>Autor: <strong className="text-slate-600">{aviso.criadoPor}</strong></span>
                            <span>·</span>
                            <span>{new Date(aviso.criadoEm).toLocaleDateString('pt-BR')}</span>
                            {aviso.expiraEm && (
                              <>
                                <span>·</span>
                                <span>Expira: {aviso.expiraEm}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {/* Toggle Active Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(aviso.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
                            aviso.ativo
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                          }`}
                          title={aviso.ativo ? 'Desativar este aviso da tela' : 'Ativar e exibir este aviso na tela'}
                        >
                          <Power size={12} className={aviso.ativo ? 'text-emerald-600' : 'text-slate-400'} />
                          <span>{aviso.ativo ? 'Ativo na Tela' : 'Inativo'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEditClick(aviso)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Editar comunicado"
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setAvisoToDelete(aviso)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Excluir comunicado"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

      {/* Delete confirmation submodal */}
      {avisoToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full border border-slate-200 shadow-2xl">
            <h4 className="font-bold text-sm text-slate-900 mb-2">Excluir Comunicado</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Deseja realmente apagar o aviso <strong className="text-slate-900">"{avisoToDelete.titulo}"</strong>? Ele será removido permanentemente da tela de todos os colaboradores.
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setAvisoToDelete(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
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
