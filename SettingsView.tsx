
import React, { useState } from 'react';
import { ArrowLeft, Palette, Shield, Activity, ChevronRight, ToggleRight, ToggleLeft, Database, Type, BrainCircuit, Code2 } from 'lucide-react';
import { ThemeType, CustomFont } from './types';
import ThemesView from './ThemesView';
import FontsView from './FontsView';

interface Props {
  onBack: () => void;
  theme: ThemeType;
  setTheme: (t: ThemeType) => void;
  userCustomColor: string;
  setUserCustomColor: (c: string) => void;
  customBgImage: string | null;
  onBgImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  useDirPicker: boolean;
  setUseDirPicker: (v: boolean) => void;
  keepSizePref: boolean;
  setKeepSizePref: (v: boolean) => void;
  onRunDiagnostic: () => void;
  onOpenRenderCodes: () => void;
  onOpenApi: () => void;
  fonts: CustomFont[];
  onAddFonts: (files: File[]) => void;
  onRemoveFont: (id: string) => void;
  onOcrPrompt: (files: File[]) => void;
  t: any;
}

const SettingsView: React.FC<Props> = (props) => {
  const [subView, setSubView] = useState<'main' | 'themes' | 'fonts'>('main');

  if (subView === 'themes') {
    return (
      <ThemesView 
        onBack={() => setSubView('main')}
        theme={props.theme}
        setTheme={props.setTheme}
        userCustomColor={props.userCustomColor}
        setUserCustomColor={props.setUserCustomColor}
        onBgImageUpload={props.onBgImageUpload}
        t={props.t}
      />
    );
  }

  if (subView === 'fonts') {
    return (
      <FontsView 
        onBack={() => setSubView('main')}
        fonts={props.fonts}
        onAddFonts={props.onAddFonts}
        onRemoveFont={props.onRemoveFont}
        onOcrPrompt={props.onOcrPrompt}
        t={props.t}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full p-8 flex-1 flex flex-col animate-in fade-in duration-300">
      <header className="py-10 flex items-center">
        <button onClick={props.onBack} className={`p-4 ${props.t.button} rounded-2xl mr-6 active:scale-90 transition-transform`}><ArrowLeft size={24} /></button>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">System Core</h1>
      </header>

      <div className="space-y-6 mt-8 pb-20">
        <button onClick={() => setSubView('themes')} className="w-full bg-zinc-950/50 p-10 rounded-[3.5rem] text-left flex items-center justify-between border border-white/5 shadow-2xl group hover:bg-zinc-900 transition-all overflow-hidden relative">
          <div className="flex items-center space-x-6 relative z-10">
            <div className="p-5 bg-black/40 rounded-[2rem] border border-white/5 relative">
               <Palette size={32} className="text-green-accent" />
               <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-zinc-950 shadow-lg" style={{ backgroundColor: props.userCustomColor }} />
            </div>
            <div>
              <span className="text-2xl font-black italic uppercase tracking-tighter">Themes</span>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mt-1">Interface Appearance</p>
            </div>
          </div>
          <ChevronRight className="opacity-30 group-hover:opacity-100 group-hover:translate-x-2 transition-all relative z-10" size={28} />
          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-green-accent/5 to-transparent pointer-events-none" />
        </button>

        <button onClick={() => setSubView('fonts')} className="w-full bg-zinc-950/50 p-10 rounded-[3.5rem] text-left flex items-center justify-between border border-white/5 shadow-2xl group hover:bg-zinc-900 transition-all overflow-hidden relative">
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

        <button onClick={props.onOpenApi} className="w-full bg-zinc-950/50 p-10 rounded-[3.5rem] text-left flex items-center justify-between border border-white/5 shadow-2xl group hover:bg-zinc-900 transition-all overflow-hidden relative">
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

        <button onClick={props.onOpenRenderCodes} className="w-full bg-zinc-950/50 p-10 rounded-[3.5rem] text-left flex items-center justify-between border border-white/5 shadow-2xl group hover:bg-zinc-900 transition-all overflow-hidden relative">
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
            <div className="cursor-pointer active:scale-90 transition-transform" onClick={() => props.setUseDirPicker(!props.useDirPicker)}>
              {props.useDirPicker ? <ToggleRight size={56} className="text-green-accent" /> : <ToggleLeft size={56} className="text-zinc-700" />}
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
            <div className="cursor-pointer active:scale-90 transition-transform" onClick={() => props.setKeepSizePref(!props.setKeepSizePref)}>
              {props.keepSizePref ? <ToggleRight size={56} className="text-green-accent" /> : <ToggleLeft size={56} className="text-zinc-700" />}
            </div>
          </div>
        </div>
        
        <button onClick={props.onRunDiagnostic} className="w-full bg-zinc-950/50 p-10 rounded-[3.5rem] text-left flex items-center justify-between group border border-white/5 hover:border-red-500/30 transition-all shadow-xl">
          <div className="flex items-center space-x-8"><Activity size={32} className="text-red-500" /> <span className="text-xl font-black italic uppercase tracking-tighter">Diagnostic Loop</span></div>
          <ChevronRight className="opacity-20 group-hover:opacity-100 transition-all" size={24} />
        </button>
      </div>

      <footer className="mt-auto py-12 text-center opacity-10">
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">TXT to PDF Universal Console v4.1</p>
      </footer>
    </div>
  );
};

export default SettingsView;
