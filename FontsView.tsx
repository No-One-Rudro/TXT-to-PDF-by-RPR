import React, { useMemo, useState, useRef } from 'react';
import { ArrowLeft, Type, FileType, Image as ImageIcon, Sparkles, Activity, Search, Database, AlertTriangle, Plus, Trash2, Edit2, Check, Upload } from 'lucide-react';
import { CustomFont } from './types';
import { getGlyphRegistry, getMissingCharacters, saveGlyphMapping, deleteGlyphMapping, clearMissingCharacters } from './persistentRegistry';

interface Props {
  onBack: () => void;
  fonts: CustomFont[];
  onAddFonts: (files: File[]) => void;
  onRemoveFont: (id: string) => void;
  onOcrPrompt: (files: File[]) => void;
  t: any;
}

const FontsView: React.FC<Props> = ({ onBack, fonts, onRemoveFont, onAddFonts, t }) => {
  const [editingUnicode, setEditingUnicode] = useState<string | null>(null);
  const [manualUnicode, setManualUnicode] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const registry = useMemo(() => getGlyphRegistry(), [fonts]);
  const missing = useMemo(() => getMissingCharacters(), [fonts]);
  const registryEntries = Object.entries(registry) as [string, { data: string; timestamp: number }][];

  const handleManualMap = (data: string) => {
    if (!manualUnicode.startsWith('0x')) return;
    saveGlyphMapping(manualUnicode, data);
    setEditingUnicode(null);
    setManualUnicode('');
  };

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
    <div className="max-w-2xl mx-auto w-full p-8 flex-1 flex flex-col animate-in fade-in duration-500 pb-48">
      <header className="py-10 flex items-center mb-6">
        <button onClick={onBack} className={`p-4 ${t.button} rounded-2xl mr-6 active:scale-90 transition-transform shadow-xl`}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Typography</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-green-accent/60 mt-2">Neural Asset Indexer</p>
        </div>
      </header>

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
                <span className="text-[18px] font-black italic text-white leading-none">{registryEntries.length}</span>
                <p className="text-[8px] font-bold uppercase text-zinc-500 tracking-widest">Learned</p>
              </div>
            </div>
            <div className="bg-black/40 border border-white/10 p-6 rounded-[2rem] flex items-center space-x-4 relative">
              <AlertTriangle size={24} className="text-red-500" />
              <div>
                <span className="text-[18px] font-black italic text-white leading-none">{missing.length}</span>
                <p className="text-[8px] font-bold uppercase text-zinc-500 tracking-widest">Missing</p>
              </div>
              {missing.length > 0 && (
                <button onClick={clearMissingCharacters} className="absolute top-2 right-2 text-[8px] font-black uppercase text-red-500/40 hover:text-red-500">Clear</button>
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

      <div className="space-y-12">
        <section className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 px-6">System Fonts</h3>
          <div className="space-y-4">
            {fonts.map((font) => (
              <div key={font.id} className="bg-zinc-950/50 p-6 rounded-[2.5rem] border border-white/5 flex items-center justify-between group shadow-xl">
                <div className="flex items-center space-x-5">
                  <div className={`p-4 bg-black/60 rounded-xl border border-white/5 ${font.format === 'glyph-map' ? 'text-pink-400' : 'text-green-accent'}`}>
                    {font.format === 'glyph-map' ? <ImageIcon size={20} /> : <FileType size={20} />}
                  </div>
                  <div>
                    <h4 className="text-md font-black italic uppercase tracking-tighter truncate max-w-[150px] leading-none">{font.name}</h4>
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-30 mt-1 block">{font.format.toUpperCase()} Protocol</span>
                  </div>
                </div>
                <button onClick={() => onRemoveFont(font.id)} className="p-4 text-red-500/20 hover:text-red-500 transition-all active:scale-90">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            {fonts.length === 0 && (
              <div className="p-10 border-2 border-dashed border-white/5 rounded-[4rem] flex flex-col items-center justify-center opacity-20">
                <Sparkles size={40} className="mb-4 text-green-accent" />
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-center">Engine Standby</p>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 px-6">Glyph Registry</h3>
          <div className="grid grid-cols-2 gap-4">
             {registryEntries.map(([unicode, entry]) => (
               <div key={unicode} className="bg-zinc-950/50 p-6 rounded-[2.5rem] border border-white/5 flex flex-col items-center space-y-4 relative group">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center p-2">
                    <img src={`data:image/png;base64,${entry.data}`} alt={unicode} className="max-w-full max-h-full invert opacity-80" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-mono font-black text-green-accent">{unicode}</p>
                    <p className="text-[8px] font-bold uppercase opacity-30 mt-1">HEX Mapped</p>
                  </div>
                  <button 
                    onClick={() => deleteGlyphMapping(unicode)} 
                    className="absolute top-2 right-2 p-2 bg-red-500/10 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
               </div>
             ))}
             {registryEntries.length === 0 && (
               <div className="col-span-2 p-10 text-center opacity-20 border-2 border-dashed border-white/5 rounded-[2.5rem]">
                 <p className="text-[10px] font-black uppercase tracking-widest">No Manual Glyphs Mapped</p>
               </div>
             )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default FontsView;