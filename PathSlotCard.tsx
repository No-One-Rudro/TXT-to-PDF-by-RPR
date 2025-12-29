import React from 'react';
import { FileText, FolderOpen, ChevronRight } from 'lucide-react';
import { SlotActionMenu } from './SlotActionMenu';
import { SlotHeader } from './SlotHeader';
import { SlotInfo } from './SlotInfo';

interface Slot {
  id: string;
  type: 'file' | 'folder';
  files: File[];
  pathDisplay: string;
  customPath?: string;
}

interface Props {
  slot: Slot;
  isLast: boolean;
  canRemove: boolean;
  activeMode: string;
  isOpen: boolean;
  onToggleOpen: () => void;
  onAdd: () => void;
  onRemove: () => void;
  onPickSpecific: (method: 'file' | 'folder' | 'terminal') => void;
  onToggleType: (type: 'file' | 'folder') => void;
  onInspect: () => void;
  t: any;
}

export const PathSlotCard: React.FC<Props> = ({ 
  slot, isLast, canRemove, activeMode, isOpen, onToggleOpen,
  onAdd, onRemove, onPickSpecific, onToggleType, onInspect, t
}) => {
  return (
    <div className="bg-zinc-950/50 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative animate-in slide-in-from-bottom-4 duration-300 overflow-hidden">
      <SlotHeader 
        id={slot.id}
        type={slot.type}
        isLast={isLast}
        canRemove={canRemove}
        activeMode={activeMode}
        onToggleType={onToggleType}
        onRemove={onRemove}
        onAdd={onAdd}
        t={t}
      />

      <SlotInfo 
        pathDisplay={slot.pathDisplay}
        fileCount={slot.files.length}
        customPath={slot.customPath}
        onInspect={onInspect}
        t={t}
      />

      <button 
        onClick={onToggleOpen}
        className={`w-full py-5 bg-zinc-900 border border-white/5 rounded-3xl font-black uppercase text-xs tracking-widest flex justify-between px-8 hover:bg-zinc-800 transition-all active:scale-[0.98] ${isOpen ? 'bg-zinc-800 border-white/10' : ''}`}
      >
        <div className="flex items-center space-x-4">
          {slot.type === 'file' ? <FileText size={18} strokeWidth={3} color={t.iconColor}/> : <FolderOpen size={18} strokeWidth={3} color={t.iconColor}/>}
          <span className={t.isDark ? 'text-white' : 'text-zinc-300'}>{isOpen ? 'ABORT PROTOCOL' : 'OPEN SELECTION PROTOCOL'}</span>
        </div>
        <ChevronRight size={18} strokeWidth={3} className={`transition-transform duration-300 ${isOpen ? 'rotate-90 text-white' : 'text-zinc-500'}`} />
      </button>

      {isOpen && (
        <SlotActionMenu onPick={onPickSpecific} t={t} />
      )}
    </div>
  );
};
