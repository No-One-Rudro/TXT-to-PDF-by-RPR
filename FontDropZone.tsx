
import React, { useState, useRef } from 'react';
import { Activity, Search, Database, AlertTriangle, Plus, Upload } from 'lucide-react';

interface Props {
  onAddFonts: (files: File[]) => void;
  registryCount: number;
  missingCount: number;
  onClearMissing: () => void;
  t: any;
}

export const FontDropZone: React.FC<Props> = ({ onAddFonts, registryCount, missingCount, onClearMissing, t }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFonts(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAddFonts(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div 
      className={`bg-zinc-950/30 border border-white/5 rounded-[3.5rem] p-10 mb-10 backdrop-blur-xl relative overflow-hidden group transition-all ${isDragging ? 'border-green-accent bg-green-accent/5 scale-[1.02]' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-30 transition-opacity">
         <Search size={120} className="text-green-accent -rotate-12" />
      </div>
      
      <div className="relative z-10 space-y-8">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-accent/20 rounded-xl">
              <Activity size={18} className="text-green-accent animate-pulse" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-white">Persistent Memory</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mt-1">
                {isDragging ? 'RELEASE TO INJECT' : 'DRAG FONTS OR SCAN'}
              </p>
            </div>
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="p-4 bg-green-accent text-black rounded-2xl shadow-xl active:scale-95 transition-transform"><Plus size={20}/></button>
          <input type="file" ref={fileInputRef} className="hidden" multiple accept=".ttf,.otf,.woff,.woff2" onChange={handleFileSelect} />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/40 border border-white/10 p-6 rounded-[2rem] flex items-center space-x-4">
            <Database size={24} className="text-blue-400" />
            <div>
              <span className="text-[18px] font-black italic text-white leading-none">{registryCount}</span>
              <p className="text-[8px] font-bold uppercase text-zinc-500 tracking-widest">Learned</p>
            </div>
          </div>
          <div className="bg-black/40 border border-white/10 p-6 rounded-[2rem] flex items-center space-x-4 relative">
            <AlertTriangle size={24} className="text-red-500" />
            <div>
              <span className="text-[18px] font-black italic text-white leading-none">{missingCount}</span>
              <p className="text-[8px] font-bold uppercase text-zinc-500 tracking-widest">Missing</p>
            </div>
            {missingCount > 0 && (
              <button onClick={onClearMissing} className="absolute top-2 right-2 text-[8px] font-black uppercase text-red-500/40 hover:text-red-500">Clear</button>
            )}
          </div>
        </div>
      </div>
      
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 backdrop-blur-sm rounded-[3.5rem]">
          <div className="flex flex-col items-center animate-bounce">
            <Upload size={48} className="text-green-accent mb-4" />
            <span className="text-green-accent font-black uppercase tracking-widest">Import Font Data</span>
          </div>
        </div>
      )}
    </div>
  );
};
