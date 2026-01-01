
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Terminal, Check, AlertTriangle, Cpu, ArrowDownCircle, PauseCircle } from 'lucide-react';
import { getMissingCharacters } from './persistentRegistry';
import { MatrixRain } from './MatrixRain';
import DoneView from './DoneView';

interface Props {
  percentFiles: number;
  percentSize: number;
  percentPage: number;
  processedBytes: number;
  totalBytes: number;
  log: string[];
  isFinished: boolean;
  zipUrl?: string;
  outputCacheName: string | null;
  generatedFiles: string[];
  onReturn: () => void;
  t: any;
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const ProcessingMatrix: React.FC<Props> = ({ 
  percentFiles, percentSize, percentPage, processedBytes, totalBytes, 
  log, isFinished, zipUrl, outputCacheName, generatedFiles, onReturn, t 
}) => {
  const logEndRef = useRef<HTMLDivElement>(null);
  const [showTerminal, setShowTerminal] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true); 
  const [showGlyphs, setShowGlyphs] = useState(true);
  const [copied, setCopied] = useState(false);
  const [liveMissing, setLiveMissing] = useState<string[]>([]);

  useEffect(() => {
    setLiveMissing(getMissingCharacters());
  }, [log, isFinished]);

  const macroSync = useMemo(() => {
    if (isFinished) return 100;
    const calc = (percentSize * 0.50) + (percentFiles * 0.30) + (percentPage * 0.20);
    return Math.min(Math.round(calc), 99);
  }, [percentSize, percentFiles, percentPage, isFinished]);

