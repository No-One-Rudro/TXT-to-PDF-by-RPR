import React from 'react';
import { Settings, Activity } from 'lucide-react';
import MatrixManager from './MatrixManager';

interface Slot {
  id: string;
  type: 'file' | 'folder';
  files: File[];
  pathDisplay: string;
}

interface Props {
  slots: Slot[];
  activeMode: string;
  onBack: () => void;
  onNext: () => void;
  onAddSlot: () => void;
  onRemoveSlot: (idx: number) => void;
  onToggleType: (idx: number, type: 'file' | 'folder') => void;
  onInspect: (idx: number) => void;
  onPickSpecific: (idx: number, method: 'file' | 'folder' | 'terminal') => void;
  onOpenSettings: () => void;
  onRunDiagnostic: () => void;
  t: any;
}

const PathsView: React.FC<Props> = ({ 
  slots, activeMode, onNext, onAddSlot, onRemoveSlot, onToggleType, onInspect, onPickSpecific, onOpenSettings, onRunDiagnostic, t 
}) => {
  return (
    <div className="max-w-2xl mx-auto w-full p-6 flex-1 flex flex-col animate-in fade-in duration-500">
      <header className="flex items-center justify-between py-12 px-4 bg-zinc-950/30 rounded-[3rem] border border-white/5 mb-8 backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-3">
             <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">TXT to PDF</h1>
             <span className="text-[8px] font-black bg-green-accent text-black px-2 py-0.5 rounded-full mt-[-10px]">v4.1</span>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-green-accent/60 mt-4 leading-relaxed">Structural Interface</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={onRunDiagnostic} className={`p-4 ${t.button} rounded-2xl border border-white/5 shadow-xl flex items-center space-x-2 text-red-500 font-black italic uppercase active:scale-90 transition-transform hover:bg-red-500/5`}>
            <Activity size={24} />
          </button>
          <button onClick={onOpenSettings} className={`p-5 ${t.button} rounded-3xl border border-white/5 shadow-2xl active:scale-90 transition-transform bg-green-accent/5 hover:bg-green-accent/10`}>
            <Settings size={32} color={t.iconColor} />
          </button>
        </div>
      </header>
      
      <div className="flex-1 space-y-6 pb-48">
        <MatrixManager 
          slots={slots} 
          activeMode={activeMode}
          onAdd={onAddSlot}
          onRemove={onRemoveSlot}
          onToggleType={onToggleType}
          onInspect={onInspect}
          onPick={() => {}}
          onPickSpecific={onPickSpecific}
          t={t}
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-8 max-w-2xl mx-auto z-50 pointer-events-none">
        <div className="bg-black/80 backdrop-blur-xl p-3 rounded-[4rem] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,1)] pointer-events-auto">
          <button onClick={onNext} className="w-full bg-green-accent text-black py-10 rounded-[3.5rem] font-black text-3xl italic shadow-2xl active:scale-95 transition-transform uppercase tracking-tighter border-b-8 border-black/20 hover:border-black/30">
            CALIBRATE CONVERTER
          </button>
        </div>
      </div>
    </div>
  );
};

export default PathsView;
