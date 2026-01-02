
import React, { useMemo } from 'react';
import { ArrowLeft, Target, Percent, Ruler, HardDrive, Zap } from 'lucide-react';
import { PaperSize, OutputMode, BorderConfig, ProcessingMode } from './types';
import { PAPER_SIZES } from './constants';

interface Props {
  selectedSize: PaperSize;
  customWidth: string;
  customHeight: string;
  outputPreference: OutputMode;
  borderConfig: BorderConfig;
  setBorderConfig: (c: BorderConfig) => void;
  onBack: () => void;
  onDeploy: () => void;
  onOpenSizeChart: () => void;
  setCustomWidth: (v: string) => void;
  setCustomHeight: (v: string) => void;
  setOutputPreference: (v: OutputMode) => void;
  processingMode: ProcessingMode;
  setProcessingMode: (m: ProcessingMode) => void;
  t: any;
}

const ConfigView: React.FC<Props> = ({
  selectedSize, customWidth, customHeight, outputPreference, borderConfig, setBorderConfig,
  onBack, onDeploy, onOpenSizeChart, setCustomWidth, setCustomHeight, setOutputPreference, 
  processingMode, setProcessingMode, t
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
    <div className="max-w-2xl mx-auto w-full p-8 flex-1 flex flex-col animate-in fade-in pb-10 min-h-screen">
      <header className="flex items-center space-x-6 py-10">
        <button onClick={onBack} className={`p-4 ${t.button} rounded-3xl border shadow-lg active:scale-90 transition-transform`}><ArrowLeft size={24} /></button>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Converter Config</h1>
      </header>

      <div className="space-y-10 mb-12">
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
        </div>
        
        {/* Processing Mode Selection */}
        <div className={`${t.card} p-10 rounded-[3rem] border shadow-xl`}>
          <span className="text-[11px] font-black uppercase opacity-40 tracking-[0.4em] mb-6 block">Processing Strategy</span>
          <div className="flex flex-col space-y-4">
             <button 
                onClick={() => setProcessingMode(ProcessingMode.SAFE)}
                className={`w-full p-6 rounded-[2.5rem] border-2 text-left flex items-center justify-between transition-all ${processingMode === ProcessingMode.SAFE ? 'border-green-accent bg-green-accent/10 shadow-lg' : 'border-transparent bg-black/10 hover:bg-black/20'}`}
             >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-2xl ${processingMode === ProcessingMode.SAFE ? 'bg-green-accent text-black' : 'bg-zinc-500/10 text-zinc-500'}`}>
                    <HardDrive size={24} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-black italic uppercase tracking-tighter ${processingMode === ProcessingMode.SAFE ? 'text-green-accent' : t.isDark ? 'text-white' : 'text-black'}`}>Safe Mode</h3>
                    <p className="text-[9px] font-black uppercase opacity-40 tracking-widest mt-0.5">Disk Journaled • Preserves Tree</p>
                  </div>
                </div>
                {processingMode === ProcessingMode.SAFE && <div className="w-4 h-4 rounded-full bg-green-accent shadow-[0_0_10px_currentColor] mr-2" />}
             </button>

             <button 
                onClick={() => setProcessingMode(ProcessingMode.FAST)}
                className={`w-full p-6 rounded-[2.5rem] border-2 text-left flex items-center justify-between transition-all ${processingMode === ProcessingMode.FAST ? 'border-blue-500 bg-blue-500/10 shadow-lg' : 'border-transparent bg-black/10 hover:bg-black/20'}`}
             >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-2xl ${processingMode === ProcessingMode.FAST ? 'bg-blue-500 text-white' : 'bg-zinc-500/10 text-zinc-500'}`}>
                    <Zap size={24} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-black italic uppercase tracking-tighter ${processingMode === ProcessingMode.FAST ? 'text-blue-500' : t.isDark ? 'text-white' : 'text-black'}`}>Fast Mode</h3>
                    <p className="text-[9px] font-black uppercase opacity-40 tracking-widest mt-0.5">In-Memory • High RAM Usage</p>
                  </div>
                </div>
                {processingMode === ProcessingMode.FAST && <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_currentColor] mr-2" />}
             </button>
          </div>
        </div>

        {/* Border Configuration */}
        <div className={`${t.card} p-10 rounded-[3rem] border shadow-xl space-y-6`}>
           <span className="text-[11px] font-black uppercase opacity-40 tracking-[0.4em] mb-6 block">Safe Zone / Border</span>
           <div className="flex items-center space-x-4">
              <div className="flex items-center bg-black/40 p-1.5 rounded-2xl border border-white/5 shrink-0">
                <button 
                  onClick={() => setBorderConfig({ ...borderConfig, mode: 'PERCENT' })}
                  className={`p-3 rounded-xl transition-all ${borderConfig.mode === 'PERCENT' ? 'bg-green-accent text-black shadow-lg' : 'text-zinc-500'}`}
                >
                  <Percent size={20} />
                </button>
                <button 
                   onClick={() => setBorderConfig({ ...borderConfig, mode: 'MM' })}
                   className={`p-3 rounded-xl transition-all ${borderConfig.mode === 'MM' ? 'bg-green-accent text-black shadow-lg' : 'text-zinc-500'}`}
                >
                  <Ruler size={20} />
                </button>
              </div>
              
              <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl px-6 py-3 flex items-center justify-between">
                <input 
                  type="number"
                  inputMode="decimal"
                  value={borderConfig.value}
                  onChange={(e) => setBorderConfig({ ...borderConfig, value: parseFloat(e.target.value) })}
                  className="bg-transparent text-2xl font-black italic text-white outline-none w-full"
                  placeholder="3.7"
                />
                <span className="text-[10px] font-black uppercase text-zinc-600">{borderConfig.mode}</span>
              </div>
           </div>
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

      <div className="mt-auto">
        <button 
          onClick={onDeploy} 
          className="w-full bg-white text-black py-10 rounded-[3rem] font-black text-4xl italic uppercase active:scale-95 transition-transform shadow-[0_30px_100px_-20px_rgba(255,255,255,0.4)]"
        >
          START CONVERSION
        </button>
      </div>
    </div>
  );
};

export default ConfigView;
