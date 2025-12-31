
import React, { useState } from 'react';
import { ColorPicker } from './ColorPicker';
import { QuickColorPicker } from './QuickColorPicker';
import { Zap, Sliders } from 'lucide-react';

interface Props {
  userBackgroundColor: string;
  setUserBackgroundColor: (c: string) => void;
  t: any;
}

export const BackgroundPicker: React.FC<Props> = ({ userBackgroundColor, setUserBackgroundColor, t }) => {
  const [mode, setMode] = useState<'quick' | 'advanced'>('quick');

  return (
    <div className="mt-4 mb-6">
       <div className="p-8 bg-zinc-950/80 rounded-[3.5rem] border-2 border-white/10 animate-in slide-in-from-top-4 shadow-3xl">
         <div className="flex justify-center mb-8">
           <div className="bg-black/40 p-1 rounded-full flex border border-white/5">
             <button 
               onClick={() => setMode('quick')}
               className={`flex items-center space-x-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'quick' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
             >
               <Zap size={14} />
               <span>Quick</span>
             </button>
             <button 
               onClick={() => setMode('advanced')}
               className={`flex items-center space-x-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'advanced' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
             >
               <Sliders size={14} />
               <span>Advanced</span>
             </button>
           </div>
         </div>

         {mode === 'quick' ? (
           <QuickColorPicker initialHex={userBackgroundColor} onUpdate={setUserBackgroundColor} t={t} />
         ) : (
           <ColorPicker initialHex={userBackgroundColor} onUpdate={setUserBackgroundColor} t={t} />
         )}
       </div>
    </div>
  );
};
