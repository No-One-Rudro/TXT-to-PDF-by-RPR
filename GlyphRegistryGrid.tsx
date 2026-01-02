
import React from 'react';
import { Trash2 } from 'lucide-react';

interface Props {
  registryEntries: [string, { data: string; timestamp: number }][];
  onDeleteMapping: (unicode: string) => void;
}

export const GlyphRegistryGrid: React.FC<Props> = ({ registryEntries, onDeleteMapping }) => {
  return (
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
                onClick={() => onDeleteMapping(unicode)} 
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
  );
};
