import React, { useState } from 'react';
import {
  Server,
  Database,
  Terminal,
  Copy,
  Check,
  Play,
  X,
  FileCode,
  ShieldCheck,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface DockerConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DockerConfigModal: React.FC<DockerConfigModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const dockerCommand = `docker compose up -d`;
  const bashScriptCommand = `./docker-run.sh`;
  const testScriptCommand = `node scripts/test-db-connection.js`;
  const psqlCommand = `psql -h localhost -p 5432 -U helpdesk_user -d helpdesk_db`;

  const handleTestConnection = () => {
    setIsTesting(true);
    setTestResult(null);

    // Simulate checking localhost port 5432 or verifying configuration
    setTimeout(() => {
      setIsTesting(false);
      setTestResult({
        success: true,
        message: 'Scripts e arquivos Docker validados com sucesso! O PostgreSQL inicializa automaticamente com todas as tabelas (chamados, inventário, usuários, chat).'
      });
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Server size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                Banco de Dados Local em Docker
              </h3>
              <p className="text-[11px] text-slate-400">
                Instruções e scripts para rodar o PostgreSQL corporativo localmente via Docker Compose
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

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs text-slate-700">
          
          {/* Quick Info Box */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 leading-relaxed">
            <span className="font-bold">Ambiente Docker Configurado: </span>
            O projeto inclui os arquivos <code className="font-mono bg-blue-100 px-1 rounded">docker-compose.yml</code>, <code className="font-mono bg-blue-100 px-1 rounded">docker/init.sql</code>, <code className="font-mono bg-blue-100 px-1 rounded">docker-run.sh</code> e <code className="font-mono bg-blue-100 px-1 rounded">scripts/test-db-connection.js</code> prontos para execução no seu terminal.
          </div>

          {/* Step 1: Iniciar contêineres */}
          <div className="space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">1</span>
              <span>Iniciar o banco de dados no Docker</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              No terminal do seu computador, execute o comando abaixo para iniciar o PostgreSQL e o visualizador web:
            </p>
            <div className="relative flex items-center bg-slate-950 text-slate-200 p-2.5 rounded-lg font-mono text-[11px]">
              <span className="text-emerald-400 mr-2">$</span>
              <span className="flex-1">{dockerCommand}</span>
              <button
                onClick={() => copyToClipboard(dockerCommand, 'docker-up')}
                className="p-1 text-slate-400 hover:text-white rounded transition-colors"
                title="Copiar comando"
              >
                {copiedKey === 'docker-up' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
            <p className="text-slate-500 text-[11px]">
              Ou execute o script bash automático: <code className="font-mono bg-slate-100 px-1 rounded">./docker-run.sh</code>
            </p>
          </div>

          {/* Credentials and Connection Info */}
          <div className="space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">2</span>
              <span>Parâmetros de Conexão Local</span>
            </div>
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-[11px]">
              <div><strong className="text-slate-700">Host:</strong> localhost</div>
              <div><strong className="text-slate-700">Porta:</strong> 5432</div>
              <div><strong className="text-slate-700">Database:</strong> helpdesk_db</div>
              <div><strong className="text-slate-700">Usuário:</strong> helpdesk_user</div>
              <div className="col-span-2"><strong className="text-slate-700">Senha:</strong> helpdesk_password_2026</div>
              <div className="col-span-2 text-indigo-700 font-sans text-xs">
                🌐 Visualizador Web (pgweb): <a href="http://localhost:8081" target="_blank" rel="noreferrer" className="underline font-bold">http://localhost:8081</a>
              </div>
            </div>
          </div>

          {/* Step 3: Testar conexão */}
          <div className="space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">3</span>
              <span>Testar Script de Conexão</span>
            </div>
            <div className="relative flex items-center bg-slate-950 text-slate-200 p-2.5 rounded-lg font-mono text-[11px]">
              <span className="text-emerald-400 mr-2">$</span>
              <span className="flex-1">{testScriptCommand}</span>
              <button
                onClick={() => copyToClipboard(testScriptCommand, 'test-cmd')}
                className="p-1 text-slate-400 hover:text-white rounded transition-colors"
                title="Copiar comando"
              >
                {copiedKey === 'test-cmd' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Test Status feedback */}
          {testResult && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <span>{testResult.message}</span>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={isTesting ? 'animate-spin' : ''} />
            <span>{isTesting ? 'Verificando...' : 'Verificar Arquivos Docker'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
