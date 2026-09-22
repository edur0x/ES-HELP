import React, { useState, useEffect, useRef } from 'react';
import { User, Chamado, ChatMessage, ChatAttachment } from '../types';
import { ChatService } from '../services/chatService';
import {
  MessageSquare,
  Send,
  Paperclip,
  Image as ImageIcon,
  X,
  Download,
  FileText,
  File,
  Maximize2,
  Minimize2,
  CheckCheck,
  Clock,
  Sparkles,
  AlertCircle,
  Eye,
  ShieldCheck,
  UserCheck,
  Laptop
} from 'lucide-react';

interface OnlineChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  chamados: Chamado[];
  selectedChamadoId?: string; // Optional pre-selected ticket ID or 'geral'
  onSelectChamadoId?: (id: string) => void;
}

export const OnlineChatModal: React.FC<OnlineChatModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  chamados,
  selectedChamadoId = 'geral',
  onSelectChamadoId
}) => {
  const [activeChamadoId, setActiveChamadoId] = useState<string>(selectedChamadoId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileAttachment, setFileAttachment] = useState<ChatAttachment | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [imagePreviewModal, setImagePreviewModal] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Sync active ticket when prop changes
  useEffect(() => {
    if (selectedChamadoId) {
      setActiveChamadoId(selectedChamadoId);
    }
  }, [selectedChamadoId]);

  // Load and subscribe to messages
  const loadMessages = () => {
    const list = ChatService.getMessages(activeChamadoId);
    setMessages(list);
    ChatService.markAsRead(activeChamadoId, currentUser.id || currentUser.login);
  };

  useEffect(() => {
    if (!isOpen) return;

    loadMessages();

    // Subscribe to incoming messages
    const unsubscribe = ChatService.subscribe((newMsg) => {
      if (newMsg.chamadoId === activeChamadoId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        ChatService.markAsRead(activeChamadoId, currentUser.id || currentUser.login);
      }
    });

    return () => unsubscribe();
  }, [isOpen, activeChamadoId, currentUser]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
    // Reset file input value so re-uploading same file works
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFile = async (file: File) => {
    setFileError(null);
    setIsProcessingFile(true);

    try {
      const attachment = await ChatService.fileToAttachment(file);
      setSelectedFile(file);
      setFileAttachment(attachment);
    } catch (err: any) {
      setFileError(err?.message || 'Erro ao carregar o anexo. Tamanho máximo permitido é de 5MB.');
      setSelectedFile(null);
      setFileAttachment(null);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleRemoveAttachment = () => {
    setSelectedFile(null);
    setFileAttachment(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanText = inputText.trim();
    if (!cleanText && !fileAttachment) return;

    try {
      await ChatService.sendMessage({
        chamadoId: activeChamadoId,
        senderId: currentUser.id || currentUser.login,
        senderName: currentUser.nome,
        senderPerfil: currentUser.perfil,
        mensagem: cleanText || (fileAttachment ? `Enviou um anexo: ${fileAttachment.nome}` : ''),
        anexo: fileAttachment
      });

      setInputText('');
      setSelectedFile(null);
      setFileAttachment(null);
      setFileError(null);
      loadMessages();
    } catch (err) {
      console.error('Erro ao enviar mensagem no chat:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick suggestion clicks
  const quickResponses = currentUser.perfil === 'Técnico'
    ? [
        'Olá! Já estou analisando seu chamado.',
        'Poderia enviar uma foto/print da tela de erro em anexo?',
        'O procedimento foi concluído. Poderia testar novamente, por favor?',
        'Chamado finalizado com sucesso!'
      ]
    : [
        'Olá! O problema continua ocorrendo.',
        'Estou anexando um print da tela com o erro.',
        'Obrigado! Testei e está funcionando perfeitamente.',
        'Qual é a previsão média para atendimento?'
      ];

  const currentChamadoObj = chamados.find((c) => c.id === activeChamadoId);

  if (!isOpen) return null;

  return (
    <div
      id="modal-chat-online"
      className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-150"
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-200 ${
          isMaximized
            ? 'w-full h-full max-w-5xl max-h-[96vh]'
            : 'w-full max-w-2xl h-[85vh] max-h-[720px]'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Chat Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs">
                <MessageSquare size={20} />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  Chat de Atendimento Online
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  TI Online
                </span>
              </div>

              {/* Ticket Context Selector */}
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-300">
                <span className="text-slate-400 text-[11px] hidden sm:inline">Contexto:</span>
                <select
                  id="select-chat-chamado-context"
                  value={activeChamadoId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setActiveChamadoId(newId);
                    if (onSelectChamadoId) onSelectChamadoId(newId);
                  }}
                  className="bg-slate-800 border border-slate-700 text-white text-xs rounded-md px-2 py-0.5 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer max-w-[240px] truncate"
                >
                  <option value="geral">Canal Geral de Suporte TI</option>
                  {chamados.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} - {c.solicitante} ({c.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              title={isMaximized ? 'Restaurar tamanho' : 'Maximizar janela'}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors hidden sm:inline-flex"
            >
              {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button
              onClick={onClose}
              title="Fechar chat"
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Sub-header with Ticket Summary (if contextual to a specific ticket) */}
        {currentChamadoObj && (
          <div className="bg-indigo-50/70 border-b border-indigo-100 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-indigo-950 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200 shrink-0">
                {currentChamadoObj.id}
              </span>
              <span className="font-semibold text-slate-800 truncate">
                {currentChamadoObj.titulo}
              </span>
              <span className="text-slate-500 text-[11px] hidden md:inline">
                • Solicitante: <strong>{currentChamadoObj.solicitante}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-slate-600">
                Status: <strong>{currentChamadoObj.status}</strong>
              </span>
              {currentChamadoObj.tecnico_responsavel && (
                <span className="text-[11px] text-indigo-700 hidden sm:inline">
                  (Técnico: {currentChamadoObj.tecnico_responsavel})
                </span>
              )}
            </div>
          </div>
        )}

        {/* Drag & drop overlay indicator */}
        {isDraggingOver && (
          <div className="absolute inset-0 bg-indigo-600/20 backdrop-blur-xs z-30 flex flex-col items-center justify-center border-2 border-dashed border-indigo-500 m-2 rounded-2xl pointer-events-none">
            <Paperclip size={42} className="text-indigo-600 animate-bounce mb-2" />
            <span className="font-bold text-indigo-900 text-sm sm:text-base">
              Solte seu arquivo aqui para anexar
            </span>
            <span className="text-xs text-indigo-700 mt-0.5">
              Imagens, documentos ou prints (até 5MB)
            </span>
          </div>
        )}

        {/* Messages List Body */}
        <div
          ref={chatContainerRef}
          className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <MessageSquare size={28} />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                Inicie uma conversa online
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Converse diretamente com o {currentUser.perfil === 'Técnico' ? 'cliente/solicitante' : 'técnico de suporte TI'}.
                Você também pode enviar prints e arquivos anexados.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === (currentUser.id || currentUser.login);
              const formattedTime = new Date(msg.criadoEm).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  {/* Sender Header */}
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">
                      {isMine ? 'Você' : msg.senderName}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        msg.senderPerfil === 'Técnico'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {msg.senderPerfil}
                    </span>
                    <span>•</span>
                    <span>{formattedTime}</span>
                  </div>

                  {/* Bubble Container */}
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 shadow-xs transition-all ${
                      isMine
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                    }`}
                  >
                    {/* Text Message */}
                    {msg.mensagem && (
                      <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed break-words">
                        {msg.mensagem}
                      </p>
                    )}

                    {/* Attachment Display (if any) */}
                    {msg.anexo && (
                      <div className="mt-2.5 pt-2 border-t border-white/20">
                        {msg.anexo.tipo.startsWith('image/') ? (
                          // Image Attachment with preview & click to zoom
                          <div className="space-y-1.5">
                            <div
                              onClick={() => setImagePreviewModal(msg.anexo!.url)}
                              className="relative group cursor-pointer overflow-hidden rounded-lg border border-black/10 bg-black/5 max-h-56 flex items-center justify-center"
                            >
                              <img
                                src={msg.anexo.url}
                                alt={msg.anexo.nome}
                                className="w-full object-cover max-h-56 group-hover:scale-102 transition-transform duration-200"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs font-semibold">
                                <Eye size={16} />
                                <span>Ampliar Imagem</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[11px] opacity-90 px-0.5">
                              <span className="truncate max-w-[180px]" title={msg.anexo.nome}>
                                {msg.anexo.nome}
                              </span>
                              <a
                                href={msg.anexo.url}
                                download={msg.anexo.nome}
                                className={`inline-flex items-center gap-1 font-bold hover:underline ${
                                  isMine ? 'text-white' : 'text-indigo-600'
                                }`}
                              >
                                <Download size={12} />
                                <span>Baixar</span>
                              </a>
                            </div>
                          </div>
                        ) : (
                          // Generic Document Attachment
                          <div
                            className={`flex items-center justify-between gap-3 p-2.5 rounded-lg border text-xs ${
                              isMine
                                ? 'bg-indigo-700/50 border-indigo-400/40 text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`p-1.5 rounded-md ${
                                  isMine ? 'bg-indigo-800 text-white' : 'bg-indigo-100 text-indigo-700'
                                }`}
                              >
                                <FileText size={16} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold truncate max-w-[180px]" title={msg.anexo.nome}>
                                  {msg.anexo.nome}
                                </p>
                                <span className="text-[10px] opacity-75">
                                  {ChatService.formatFileSize(msg.anexo.tamanho)} • {msg.anexo.extensao?.toUpperCase() || 'ARQUIVO'}
                                </span>
                              </div>
                            </div>

                            <a
                              href={msg.anexo.url}
                              download={msg.anexo.nome}
                              className={`p-1.5 rounded-md transition-colors shrink-0 ${
                                isMine
                                  ? 'hover:bg-indigo-500 text-white'
                                  : 'hover:bg-slate-200 text-indigo-600'
                              }`}
                              title="Baixar arquivo"
                            >
                              <Download size={15} />
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="bg-slate-100/80 px-4 py-2 border-t border-slate-200 overflow-x-auto shrink-0 flex items-center gap-1.5 scrollbar-none">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Sparkles size={12} className="text-indigo-600" />
            Sugestões:
          </span>
          {quickResponses.map((qr, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setInputText(qr)}
              className="text-[11px] bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 border border-slate-200 hover:border-indigo-200 rounded-full px-3 py-1 whitespace-nowrap transition-colors shadow-2xs font-medium"
            >
              {qr}
            </button>
          ))}
        </div>

        {/* Attachment Pending Strip (Before sending) */}
        {fileAttachment && (
          <div className="bg-indigo-50 border-t border-indigo-200 px-4 sm:px-6 py-2 flex items-center justify-between gap-3 text-xs shrink-0 animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2.5 min-w-0">
              {fileAttachment.tipo.startsWith('image/') ? (
                <img
                  src={fileAttachment.url}
                  alt="Anexo selecionado"
                  className="w-10 h-10 object-cover rounded-md border border-indigo-200 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 bg-indigo-200 text-indigo-700 rounded-md flex items-center justify-center shrink-0">
                  <FileText size={20} />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-indigo-950 truncate max-w-[220px]">
                    {fileAttachment.nome}
                  </span>
                  <span className="text-[10px] bg-indigo-200 text-indigo-800 px-1.5 py-0.2 rounded font-semibold">
                    {ChatService.formatFileSize(fileAttachment.tamanho)}
                  </span>
                </div>
                <span className="text-[11px] text-indigo-600">
                  Pronto para enviar junto com a mensagem
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemoveAttachment}
              className="text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
              title="Remover anexo"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* File validation error */}
        {fileError && (
          <div className="bg-red-50 border-t border-red-200 px-4 py-2 text-xs text-red-700 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <AlertCircle size={14} className="text-red-500 shrink-0" />
              <span>{fileError}</span>
            </div>
            <button onClick={() => setFileError(null)} className="text-red-400 hover:text-red-600">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-end gap-2 shrink-0"
        >
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,.pdf,.doc,.docx,.txt,.log,.xls,.xlsx,.zip"
            className="hidden"
          />

          {/* Attachment Button */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              id="btn-chat-attach-file"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessingFile}
              title="Anexar arquivo (Foto, PDF, Print, Documento)"
              className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors border border-slate-200 shadow-2xs"
            >
              <Paperclip size={18} />
            </button>
          </div>

          {/* Message Textarea */}
          <div className="flex-1 relative">
            <textarea
              id="textarea-chat-mensagem"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem aqui... (Enter para enviar)"
              rows={1}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none max-h-28"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            id="btn-chat-send"
            disabled={!inputText.trim() && !fileAttachment}
            className={`p-2.5 rounded-xl font-bold transition-all shadow-xs shrink-0 flex items-center justify-center ${
              !inputText.trim() && !fileAttachment
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-indigo-200'
            }`}
            title="Enviar mensagem"
          >
            <Send size={18} />
          </button>
        </form>

      </div>

      {/* Lightbox Zoom Modal for Images */}
      {imagePreviewModal && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setImagePreviewModal(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setImagePreviewModal(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 p-1.5"
            >
              <X size={24} />
            </button>
            <img
              src={imagePreviewModal}
              alt="Anexo ampliado"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
