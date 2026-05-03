'use client';

import React from 'react';
import MessageBubble from './MessageBubble';
import ChatMessageActions from './ChatMessageActions';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatTranscriptProps {
  messages: Message[];
  isLoading: boolean;
  suggestBooking: boolean;
  bookingStep: 'none' | 'selecting' | 'confirmed';
  postBookingStep: 'none' | 'ask_subject' | 'ask_copy' | 'ask_email' | 'done';
  usedSuggestions: string[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onStartBooking: () => void;
  onBookingConfirm: (slot: string) => void;
  onCopyYes: () => void;
  onCopyNo: () => void;
  onSuggestionClick: (suggestion: string) => void;
}

const ChatTranscript: React.FC<ChatTranscriptProps> = ({
  messages,
  isLoading,
  suggestBooking,
  bookingStep,
  postBookingStep,
  usedSuggestions,
  messagesEndRef,
  onStartBooking,
  onBookingConfirm,
  onCopyYes,
  onCopyNo,
  onSuggestionClick,
}) => {
  const parseContent = (content: string) => {
    let mainText = content;
    let suggestionText = '';

    if (content.includes('---')) {
      const parts = content.split('---');
      mainText = parts[0];
      suggestionText = parts.slice(1).join('---');
    } else {
      const lines = content.split('\n');
      const suggestionLines: string[] = [];
      while (lines.length > 0) {
        const lastLine = lines[lines.length - 1].trim();
        if (lastLine === '' || /^[•*\-]/.test(lastLine)) {
          if (lastLine !== '') suggestionLines.unshift(lastLine);
          lines.pop();
        } else {
          if (lastLine.toLowerCase().includes('follow') || lastLine.toLowerCase().includes('question') || lastLine.endsWith(':')) {
            lines.pop();
          }
          break;
        }
      }

      if (suggestionLines.length > 0) {
        mainText = lines.join('\n');
        suggestionText = suggestionLines.join('\n');
      }
    }

    const suggestions = suggestionText
      .split('\n')
      .map(suggestion => suggestion.trim().replace(/^[•*-]\s*/, '').replace(/^["']|["']$/g, ''))
      .filter(suggestion => suggestion && !usedSuggestions.includes(suggestion));

    return { mainText: mainText.trim(), suggestions };
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
      {messages.map((message, index) => {
        const { mainText, suggestions } = parseContent(message.content);
        const isLast = index === messages.length - 1;

        return (
          <div key={message.id} className="group animate-in fade-in slide-in-from-bottom-3 duration-500">
            <MessageBubble role={message.role} content={mainText} />

            <ChatMessageActions
              isVisible={isLast && message.role === 'assistant' && !isLoading}
              suggestBooking={suggestBooking}
              bookingStep={bookingStep}
              postBookingStep={postBookingStep}
              suggestions={suggestions}
              onStartBooking={onStartBooking}
              onBookingConfirm={onBookingConfirm}
              onCopyYes={onCopyYes}
              onCopyNo={onCopyNo}
              onSuggestionClick={onSuggestionClick}
            />
          </div>
        );
      })}

      {isLoading && (
        <div className="ml-12 w-12 h-8 bg-slate-800/50 rounded-full flex items-center justify-center gap-1 border border-white/5">
          <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce" />
          <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce [animation-delay:0.2s]" />
          <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce [animation-delay:0.4s]" />
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatTranscript;