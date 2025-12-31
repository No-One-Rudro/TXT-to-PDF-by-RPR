
import React, { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CustomFont } from './types';
import { getGlyphRegistry, getMissingCharacters, deleteGlyphMapping, clearMissingCharacters } from './persistentRegistry';
import { FontDropZone } from './FontDropZone';
import { SystemFontsList } from './SystemFontsList';
import { GlyphRegistryGrid } from './GlyphRegistryGrid';

interface Props {
  onBack: () => void;
  fonts: CustomFont[];
  onAddFonts: (files: File[]) => void;
  onRemoveFont: (id: string) => void;
  onOcrPrompt: (files: File[]) => void;
  t: any;
}

const FontsView: React.FC<Props> = ({ onBack, fonts, onRemoveFont, onAddFonts, t }) => {
  const registry = useMemo(() => getGlyphRegistry(), [fonts]);
  const missing = useMemo(() => getMissingCharacters(), [fonts]);
  const registryEntries = Object.entries(registry) as [string, { data: string; timestamp: number }][];

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

      <FontDropZone 
        onAddFonts={onAddFonts} 
        registryCount={registryEntries.length} 
        missingCount={missing.length} 
        onClearMissing={clearMissingCharacters}
        t={t}
      />

      <div className="space-y-12">
        <SystemFontsList fonts={fonts} onRemoveFont={onRemoveFont} />
        <GlyphRegistryGrid registryEntries={registryEntries} onDeleteMapping={deleteGlyphMapping} />
      </div>
    </div>
  );
};

export default FontsView;
