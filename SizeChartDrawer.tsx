
import React from 'react';
import { X, Ruler } from 'lucide-react';
import { PAPER_SIZES } from './constants';
import { PaperSize } from './types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (s: PaperSize) => void;
}

const SizeChartDrawer: React.FC<Props> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[8000] flex items-end">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full h-[65vh] bg-zinc-950 border-t border-white/10 rounded-t-[4rem] p-10 flex flex-col shadow-[0_-50px_100px_rgba(0,0,0,1)] animate-in slide-in-from-bottom duration-500">
        <div className="w-20 h-1.5 bg-zinc-800 rounded-full mx-auto mb-10 cursor-pointer" onClick={onClose} />
        
        <div className="flex justify-between items-center mb-8 px-4">
          <div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Metric Chart</h2>
            <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.4em] mt-2">ISO • JIS • STANDARDS</p>
          </div>
          <button onClick={onClose} className="p-4 bg-white/5 rounded-full"><X size={32}/></button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-10 custom-scrollbar pr-4 pb-20">
          {['ISO', 'JIS', 'OTHER'].map(cat => (
            <div key={cat} className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 px-6">{cat} Systems</h4>
              <div className="grid gap-3">
                {PAPER_SIZES.filter(s => s.category === cat).map(s => (
                  <button 
                    key={s.name} 
                    onClick={() => onSelect(s)}
                    className="w-full p-8 rounded-[2.5rem] bg-black/60 border border-white/5 flex justify-between items-center active:scale-[0.97] transition-all hover:bg-black/40"
                  >
                    <span className="text-3xl font-black italic tracking-tighter green-underlined uppercase">
                      {s.name}
                    </span>
                    <div className="text-right">
                      <p className="text-xl font-black italic tracking-tighter leading-none white-blue-text">
                        {s.width}×{s.height}
                      </p>
                      <p className="text-[9px] font-mono opacity-40 uppercase mt-2 tracking-widest font-bold">MM</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SizeChartDrawer;
