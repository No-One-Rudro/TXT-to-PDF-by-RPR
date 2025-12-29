import React, { useState } from 'react';
import { PathSlotCard } from './PathSlotCard';

interface Slot {
  id: string;
  type: 'file' | 'folder';
  files: File[];
  pathDisplay: string;
}

interface Props {
  slots: Slot[];
  activeMode: string;
  onAdd: () => void;
  onRemove: (idx: number) => void;
  onPick: (idx: number) => void;
  onPickSpecific: (idx: number, method: 'file' | 'folder' | 'terminal') => void;
  onToggleType: (idx: number, type: 'file' | 'folder') => void;
  onInspect: (idx: number) => void;
  t: any;
}

const MatrixManager: React.FC<Props> = ({ slots, activeMode, onAdd, onRemove, onPick, onPickSpecific, onToggleType, onInspect, t }) => {
  const [openSelectorIdx, setOpenSelectorIdx] = useState<number | null>(null);

  const handleToggle = (i: number) => {
    setOpenSelectorIdx(openSelectorIdx === i ? null : i);
  };

  const handlePickSpecific = (i: number, method: 'file' | 'folder' | 'terminal') => {
    onPickSpecific(i, method);
    setOpenSelectorIdx(null);
  };

  return (
    <div className="space-y-6">
      {slots.map((slot, i) => (
        <PathSlotCard
          key={slot.id}
          slot={slot}
          isLast={i === slots.length - 1}
          canRemove={slots.length > 1}
          activeMode={activeMode}
          isOpen={openSelectorIdx === i}
          onToggleOpen={() => handleToggle(i)}
          onAdd={onAdd}
          onRemove={() => onRemove(i)}
          onPickSpecific={(method) => handlePickSpecific(i, method)}
          onToggleType={(type) => onToggleType(i, type)}
          onInspect={() => onInspect(i)}
          t={t}
        />
      ))}
    </div>
  );
};

export default MatrixManager;
