import React from 'react';
import { FileText, FolderOpen, Terminal } from 'lucide-react';

interface Props {
  onPick: (method: 'file' | 'folder' | 'terminal') => void;
  t: any;
}

export const SlotActionMenu: React.FC<Props> = ({ onPick, t }) => (
  <div className="mt-4 grid grid-cols-3 gap-3 animate-in slide-in-from-top-4 duration-300">
    <button 
      onClick={() => onPick('file')}
      className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col items-center space-y-2 hover:bg-green-accent/10 hover:border-green-accent/40 transition-all active:scale-95"
    >
      <FileText size={24} strokeWidth={3} color={t.iconColor} />
      <span className={`text-[9px] font-black uppercase ${t.isDark ? 'text-white' : 'text-black'}`}>Files</span>
    </button>
    <button 
      onClick={() => onPick('folder')}
      className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col items-center space-y-2 hover:bg-green-accent/10 hover:border-green-accent/40 transition-all active:scale-95"
    >
      <FolderOpen size={24} strokeWidth={3} color={t.iconColor} />
      <span className={`text-[9px] font-black uppercase ${t.isDark ? 'text-white' : 'text-black'}`}>Folder</span>
    </button>
    <button 
      onClick={() => onPick('terminal')}
      className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col items-center space-y-2 hover:bg-green-accent/10 hover:border-green-accent/40 transition-all active:scale-95"
    >
      <Terminal size={24} strokeWidth={3} color={t.iconColor} />
      <span className={`text-[9px] font-black uppercase ${t.isDark ? 'text-white' : 'text-black'}`}>Path</span>
    </button>
  </div>
);
