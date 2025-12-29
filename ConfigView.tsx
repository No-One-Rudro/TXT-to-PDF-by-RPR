
import React, { useMemo } from 'react';
import { ArrowLeft, Target } from 'lucide-react';
import { PaperSize, OutputMode } from './types';
import { PAPER_SIZES } from './constants';

interface Props {
  selectedSize: PaperSize;
  customWidth: string;
  customHeight: string;
  outputPreference: OutputMode;
  onBack: () => void;
  onDeploy: () => void;
  onOpenSizeChart: () => void;
  setCustomWidth: (v: string) => void;
  setCustomHeight: (v: string) => void;
  setOutputPreference: (v: OutputMode) => void;
  t: any;
}

const ConfigView: React.FC<Props> = ({
  selectedSize, customWidth, customHeight, outputPreference,
  onBack, onDeploy, onOpenSizeChart, setCustomWidth, setCustomHeight, setOutputPreference, t
}) => {
  const matchedPreset = useMemo(() => {
    const w = Math.round(parseFloat(customWidth));
    const h = Math.round(parseFloat(customHeight));
    if (isNaN(w) || isNaN(h)) return null;
    
    return PAPER_SIZES.find(s => 
      Math.abs(Math.round(s.width) - w) < 1 && 
      Math.abs(Math.round(s.height) - h) < 1
    );
  }, [customWidth, customHeight]);

  const displayName = matchedPreset ? matchedPreset.name : "Custom";

  return (
    <div className="max-w-2xl mx-auto w-full p-8 flex-1 flex flex-col animate-in fade-in">
      <header className="flex items-center space-x-6 py-10">
        <button onClick={onBack} className={`p-4 ${t.button} rounded-3xl border shadow-lg active:scale-90 transition-transform`}><ArrowLeft size={24} /></button>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Converter Config</h1>
      </header>

      <div className="flex-1 space-y-10 pb-40">
        <div className={`${t.card} p-10 rounded-[4rem] border space-y-8 relative overflow-hidden shadow-2xl`}>
          <div className="flex justify-between items-center px-2">
            <span className="text-[11px] font-black uppercase opacity-40 tracking-[0.4em]">Staging Metric</span>
            {matchedPreset && (
              <div className="flex items-center space-x-2 bg-green-accent/10 px-4 py-1.5 rounded-full animate-in zoom-in duration-300">
                <Target size={14} className="text-green-accent" />
                <span className="text-[10px] font-black text-green-accent uppercase tracking-widest">Matched Preset</span>
              </div>
            )}
          </div>

          <div 
            className="bg-white p-10 rounded-[3.5rem] shadow-2xl flex flex-col items-center cursor-pointer hover:scale-[0.98] transition-all active:scale-95 group" 
            onClick={onOpenSizeChart}
          >
            <span className="text-7xl font-black italic tracking-tighter text-[#1e293b] uppercase leading-none min-h-[1em] flex items-center group-hover:text-green-accent transition-colors">
              {displayName}
            </span>
            
            <div className="mt-10 flex items-center space-x-4 text-3xl font-black italic text-zinc-900 bg-zinc-100 p-3 rounded-[3rem] border-4 border-zinc-200 shadow-inner">
              <div className="flex flex-col items-center">
                <input 
                  type="number" 
                  inputMode="decimal"
                  value={customWidth} 
                  onChange={(e) => setCustomWidth(e.target.value)} 
                  onClick={e => e.stopPropagation()} 
                  className="w-32 bg-transparent text-center outline-none font-black tracking-tighter border-b-4 border-zinc-300 focus:border-green-accent transition-all"
                  placeholder="0000"
                />
                <span className="text-[10px] opacity-30 uppercase font-mono mt-2 font-black">Width</span>
              </div>
              <span className="text-zinc-400 text-5xl mt-[-15px] font-light">×</span>
              <div className="flex flex-col items-center">
                <input 
                  type="number" 
                  inputMode="decimal"
                  value={customHeight} 
                  onChange={(e) => setCustomHeight(e.target.value)} 
                  onClick={e => e.stopPropagation()} 
                  className="w-32 bg-transparent text-center outline-none font-black tracking-tighter border-b-4 border-zinc-300 focus:border-green-accent transition-all"
                  placeholder="0000"
                />
                <span className="text-[10px] opacity-30 uppercase font-mono mt-2 font-black">Height</span>
              </div>
            </div>
          </div>
          
          <p className="text-center text-[11px] font-black uppercase tracking-widest text-zinc-500 animate-pulse">
            TAP CARD TO SELECT PRESETS
          </p>
        </div>

        <div className={`${t.card} p-10 rounded-[3rem] border shadow-xl`}>
          <span className="text-[11px] font-black uppercase opacity-40 tracking-[0.4em] mb-6 block">Output Strategy</span>
          <div className="bg-black/40 p-2 rounded-full flex h-24 relative shadow-inner">
            <div 
              className={`absolute top-2 bottom-2 w-[calc(50%-8px)] bg-green-accent rounded-full transition-all duration-500 shadow-lg ${outputPreference === OutputMode.MIXED ? 'left-[calc(50%+4px)]' : 'left-2'}`} 
            />
            <button 
              onClick={() => setOutputPreference(OutputMode.MIRROR)} 
              className={`flex-1 relative z-10 text-[13px] font-black uppercase tracking-[0.2em] transition-colors ${outputPreference === OutputMode.MIRROR ? 'text-black' : 'text-zinc-500'}`}
            >
              Structure
            </button>
            <button 
              onClick={() => setOutputPreference(OutputMode.MIXED)} 
              className={`flex-1 relative z-10 text-[13px] font-black uppercase tracking-[0.2em] transition-colors ${outputPreference === OutputMode.MIXED ? 'text-black' : 'text-zinc-500'}`}
            >
              Flat
            </button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-8 max-w-2xl mx-auto z-10 pointer-events-none">
        <button 
          onClick={onDeploy} 
          className="pointer-events-auto w-full bg-white text-black py-10 rounded-[3rem] font-black text-4xl italic uppercase active:scale-95 transition-transform shadow-[0_30px_100px_-20px_rgba(255,255,255,0.4)]"
        >
          START CONVERSION
        </button>
      </div>
    </div>
  );
};

export default ConfigView;
