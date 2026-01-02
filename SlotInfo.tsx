import React from 'react';
import { Eye } from 'lucide-react';

interface Props {
  pathDisplay: string;
  fileCount: number;
  customPath?: string;
  onInspect: () => void;
  t: any;
}

export const SlotInfo: React.FC<Props> = ({ pathDisplay, fileCount, customPath, onInspect, t }) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-end mb-3 ml-2">
        <h4 className={`text-[10px] uppercase font-black tracking-[0.2em] ${t.isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
          {customPath ? 'OVERRIDE TARGET' : 'MAPPING ADDRESS'}
        </h4>
        {customPath && <span className="text-[9px] font-mono text-green-accent px-2 py-0.5 bg-green-accent/10 rounded">MANUAL OVERRIDE</span>}
      </div>
      
      <div className={`bg-black/60 p-5 rounded-3xl font-mono text-[11px] leading-relaxed border break-all shadow-inner relative group transition-colors ${customPath ? 'border-green-accent/30 text-green-accent' : `border-white/5 ${t.isDark ? 'text-white' : 'text-black'}`}`}>
        {pathDisplay || <span className="opacity-30 italic">STANDBY FOR INTERFACE...</span>}
        <div className="absolute inset-0 border border-white/5 rounded-3xl pointer-events-none group-hover:border-white/10 transition-colors" />
      </div>
      
      {fileCount > 0 && (
        <div className="flex justify-between items-center mt-3 px-2 animate-in fade-in slide-in-from-top-2">
          <p className="text-[9px] font-black uppercase text-green-accent/60 tracking-widest">
            {fileCount} ITEMS CAPTURED
          </p>
          <button 
            onClick={onInspect}
            className={`flex items-center space-x-2 text-[10px] font-black uppercase px-3 py-1.5 rounded-full transition-all active:scale-95 ${t.isDark ? 'text-blue-400 bg-blue-400/10 hover:bg-blue-400/20' : 'text-blue-600 bg-blue-600/10 hover:bg-blue-600/20'}`}
          >
            <Eye size={12} strokeWidth={3} color={t.isDark ? 'white' : 'black'} />
            <span>Inspect Tree</span>
          </button>
        </div>
      )}
    </div>
  );
};
