'use client';

import React from 'react';
import { RotateCcw, User, Volume2, VolumeX } from 'lucide-react';

interface ChatBoxHeaderProps {
  autoRead: boolean;
  onToggleAutoRead: () => void;
  onReload: () => void;
}

const ChatBoxHeader: React.FC<ChatBoxHeaderProps> = ({ autoRead, onToggleAutoRead, onReload }) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-slate-900/[0.45] border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-inner">
          <User size={20} />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
          <h2 className="text-sm font-bold text-white">Ciel's AI Twin</h2>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleAutoRead}
          className={`p-2 rounded-lg transition-all ${autoRead ? 'text-indigo-400 bg-slate-800/50' : 'text-slate-400 hover:text-slate-600'}`}
          title="Toggle auto-read"
        >
          {autoRead ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        <button type="button" onClick={onReload} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatBoxHeader;