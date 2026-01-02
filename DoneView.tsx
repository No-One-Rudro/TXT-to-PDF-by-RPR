
import React, { useState, useEffect } from 'react';
import { Download, ArrowLeft, RotateCcw, FileText, Trash2, Database, AlertTriangle, Copy, CheckCircle2, PlayCircle, Layers } from 'lucide-react';
import { getMissingCharacters } from './persistentRegistry';

interface Props {
  zipUrl?: string;
  outputCacheName: string | null;
  generatedFiles: string[];
  onReturn: () => void;
  // Partial / Resume Support
  isPartial?: boolean;
  remainingCount?: number;
  partNumber: number;
  onContinue?: () => void;
  sessionBaseName?: string;
  t: any;
}

const safeChar = (hex: string) => {
  if (!hex) return '?';
  try {
    const code = parseInt(hex, 16);
    if (isNaN(code) || code < 0 || code > 0x10FFFF) return '?';
    return String.fromCodePoint(code);
  } catch {
    return '?';
  }
};

const DoneView: React.FC<Props> = ({ 
  zipUrl, outputCacheName, generatedFiles, onReturn,
  isPartial, remainingCount, partNumber, onContinue, sessionBaseName, t 
}) => {
  const [clearing, setClearing] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [cachedZipAvailable, setCachedZipAvailable] = useState(false);
  const [missingGlyphs, setMissingGlyphs] = useState<string[]>([]);
  const [copiedMissing, setCopiedMissing] = useState(false);
  
  const currentZipName = `${sessionBaseName || 'output'}_part_${partNumber}.zip`;

  useEffect(() => {
    // 1. Check ZIP cache
    const checkZip = async () => {
        if (!outputCacheName) return;
        try {
            const cache = await caches.open(outputCacheName);
            const match = await cache.match(new URL(`/_output/${currentZipName}`, self.location.origin).href);
            if (match) setCachedZipAvailable(true);
        } catch {}
    };
    checkZip();

    // 2. Load Missing Glyphs
    setMissingGlyphs(getMissingCharacters());
  }, [outputCacheName, isPartial, remainingCount, partNumber, currentZipName]);

  const copyMissing = () => {
    navigator.clipboard.writeText(missingGlyphs.join(', '));
    setCopiedMissing(true);
    setTimeout(() => setCopiedMissing(false), 2000);
  };

  const downloadFile = async (fileName: string) => {
    if (!outputCacheName) return;
    try {
        const cache = await caches.open(outputCacheName);
        const safePath = fileName.split('/').map(encodeURIComponent).join('/');
        const cacheUrl = new URL(`/_output/${safePath}`, self.location.origin).href;
        
        const response = await cache.match(cacheUrl);
        if (response) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName.split('/').pop() || 'document.pdf';
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 100);
        } else {
            alert("File not found in cache.");
        }
    } catch (e) {
        alert("Cache Retrieval Failed: " + e);
    }
  };

  const downloadCachedZip = async () => {
    if (!outputCacheName) return;
    try {
        const cache = await caches.open(outputCacheName);
        const cacheUrl = new URL(`/_output/${currentZipName}`, self.location.origin).href;
        const response = await cache.match(cacheUrl);
        if (response) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = currentZipName;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 100);
        } else {
             alert("ZIP not found in cache.");
        }
    } catch (e) {
        alert("Failed to retrieve ZIP from cache.");
    }
  };

  const clearCache = async () => {
      if (!outputCacheName) return;
      setClearing(true);
      try {
          await caches.delete(outputCacheName);
          setCleared(true);
          setCachedZipAvailable(false);
      } catch (e) {
          alert("Clear Failed");
      }
      setClearing(false);
  };
  
  const handleReturn = async () => {
     if (outputCacheName) {
         try { await caches.delete(outputCacheName); } catch {}
     }
     onReturn();
  };

  const isResumable = remainingCount !== undefined && remainingCount > 0 && onContinue;

  return (
    <div className="fixed inset-0 z-[10000] bg-black flex flex-col text-white font-mono">
      <div className="flex items-center justify-between p-8 border-b border-white/5 bg-zinc-950/50">
        <button 
          onClick={handleReturn}
          className="p-4 bg-zinc-900 border border-white/10 rounded-full text-white hover:bg-zinc-800 transition-colors active:scale-90"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-right">
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 block">Status</span>
             <span className={`text-xl font-black italic uppercase tracking-tighter ${isPartial ? 'text-yellow-500' : 'text-green-accent'}`}>
                {isPartial ? 'Session Paused' : 'Session Complete'}
             </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
            
            {/* Status Indicator */}
            <div className="mb-12 text-center">
                <div className={`w-32 h-32 ${missingGlyphs.length > 0 ? 'bg-yellow-500 shadow-[0_0_100px_rgba(234,179,8,0.4)]' : isPartial ? 'bg-blue-500 shadow-[0_0_100px_rgba(59,130,246,0.4)]' : 'bg-green-accent shadow-[0_0_100px_rgba(34,197,94,0.4)]'} rounded-full flex items-center justify-center mb-8 mx-auto animate-in zoom-in-50 duration-700`}>
                    {missingGlyphs.length > 0 ? <AlertTriangle size={48} className="text-black" strokeWidth={3} /> : isPartial ? <Layers size={48} className="text-black" strokeWidth={3} /> : <Download size={48} className="text-black" strokeWidth={3} />}
                </div>
                <h1 className="text-6xl font-black italic tracking-tighter leading-tight opacity-90 text-white">
                  {missingGlyphs.length > 0 ? 'ATTENTION NEEDED' : isPartial ? `PART ${partNumber} DONE` : 'ALL FILES DONE'}
                </h1>
                <p className="text-zinc-500 font-black uppercase text-xs tracking-[0.6em] mt-4">
                    {missingGlyphs.length > 0 ? "Missing Glyphs Detected" : isPartial ? `${remainingCount} Files Remaining in Queue` : "Full Archive Ready"}
                </p>
            </div>

            {/* Resume Button (If Partial) */}
            {isResumable && (
                <button 
                    onClick={onContinue}
                    className="w-full max-w-md bg-blue-600 text-white py-8 rounded-[3rem] font-black text-2xl italic uppercase flex flex-col items-center justify-center hover:bg-blue-500 active:scale-95 transition-all shadow-[0_0_60px_rgba(37,99,235,0.4)] mb-8"
                >
                    <div className="flex items-center space-x-3">
                        <PlayCircle size={32} strokeWidth={3} fill="currentColor" className="text-white/20" />
                        <span>PROCESS PART {partNumber + 1}</span>
                    </div>
                    <span className="text-[10px] font-sans font-normal opacity-70 mt-1">
                        Resume remaining {remainingCount} files
                    </span>
                </button>
            )}

            {/* ZIP Download */}
            {(zipUrl || cachedZipAvailable) && (
                <button 
                   onClick={() => zipUrl ? window.open(zipUrl) : downloadCachedZip()}
                   className={`w-full max-w-md py-8 rounded-[3rem] font-black text-2xl italic uppercase flex flex-col items-center justify-center hover:scale-105 transition-transform shadow-[0_20px_50px_rgba(255,255,255,0.2)] mb-12 ${isResumable ? 'bg-zinc-900 border border-white/20 text-white' : 'bg-white text-black'}`}
                >
                    <div className="flex items-center space-x-3">
                        <Download size={24} strokeWidth={3} />
                        <span>Download {isPartial ? 'Partial' : 'Full'} ZIP</span>
                    </div>
                    <span className="text-[10px] font-sans font-normal opacity-50 mt-1">
                        {currentZipName}
                    </span>
                </button>
            )}

            {/* Missing Glyphs Report */}
            {missingGlyphs.length > 0 && (
              <div className="w-full bg-red-950/20 border border-red-500/20 rounded-[3rem] p-8 mb-8 animate-in slide-in-from-bottom-6 duration-700">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black italic uppercase tracking-tighter text-red-500">Missing Glyphs</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-500/50 mt-1">Rendered as placeholders</p>
                        </div>
                    </div>
                    <button 
                        onClick={copyMissing}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2"
                    >
                        {copiedMissing ? <CheckCircle2 size={14}/> : <Copy size={14}/>}
                        <span>{copiedMissing ? 'COPIED' : 'COPY CODES'}</span>
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {missingGlyphs.map((glyph, i) => (
                        <div key={i} className="bg-black/40 border border-red-500/10 px-3 py-2 rounded-xl flex flex-col items-center min-w-[3rem]">
                             <span className="text-xs font-mono text-red-400 font-bold">{safeChar(glyph)}</span>
                             <span className="text-[8px] font-mono text-red-500/40">{glyph}</span>
                        </div>
                    ))}
                </div>
              </div>
            )}

            {/* Cached Files List */}
            <div className="w-full bg-zinc-950/50 border border-white/5 rounded-[3rem] p-8 mb-8">
                <div className="flex items-center justify-between mb-6 px-4">
                    <div className="flex items-center space-x-3">
                        <Database size={20} className="text-blue-400" />
                        <span className="text-sm font-black uppercase tracking-widest text-zinc-400">
                             {isPartial ? `Processed This Batch (${generatedFiles.length})` : `Cached Files (${generatedFiles.length})`}
                        </span>
                    </div>
                    {!cleared && (
                        <button onClick={clearCache} disabled={clearing} className="text-[10px] font-black uppercase text-red-500 flex items-center space-x-2 hover:bg-red-500/10 px-3 py-1.5 rounded-full transition-colors">
                            <Trash2 size={12} />
                            <span>{clearing ? 'Purging...' : 'Purge Cache'}</span>
                        </button>
                    )}
                </div>

                {cleared ? (
                    <div className="text-center py-10 opacity-30">
                        <Trash2 size={48} className="mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Cache Purged</p>
                    </div>
                ) : (
                    <div className="grid gap-3 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                        {generatedFiles.map((file, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-green-accent/30 transition-colors group">
                                <div className="flex items-center space-x-3 overflow-hidden">
                                    <FileText size={16} className="text-zinc-600 group-hover:text-green-accent transition-colors shrink-0" />
                                    <span className="text-xs font-mono text-zinc-300 truncate">{file}</span>
                                </div>
                                <button 
                                    onClick={() => downloadFile(file)}
                                    className="p-2 bg-white/5 hover:bg-green-accent hover:text-black rounded-lg transition-colors"
                                    title="Download Single File"
                                >
                                    <Download size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button 
                onClick={handleReturn} 
                className="px-12 py-6 bg-zinc-900 border border-white/10 rounded-[3rem] font-black text-sm italic uppercase shadow-xl active:scale-95 transition-transform flex items-center space-x-3 text-zinc-400 hover:text-white hover:border-white/30"
            >
                <RotateCcw size={16} />
                <span>{isResumable ? 'Abort Remaining' : 'Start New Session'}</span>
            </button>

        </div>
      </div>
    </div>
  );
};

export default DoneView;
