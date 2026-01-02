
import React, { useState, useMemo } from 'react';
import { X, ArrowDown, ArrowUp, Database, Search, FolderOpen, FileText } from 'lucide-react';
import { SortCriteria, ExtendedSlot } from './types';
import { buildTreeFromFiles, sortTree } from './TreeUtils';
import { RecursiveTreeRenderer } from './RecursiveTreeRenderer';

interface Props {
  slots: ExtendedSlot[];
  onClose: () => void;
  t: any;
}

const InspectorModal: React.FC<Props> = ({ slots, onClose, t }) => {
  const [search, setSearch] = useState('');
  
  // Independent Sorting State
  const [folderSortCriteria, setFolderSortCriteria] = useState<SortCriteria>('NAME');
  const [folderSortDesc, setFolderSortDesc] = useState(false);
  
  const [fileSortCriteria, setFileSortCriteria] = useState<SortCriteria>('NAME');
  const [fileSortDesc, setFileSortDesc] = useState(false);
  
  const compositeTree = useMemo(() => {
    // 1. Build trees
    const trees = slots.map(slot => buildTreeFromFiles(slot.files, slot.id, slot.customPath, search));
    // 2. Apply explicit sorting to both Files and Folders recursively
    trees.forEach(root => sortTree(root, folderSortCriteria, folderSortDesc, fileSortCriteria, fileSortDesc));
    return trees;
  }, [slots, search, folderSortCriteria, folderSortDesc, fileSortCriteria, fileSortDesc]);

  const renderSortControl = (
    label: string, 
    icon: React.ReactNode,
    current: SortCriteria, 
    desc: boolean, 
    setCriteria: (c: SortCriteria) => void, 
    setDesc: (d: boolean) => void
  ) => (
    <div className="flex items-center space-x-4 bg-black/20 p-2 rounded-2xl border border-white/5 pr-4 shrink-0">
       <div className="flex items-center space-x-2 px-3 py-2 bg-white/5 rounded-xl text-zinc-400">
          {icon}
          <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
       </div>
       
       <div className="flex space-x-1">
         {(['NAME', 'DATE', 'SIZE', 'TYPE'] as SortCriteria[]).map(c => (
           <button 
             key={c} 
             onClick={() => setCriteria(c)} 
             className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase whitespace-nowrap transition-all ${current === c ? 'bg-green-accent text-black' : 'hover:bg-white/10 text-zinc-500'}`}
           >
             {c}
           </button>
         ))}
       </div>

       <button 
         onClick={() => setDesc(!desc)} 
         className={`p-1.5 rounded-lg transition-colors ${desc ? 'bg-blue-500 text-white' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
       >
         {desc ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
       </button>
    </div>
  );

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

          <div className="flex items-center space-x-4 overflow-x-auto custom-scrollbar pb-4 pt-2">
            {renderSortControl('Folders', <FolderOpen size={14} />, folderSortCriteria, folderSortDesc, setFolderSortCriteria, setFolderSortDesc)}
            {renderSortControl('Files', <FileText size={14} />, fileSortCriteria, fileSortDesc, setFileSortCriteria, setFileSortDesc)}
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
