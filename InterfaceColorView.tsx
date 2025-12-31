
import React from 'react';
import { ArrowLeft, Palette } from 'lucide-react';
import { ColorPicker } from './ColorPicker';

interface Props {
  onBack: () => void;
  userCustomColor: string;
  setUserCustomColor: (c: string) => void;
  t: any;
}

const InterfaceColorView: React.FC<Props> = ({ onBack, userCustomColor, setUserCustomColor, t }) => {
  return (
    <div className="max-w-2xl mx-auto w-full p-8 flex-1 flex flex-col animate-in fade-in duration-500 pb-48">
      <header className="py-10 flex items-center mb-6">
        <button onClick={onBack} className={`p-4 ${t.button} rounded-2xl mr-6 active:scale-90 transition-transform shadow-xl`}>
          <ArrowLeft size={24} color={t.iconColor} />
        </button>
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Interface Color</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-green-accent/60 mt-2">Global Accent Calibration</p>
        </div>
      </header>

      <div className="p-10 bg-zinc-950/80 rounded-[4rem] border-2 border-green-accent/20 animate-in slide-in-from-top-4 shadow-3xl">
        <ColorPicker initialHex={userCustomColor} onUpdate={setUserCustomColor} t={t} />
      </div>

      <div className="mt-8 p-8 border border-white/5 rounded-[3rem] bg-black/20 text-center">
        <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Changes apply instantly to all controls</p>
      </div>
    </div>
  );
};

export default InterfaceColorView;
