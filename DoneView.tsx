
import React from 'react';
import { Download } from 'lucide-react';

interface Props {
  onReturn: () => void;
}

const DoneView: React.FC<Props> = ({ onReturn }) => {
  return (
    <div className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center p-12 text-center overflow-y-auto">
      <div className="w-64 h-64 bg-green-accent rounded-full flex items-center justify-center mb-16 shadow-[0_0_100px_rgba(34,197,94,0.4)] animate-in zoom-in-50 duration-700">
        <Download size={100} className="text-black" />
      </div>
      <h1 className="text-[8rem] font-black italic tracking-tighter leading-tight opacity-90">PDF READY</h1>
      <p className="text-zinc-600 font-black uppercase text-sm tracking-[0.6em] mt-8">Operation Successful.</p>
      <button 
        onClick={onReturn} 
        className="mt-20 px-24 py-10 bg-zinc-900 rounded-full font-black text-2xl italic uppercase shadow-3xl active:scale-95 transition-transform"
      >
        TERMINAL
      </button>
    </div>
  );
};

export default DoneView;
