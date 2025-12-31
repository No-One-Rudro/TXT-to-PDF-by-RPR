
import React, { useState, useMemo } from 'react';
import { X, ArrowDown, ArrowUp, Database, Search } from 'lucide-react';
import { SortCriteria, ExtendedSlot } from './types';
import { buildTreeFromFiles } from './TreeUtils';
import { RecursiveTreeRenderer } from './RecursiveTreeRenderer';

interface Props {
  slots: ExtendedSlot[];
  folderSortCriteria: SortCriteria;
  folderSortDesc: boolean;
  fileSortCriteria: SortCriteria;
  fileSortDesc: boolean;
  onClose: () => void;
  setFolderSortCriteria: (c: SortCriteria) => void;
  setFolderSortDesc: (v: boolean) => void;
  setFileSortCriteria: (c: SortCriteria) => void;
  setFileSortDesc: (v: boolean) => void;
  t: any;
}

const InspectorModal: React.FC<Props> = ({
  slots, folderSortCriteria, folderSortDesc, fileSortCriteria, fileSortDesc,
  onClose, setFolderSortCriteria, setFolderSortDesc, setFileSortCriteria, setFileSortDesc, t
}) => {
  const [search, setSearch] = useState('');
  
  const compositeTree = useMemo(() => {
    return slots.map(slot => buildTreeFromFiles(slot.files, slot.id, slot.customPath, search));
  }, [slots, search]);

  return (
    <div className="fixed inset-0 z-[8500] flex items-end animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose} />
      <div className={`relative w-full h-[85vh] ${t.card} rounded-t-[5rem] border-t border-white/10 flex flex-col shadow-3xl overflow-hidden`}>
        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-black/20">
          <div className="flex items-center space-x-6">
            <div className="p-4 bg-green-accent/10 rounded-[1.5rem] border border-green-accent/20">
               <Database size={32} className="text-green-accent" strokeWidth={3} />
            </div>
            <div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Mapping Inspector</h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em] mt-3">Active Matrix Buffers</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-4 ${t.button} rounded-full border border-white/5 shadow-xl active:scale-90 transition-transform`}><X size={32} strokeWidth={3}/></button>
        </div>
        
        <div className="px-10 py-6 border-b border-white/5 bg-black/40 space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <span className="text-green-accent font-mono text-sm mr-2 opacity-60">grep</span>
              <Search size={16} className="text-green-accent" />
            </div>
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH PROTOCOL..."
              className="w-full bg-black/60 border-2 border-white/5 focus:border-green-accent/40 rounded-[2rem] py-5 pl-24 pr-8 font-mono text-sm text-green-accent outline-none transition-all placeholder:text-zinc-800"
            />
          </div>

          <div className="flex items-center space-x-6 overflow-x-auto custom-scrollbar pb-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 shrink-0">Folder Sort</span>
            <div className="flex space-x-2">
              {(['NAME', 'DATE', 'SIZE', 'TYPE'] as SortCriteria[]).map(c => (
                <button 
                  key={c} 
                  onClick={() => setFolderSortCriteria(c)} 
                  className={`px-4 py-2 rounded-full text-[10px] font-black uppercase whitespace-nowrap transition-all ${folderSortCriteria === c ? 'bg-green-accent text-black' : 'bg-white/10 text-zinc-400'}`}
                >
                  {c}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setFolderSortDesc(!folderSortDesc)} 
              className={`p-2 rounded-full ${folderSortDesc ? 'bg-blue-500' : 'bg-white/10'}`}
            >
              {folderSortDesc ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar pb-48">
          {compositeTree.length > 0 ? (
            compositeTree.map((root, i) => (
              <div key={i} className="mb-8 last:mb-0">
                <RecursiveTreeRenderer node={root} t={t} searchTerm={search} />
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
               <Database size={64} className="mb-6" />
               <p className="text-[10px] font-black uppercase tracking-[0.5em]">System buffer is empty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InspectorModal;
