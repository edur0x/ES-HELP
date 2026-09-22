import React, { useEffect, useState } from 'react';
import { MessageSquare, Paperclip } from 'lucide-react';
import { User } from '../types';
import { ChatService } from '../services/chatService';

interface ChatFloatingLauncherProps {
  currentUser: User;
  onOpenChat: (chamadoId?: string) => void;
}

export const ChatFloatingLauncher: React.FC<ChatFloatingLauncherProps> = ({
  currentUser,
  onOpenChat
}) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const updateUnread = () => {
    const count = ChatService.getUnreadCount(currentUser.id || currentUser.login);
    setUnreadCount(count);
  };

  useEffect(() => {
    updateUnread();
    const unsubscribe = ChatService.subscribe(() => {
      updateUnread();
    });

    const interval = setInterval(updateUnread, 3000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [currentUser]);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
      <button
        id="btn-floating-chat-launcher"
        onClick={() => onOpenChat('geral')}
        className="group flex items-center gap-2.5 bg-slate-900 hover:bg-indigo-700 active:bg-indigo-800 text-white px-4 py-3 rounded-full shadow-lg shadow-indigo-950/20 hover:shadow-xl transition-all duration-200 border border-slate-700 hover:border-indigo-500 cursor-pointer"
        title="Abrir Chat Online com Opção de Anexos"
      >
        <div className="relative">
          <MessageSquare size={19} className="text-white group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse"></span>
        </div>

        <div className="flex flex-col text-left">
          <span className="text-xs font-bold leading-tight flex items-center gap-1">
            Chat Online
            <span className="text-[10px] text-indigo-300 font-normal hidden sm:inline">• Suporte TI</span>
          </span>
          <span className="text-[10px] text-slate-300 group-hover:text-indigo-100 flex items-center gap-1">
            <Paperclip size={10} />
            com envio de anexos
          </span>
        </div>

        {unreadCount > 0 && (
          <span
            id="badge-unread-chat-count"
            className="ml-1 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-bounce shadow-xs"
          >
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};
