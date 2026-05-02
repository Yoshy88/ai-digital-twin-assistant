'use client';

import { useState } from 'react';
import ChatBox from '@/components/ChatBox';
import Footer from '@/components/Footer';
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
          <div className="flex justify-center w-full shadow-2xl rounded-xl">
            <ChatBox onTypingStateChange={setIsTyping} />
          </div>
        </div>
        <Footer />
      </div>
    </main>
  );
}


