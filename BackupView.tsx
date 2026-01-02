
import React, { useState } from 'react';
import { ArrowLeft, Copy, CheckCircle2, Zap } from 'lucide-react';
import { EngineVersion } from './types';
import { ENGINE_REGISTRY } from './EngineRegistry';

interface Props {
  onBack: () => void;
  selectedEngine: EngineVersion;
  onSelectEngine: (v: EngineVersion) => void;
  t: any;
}

const BackupView: React.FC<Props> = ({ onBack, selectedEngine, onSelectEngine, t }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto w-full p-8 flex-1 flex flex-col min-h-screen animate-in fade-in duration-500">
      <header className="py-10 flex items-center">
        <button onClick={onBack} className={`p-5 ${t.button} border rounded-3xl shadow-xl active:scale-90 transition-transform`}><ArrowLeft size={28} /></button>
        <div className="ml-8">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Archives</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-green-accent/60 mt-2">Historical Logic Storage</p>
        </div>
      </header>

      <div className="flex-1 flex flex-col justify-center pb-20 overflow-hidden">
        <div className="flex overflow-x-auto gap-8 pb-12 pt-4 px-4 custom-scrollbar snap-x">
          {ENGINE_REGISTRY.map((eng) => (
            <div 
              key={eng.id} 
              className={`snap-center min-w-[320px] md:min-w-[450px] flex flex-col ${t.card} rounded-[4rem] border-2 transition-all duration-500 relative ${selectedEngine === eng.id ? 'border-green-accent shadow-[0_40px_100px_rgba(34,197,94,0.2)]' : 'border-white/5 shadow-3xl'}`}
            >
              <div className="p-10 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span className="text-6xl font-black italic tracking-tighter text-green-accent">{eng.label}</span>
                  <div>
                    <h3 className="text-xl font-black italic uppercase tracking-tighter">{eng.name}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mt-1">{eng.desc}</p>
                  </div>
                </div>
                {selectedEngine === eng.id ? (
                  <div className="p-3 bg-green-accent/20 rounded-2xl text-green-accent"><Zap size={24} /></div>
                ) : (
                  <button 
                    onClick={() => onSelectEngine(eng.id)}
                    className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase hover:bg-white/10 transition-all"
                  >
                    Activate
                  </button>
                )}
              </div>

              <div className="flex-1 p-8 bg-black/40 relative group">
                <div className="absolute top-10 right-10 z-20 flex space-x-3">
                  <button 
                    onClick={() => handleCopy(eng.code, eng.id)}
                    className={`p-4 rounded-2xl transition-all shadow-xl backdrop-blur-md ${copiedId === eng.id ? 'bg-green-accent text-black' : 'bg-zinc-900/80 border border-white/10 text-white hover:bg-zinc-800'}`}
                  >
                    {copiedId === eng.id ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                  </button>
                </div>
                <div className="h-[40vh] overflow-y-auto custom-scrollbar rounded-[2rem] bg-black/60 p-6 border border-white/5">
                  <pre className="font-mono text-[11px] text-green-accent/60 leading-relaxed whitespace-pre-wrap">
                    {eng.code}
                  </pre>
                </div>
              </div>

              <div className="p-8 text-center bg-black/20 rounded-b-[4rem]">
                 <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-20">Structure Registry Entry {eng.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BackupView;
