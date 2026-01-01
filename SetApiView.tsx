import React from 'react';
import { ArrowLeft, Cpu, Globe, Zap, ShieldCheck, Database, Search } from 'lucide-react';
import { ApiConfig } from './types';

interface Props {
  onBack: () => void;
  config: ApiConfig;
  setConfig: (c: ApiConfig) => void;
  t: any;
}

const SetApiView: React.FC<Props> = ({ onBack, config, setConfig, t }) => {
  const models = ['gemini-3-flash-preview', 'gemini-3-pro-preview'];

  return (
    <div className="max-w-2xl mx-auto w-full p-8 flex-1 flex flex-col animate-in fade-in duration-500 pb-48">
      <header className="py-10 flex items-center mb-6">
        <button onClick={onBack} className={`p-4 ${t.button} rounded-2xl mr-6 active:scale-90 transition-transform shadow-xl`}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Intelligence</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-green-accent/60 mt-2">API Configuration Engine</p>
        </div>
      </header>

      <div className="space-y-6">
        <div className="bg-zinc-950/50 p-8 rounded-[3rem] border border-white/5 space-y-8">
          <div className="flex items-center space-x-4 mb-2">
            <div className="p-3 bg-green-accent/10 rounded-xl text-green-accent">
              <Cpu size={24} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tighter italic">Primary Core</h3>
          </div>

          <div className="space-y-4">
            {models.map(m => (
              <button
                key={m}
                onClick={() => setConfig({ ...config, activeModel: m })}
                className={`w-full p-6 rounded-2xl border flex items-center justify-between transition-all ${config.activeModel === m ? 'border-green-accent bg-green-accent/5' : 'border-white/5 bg-black/40'}`}
              >
                <span className="text-xs font-mono font-bold">{m}</span>
                {config.activeModel === m && <Zap size={16} className="text-green-accent" />}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-zinc-950/50 p-8 rounded-[3rem] border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Globe size={20} className="text-blue-400" />
              <span className="text-sm font-black uppercase tracking-tighter italic opacity-60">OCR Logic Bridge</span>
            </div>
            <input 
              type="checkbox" 
              checked={config.ocrEnabled} 
              onChange={e => setConfig({ ...config, ocrEnabled: e.target.checked })}
              className="w-6 h-6 accent-green-accent"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Search size={20} className="text-green-accent" />
              <span className="text-sm font-black uppercase tracking-tighter italic opacity-60">Search Grounding</span>
            </div>
            <input 
              type="checkbox" 
              checked={config.searchGrounding} 
              onChange={e => setConfig({ ...config, searchGrounding: e.target.checked })}
              className="w-6 h-6 accent-green-accent"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ShieldCheck size={20} className="text-purple-400" />
              <span className="text-sm font-black uppercase tracking-tighter italic opacity-60">Auto-Fallback Vector</span>
            </div>
            <input 
              type="checkbox" 
              checked={config.fallbackEnabled} 
              onChange={e => setConfig({ ...config, fallbackEnabled: e.target.checked })}
              className="w-6 h-6 accent-green-accent"
            />
          </div>
        </div>

        <div className="p-8 bg-zinc-900/30 border border-white/5 rounded-[3rem]">
          <div className="flex items-start space-x-4">
            <Database size={24} className="text-zinc-500 mt-1" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Registry Status</p>
              <p className="text-[11px] leading-relaxed mt-2 opacity-40">System environment key is currently managed by the root container. Google Search tool requires valid API keys with search capabilities enabled.</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-auto py-10 text-center opacity-10">
        <p className="text-[9px] font-black uppercase tracking-[0.5em]">TXT to PDF Auth Service v4.1</p>
      </footer>
    </div>
  );
};

export default SetApiView;
