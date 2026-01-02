
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FolderOpen, FileText } from 'lucide-react';
import { TreeNode } from './TreeUtils';

interface Props {
  node: TreeNode;
  level?: number;
  t: any;
  searchTerm: string;
}

export const RecursiveTreeRenderer: React.FC<Props> = ({ node, level = 0, t, searchTerm }) => {
  const [open, setOpen] = useState(true);
  
  if (node.type === 'file') {
    return (
      <div className="flex items-center justify-between py-2 hover:bg-white/5 rounded px-2 transition-colors" style={{ marginLeft: level * 20 }}>
        <div className="flex items-center space-x-3 truncate">
          <FileText size={16} className={`${node.matchesSearch && searchTerm ? 'text-green-accent' : 'text-zinc-500'} shrink-0`} strokeWidth={3} />
          <span className={`text-[12px] font-mono truncate ${node.matchesSearch && searchTerm ? 'text-green-accent font-black' : t.isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
            {node.name}
          </span>
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
          <span className={`text-[12px] font-black uppercase tracking-tight ${node.matchesSearch && searchTerm ? 'text-green-accent' : open ? 'text-green-accent/80' : t.isDark ? 'text-white' : 'text-black'}`}>
            {node.name}
          </span>
        </div>
        {node.children.length > 0 && (
          <span className="text-[9px] font-black bg-white/5 px-2 py-0.5 rounded-full opacity-30">{node.children.length} items</span>
        )}
      </div>
      {open && node.children.map((c, i) => <RecursiveTreeRenderer key={`${c.name}-${i}`} node={c} level={level + 1} t={t} searchTerm={searchTerm} />)}
    </div>
  );
};
