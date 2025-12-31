
import React from 'react';
import { MinusCircle, PlusCircle } from 'lucide-react';

interface Props {
  id: string;
  type: 'file' | 'folder';
  isLast: boolean;
  canRemove: boolean;
  activeMode: string;
  onToggleType: (type: 'file' | 'folder') => void;
  onRemove: () => void;
  onAdd: () => void;
  t: any;
}

export const SlotHeader: React.FC<Props> = ({ 
  id, type, isLast, canRemove, activeMode, onToggleType, onRemove, onAdd, t
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center space-x-6">
        {/* Ultra-Prominent Access Box */}
        <div className={`px-8 py-6 bg-green-accent ${t.isDark ? 'text-black' : 'text-black'} rounded-[1.5rem] shadow-[0_0_40px_-10px_rgba(34,197,94,0.6)] border-4 border-black/10 flex items-center justify-center min-w-[6rem] transform hover:scale-105 transition-transform duration-300 group`}>
            <span className="font-black italic text-5xl tracking-tighter leading-none group-hover:scale-110 transition-transform">{id}</span>
        </div>
        
        {activeMode === 'MIXED_MODE' && (
          <div className="flex items-center space-x-3 ml-2 animate-in fade-in slide-in-from-left-4 duration-500">
            <span className={`text-[10px] font-black uppercase tracking-widest ${t.isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Logic:</span>
            <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 backdrop-blur-sm">
              <button 
                onClick={() => onToggleType('file')}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${type === 'file' ? 'bg-green-accent text-black shadow-lg' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
              >
                Files
              </button>
              <button 
                onClick={() => onToggleType('folder')}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${type === 'folder' ? 'bg-green-accent text-black shadow-lg' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
              >
                Tree
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex space-x-3">
        {canRemove && (
          <button onClick={onRemove} className="text-red-500 hover:scale-110 active:scale-90 transition-all p-4 hover:bg-red-500/10 rounded-full border border-transparent hover:border-red-500/20">
            <MinusCircle size={32} strokeWidth={2.5} />
          </button>
        )}
        {isLast && (
          <button onClick={onAdd} className="text-green-accent hover:scale-110 active:scale-90 transition-all p-4 hover:bg-green-accent/10 rounded-full border border-transparent hover:border-green-accent/20">
            <PlusCircle size={32} strokeWidth={2.5} color={t.iconColor} />
          </button>
        )}
      </div>
    </div>
  );
};
