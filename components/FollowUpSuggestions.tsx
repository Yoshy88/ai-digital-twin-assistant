import React from 'react';

interface FollowUpSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  isVisible: boolean;
}

/**
 * Renders a list of clickable follow-up suggestions as buttons (chips).
 * These help guide the user to ask relevant subsequent questions.
 */
const FollowUpSuggestions: React.FC<FollowUpSuggestionsProps> = ({ 
  suggestions, 
  onSuggestionClick, 
  isVisible 
}) => {
  if (!isVisible || suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {suggestions.slice(0, 4).map((suggestion, index) => (
        <button 
          key={index} 
          onClick={() => onSuggestionClick(suggestion)} 
          className="px-3 py-1.5 bg-slate-800/80 border border-white/10 text-slate-300 rounded-full text-[11px] font-medium hover:border-indigo-400 hover:text-indigo-300 transition-all shadow-sm"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};

export default FollowUpSuggestions;
