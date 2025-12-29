import React, { useState, useRef, useMemo, useEffect } from 'react';
import JSZip from 'jszip';
import { GoogleGenAI } from "@google/genai";
import { OutputMode, ThemeType, PaperSize, EngineVersion, CustomFont, ApiConfig, ExtendedSlot } from './types';
import { PAPER_SIZES } from './constants';
import { Printer, Globe } from 'lucide-react';
import { getEngine, getLatestEngineVersion } from './EngineRegistry';
import SizeChartDrawer from './SizeChartDrawer';
import ProcessingMatrix from './ProcessingMatrix';
import SettingsView from './SettingsView';
import PathsView from './PathsView';
import ConfigView from './ConfigView';
import InspectorModal from './InspectorModal';
import RenderCodesView from './RenderCodesView';
import SetApiView from './SetApiView';
import { saveGlyphMapping, clearMissingCharacters } from './persistentRegistry';
import { TerminalPathModal } from './TerminalPathModal';

type ViewState = 'splash' | 'paths' | 'config' | 'processing' | 'settings' | 'render_codes' | 'api';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('splash');
  const [theme, setTheme] = useState<ThemeType>(() => (localStorage.getItem('citadel_theme') as ThemeType) || ThemeType.AMOLED);
  const [userCustomColor, setUserCustomColor] = useState(() => localStorage.getItem('citadel_custom_color') || '#22c55e');
  const [customBgImage, setCustomBgImage] = useState<string | null>(() => localStorage.getItem('citadel_bg_image'));
  const [keepSizePref, setKeepSizePref] = useState(() => localStorage.getItem('citadel_pref_keep_size') !== 'false');
  const [useDirPicker, setUseDirPicker] = useState(() => localStorage.getItem('citadel_pref_dir_picker') !== 'false');
  const [selectedEngine, setSelectedEngine] = useState<EngineVersion>(() => (localStorage.getItem('citadel_selected_engine') as EngineVersion) || getLatestEngineVersion());
  const [isSystemDark, setIsSystemDark] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);

  const [apiConfig, setApiConfig] = useState<ApiConfig>(() => {
    try {
      return JSON.parse(localStorage.getItem('citadel_api_config') || '{"activeModel":"gemini-3-flash-preview","ocrEnabled":true,"fallbackEnabled":true}');
    } catch {
      return { activeModel: 'gemini-3-flash-preview', ocrEnabled: true, fallbackEnabled: true };
    }
  });

  const [customFonts, setCustomFonts] = useState<CustomFont[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('citadel_custom_fonts') || '[]');
    } catch {
      return [];
    }
  });

  const [inputSlots, setInputSlots] = useState<ExtendedSlot[]>([
    { id: 'A1', type: 'file' as const, files: [], pathDisplay: '' },
    { id: 'A2', type: 'folder' as const, files: [], pathDisplay: '' }
  ]);
  
  const [selectedSize, setSelectedSize] = useState<PaperSize>(() => {
    const saved = localStorage.getItem('citadel_pref_size_name');
    if (saved) return PAPER_SIZES.find(s => s.name === saved) || PAPER_SIZES[0];
    return PAPER_SIZES.find(s => s.name === 'A4') || PAPER_SIZES[0];
  });
  
  const [customWidth, setCustomWidth] = useState(selectedSize.width.toString());
  const [customHeight, setCustomHeight] = useState(selectedSize.height.toString());
  const [isSizeDrawerOpen, setIsSizeDrawerOpen] = useState(false);
  const [outputPreference, setOutputPreference] = useState<OutputMode>(OutputMode.MIRROR);

  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [folderSortCriteria, setFolderSortCriteria] = useState<any>('NAME');
  const [folderSortDesc, setFolderSortDesc] = useState(false);
  const [fileSortCriteria, setFileSortCriteria] = useState<any>('NAME');
  const [fileSortDesc, setFileSortDesc] = useState(false);
  
  const [terminalTargetSlot, setTerminalTargetSlot] = useState<number | null>(null);

  const [processedBytes, setProcessedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [fileProgressCount, setFileProgressCount] = useState(0);
  const [totalFilesCount, setTotalFilesCount] = useState(0);
  const [currentPageProgress, setCurrentPageProgress] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [ocrQueue, setOcrQueue] = useState<File[] | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const activeSlotIndex = useRef<number | null>(null);

  useEffect(() => {
    if (view === 'splash') {
      const timer = setTimeout(() => setView('paths'), 1800);
      return () => clearTimeout(timer);
    }
  }, [view]);

  useEffect(() => {
    localStorage.setItem('citadel_theme', theme);
    localStorage.setItem('citadel_custom_color', userCustomColor);
    localStorage.setItem('citadel_pref_keep_size', keepSizePref.toString());
    localStorage.setItem('citadel_pref_dir_picker', useDirPicker.toString());
    localStorage.setItem('citadel_selected_engine', selectedEngine);
    localStorage.setItem('citadel_custom_fonts', JSON.stringify(customFonts));
    localStorage.setItem('citadel_api_config', JSON.stringify(apiConfig));
    if (customBgImage) localStorage.setItem('citadel_bg_image', customBgImage);
    if (keepSizePref) localStorage.setItem('citadel_pref_size_name', selectedSize.name);
    
    document.documentElement.style.setProperty('--accent', userCustomColor);
    
    const isDark = theme === ThemeType.AMOLED || theme === ThemeType.DARK || (theme === ThemeType.SYSTEM && isSystemDark) || theme === ThemeType.CUSTOM_COLOR;
    const bgClass = isDark ? 'bg-black' : 'bg-white';
    document.documentElement.className = bgClass;
    document.body.className = `antialiased selection:bg-green-accent/30 custom-scrollbar ${bgClass} ${isDark ? 'text-white' : 'text-zinc-900'}`;
  }, [theme, userCustomColor, keepSizePref, useDirPicker, selectedSize, customBgImage, selectedEngine, customFonts, apiConfig, isSystemDark]);

  const handleStartProcess = async (isSelfTest = false) => {
    const queue: { file: File; path: string }[] = [];
    if (isSelfTest) {
      queue.push({ file: new File([`DIAGNOSTIC TEST\n${new Date().toISOString()}`], "DIAGNOSTIC.txt"), path: 'logs' });
    } else {
      inputSlots.forEach(slot => {
        slot.files.forEach(f => {
          if (!f.name.toLowerCase().endsWith('.png') && !/\.(ttf|otf|woff2?)$/i.test(f.name)) {
            const rel = (f as any).webkitRelativePath;
            const basePath = slot.customPath || slot.id;
            
            let finalPath = basePath;
            if (rel) {
               const relDir = rel.substring(0, rel.lastIndexOf('/'));
               const parts = relDir.split('/');
               const cleanBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
               if (parts.length > 1) {
                  finalPath = `${cleanBasePath}/${parts.slice(1).join('/')}`;
               } else {
                  finalPath = cleanBasePath;
               }
            }
            queue.push({ file: f, path: finalPath });
          }
        });
      });
    }

    if (!queue.length && !isSelfTest) return;

    clearMissingCharacters();
    setView('processing');
    setIsFinished(false);
    setFileProgressCount(0); 
    setTotalFilesCount(queue.length);
    setCurrentPageProgress(0);
    setProcessedBytes(0);
    setTotalBytes(queue.reduce((acc, c) => acc + c.file.size, 0));
    setLog([`[BOOT] Engine ${selectedEngine}`, `[INIT] Core synchronization sequence started.`]);

    const zip = new JSZip();
    let accumulatedSize = 0;
    const renderer = getEngine(selectedEngine);

    for (let i = 0; i < queue.length; i++) {
      const task = queue[i];
      setFileProgressCount(i);
      setLog(prev => [...prev, `(mapping) ${task.file.name}`]);
      
      try {
        const text = await task.file.text();
        if (!text.trim()) {
           setLog(prev => [...prev, `[WARN] Skipping empty artifact: ${task.file.name}`]);
           continue;
        }

        // --- CITADEL UPDATE: PASSING FILENAME TO RENDERER ---
        const pdf = await renderer(
          text, 
          parseFloat(customWidth), 
          parseFloat(customHeight), 
          (p) => {
            setCurrentPageProgress(p);
            setProcessedBytes(accumulatedSize + (task.file.size * (p / 100)));
          }, 
          customFonts,
          task.file.name // <--- Critical for Code Indentation
        );

        const fileNameNoExt = task.file.name.replace(/\.[^/.]+$/, "");
        const dirPath = task.path.endsWith('/') ? task.path : `${task.path}/`;
        const finalPath = `${dirPath}${fileNameNoExt}.pdf`;
        const zipPath = finalPath.startsWith('/') ? finalPath.substring(1) : finalPath;
        zip.file(zipPath, pdf.output('blob'));
        accumulatedSize += task.file.size;
        setProcessedBytes(accumulatedSize);
        setLog(prev => [...prev, `(ready) ${task.file.name}`]);
      } catch (err) { 
        setLog(prev => [...prev, `[ERR] Logic fault in ${task.file.name}: ${err}`]); 
      }
    }
    
    setFileProgressCount(queue.length);
    setCurrentPageProgress(100);
    setProcessedBytes(accumulatedSize);

    try {
      setLog(prev => [...prev, "[SYNC] All kernels ready. Compiling archive...", "pdf is given to download", "downloading"]);
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = isSelfTest ? `Diag_${Date.now()}.zip` : `Convert_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setLog(prev => [...prev, "downloading started"]);
      setIsFinished(true);
    } catch (zipErr) {
      setLog(prev => [...prev, `[FATAL] Archiver corruption: ${zipErr}`]);
    }
  };

  const handleOcrProcess = async () => {
    const files = ocrQueue;
    if (!files) return;
    setView('processing');
    setIsFinished(false);
    setLog(["[AI] Neural scanning in progress..."]);
    
    if (!navigator.onLine) {
       setLog(prev => [...prev, "[ERR] Offline. Cannot connect to Neural Cloud.", "[INFO] Please use manual mapping in Settings."]);
       setIsFinished(true);
       return;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    for (const fileObj of (files as File[])) {
      const f = fileObj as File;
      try {
        setLog(prev => [...prev, `(scanning) ${f.name}`]);
        const data = await new Promise<string>(res => {
          const r = new FileReader(); 
          r.onload = (e) => res(typeof e.target?.result === 'string' ? e.target.result.split(',')[1] : '');
          r.readAsDataURL(f);
        });
        const prompt = "Analyze image. Return JSON: {\"unicode\": \"0x...\"}";
        const response = await ai.models.generateContent({
          model: apiConfig.activeModel,
          contents: { parts: [{ inlineData: { mimeType: f.type, data } }, { text: prompt }] }
        });
        const json: any = JSON.parse((response.text || '').trim().replace(/```json|```/g, '') || '{}');
        if (json.unicode) saveGlyphMapping(json.unicode, data);
      } catch {
        setLog(prev => [...prev, `[ERR] Scan failed for ${f.name}`]);
      }
    }
    setLog(prev => [...prev, "[OK] Neural sync complete."]);
    setIsFinished(true);
    setOcrQueue(null);
  };

  const handleAddFonts = async (files: File[]) => {
    const newFonts: CustomFont[] = [];
    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (['ttf', 'otf', 'woff', 'woff2'].includes(ext || '')) {
        try {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const res = reader.result as string;
              resolve(res.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          
          newFonts.push({
            id: `${file.name}-${Date.now()}`,
            name: file.name.replace(/\.[^/.]+$/, ""),
            fileName: file.name,
            data: base64,
            format: ext as any
          });
        } catch (e) {
          console.error("Font load error", e);
        }
      }
    }
    if (newFonts.length > 0) {
      setCustomFonts(prev => [...prev, ...newFonts]);
    }
  };

  const handleRemoveFont = (id: string) => {
    setCustomFonts(prev => prev.filter(f => f.id !== id));
  };

  const handleTerminalConfirm = (path: string) => {
    if (terminalTargetSlot !== null) {
      const ns = [...inputSlots];
      const displayPath = path.endsWith('/') ? path : `${path}/`;
      ns[terminalTargetSlot].customPath = path;
      ns[terminalTargetSlot].pathDisplay = displayPath;
      setInputSlots(ns);
      setTerminalTargetSlot(null);
    }
  };

  const t = useMemo(() => {
    let effective = theme;
    if (theme === ThemeType.SYSTEM) effective = isSystemDark ? ThemeType.DARK : ThemeType.WHITE;
    const isDark = effective !== ThemeType.WHITE;
    const styles: React.CSSProperties = {};
    if (effective === ThemeType.CUSTOM_COLOR) styles.backgroundColor = userCustomColor;
    if (effective === ThemeType.CUSTOM_IMAGE && customBgImage) {
      styles.backgroundImage = `url(${customBgImage})`; styles.backgroundSize = 'cover'; styles.backgroundAttachment = 'fixed';
    }
    return {
      isDark,
      root: `${isDark ? 'text-white' : 'text-zinc-900'} ${effective === ThemeType.AMOLED ? 'bg-black' : effective === ThemeType.DARK ? 'bg-zinc-900' : effective === ThemeType.WHITE ? 'bg-white' : ''}`,
      style: styles,
      card: isDark ? 'bg-zinc-950/80 border-white/5 shadow-2xl backdrop-blur-md' : 'bg-zinc-100 border-zinc-200 shadow-xl',
      button: isDark ? 'bg-zinc-900 border-white/5 text-white' : 'bg-white border-zinc-200 text-zinc-900',
      iconColor: isDark ? 'white' : 'black',
      iconClass: isDark ? 'text-white' : 'text-black'
    };
  }, [theme, isSystemDark, userCustomColor, customBgImage]);

  return (
    <div className={`min-h-screen ${t.root} flex flex-col overflow-y-auto custom-scrollbar transition-colors duration-500`} style={t.style}>
      {view === 'splash' && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center animate-pulse">
          <Printer size={100} className="text-green-accent" />
          <h1 className="text-5xl font-black italic mt-8 tracking-tighter">TXT to PDF<span className="text-green-accent">4.1</span></h1>
        </div>
      )}

      {ocrQueue && (
        <div className="fixed inset-0 z-[9500] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-8">
          <div className="w-full max-w-lg bg-zinc-950 border border-white/10 rounded-[4rem] p-12 text-center shadow-3xl">
            <Globe size={64} className="text-blue-400 mx-auto mb-8" />
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Neural Mapping</h2>
            <p className="text-zinc-400 text-sm mb-10">Unknown glyphs detected in buffer. Execute AI recovery?</p>
            <div className="flex space-x-4">
              <button onClick={handleOcrProcess} className="flex-1 py-8 bg-green-accent text-black font-black uppercase rounded-[2.5rem] text-xl italic">EXECUTE</button>
              <button onClick={() => setOcrQueue(null)} className="flex-1 py-8 bg-zinc-900 rounded-[2.5rem] font-black uppercase text-xl italic border border-white/5 text-white">DISCARD</button>
            </div>
          </div>
        </div>
      )}

      {view === 'paths' && <PathsView slots={inputSlots} activeMode={'MIXED_MODE'} onBack={() => {}} onNext={() => setView('config')} onOpenSettings={() => setView('settings')} onAddSlot={() => setInputSlots([...inputSlots, { id: `A${inputSlots.length + 1}`, type: 'file', files: [], pathDisplay: '' }])} onRemoveSlot={(i) => setInputSlots(inputSlots.filter((_, idx) => idx !== i))} onToggleType={(i, type) => { const ns = [...inputSlots]; ns[i].type = type; setInputSlots(ns); }} onInspect={() => setIsInspectorOpen(true)} onPickSpecific={async (idx, method) => { activeSlotIndex.current = idx; if (method === 'file') fileInputRef.current?.click(); else if (method === 'folder') folderInputRef.current?.click(); else if (method === 'terminal') { setTerminalTargetSlot(idx); } }} onRunDiagnostic={() => handleStartProcess(true)} t={t} />}
      {view === 'config' && <ConfigView selectedSize={selectedSize} customWidth={customWidth} customHeight={customHeight} outputPreference={outputPreference} onBack={() => setView('paths')} onDeploy={() => handleStartProcess()} onOpenSizeChart={() => setIsSizeDrawerOpen(true)} setCustomWidth={setCustomWidth} setCustomHeight={setCustomHeight} setOutputPreference={setOutputPreference} t={t} />}
      {view === 'processing' && <ProcessingMatrix percentFiles={totalFilesCount ? (fileProgressCount / totalFilesCount) * 100 : 0} percentSize={totalBytes ? (processedBytes / totalBytes) * 100 : 0} percentPage={currentPageProgress} log={log} isFinished={isFinished} onReturn={() => setView('paths')} t={t} />}
      {view === 'settings' && <SettingsView onBack={() => setView('paths')} theme={theme} setTheme={setTheme} userCustomColor={userCustomColor} setUserCustomColor={setUserCustomColor} customBgImage={customBgImage} onBgImageUpload={(e) => { if (e.target.files?.[0]) { const r = new FileReader(); r.onload = (ev) => setCustomBgImage(ev.target?.result as string); r.readAsDataURL(e.target.files[0]); } }} useDirPicker={useDirPicker} setUseDirPicker={setUseDirPicker} keepSizePref={keepSizePref} setKeepSizePref={setKeepSizePref} onRunDiagnostic={() => handleStartProcess(true)} onOpenRenderCodes={() => setView('render_codes')} onOpenApi={() => setView('api')} fonts={customFonts} onAddFonts={handleAddFonts} onRemoveFont={handleRemoveFont} onOcrPrompt={(fs) => setOcrQueue(fs)} t={t} />}
      {view === 'render_codes' && <RenderCodesView onBack={() => setView('settings')} selectedEngine={selectedEngine} onSelectEngine={setSelectedEngine} t={t} />}
      {view === 'api' && <SetApiView onBack={() => setView('settings')} config={apiConfig} setConfig={setApiConfig} t={t} />}
      
      {isInspectorOpen && (
        <InspectorModal 
          slots={inputSlots}
          folderSortCriteria={folderSortCriteria}
          folderSortDesc={folderSortDesc}
          fileSortCriteria={fileSortCriteria}
          fileSortDesc={fileSortDesc}
          onClose={() => setIsInspectorOpen(false)}
          setFolderSortCriteria={setFolderSortCriteria}
          setFolderSortDesc={setFolderSortDesc}
          setFileSortCriteria={setFileSortCriteria}
          setFileSortDesc={setFileSortDesc}
          t={t}
        />
      )}
      
      <SizeChartDrawer isOpen={isSizeDrawerOpen} onClose={() => setIsSizeDrawerOpen(false)} onSelect={(s) => { setSelectedSize(s); setCustomWidth(s.width.toString()); setCustomHeight(s.height.toString()); setIsSizeDrawerOpen(false); }} />
      
      <TerminalPathModal 
        isOpen={terminalTargetSlot !== null} 
        currentId={terminalTargetSlot !== null ? inputSlots[terminalTargetSlot].id : ''}
        onClose={() => setTerminalTargetSlot(null)}
        onConfirm={handleTerminalConfirm}
      />

      <input type="file" ref={fileInputRef} className="hidden" multiple accept=".txt,.py,.js,.json,.md,.log,.java,.cpp,.h,.css,.html,.xml,.kt,.swift" onChange={(e) => {
        const target = e.target as HTMLInputElement;
        const files = target.files; const idx = activeSlotIndex.current; if (!files || idx === null) return;
        const fs = Array.from(files) as File[]; const ns = [...inputSlots]; 
        if (ns[idx]) { ns[idx].files = fs; ns[idx].pathDisplay = fs.length === 1 ? fs[0].name : `${fs.length} items captured`; setInputSlots(ns); }
      }} />
      <input type="file" ref={folderInputRef} className="hidden" {...({ webkitdirectory: "", directory: "" } as any)} onChange={(e) => {
        const target = e.target as HTMLInputElement;
        const files = target.files; const idx = activeSlotIndex.current; if (!files || idx === null) return;
        const fs = Array.from(files) as File[]; const ns = [...inputSlots]; 
        if (ns[idx]) { ns[idx].files = fs; ns[idx].pathDisplay = `${fs.length} items in tree`; setInputSlots(ns); }
      }} />
    </div>
  );
};

export default App;