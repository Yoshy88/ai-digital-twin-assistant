import LLMDebugBox from './LLMDebugBox';

export default function Footer({ llmInfo }: { llmInfo?: { provider: string; model: string } }) {
  return (
    <footer className="relative z-10 mt-12 w-full flex flex-col items-center gap-2 pointer-events-none">
      <div className="flex items-center gap-4 text-slate-500 text-[10px] uppercase tracking-widest font-bold drop-shadow-sm">
        <span>AI digital twin powered by</span>
        <span className="text-slate-400">•</span>
        <div className="pointer-events-auto">
          <LLMDebugBox llmInfo={llmInfo} isFooter={true} />
        </div>
      </div>
    </footer>
  );
}
