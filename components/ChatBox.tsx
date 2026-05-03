'use client';

import React, { useEffect, useRef, useState } from 'react';
import ChatBoxHeader from './ChatBoxHeader';
import ChatComposer from './ChatComposer';
import ChatTranscript from '@/components/ChatTranscript';

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

const ChatBox: React.FC<{ onTypingStateChange?: (isTyping: boolean) => void; onLLMInfoChange?: (info: { provider: string; model: string }) => void }> = ({ onTypingStateChange, onLLMInfoChange }) => {
  const [messages, setMessages] = useState<Message[]>([{ id: 'init', role: 'assistant', content: INITIAL_CONTENT }]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestBooking, setSuggestBooking] = useState(false);
  const [bookingStep, setBookingStep] = useState<'none' | 'selecting' | 'confirmed'>('none');
  const [postBookingStep, setPostBookingStep] = useState<'none' | 'ask_subject' | 'ask_copy' | 'ask_email' | 'done'>('none');
  const [usedSuggestions, setUsedSuggestions] = useState<string[]>([]);
  const [userEmail, setUserEmail] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [autoRead, setAutoRead] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef(messages);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

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

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Initialize speech recognition (once on mount)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition && !recognitionRef.current) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            handleRecognitionResult(transcript);
          }
        };
        recognition.onend = () => setIsRecording(false);
        recognition.onerror = () => setIsRecording(false);
        recognitionRef.current = recognition;
      }
    }
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

  const addAssistantMessage = (content: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content }]);
  };

  const submitConversationMessage = async (text: string) => {
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: text };
    const conversation = [...messagesRef.current, userMessage];

    setMessages(conversation);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversation.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!response.ok) throw new Error('API error');
      if (!response.body) throw new Error('No response body');

      const provider = response.headers.get('X-LLM-Provider');
      const model = response.headers.get('X-LLM-Model');
      if (provider && model) {
        onLLMInfoChange?.({ provider, model });
      }

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

        if (autoRead) {
          const textToSpeak = assistantMessage.split('---')[0].trim();
          if (textToSpeak) {
            speakText(textToSpeak);
          }
        }

        const hasInsufficientInfo = checkInsufficientInfo(assistantMessage);
        const currentUserMessageCount = conversation.filter(message => message.role === 'user').length;
        const mentionsBooking = BOOKING_KEYWORDS.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
        const isAlreadyBooking = bookingStep !== 'none' || postBookingStep !== 'none';

        if (!isAlreadyBooking && (currentUserMessageCount >= LIMIT || mentionsBooking || hasInsufficientInfo)) {
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

  const speakWithBrowser = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSpeaking(false);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  };

  const handleRecognitionResult = (transcript: string) => {
    if (!transcript.trim()) return;
    void submitConversationMessage(transcript);
  };

  const speakText = async (text: string) => {
    try {
      setIsSpeaking(true);
      const res = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }

        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
          audioRef.current = null;
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
          audioRef.current = null;
          speakWithBrowser(text);
        };
        audio.play().catch(() => {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
          audioRef.current = null;
          speakWithBrowser(text);
        });
      } else {
        speakWithBrowser(text);
      }
    } catch {
      speakWithBrowser(text);
    }
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
    void submitConversationMessage(text);
  };

  const handleBookingConfirm = (slot: string) => {
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
        <ChatBoxHeader autoRead={autoRead} onToggleAutoRead={() => setAutoRead(prev => !prev)} onReload={() => window.location.reload()} />

        <ChatTranscript
          messages={messages}
          isLoading={isLoading}
          suggestBooking={suggestBooking}
          bookingStep={bookingStep}
          postBookingStep={postBookingStep}
          usedSuggestions={usedSuggestions}
          messagesEndRef={messagesEndRef}
          onStartBooking={() => setBookingStep('selecting')}
          onBookingConfirm={handleBookingConfirm}
          onCopyYes={handleCopyYes}
          onCopyNo={handleCopyNo}
          onSuggestionClick={(suggestion: string) => void handleFormSubmit(undefined, suggestion)}
        />

        <ChatComposer
          value={inputValue}
          placeholder={postBookingStep === 'ask_email' ? 'Enter your email...' : 'Type your question here or hold mic button to talk'}
          isLoading={isLoading}
          isRecording={isRecording}
          isSpeaking={isSpeaking}
          isEmailMode={postBookingStep === 'ask_email'}
          onChange={setInputValue}
          onSubmit={handleFormSubmit}
          onMicStart={() => {
            if (!isLoading && recognitionRef.current) {
              setIsRecording(true);
              recognitionRef.current.start();
            }
          }}
          onMicStop={() => {
            if (recognitionRef.current) {
              recognitionRef.current.stop();
            }
          }}
          onMicLeave={() => {
            if (isRecording && recognitionRef.current) {
              recognitionRef.current.stop();
            }
          }}
        />
      </div>
    </>
  );
};

export default ChatBox;
