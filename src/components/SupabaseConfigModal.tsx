import React, { useState } from 'react';
import { SupabaseService } from '../services/supabaseService';
import { Database, CheckCircle2, AlertCircle, Copy, Check, RefreshCw, Trash2, Key, Globe, Shield, Terminal, X } from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => void;
}

const SQL_SCHEMA = `-- TABELA DE CHAMADOS (Execute no SQL Editor do Supabase)
CREATE TABLE IF NOT EXISTS public.chamados (
  id TEXT PRIMARY KEY,
  solicitante TEXT NOT NULL,
  tipo_solicitacao TEXT,
  categoria TEXT NOT NULL,
  prioridade TEXT NOT NULL,
  equipamento TEXT,
  titulo TEXT NOT NULL,
  descricao_problema TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Aberto',
  data_abertura TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  descricao_servico TEXT,
  data_encerramento TIMESTAMP WITH TIME ZONE,
  tecnico_responsavel TEXT
);

-- Habilitar RLS e política livre para a demonstração
ALTER TABLE public.chamados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir tudo para demonstração didática"
ON public.chamados
FOR ALL
USING (true)
WITH CHECK (true);`;

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onRefreshData
}) => {
  if (!isOpen) return null;

  const currentCfg = SupabaseService.getConfig();
  const [url, setUrl] = useState(currentCfg.url);
  const [anonKey, setAnonKey] = useState(currentCfg.anonKey);
  const [enabled, setEnabled] = useState(currentCfg.isEnabled);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    SupabaseService.updateConfig(url, anonKey, enabled);

    if (enabled && url && anonKey) {
      const result = await SupabaseService.testConnection();
      setTestResult(result);
      if (result.success) {
        onRefreshData();
      }
    } else {
      setTestResult({
        success: true,
        message: 'Modo Local Ativo: O sistema salvará os chamados no armazenamento local com a mesma estrutura.'
      });
      onRefreshData();
    }

    setTesting(false);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleClearAll = async () => {
    if (confirm('Tem certeza que deseja zerar todos os chamados salvos para reiniciar a demonstração?')) {
      setClearing(true);
      await SupabaseService.clearAllData();
      onRefreshData();
      setClearing(false);
      alert('Banco de dados de chamados resetado!');
    }
  };

  return (
    <div
      id="modal-supabase-config"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-lg border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Database size={16} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Integração Banco de Dados Supabase
              </h3>
              <p className="text-xs text-slate-400">
                Conexão oficial do Supabase e DDL da tabela "chamados"
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm p-1.5 rounded-md hover:bg-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Status banner */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-3">
            <div className="p-2 rounded-md bg-emerald-100 text-emerald-700 shrink-0">
              <Shield size={18} />
            </div>
            <div className="text-xs">
              <h4 className="font-bold text-slate-800 text-sm">Status da Camada de Dados</h4>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                {enabled && url && anonKey
                  ? 'Configurado para sincronizar diretamente com o projeto Supabase online.'
                  : 'Modo Local Ativo: O sistema opera com armazenamento persistente em memória e está 100% pronto para conectar ao Supabase fornecendo URL e chave anon.'}
              </p>
            </div>
          </div>

          {/* Test result alert */}
          {testResult && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                testResult.success
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 size={16} className="text-green-600 shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-red-600 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Connection Form */}
          <form onSubmit={handleSaveAndTest} className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <input
                id="checkbox-supabase-enabled"
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
              />
              <label htmlFor="checkbox-supabase-enabled" className="text-xs font-bold text-slate-800">
                Ativar conexão remota direta com Supabase
              </label>
            </div>

            <div>
              <label htmlFor="input-supabase-url" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Supabase Project URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Globe size={15} />
                </div>
                <input
                  id="input-supabase-url"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://seu-projeto.supabase.co"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="input-supabase-key" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Supabase Anon / Public Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Key size={15} />
                </div>
                <input
                  id="input-supabase-key"
                  type="password"
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleClearAll}
                disabled={clearing}
                className="text-xs font-semibold text-red-600 hover:text-red-800 flex items-center gap-1"
              >
                <Trash2 size={13} />
                <span>Zerar Chamados do Banco</span>
              </button>

              <button
                id="btn-save-supabase-config"
                type="submit"
                disabled={testing}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <RefreshCw size={13} className={testing ? 'animate-spin' : ''} />
                <span>{testing ? 'Testando Conexão...' : 'Salvar e Testar Conexão'}</span>
              </button>
            </div>
          </form>

          {/* SQL DDL Schema for reference / copy */}
          <div className="space-y-2 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Terminal size={14} className="text-indigo-600" />
                <span>Script SQL DDL para o Supabase</span>
              </div>
              <button
                id="btn-copy-sql"
                type="button"
                onClick={handleCopySql}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors border border-slate-200"
              >
                {copiedSql ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                <span>{copiedSql ? 'Copiado!' : 'Copiar SQL'}</span>
              </button>
            </div>

            <pre className="bg-slate-900 text-slate-200 p-3.5 rounded-lg text-[11px] font-mono overflow-x-auto border border-slate-800">
              {SQL_SCHEMA}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-md transition-colors border border-slate-200"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