  // Auto-scroll logic
  useEffect(() => {
    if (autoScroll && showTerminal && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [log, showTerminal, autoScroll]);

  const copyUnicodes = () => {
    navigator.clipboard.writeText(liveMissing.join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isFinished) {
    return <DoneView 
      zipUrl={zipUrl} 
      onReturn={onReturn} 
      outputCacheName={outputCacheName}
      generatedFiles={generatedFiles}
      t={t} 
    />;
  }

  return (
    <div className="fixed inset-0 z-[9000] bg-black text-white flex flex-col overflow-hidden font-mono">
      <MatrixRain />
      
      <div className="relative z-10 flex-1 flex flex-col p-6 max-w-2xl mx-auto w-full h-full">
        {/* HEADER */}
        <header className="py-6 flex flex-col items-center relative mb-4 shrink-0">
          <div className={`text-[6rem] font-black italic tracking-tighter uppercase leading-none absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none select-none blur-sm animate-pulse text-green-accent/10`}>
             SYNC
          </div>
          <div className="text-[5rem] font-black italic tracking-tighter uppercase leading-none z-10 text-white mix-blend-overlay">
             {macroSync}%
          </div>
        </header>

        {/* PROGRESS BARS */}
        <div className="grid gap-4 mb-4 shrink-0">
          <div className={`p-4 rounded-3xl border shadow-lg space-y-2 backdrop-blur-md transition-colors bg-zinc-950/80 border-white/10`}>
            <div className="flex justify-between px-2">
              <span className="text-[10px] font-black uppercase opacity-60 tracking-widest">Files</span>
              <span className="text-sm font-black italic text-green-accent">{Math.round(percentFiles)}%</span>
            </div>
            <div className="h-2 bg-black rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-green-accent transition-all duration-300 ease-out" style={{ width: `${percentFiles}%` }} />
            </div>
          </div>
          <div className={`p-4 rounded-3xl border shadow-lg space-y-2 backdrop-blur-md transition-colors bg-zinc-950/80 border-white/10`}>
            <div className="flex justify-between px-2 text-blue-400">
              <span className="text-[10px] font-black uppercase opacity-80 tracking-widest">Data Stream</span>
              <span className="text-[10px] font-mono font-bold text-white">
                {formatBytes(processedBytes)} / {formatBytes(totalBytes)}
              </span>
            </div>
            <div className="h-2 bg-black rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-blue-500 transition-all duration-300 ease-out" style={{ width: `${percentSize}%` }} />
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center justify-between mb-2 px-2 shrink-0 bg-white/5 p-3 rounded-2xl border border-white/5">
           <div className="flex items-center space-x-2 overflow-x-auto custom-scrollbar">
             
             {/* Console Toggle */}
             <button onClick={() => setShowTerminal(!showTerminal)} className={`flex items-center space-x-2 px-3 py-2 rounded-xl border transition-all ${showTerminal ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-transparent text-zinc-600'}`}>
                <Terminal size={14} />
                <span className="text-[10px] font-black uppercase">Console</span>
             </button>

             {/* Auto Scroll Toggle */}
             <button 
                onClick={() => setAutoScroll(!autoScroll)} 
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl border transition-all ${autoScroll ? 'bg-green-accent/20 border-green-accent/40 text-green-accent' : 'bg-transparent border-transparent text-zinc-600'}`}
             >
                {autoScroll ? <ArrowDownCircle size={14} className="animate-bounce" /> : <PauseCircle size={14} />}
                <span className="text-[10px] font-black uppercase">Auto-Scroll</span>
             </button>

             {/* Glyph Toggle */}
             <button 
                onClick={() => setShowGlyphs(!showGlyphs)} 
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl border transition-all ${showGlyphs ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-transparent border-transparent text-zinc-600'}`}
             >
                <AlertTriangle size={14} />
                <span className="text-[10px] font-black uppercase">Glyphs</span>
             </button>

           </div>
           <Cpu size={16} className="text-zinc-500 animate-pulse ml-2 shrink-0" />
        </div>

        {/* TERMINAL BOX */}
        {showTerminal && (
          <div className="relative mb-2 shrink-0 flex-1 min-h-[100px] transition-all duration-300 ease-in-out">
             <div className="absolute inset-0 bg-black/90 rounded-[2rem] border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col">
                <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-black to-transparent z-20 pointer-events-none" />
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 15%)' }}>
                   <div className="h-4" /> 
                   {log.map((line, i) => (
                     <div key={i} className={`mb-1.5 break-all font-mono text-[10px] leading-relaxed border-l-2 pl-3 ${line.startsWith('[ERR]') ? 'text-red-500 border-red-500 bg-red-500/10' : line.startsWith('[WARN]') ? 'text-yellow-500 border-yellow-500' : line.includes('[BOOT]') ? 'text-white border-white' : i === log.length - 1 ? 'text-green-400 font-bold border-green-500 animate-pulse' : 'text-green-800 border-transparent opacity-60'}`}>
                        {line}
                     </div>
                   ))}
                   <div ref={logEndRef} />
                </div>
             </div>
          </div>
        )}

        {/* MISSING GLYPHS BLOCK */}
        {showGlyphs && liveMissing.length > 0 && (
          <div className="shrink-0 mb-4 animate-in slide-in-from-bottom duration-500 min-h-0">
            <div className="bg-red-950/20 border border-red-500/20 rounded-[2rem] p-4 flex flex-col shadow-inner max-h-[10vh]">
               <div className="flex justify-between items-center mb-2 px-2 shrink-0">
                 <span className="text-[9px] font-black uppercase tracking-widest text-red-400 flex items-center gap-2">
                   <AlertTriangle size={12} />
                   Unmapped Vectors ({liveMissing.length})
                 </span>
                 <button onClick={copyUnicodes} className="text-[8px] font-black bg-red-500/10 text-red-400 px-2 py-1 rounded hover:bg-red-500/20 transition-colors uppercase">
                   {copied ? 'Copied' : 'Copy All'}
                 </button>
               </div>
               <div className="overflow-y-auto custom-scrollbar flex flex-wrap content-start gap-1 p-2 bg-black/20 rounded-xl">
                  {liveMissing.map((glyph, i) => (
                    <span key={i} className="text-[9px] font-mono text-red-300 bg-red-500/10 px-1 rounded border border-red-500/10" title={String.fromCharCode(parseInt(glyph, 16))}>
                      {glyph}
                    </span>
                  ))}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessingMatrix;
