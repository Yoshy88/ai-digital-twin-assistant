'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import CalendarPicker from './CalendarPicker';
import FollowUpSuggestions from './FollowUpSuggestions';

interface ChatMessageActionsProps {
  isVisible: boolean;
  suggestBooking: boolean;
  bookingStep: 'none' | 'selecting' | 'confirmed';
  postBookingStep: 'none' | 'ask_subject' | 'ask_copy' | 'ask_email' | 'done';
  suggestions: string[];
  onStartBooking: () => void;
  onBookingConfirm: (slot: string) => void;
  onCopyYes: () => void;
  onCopyNo: () => void;
  onSuggestionClick: (suggestion: string) => void;
}

const ChatMessageActions: React.FC<ChatMessageActionsProps> = ({
  isVisible,
  suggestBooking,
  bookingStep,
  postBookingStep,
  suggestions,
  onStartBooking,
  onBookingConfirm,
  onCopyYes,
  onCopyNo,
  onSuggestionClick,
}) => {
  if (!isVisible) return null;

  return (
    <div className="mt-4 flex flex-col gap-4 ml-12">
      {suggestBooking && bookingStep === 'none' && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-indigo-400 animate-in fade-in slide-in-from-left-2 duration-700 italic">
            "I recommend you book a quick call with Ciel to discuss further in person"
          </p>
          <button
            type="button"
            onClick={onStartBooking}
            className="flex items-center gap-2 w-fit px-5 py-2.5 bg-indigo-600 text-white rounded-full text-sm font-bold hover:bg-indigo-700 shadow-lg transition-all scale-105"
          >
            <Calendar size={16} /> Book a call with Ciel
          </button>
        </div>
      )}

      {bookingStep === 'selecting' && (
        <div className="mt-2">
          <CalendarPicker onConfirm={onBookingConfirm} />
        </div>
      )}

      {postBookingStep === 'ask_copy' && (
        <div className="flex gap-2 animate-in fade-in zoom-in duration-300">
          <button type="button" onClick={onCopyYes} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700">
            Yes
          </button>
          <button type="button" onClick={onCopyNo} className="px-4 py-2 bg-slate-800 border border-white/10 text-slate-300 hover:bg-slate-700 rounded-lg text-xs font-bold transition-all">
            No
          </button>
        </div>
      )}

      <FollowUpSuggestions
        suggestions={suggestions}
        isVisible={bookingStep === 'none'}
        onSuggestionClick={onSuggestionClick}
      />
    </div>
  );
};

export default ChatMessageActions;