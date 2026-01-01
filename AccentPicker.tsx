
import React from 'react';
import { ColorPicker } from './ColorPicker';

interface Props {
  userCustomColor: string;
  setUserCustomColor: (c: string) => void;
  t: any;
}

export const AccentPicker: React.FC<Props> = ({ userCustomColor, setUserCustomColor, t }) => {
  return (
    <div className="mt-8 pt-8 border-t border-white/5">
      <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-6 text-center">Interface Accent Color</h3>
      <div className="p-10 bg-zinc-950/80 rounded-[4rem] border-2 border-green-accent/20 animate-in slide-in-from-top-4 shadow-3xl">
        <ColorPicker initialHex={userCustomColor} onUpdate={setUserCustomColor} t={t} />
      </div>
    </div>
  );
};
