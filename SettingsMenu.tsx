
import React from 'react';
import { ChevronRight, LayoutTemplate, Palette, Type, BrainCircuit, Code2, Shield, Activity, ToggleRight, ToggleLeft } from 'lucide-react';

interface Props {
  userCustomColor: string;
  useDirPicker: boolean;
  setUseDirPicker: (v: boolean) => void;
  keepSizePref: boolean;
  setKeepSizePref: (v: boolean) => void;
  onSubViewChange: (view: 'themes' | 'interface_color' | 'fonts') => void;
  onOpenApi: () => void;
  onOpenRenderCodes: () => void;
  onRunDiagnostic: () => void;
  t: any;
}

export const SettingsMenu: React.FC<Props> = ({ 
  userCustomColor, useDirPicker, setUseDirPicker, keepSizePref, setKeepSizePref,
  onSubViewChange, onOpenApi, onOpenRenderCodes, onRunDiagnostic, t 
}) => {
  return (
    <div className="space-y-6 mt-8 pb-20">
      {/* THEMES */}
      <button onClick={() => onSubViewChange('themes')} className="w-full bg-zinc-950/50 p-10 rounded-[3.5rem] text-left flex items-center justify-between border border-white/5 shadow-2xl group hover:bg-zinc-900 transition-all overflow-hidden relative">
        <div className="flex items-center space-x-6 relative z-10">
          <div className="p-5 bg-black/40 rounded-[2rem] border border-white/5 relative">
              <LayoutTemplate size={32} className="text-zinc-200" />
          </div>
          <div>
            <span className="text-2xl font-black italic uppercase tracking-tighter">Themes</span>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mt-1">Background & Surface</p>
          </div>
        </div>
        <ChevronRight className="opacity-30 group-hover:opacity-100 group-hover:translate-x-2 transition-all relative z-10" size={28} />
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-zinc-500/5 to-transparent pointer-events-none" />
      </button>

      {/* INTERFACE COLOR */}
      <button onClick={() => onSubViewChange('interface_color')} className="w-full bg-zinc-950/50 p-10 rounded-[3.5rem] text-left flex items-center justify-between border border-white/5 shadow-2xl group hover:bg-zinc-900 transition-all overflow-hidden relative">
        <div className="flex items-center space-x-6 relative z-10">
          <div className="p-5 bg-black/40 rounded-[2rem] border border-white/5 relative">
              <Palette size={32} className="text-green-accent" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-zinc-950 shadow-lg" style={{ backgroundColor: userCustomColor }} />
          </div>
          <div>
            <span className="text-2xl font-black italic uppercase tracking-tighter text-green-accent">Interface Color</span>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mt-1">Buttons & Accents</p>
          </div>
        </div>
        <ChevronRight className="opacity-30 group-hover:opacity-100 group-hover:translate-x-2 transition-all relative z-10" size={28} />
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-green-accent/5 to-transparent pointer-events-none" />
      </button>

      {/* TYPOGRAPHY */}
      <button onClick={() => onSubViewChange('fonts')} className="w-full bg-zinc-950/50 p-10 rounded-[3.5rem] text-left flex items-center justify-between border border-white/5 shadow-2xl group hover:bg-zinc-900 transition-all overflow-hidden relative">
        <div className="flex items-center space-x-6 relative z-10">
          <div className="p-5 bg-black/40 rounded-[2rem] border border-white/5 relative">
              <Type size={32} className="text-purple-400" />
          </div>
          <div>
            <span className="text-2xl font-black italic uppercase tracking-tighter">Typography</span>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mt-1">Custom Font Engine</p>
          </div>
        </div>
        <ChevronRight className="opacity-30 group-hover:opacity-100 group-hover:translate-x-2 transition-all relative z-10" size={28} />
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-purple-400/5 to-transparent pointer-events-none" />
      </button>

      {/* INTELLIGENCE */}
      <button onClick={onOpenApi} className="w-full bg-zinc-950/50 p-10 rounded-[3.5rem] text-left flex items-center justify-between border border-white/5 shadow-2xl group hover:bg-zinc-900 transition-all overflow-hidden relative">
        <div className="flex items-center space-x-6 relative z-10">
          <div className="p-5 bg-black/40 rounded-[2rem] border border-white/5 relative">
              <BrainCircuit size={32} className="text-pink-400" />
          </div>
          <div>
            <span className="text-2xl font-black italic uppercase tracking-tighter">Intelligence</span>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mt-1">Model Config Vector</p>
          </div>
        </div>
        <ChevronRight className="opacity-30 group-hover:opacity-100 group-hover:translate-x-2 transition-all relative z-10" size={28} />
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-pink-400/5 to-transparent pointer-events-none" />
      </button>

      {/* RENDER CODES */}
      <button onClick={onOpenRenderCodes} className="w-full bg-zinc-950/50 p-10 rounded-[3.5rem] text-left flex items-center justify-between border border-white/5 shadow-2xl group hover:bg-zinc-900 transition-all overflow-hidden relative">
        <div className="flex items-center space-x-6 relative z-10">
          <div className="p-5 bg-black/40 rounded-[2rem] border border-white/5 relative">
              <Code2 size={32} className="text-blue-400" />
          </div>
          <div>
            <span className="text-2xl font-black italic uppercase tracking-tighter">Render Codes</span>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mt-1">Engine Version Select</p>
          </div>
        </div>
        <ChevronRight className="opacity-30 group-hover:opacity-100 group-hover:translate-x-2 transition-all relative z-10" size={28} />
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-blue-400/5 to-transparent pointer-events-none" />
      </button>

      <div className="bg-zinc-950/50 p-10 rounded-[4rem] border border-white/5 space-y-8 shadow-3xl">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-6">
              <div className="p-4 bg-blue-400/10 rounded-2xl text-blue-400"><Shield size={24} /></div>
              <div>
                <span className="text-xl font-black italic uppercase tracking-tighter">Recursion</span>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mt-1">Scan directory trees</p>
              </div>
          </div>
          <div className="cursor-pointer active:scale-90 transition-transform" onClick={() => setUseDirPicker(!useDirPicker)}>
            {useDirPicker ? <ToggleRight size={56} className="text-green-accent" /> : <ToggleLeft size={56} className="text-zinc-700" />}
          </div>
        </div>
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-6">
              <div className="p-4 bg-purple-400/10 rounded-2xl text-purple-400"><Activity size={24} /></div>
              <div>
                <span className="text-xl font-black italic uppercase tracking-tighter">Metric Lock</span>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mt-1">Persist paper size</p>
              </div>
          </div>
          <div className="cursor-pointer active:scale-90 transition-transform" onClick={() => setKeepSizePref(!keepSizePref)}>
            {keepSizePref ? <ToggleRight size={56} className="text-green-accent" /> : <ToggleLeft size={56} className="text-zinc-700" />}
          </div>
        </div>
      </div>
      
      <button onClick={onRunDiagnostic} className="w-full bg-zinc-950/50 p-10 rounded-[3.5rem] text-left flex items-center justify-between group border border-white/5 hover:border-red-500/30 transition-all shadow-xl">
        <div className="flex items-center space-x-8"><Activity size={32} className="text-red-500" /> <span className="text-xl font-black italic uppercase tracking-tighter">Diagnostic Loop</span></div>
        <ChevronRight className="opacity-20 group-hover:opacity-100 transition-all" size={24} />
      </button>
    </div>
  );
};
