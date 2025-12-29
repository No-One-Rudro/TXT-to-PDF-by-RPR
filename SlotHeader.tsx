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
      <div className="flex items-center space-x-4">
        <span className={`px-5 py-1.5 bg-green-accent ${t.isDark ? 'text-black' : 'text-black'} rounded-full font-black italic text-xs tracking-tighter shadow-lg shadow-green-accent/20`}>
          {id}
        </span>
        {activeMode === 'MIXED_MODE' && (
          <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
            <button 
              onClick={() => onToggleType('file')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${type === 'file' ? 'bg-green-accent text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
            >
              Files
            </button>
            <button 
              onClick={() => onToggleType('folder')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${type === 'folder' ? 'bg-green-accent text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
            >
              Tree
            </button>
          </div>
        )}
      </div>
      
      <div className="flex space-x-2">
        {canRemove && (
          <button onClick={onRemove} className="text-red-500 hover:scale-110 active:scale-90 transition-all p-2 hover:bg-red-500/10 rounded-full">
            <MinusCircle size={28} strokeWidth={3} />
          </button>
        )}
        {isLast && (
          <button onClick={onAdd} className="text-green-accent hover:scale-110 active:scale-90 transition-all p-2 hover:bg-green-accent/10 rounded-full">
            <PlusCircle size={28} strokeWidth={3} color={t.iconColor} />
          </button>
        )}
      </div>
    </div>
  );
};
