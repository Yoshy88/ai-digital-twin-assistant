import React from 'react';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ role, content }) => {
  const isUser = role === 'user';

  // Simple formatter to handle **bold** text without a full markdown library
  const renderContent = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-indigo-300">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-indigo-900/50 border border-white/5 flex items-center justify-center mr-2 mt-1 shadow-sm">
          <span className="text-[10px] font-bold text-indigo-300">AI</span>
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? 'bg-indigo-600 text-white rounded-tr-none'
            : 'bg-slate-800/80 border border-white/10 text-slate-200 rounded-tl-none'
        }`}
      >
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {renderContent(content)}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
