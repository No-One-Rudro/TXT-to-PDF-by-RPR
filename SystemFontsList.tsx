
import React from 'react';
import { FileType, Image as ImageIcon, Sparkles, Trash2 } from 'lucide-react';
import { CustomFont } from './types';

interface Props {
  fonts: CustomFont[];
  onRemoveFont: (id: string) => void;
}

export const SystemFontsList: React.FC<Props> = ({ fonts, onRemoveFont }) => {
  return (
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
  );
};
