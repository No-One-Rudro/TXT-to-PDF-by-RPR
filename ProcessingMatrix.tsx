import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Terminal, Activity, Copy, Check, Box } from 'lucide-react';
import { getMissingCharacters } from './persistentRegistry';

interface Props {
  percentFiles: number;
  percentSize: number;
  percentPage: number;
  log: string[];
  isFinished: boolean;
  onReturn: () => void;
  t: any;
}

const ProcessingMatrix: React.FC<Props> = ({ percentFiles, percentSize, percentPage, log, isFinished, onReturn, t }) => {
  const logEndRef = useRef<HTMLDivElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);

  // Aggregated Macro Sync: 50% Size, 30% Files, 20% Pages
  const macroSync = useMemo(() => {
    const calc = (percentSize * 0.50) + (percentFiles * 0.30) + (percentPage * 0.20);
    return Math.min(Math.round(calc), 100);
  }, [percentSize, percentFiles, percentPage]);

  const missingGlyphs = useMemo(() => isFinished ? getMissingCharacters() : [], [isFinished, log]);

  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [log, autoScroll]);

  const handleScroll = () => {
    if (!logContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isAtBottom);
  };

  const copyUnicodes = () => {
    navigator.clipboard.writeText(missingGlyphs.join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto w-full p-8 flex-1 flex flex-col animate-in fade-in duration-500 overflow-hidden">
      <header className="py-12 flex flex-col items-center">
        <h2 className="text-[12rem] font-black italic uppercase tracking-tighter leading-none text-white-blue/5 absolute top-10 left-1/2 -translate-x-1/2 pointer-events-none select-none">MACRO</h2>
        <div className="text-[10rem] font-black italic tracking-tighter uppercase leading-none mb-4 animate-pulse">
           {macroSync}%
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-green-accent">Aggregate Nexus Sync</p>
      </header>

      <div className="grid gap-4 mb-8">
        {/* Tier 1: Artifact Sync (Files) */}
        <div className={`${t.card} p-6 rounded-[2.5rem] border shadow-xl space-y-3`}>
          <div className="flex justify-between items-center px-2">
             <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Artifact Progress</span>
             <span className="text-xl font-black italic text-green-accent">{Math.round(percentFiles)}%</span>
          </div>
          <div className="h-3 bg-black/40 rounded-full p-0.5 border border-white/5 overflow-hidden">
             <div className="h-full bg-green-accent rounded-full transition-all duration-500" style={{ width: `${percentFiles}%` }} />
          </div>
        </div>

        {/* Tier 2: Kernel Sync (Pages - Parts of Parts) */}
        <div className={`${t.card} p-6 rounded-[2.5rem] border shadow-xl space-y-3`}>
          <div className="flex justify-between items-center px-2 text-blue-400">
             <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Kernel Synthesis (Inner)</span>
             <span className="text-xl font-black italic">{Math.round(percentPage)}%</span>
          </div>
          <div className="h-3 bg-black/40 rounded-full p-0.5 border border-white/5 overflow-hidden">
             <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${percentPage}%` }} />
          </div>
        </div>

        {/* Tier 3: Bit-Stream Sync (Purple Smooth) */}
        <div className={`${t.card} p-6 rounded-[2.5rem] border shadow-xl space-y-3`}>
          <div className="flex justify-between items-center px-2 text-purple-400">
             <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Bit-Stream (Smooth 5s)</span>
             <span className="text-xl font-black italic">{Math.round(percentSize)}%</span>
          </div>
          <div className="h-3 bg-black/40 rounded-full p-0.5 border border-white/5 overflow-hidden">
             <div className="h-full bg-purple-500 rounded-full transition-all duration-[5000ms] ease-linear" style={{ width: `${percentSize}%` }} />
          </div>
        </div>
      </div>

      <div className={`${t.card} flex-1 min-h-0 rounded-[3.5rem] border shadow-2xl flex flex-col overflow-hidden bg-black/60 relative`}>
        <div className="flex items-center space-x-3 p-6 border-b border-white/5 bg-zinc-950/40">
           <Terminal size={18} className="text-green-accent" />
           <span className="text-[10px] font-black uppercase tracking-widest">Logic Stream</span>
           {isFinished && <Activity size={14} className="text-blue-400 animate-pulse ml-auto" />}
        </div>
        
        <div 
          ref={logContainerRef}
          onScroll={handleScroll}
          className="flex-1 p-8 font-mono text-[11px] leading-relaxed overflow-y-auto custom-scrollbar text-green-accent/80 selection:bg-green-accent/20"
        >
          {log.map((line, i) => (
            <div key={i} className={`mb-1 ${line.startsWith('[ERR]') ? 'text-red-500' : line.startsWith('[WARN]') ? 'text-yellow-500' : line.includes('downloading') ? 'text-blue-400' : ''}`}>
               <span className="opacity-40 mr-2">$</span>{line}
            </div>
          ))}
          <div ref={logEndRef} />
        </div>

        {isFinished && missingGlyphs.length > 0 && (
          <div className="p-8 bg-zinc-950/80 border-t border-white/10 animate-in slide-in-from-bottom duration-500">
            <div className="flex justify-between items-center mb-4">
               <h4 className="text-xs font-black uppercase tracking-widest text-red-500">Telemetry Deficit</h4>
               <button onClick={copyUnicodes} className="flex items-center space-x-2 text-[10px] font-black uppercase bg-white/5 px-4 py-2 rounded-xl active:scale-95 transition-all">
                  {copied ? <Check size={14} className="text-green-accent" /> : <Copy size={14} />}
                  <span>{copied ? 'Captured' : 'Copy Unicodes'}</span>
               </button>
            </div>
            <div className="bg-black/40 p-4 rounded-2xl font-mono text-[10px] text-zinc-500 break-all border border-white/5 max-h-24 overflow-y-auto">
               {missingGlyphs.join(', ')}
            </div>
          </div>
        )}
      </div>

      <div className="py-8">
        <button 
          onClick={onReturn}
          className={`w-full py-10 rounded-[3rem] font-black text-3xl italic uppercase tracking-tighter shadow-2xl active:scale-95 transition-transform ${isFinished ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-700 pointer-events-none'}`}
        >
          {isFinished ? 'TERMINAL RETURN' : 'EXECUTING NEXUS...'}
        </button>
      </div>
    </div>
  );
};

export default ProcessingMatrix;
