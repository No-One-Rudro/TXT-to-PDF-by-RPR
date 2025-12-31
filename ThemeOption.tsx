
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { ThemeType } from './types';

interface Props {
  type: ThemeType;
  label: string;
  icon: React.ReactNode;
  desc: string;
  isActive: boolean;
  onSelect: () => void;
  t: any;
}

export const ThemeOption: React.FC<Props> = ({ type, label, icon, desc, isActive, onSelect, t }) => {
  return (
    <button 
      onClick={onSelect}
      className={`w-full p-8 rounded-[3rem] border-2 text-left transition-all flex items-center justify-between relative ${isActive ? 'border-green-accent bg-green-accent/10 shadow-2xl scale-[1.02]' : 'bg-zinc-950/50 border-white/5 shadow-xl hover:bg-zinc-900'}`}
    >
      <div className="flex items-center space-x-6">
        <div className={`p-4 rounded-2xl ${isActive ? 'bg-green-accent/20' : 'bg-white/5'}`}>{icon}</div>
        <div>
          <span className={`text-xl font-black italic uppercase tracking-tighter ${isActive ? 'text-green-accent' : ''}`}>{label}</span>
          <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mt-1">{desc}</p>
        </div>
      </div>
      {isActive && <CheckCircle2 className="text-green-accent" size={24} />}
    </button>
  );
};
