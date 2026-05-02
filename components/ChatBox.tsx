'use client';

import React, { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble';
import CalendarPicker from './CalendarPicker';
import FollowUpSuggestions from './FollowUpSuggestions';
import LLMDebugBox from './LLMDebugBox';
import { Send, RotateCcw, User, Calendar, Mail } from 'lucide-react';

const LIMIT = 5;

const INITIAL_CONTENT = `Hello. I am Ciel's AI assistant — a digital clone representing Ciel. I'm here to answer your questions about Ciel's professional background and expertise. How can I help you today?
---
- What are Ciel's top technical skills?
- Tell me about Ciel's experience.
- What kind of role is Ciel looking for?
- Is Ciel available for a full-time role?`;

const BOOKING_KEYWORDS = ['salary', 'pay', 'compensation', 'availability', 'available', 'schedule', 'call', 'meeting', 'interview', 'position', 'role', 'offer', 'hire', 'employer\'s feedback'];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const ChatBox: React.FC<{ onTypingStateChange?: (isTyping: boolean) => void }> = ({ onTypingStateChange }) => {
  const [messages, setMessages] = useState<Message[]>([{ id: 'init', role: 'assistant', content: INITIAL_CONTENT }]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestBooking, setSuggestBooking] = useState(false);
  const [bookingStep, setBookingStep] = useState<'none' | 'selecting' | 'confirmed'>('none');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [postBookingStep, setPostBookingStep] = useState<'none' | 'ask_subject' | 'ask_copy' | 'ask_email' | 'done'>('none');
  const [usedSuggestions, setUsedSuggestions] = useState<string[]>([]);
  const [llmInfo, setLLMInfo] = useState<{ provider: string; model: string } | undefined>();
  const [userEmail, setUserEmail] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userMessageCount = messages.filter(m => m.role === 'user').length;
  const isLimitReached = userMessageCount >= LIMIT;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, bookingStep]);

  useEffect(() => {
    onTypingStateChange?.(isLoading || (inputValue?.length ?? 0) > 0);
  }, [isLoading, inputValue, onTypingStateChange]);

  useEffect(() => {
    const savedEmail = localStorage.getItem('ciel_user_email');
    if (savedEmail) setUserEmail(savedEmail);
  }, []);

  const checkInsufficientInfo = (content: string): boolean => {
    const lowerContent = content.toLowerCase();
    const insufficientPhrases = [
      "don't know",
      "not in my",
      "not provided",
      "not mentioned",
      "not in the profile",
      "not available",
      "i'm unable to",
      "i cannot",
      "no information",
      "not specified"
    ];
    return insufficientPhrases.some(phrase => lowerContent.includes(phrase));
  };

  const parseContent = (content: string) => {
    let mainText = content;
    let suggestionText = '';

    if (content.includes('---')) {
      const parts = content.split('---');
      mainText = parts[0];
      suggestionText = parts.slice(1).join('---');
    } else {
      const lines = content.split('\n');
      const suggestionLines = [];
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
      .map(s => s.trim().replace(/^[•*-]\s*/, '').replace(/^["']|["']$/g, ''))
      .filter(s => s && !usedSuggestions.includes(s));

    return { mainText: mainText.trim(), suggestions };
  };

  const addAssistantMessage = (content: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content }]);
  };

  const handleFormSubmit = async (e?: React.FormEvent, customText?: string) => {
    e?.preventDefault();
    const text = customText ?? inputValue;
    if (!text.trim() || isLoading) return;

    if (customText) {
      setUsedSuggestions(prev => [...prev, customText]);
    }

    // Flow Post-Booking: Subject
    if (postBookingStep === 'ask_subject') {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text }]);
      setInputValue('');
      const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch && !userEmail) {
        setUserEmail(emailMatch[0]);
        localStorage.setItem('ciel_user_email', emailMatch[0]);
      }
      setPostBookingStep('ask_copy');
      setTimeout(() => addAssistantMessage("I will send this to Ciel with a summary of this chat to prepare the call. Would you like a copy?"), 500);
      return;
    }

    // Flow Post-Booking: Email
    if (postBookingStep === 'ask_email' && text.includes('@')) {
      const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const email = emailMatch ? emailMatch[0] : text.replace('Email:', '').trim();
      setUserEmail(email);
      localStorage.setItem('ciel_user_email', email);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text }]);
      setInputValue('');
      setPostBookingStep('done');
      setTimeout(() => addAssistantMessage("Thank you, you should receive a copy within a few minutes."), 500);
      return;
    }

    // Normal chat
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: text }],
        }),
      });

      if (!response.ok) throw new Error('API error');
      if (!response.body) throw new Error('No response body');

      // Check headers for LLM info
      const provider = response.headers.get('X-LLM-Provider');
      const model = response.headers.get('X-LLM-Model');
      if (provider && model) setLLMInfo({ provider, model });

      // Stream response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantMessage += decoder.decode(value, { stream: true });
      }

      if (assistantMessage) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: assistantMessage }]);

        // Check for booking trigger based on user requirements:
        // 1. 5+ user messages
        // 2. Contains specific keywords
        // 3. AI lacks information
        const hasInsufficientInfo = checkInsufficientInfo(assistantMessage);
        const currentUserMessageCount = messages.filter(m => m.role === 'user').length + 1;
        const enoughMessages = currentUserMessageCount >= 5;
        const mentionsBooking = BOOKING_KEYWORDS.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
        
        const isAlreadyBooking = bookingStep !== 'none' || postBookingStep !== 'none';

        if (!isAlreadyBooking && (enoughMessages || mentionsBooking || hasInsufficientInfo)) {
          setSuggestBooking(true);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addAssistantMessage('Sorry, there was an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingConfirm = (slot: string) => {
    setSelectedSlot(slot);
    setBookingStep('confirmed');
    setSuggestBooking(false);
    addAssistantMessage(`Thank you, Ciel will shortly confirm your call on ${slot}.`);
    setTimeout(() => {
      addAssistantMessage("Can you provide the call subject?");
      setPostBookingStep('ask_subject');
      setInputValue('Subject: ');
    }, 1000);
  };

  const handleCopyYes = () => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: 'Yes' }]);
    setPostBookingStep('ask_email');
    setTimeout(() => addAssistantMessage("Please provide your email:"), 500);
    setInputValue('Email: ');
  };

  const handleCopyNo = () => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: 'No' }]);
    setPostBookingStep('done');
    setTimeout(() => addAssistantMessage("Thank you, I will forward this information to Ciel."), 500);
  };

  return (
    <>
      <div className="flex flex-col h-[700px] w-full max-w-2xl bg-slate-900/[0.35] backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden border border-white/10">
        {/* Header */}
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
          <button onClick={() => window.location.reload()} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
            <RotateCcw size={18} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {messages.map((msg, idx) => {
            const { mainText, suggestions } = parseContent(msg.content);
            const isLast = idx === messages.length - 1;

            return (
              <div key={msg.id} className="group animate-in fade-in slide-in-from-bottom-3 duration-500">
                <MessageBubble role={msg.role as 'user' | 'assistant'} content={mainText} />

                {isLast && msg.role === 'assistant' && !isLoading && (
                  <div className="mt-4 flex flex-col gap-4 ml-12">
                    {suggestBooking && bookingStep === 'none' && (
                      <div className="flex flex-col gap-3">
                        <p className="text-sm font-medium text-indigo-400 animate-in fade-in slide-in-from-left-2 duration-700 italic">
                          "I recommend you book a quick call with Ciel to discuss further in person"
                        </p>
                        <button
                          onClick={() => setBookingStep('selecting')}
                          className="flex items-center gap-2 w-fit px-5 py-2.5 bg-indigo-600 text-white rounded-full text-sm font-bold hover:bg-indigo-700 shadow-lg transition-all scale-105"
                        >
                          <Calendar size={16} /> Book a call with Ciel
                        </button>
                      </div>
                    )}

                    {bookingStep === 'selecting' && (
                      <div className="mt-2">
                        <CalendarPicker onConfirm={handleBookingConfirm} />
                      </div>
                    )}

                    {postBookingStep === 'ask_copy' && (
                      <div className="flex gap-2 animate-in fade-in zoom-in duration-300">
                        <button onClick={handleCopyYes} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700">Yes</button>
                        <button onClick={handleCopyNo} className="px-4 py-2 bg-slate-800 border border-white/10 text-slate-300 hover:bg-slate-700 rounded-lg text-xs font-bold transition-all">No</button>
                      </div>
                    )}

                    <FollowUpSuggestions
                      suggestions={suggestions}
                      isVisible={bookingStep === 'none'}
                      onSuggestionClick={(s) => handleFormSubmit(undefined, s)}
                    />
                  </div>
                )}
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

        {/* Input Form */}
        <form onSubmit={handleFormSubmit} className="p-4 bg-slate-900/[0.45] border-t border-white/10 backdrop-blur-md">
          <div className="relative flex items-center max-w-3xl mx-auto">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              placeholder={postBookingStep === 'ask_email' ? "Enter your email..." : "Type your question here..."}
              className="w-full pl-5 pr-14 py-3.5 bg-slate-800/80 border border-white/10 rounded-full text-sm text-white placeholder-slate-400 shadow-inner focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue || !inputValue.trim()}
              className="absolute right-2 p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-30 transition-all shadow-md"
            >
              {postBookingStep === 'ask_email' ? <Mail size={18} /> : <Send size={18} />}
            </button>
          </div>
        </form>
      </div>
      <LLMDebugBox llmInfo={llmInfo} />
    </>
  );
};

export default ChatBox;
