
import React from 'react';
import { Download, ArrowLeft, RotateCcw } from 'lucide-react';

interface Props {
  onReturn: () => void;
}

const DoneView: React.FC<Props> = ({ onReturn }) => {
  return (
    <div className="fixed inset-0 z-[10000] bg-black flex flex-col">
      <div className="flex items-center justify-between p-8">
        <button 
          onClick={onReturn}
          className="p-4 bg-zinc-900 border border-white/10 rounded-full text-white hover:bg-zinc-800 transition-colors active:scale-90"
        >
          <ArrowLeft size={24} />
        </button>
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Session Complete</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center overflow-y-auto">
        <div className="w-64 h-64 bg-green-accent rounded-full flex items-center justify-center mb-16 shadow-[0_0_100px_rgba(34,197,94,0.4)] animate-in zoom-in-50 duration-700">
          <Download size={100} className="text-black" />
        </div>
        <h1 className="text-[8rem] font-black italic tracking-tighter leading-tight opacity-90 text-white">PDF READY</h1>
        <p className="text-zinc-500 font-black uppercase text-sm tracking-[0.6em] mt-8">Operation Successful.</p>
        
        <div className="mt-20 flex space-x-4">
          <button 
            onClick={onReturn} 
            className="px-12 py-8 bg-zinc-900 border border-white/10 rounded-[3rem] font-black text-xl italic uppercase shadow-xl active:scale-95 transition-transform flex items-center space-x-4 text-white hover:border-green-accent/50 hover:text-green-accent"
          >
            <RotateCcw size={24} />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoneView;
