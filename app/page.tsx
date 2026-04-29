'use client';

import { useState } from 'react';
import ChatBox from '@/components/ChatBox';
import Orb from '@/components/Orb';

export default function Home() {
  const [isTyping, setIsTyping] = useState(false);

  return (
    <main className="min-h-screen bg-black relative flex flex-col items-center justify-center p-4 md:p-8 font-sans overflow-hidden">
      {/* Background Orb */}
      <div className="fixed inset-0 z-0 pointer-events-auto">
        <Orb
          hoverIntensity={0.5}
          rotateOnHover={true}
          hue={0}
          forceHoverState={isTyping}
          backgroundColor="#000000"
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center pointer-events-none">
        <div className="w-full animate-in fade-in zoom-in-95 duration-500 pointer-events-auto">
          <div className="flex items-center justify-between mb-6 w-full max-w-2xl mx-auto border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight drop-shadow-sm">Recruitment Assistant</h2>
              <p className="text-sm text-slate-300 font-medium">Digital Twin of Alex Rivera</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest drop-shadow-sm">Live Assistant</span>
            </div>
          </div>
          <div className="flex justify-center w-full shadow-2xl rounded-xl">
            <ChatBox onTypingStateChange={setIsTyping} />
          </div>
        </div>
      </div>
      <footer className="relative z-10 mt-8 text-slate-500 text-[10px] uppercase tracking-widest font-bold pointer-events-none drop-shadow-sm">
        AI Verification Powered by Alex Rivera
      </footer>
    </main>
  );
}


