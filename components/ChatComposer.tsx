'use client';

import React from 'react';
import { Mail, Mic, Send } from 'lucide-react';

interface ChatComposerProps {
  value: string;
  placeholder: string;
  isLoading: boolean;
  isRecording: boolean;
  isSpeaking: boolean;
  isEmailMode: boolean;
  onChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onMicStart: () => void;
  onMicStop: () => void;
  onMicLeave: () => void;
}

const ChatComposer: React.FC<ChatComposerProps> = ({
  value,
  placeholder,
  isLoading,
  isRecording,
  isSpeaking,
  isEmailMode,
  onChange,
  onSubmit,
  onMicStart,
  onMicStop,
  onMicLeave,
}) => {
  return (
    <form onSubmit={onSubmit} className="p-4 bg-slate-900/[0.45] border-t border-white/10 backdrop-blur-md">
      <div className="relative flex items-center max-w-3xl mx-auto">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={isLoading}
          placeholder={placeholder}
          className="w-full pl-5 pr-28 py-3.5 bg-slate-800/80 border border-white/10 rounded-full text-sm text-white placeholder-slate-400 shadow-inner focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
        />
        <div className="absolute right-2 flex items-center gap-1.5">
          <button
            type="button"
            onMouseDown={onMicStart}
            onMouseUp={onMicStop}
            onMouseLeave={onMicLeave}
            disabled={isLoading || isSpeaking}
            className={`p-2.5 rounded-full transition-all ${
              isRecording
                ? 'bg-red-600 text-white animate-pulse'
                : isSpeaking
                  ? 'bg-slate-700 text-slate-400 opacity-50'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
            title="Hold to record"
          >
            <Mic size={18} />
          </button>
          <button
            type="submit"
            disabled={isLoading || !value || !value.trim()}
            className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-30 transition-all shadow-md"
          >
            {isEmailMode ? <Mail size={18} /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ChatComposer;