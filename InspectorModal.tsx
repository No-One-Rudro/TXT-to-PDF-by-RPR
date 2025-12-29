import React, { useState, useMemo } from 'react';
import { X, ChevronDown, ChevronRight, FileText, FolderOpen, ArrowDown, ArrowUp, Database } from 'lucide-react';
import { SortCriteria } from './types';
import { ExtendedSlot } from './App';

interface TreeNode {
  name: string;
  type: 'file' | 'folder';
  children: TreeNode[];
  file?: File;
  lastModified?: number;
  size?: number;
  extension?: string;
}

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

const buildTreeFromFiles = (files: File[], rootName: string, customPath?: string): TreeNode => {
  const root: TreeNode = {
    name: rootName,
    type: 'folder',
    children: [],
  };

  files.forEach(file => {
    // webkitRelativePath exists for folder inputs. 
    // If not, it's a single file upload, so we just use the name.
    const fullPath = (file as any).webkitRelativePath || file.name;
    const parts = fullPath.split('/');
    
    let current = root;
    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      let existing = current.children.find(c => c.name === part && c.type === (isFile ? 'file' : 'folder'));

      if (!existing) {
        existing = {
          name: part,
          type: isFile ? 'file' : 'folder',
          children: [],
          file: isFile ? file : undefined,
          lastModified: file.lastModified,
          size: isFile ? file.size : 0,
          extension: isFile ? part.split('.').pop() || '' : ''
        };
        current.children.push(existing);
      }
      current = existing;
    });
  });

  // If a custom terminal path is provided, we can prepend a virtual node to reflect that target
  if (customPath) {
    return {
      name: `${rootName} (Target: ${customPath})`,
      type: 'folder',
      children: [root]
    };
  }

  return root;
};

const RecursiveTreeRenderer: React.FC<{ node: TreeNode, level?: number, t: any }> = ({ node, level = 0, t }) => {
  const [open, setOpen] = useState(true);
  
  if (node.type === 'file') {
    return (
      <div className="flex items-center justify-between py-2 hover:bg-white/5 rounded px-2 transition-colors" style={{ marginLeft: level * 20 }}>
        <div className="flex items-center space-x-3 truncate">
          <FileText size={16} className="text-zinc-500 shrink-0" strokeWidth={3} />
          <span className={`text-[12px] font-mono truncate ${t.isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{node.name}</span>
        </div>
        <span className="text-[10px] font-mono opacity-40 shrink-0">
          {node.size ? (node.size / 1024).toFixed(1) : '0'} KB
        </span>
      </div>
    );
  }
  
  return (
    <div style={{ marginLeft: level * 20 }}>
      <div 
        className="flex items-center justify-between cursor-pointer hover:bg-white/5 py-3 px-2 rounded-xl group transition-all" 
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center space-x-3 truncate">
          {open ? <ChevronDown size={16} className="text-green-accent shrink-0" strokeWidth={3} /> : <ChevronRight size={16} className="text-zinc-500 shrink-0" strokeWidth={3} />}
          <FolderOpen size={18} className={open ? 'text-green-accent' : 'text-zinc-500'} strokeWidth={3} />
          <span className={`text-[12px] font-black uppercase tracking-tight ${open ? 'text-green-accent' : t.isDark ? 'text-white' : 'text-black'}`}>
            {node.name}
          </span>
        </div>
        {node.children.length > 0 && (
          <span className="text-[9px] font-black bg-white/5 px-2 py-0.5 rounded-full opacity-30">{node.children.length} items</span>
        )}
      </div>
      {open && node.children.map((c, i) => <RecursiveTreeRenderer key={`${c.name}-${i}`} node={c} level={level + 1} t={t} />)}
    </div>
  );
};

const InspectorModal: React.FC<Props> = ({
  slots, folderSortCriteria, folderSortDesc, fileSortCriteria, fileSortDesc,
  onClose, setFolderSortCriteria, setFolderSortDesc, setFileSortCriteria, setFileSortDesc, t
}) => {
  const compositeTree = useMemo(() => {
    return slots.map(slot => buildTreeFromFiles(slot.files, slot.id, slot.customPath));
  }, [slots]);

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
        
        <div className="px-10 py-6 border-b border-white/5 bg-black/40 flex flex-col space-y-4">
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
          
          <div className="flex items-center space-x-6 overflow-x-auto custom-scrollbar pb-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 shrink-0">File Sort</span>
            <div className="flex space-x-2">
              {(['NAME', 'DATE', 'SIZE', 'TYPE'] as SortCriteria[]).map(c => (
                <button 
                  key={c} 
                  onClick={() => setFileSortCriteria(c)} 
                  className={`px-4 py-2 rounded-full text-[10px] font-black uppercase whitespace-nowrap transition-all ${fileSortCriteria === c ? 'bg-green-accent text-black' : 'bg-white/10 text-zinc-400'}`}
                >
                  {c}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setFileSortDesc(!fileSortDesc)} 
              className={`p-2 rounded-full ${fileSortDesc ? 'bg-blue-500' : 'bg-white/10'}`}
            >
              {fileSortDesc ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar pb-48">
          {compositeTree.length > 0 ? (
            compositeTree.map((root, i) => (
              <div key={i} className="mb-8 last:mb-0">
                <RecursiveTreeRenderer node={root} t={t} />
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
