import React, { useState, useEffect, useRef } from 'react';
import { Terminal, ChevronRight, Check, X, HardDrive, Cpu } from 'lucide-react';

interface Props {
  isOpen: boolean;
  currentId: string;
  onClose: () => void;
  onConfirm: (path: string) => void;
}

export const TerminalPathModal: React.FC<Props> = ({ isOpen, currentId, onClose, onConfirm }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setInput('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    let finalPath = input.trim();
    
    // Normalize prefix: 'storage/...' -> '/storage/...'
    if (finalPath.startsWith('storage/')) {
      finalPath = '/' + finalPath;
    }

    // Auto-format External SD Card IDs (XXXXXXXX -> XXXX-XXXX)
    if (finalPath.startsWith('/storage/')) {
      const parts = finalPath.split('/');
      // parts[0]='', parts[1]='storage', parts[2]=ID
      if (parts.length > 2) {
        const id = parts[2];
        const rawId = id.replace(/-/g, '');
        
        // Exclude 'emulated' and 'self' from formatting
        if (id.toLowerCase() !== 'emulated' && id.toLowerCase() !== 'self') {
          // Check for 8-char alphanumeric pattern typical of FAT32/exFAT UUIDs
          if (rawId.length === 8 && /^[a-zA-Z0-9]+$/.test(rawId)) {
            const upper = rawId.toUpperCase();
            parts[2] = `${upper.slice(0, 4)}-${upper.slice(4, 8)}`;
            finalPath = parts.join('/');
          }
        }
      }
    }

    // Remove trailing slash for internal consistency (App appends it for display)
    if (finalPath.endsWith('/')) {
      finalPath = finalPath.slice(0, -1);
    }
    
    if (finalPath) onConfirm(finalPath);
  };

  const applyPreset = (preset: string) => {
    setInput(preset);
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(34,197,94,0.1)] overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/5">
          <div className="flex items-center space-x-3">
            <Terminal size={20} className="text-green-accent" />
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Path Override Protocol • {currentId}</span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          <p className="text-[10px] font-mono text-green-accent/60 mb-6 uppercase tracking-wider">
            // ENTER VIRTUAL DIRECTORY FOR OUTPUT ARCHIVE
          </p>
          
          <form onSubmit={handleSubmit} className="relative group mb-8">
            <div className="absolute top-6 left-0 flex items-start pl-4 pointer-events-none">
              <ChevronRight size={24} className="text-green-accent animate-pulse" />
            </div>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              className="w-full bg-black/40 border-2 border-white/10 rounded-2xl py-6 pl-14 pr-36 font-mono text-xl text-white outline-none focus:border-green-accent/50 transition-all placeholder:text-zinc-800 resize-none h-32 custom-scrollbar break-all"
              placeholder="/storage/emulated/0/"
              spellCheck={false}
            />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-green-accent text-black px-6 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 shadow-lg shadow-green-accent/20"
            >
              <span>Execute</span>
              <Check size={16} />
            </button>
          </form>
          
          <div className="space-y-4">
             <div className="flex items-center space-x-2 opacity-50">
               <HardDrive size={14} className="text-blue-400" />
               <span className="text-[9px] font-black uppercase tracking-widest">Quick Mount Points</span>
             </div>
             <div className="grid grid-cols-2 gap-3">
               <button 
                 type="button"
                 onClick={() => applyPreset('/storage/emulated/0/')}
                 className="bg-white/5 hover:bg-white/10 p-4 rounded-xl text-left border border-white/5 transition-all active:scale-95 group"
               >
                 <span className="text-[10px] font-mono text-blue-300 block mb-1 group-hover:text-blue-200">Internal Storage</span>
                 <span className="text-[11px] font-mono opacity-50">/storage/emulated/0/</span>
               </button>
               <button 
                 type="button"
                 onClick={() => applyPreset('/storage/XXXX-XXXX/')}
                 className="bg-white/5 hover:bg-white/10 p-4 rounded-xl text-left border border-white/5 transition-all active:scale-95 group"
               >
                 <span className="text-[10px] font-mono text-purple-300 block mb-1 group-hover:text-purple-200">External Media</span>
                 <span className="text-[11px] font-mono opacity-50">/storage/XXXX-XXXX/</span>
               </button>
             </div>
          </div>
          
          <div className="mt-8 flex justify-between items-center">
            <div className="flex space-x-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-bounce delay-75" />
              <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce delay-150" />
            </div>
            <div className="flex items-center space-x-2 text-zinc-600">
               <Cpu size={14} />
               <span className="text-[9px] font-black uppercase tracking-wider">Awaiting Input</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
