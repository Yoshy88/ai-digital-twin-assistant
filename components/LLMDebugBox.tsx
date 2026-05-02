'use client';

import React, { useState } from 'react';
import { Cpu, ChevronDown, ChevronUp } from 'lucide-react';

interface LLMInfo {
  provider: string;
  model: string;
}

interface LLMDebugBoxProps {
  llmInfo?: LLMInfo;
  isFooter?: boolean;
}

const LLMDebugBox: React.FC<LLMDebugBoxProps> = ({ llmInfo, isFooter = false }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!llmInfo) {
    return null;
  }

  // Footer version: compact one-liner
  if (isFooter) {
    return (
      <div className="text-slate-500 text-[10px] uppercase tracking-widest font-bold drop-shadow-sm flex items-center gap-2">
        <span className="text-cyan-400 flex items-center gap-1">
          <Cpu size={12} />
          LLM
        </span>
        <span className="text-cyan-300 font-mono">
          {llmInfo.provider} • {llmInfo.model}
        </span>
      </div>
    );
  }

  // Fixed position version: collapsible box
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-slate-800/95 backdrop-blur-md border border-cyan-500/50 rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-2 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-cyan-400" />
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">LLM Debug</span>
          </div>
          {isExpanded ? (
            <ChevronUp size={16} className="text-cyan-400" />
          ) : (
            <ChevronDown size={16} className="text-cyan-400" />
          )}
        </button>

        {/* Content */}
        {isExpanded && (
          <div className="px-4 py-3 border-t border-cyan-500/30 space-y-2 text-xs">
            <div className="space-y-1">
              <div className="text-slate-400">Provider:</div>
              <div className="text-cyan-300 font-mono font-bold">{llmInfo.provider}</div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-400">Model:</div>
              <div className="text-cyan-300 font-mono text-[11px] break-all">{llmInfo.model}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LLMDebugBox;
