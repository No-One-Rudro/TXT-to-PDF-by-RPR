
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { OutputMode, ThemeType, PaperSize, EngineVersion, CustomFont, ApiConfig, BorderConfig, ExtendedSlot } from './types';
import { PAPER_SIZES } from './constants';
import { Printer, Globe } from 'lucide-react';
import { getLatestEngineVersion } from './EngineRegistry';
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
import { useConversionProcessor } from './useConversionProcessor';
import { processFilesMode } from './Files';
import { processTreesMode } from './Trees';
import { injectDOMFonts } from './EngineShared';

// View State Management
type MainView = 'splash' | 'paths' | 'config' | 'settings' | 'render_codes' | 'api';

// Helper for Subscript Generation (0-9 -> ₀-₉)
const toSubscript = (num: number): string => {
  const map: Record<string, string> = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
  };
  return num.toString().split('').map(d => map[d] || d).join('');
};

const App: React.FC = () => {
  const [mainView, setMainView] = useState<MainView>('splash');
  const [theme, setTheme] = useState<ThemeType>(() => (localStorage.getItem('citadel_theme') as ThemeType) || ThemeType.AMOLED);
  
  // Custom Accent Color (Buttons/Icons)
  const [userCustomColor, setUserCustomColor] = useState(() => localStorage.getItem('citadel_custom_color') || '#22c55e');
  
  // Custom Background Color (Surface)
  const [userBackgroundColor, setUserBackgroundColor] = useState(() => localStorage.getItem('citadel_bg_color') || '#09090b');

  const [customBgImage, setCustomBgImage] = useState<string | null>(() => localStorage.getItem('citadel_bg_image'));
  const [keepSizePref, setKeepSizePref] = useState(() => localStorage.getItem('citadel_pref_keep_size') !== 'false');
  const [useDirPicker, setUseDirPicker] = useState(() => localStorage.getItem('citadel_pref_dir_picker') !== 'false');
  const [selectedEngine, setSelectedEngine] = useState<EngineVersion>(() => (localStorage.getItem('citadel_selected_engine') as EngineVersion) || getLatestEngineVersion());
  const [isSystemDark, setIsSystemDark] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);

  const [apiConfig, setApiConfig] = useState<ApiConfig>(() => {
    try {
      return JSON.parse(localStorage.getItem('citadel_api_config') || '{"activeModel":"gemini-3-flash-preview","ocrEnabled":true,"fallbackEnabled":true,"searchGrounding":false}');
    } catch {
      return { activeModel: 'gemini-3-flash-preview', ocrEnabled: true, fallbackEnabled: true, searchGrounding: false };
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
    { id: `A${toSubscript(1)}`, type: 'file' as const, files: [], pathDisplay: '' },
    { id: `A${toSubscript(2)}`, type: 'folder' as const, files: [], pathDisplay: '' }
  ]);
  
  const [selectedSize, setSelectedSize] = useState<PaperSize>(() => {
    const saved = localStorage.getItem('citadel_pref_size_name');
    if (saved) return PAPER_SIZES.find(s => s.name === saved) || PAPER_SIZES[0];
    return PAPER_SIZES.find(s => s.name === 'A4') || PAPER_SIZES[0];
  });
  
  const [customWidth, setCustomWidth] = useState(selectedSize.width.toString());
  const [customHeight, setCustomHeight] = useState(selectedSize.height.toString());
  const [borderConfig, setBorderConfig] = useState<BorderConfig>({ mode: 'PERCENT', value: 3.7 });
  const [outputPreference, setOutputPreference] = useState<OutputMode>(OutputMode.MIRROR);
  const [isSizeDrawerOpen, setIsSizeDrawerOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [terminalTargetSlot, setTerminalTargetSlot] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const activeSlotIndex = useRef<number | null>(null);

  // Hook Logic
  const processor = useConversionProcessor();

  useEffect(() => {
    if (mainView === 'splash') {
      const timer = setTimeout(() => setMainView('paths'), 1800);
      return () => clearTimeout(timer);
    }
  }, [mainView]);

  // Inject fonts into DOM whenever they change so Canvas can use them
  useEffect(() => {
    injectDOMFonts(customFonts);
  }, [customFonts]);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('citadel_theme', theme);
    localStorage.setItem('citadel_custom_color', userCustomColor);
    localStorage.setItem('citadel_bg_color', userBackgroundColor);
    localStorage.setItem('citadel_pref_keep_size', keepSizePref.toString());
    localStorage.setItem('citadel_pref_dir_picker', useDirPicker.toString());
    localStorage.setItem('citadel_selected_engine', selectedEngine);
    localStorage.setItem('citadel_custom_fonts', JSON.stringify(customFonts));
    localStorage.setItem('citadel_api_config', JSON.stringify(apiConfig));
    if (customBgImage) localStorage.setItem('citadel_bg_image', customBgImage);
    if (keepSizePref) localStorage.setItem('citadel_pref_size_name', selectedSize.name);
    
    document.documentElement.style.setProperty('--accent', userCustomColor);
    
    let bgClass = 'bg-white';
    document.documentElement.style.backgroundColor = '';

    if (theme === ThemeType.AMOLED) bgClass = 'bg-black';
    else if (theme === ThemeType.DARK) bgClass = 'bg-zinc-900';
    else if (theme === ThemeType.CUSTOM_COLOR) {
      bgClass = ''; 
      document.documentElement.style.backgroundColor = userBackgroundColor;
    } 
    else if (theme === ThemeType.CUSTOM_IMAGE) bgClass = 'bg-zinc-900'; 
    else if (theme === ThemeType.SYSTEM && isSystemDark) bgClass = 'bg-zinc-900';

    document.documentElement.className = bgClass;
  }, [theme, userCustomColor, userBackgroundColor, keepSizePref, useDirPicker, selectedSize, customBgImage, selectedEngine, customFonts, apiConfig, isSystemDark]);

  const handleRemoveSlot = (index: number) => {
    setInputSlots(prev => {
      // 1. Remove the target slot
      const filtered = prev.filter((_, i) => i !== index);
      // 2. RE-INDEX strictly: A₁, A₂, A₃... based on new positions
      return filtered.map((slot, i) => ({ 
        ...slot, 
        id: `A${toSubscript(i + 1)}` 
      }));
    });
  };

  const handleAddFonts = async (files: File[]) => {
    const newFonts: CustomFont[] = [];
    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (['ttf', 'otf', 'woff', 'woff2'].includes(ext || '')) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(file);
        });
        newFonts.push({
          id: `${file.name}-${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, ""),
          fileName: file.name,
          data: base64,
          format: ext as any
        });
      }
    }
    setCustomFonts(prev => [...prev, ...newFonts]);
  };

  const triggerStart = (isSelfTest = false) => {
    const queue: { file: File; path: string; basePath: string }[] = [];
    
    if (isSelfTest) {
      queue.push({ 
        file: new File([`DIAGNOSTIC TEST\n${new Date().toISOString()}`], "DIAGNOSTIC.txt"), 
        path: 'logs',
        basePath: 'logs'
      });
    } else {
      inputSlots.forEach(slot => {
        if (slot.type === 'file') {
          queue.push(...processFilesMode(slot));
        } else {
          queue.push(...processTreesMode(slot));
        }
      });
    }

    if (queue.length === 0 && !isSelfTest) return;

    processor.startProcess(queue, selectedEngine, customWidth, customHeight, customFonts, borderConfig, outputPreference);
  };

  const t = useMemo(() => {
    let effective = theme;
    if (theme === ThemeType.SYSTEM) effective = isSystemDark ? ThemeType.DARK : ThemeType.WHITE;
    
    const isLight = effective === ThemeType.WHITE;
    const isDark = !isLight;

    let bgClass = 'bg-white';
    if (effective === ThemeType.AMOLED) bgClass = 'bg-black';
    else if (effective === ThemeType.DARK) bgClass = 'bg-zinc-900';
    else if (effective === ThemeType.CUSTOM_COLOR) bgClass = ''; 
    else if (effective === ThemeType.CUSTOM_IMAGE) bgClass = 'bg-zinc-900'; 

    const style: React.CSSProperties = {};
    if (effective === ThemeType.CUSTOM_IMAGE && customBgImage) {
        style.backgroundImage = `url(${customBgImage})`;
        style.backgroundSize = 'cover';
        style.backgroundAttachment = 'fixed';
        style.backgroundPosition = 'center';
    } else if (effective === ThemeType.CUSTOM_COLOR) {
        style.backgroundColor = userBackgroundColor;
    }

    return {
      isDark,
      root: `${isDark ? 'text-white' : 'text-zinc-900'} ${bgClass}`,
      style,
      card: isDark ? 'bg-zinc-950/80 border-white/5 shadow-2xl backdrop-blur-md' : 'bg-zinc-100 border-zinc-200 shadow-xl',
      button: isDark ? 'bg-zinc-900 border-white/5 text-white' : 'bg-white border-zinc-200 text-zinc-900',
      iconColor: isDark ? 'white' : 'black',
      iconClass: isDark ? 'text-white' : 'text-black'
    };
  }, [theme, isSystemDark, customBgImage, userBackgroundColor]);

  const activeView = processor.viewState !== 'paths' ? 'processing' : mainView;

  return (
    <div className={`min-h-screen ${t.root} flex flex-col overflow-y-auto custom-scrollbar transition-colors duration-500`} style={t.style}>
      {mainView === 'splash' && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center animate-pulse">
          <Printer size={100} className="text-green-accent" />
          <h1 className="text-5xl font-black italic mt-8 tracking-tighter">TXT to PDF<span className="text-green-accent">4.5</span></h1>
        </div>
      )}

      {processor.ocrQueue && (
        <div className="fixed inset-0 z-[9500] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-8">
          <div className="w-full max-w-lg bg-zinc-950 border border-white/10 rounded-[4rem] p-12 text-center shadow-3xl">
            <Globe size={64} className="text-blue-400 mx-auto mb-8" />
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Neural Mapping</h2>
            <p className="text-zinc-400 text-sm mb-10">Detected unknown glyphs in source. Trigger AI training sequence?</p>
            <div className="flex space-x-4">
              <button onClick={() => processor.processOcr(apiConfig, () => triggerStart())} className="flex-1 py-8 bg-green-accent text-black font-black uppercase rounded-[2.5rem] text-xl italic">EXECUTE</button>
              <button onClick={() => { processor.setOcrQueue(null); triggerStart(); }} className="flex-1 py-8 bg-zinc-900 rounded-[2.5rem] font-black uppercase text-xl italic border border-white/5 text-white">IGNORE</button>
            </div>
          </div>
        </div>
      )}

      {activeView === 'paths' && 
        <PathsView 
          slots={inputSlots} 
          activeMode={'MIXED_MODE'} 
          onBack={() => {}} 
          onNext={() => {
            const hasFiles = inputSlots.some(s => s.files.length > 0);
            if (hasFiles) {
              setMainView('config');
            } else {
              alert("INPUT MATRIX EMPTY. CAPTURE DATA TO PROCEED.");
            }
          }} 
          onOpenSettings={() => setMainView('settings')} 
          onAddSlot={() => setInputSlots([...inputSlots, { id: `A${toSubscript(inputSlots.length + 1)}`, type: 'file', files: [], pathDisplay: '' }])} 
          onRemoveSlot={handleRemoveSlot} 
          onToggleType={(i, type) => { const ns = [...inputSlots]; ns[i].type = type; setInputSlots(ns); }} 
          onInspect={() => setIsInspectorOpen(true)} 
          onPickSpecific={async (idx, method) => { activeSlotIndex.current = idx; if (method === 'file') fileInputRef.current?.click(); else if (method === 'folder') folderInputRef.current?.click(); else if (method === 'terminal') setTerminalTargetSlot(idx); }} 
          onRunDiagnostic={() => triggerStart(true)} 
          t={t} 
        />
      }
      
      {activeView === 'config' && 
        <ConfigView 
          selectedSize={selectedSize} 
          customWidth={customWidth} 
          customHeight={customHeight} 
          outputPreference={outputPreference} 
          borderConfig={borderConfig}
          setBorderConfig={setBorderConfig}
          onBack={() => setMainView('paths')} 
          onDeploy={() => triggerStart()} 
          onOpenSizeChart={() => setIsSizeDrawerOpen(true)} 
          setCustomWidth={setCustomWidth} 
          setCustomHeight={setCustomHeight} 
          setOutputPreference={setOutputPreference} 
          t={t} 
        />
      }
      
      {processor.viewState === 'processing' && (
        <ProcessingMatrix 
          percentFiles={processor.totalFilesCount ? (processor.fileProgressCount / processor.totalFilesCount) * 100 : 0} 
          percentSize={processor.totalBytes ? (processor.processedBytes / processor.totalBytes) * 100 : 0} 
          processedBytes={processor.processedBytes}
          totalBytes={processor.totalBytes}
          percentPage={processor.currentPageProgress} 
          log={processor.log} 
          isFinished={processor.isFinished} 
          zipUrl={processor.zipUrl}
          onReturn={() => { processor.setViewState('paths'); setMainView('paths'); }} 
          t={t} 
        />
      )}
      
      {activeView === 'settings' && <SettingsView onBack={() => setMainView('paths')} theme={theme} setTheme={setTheme} userCustomColor={userCustomColor} setUserCustomColor={setUserCustomColor} userBackgroundColor={userBackgroundColor} setUserBackgroundColor={setUserBackgroundColor} customBgImage={customBgImage} onBgImageUpload={(e) => { if (e.target.files?.[0]) { const r = new FileReader(); r.onload = (ev) => setCustomBgImage(ev.target?.result as string); r.readAsDataURL(e.target.files[0]); } }} useDirPicker={useDirPicker} setUseDirPicker={setUseDirPicker} keepSizePref={keepSizePref} setKeepSizePref={setKeepSizePref} onRunDiagnostic={() => triggerStart(true)} onOpenRenderCodes={() => setMainView('render_codes')} onOpenApi={() => setMainView('api')} fonts={customFonts} onAddFonts={handleAddFonts} onRemoveFont={(id) => setCustomFonts(prev => prev.filter(f => f.id !== id))} onOcrPrompt={(fs) => processor.setOcrQueue(fs.map(f => ({char: f.name})))} t={t} />}
      {activeView === 'render_codes' && <RenderCodesView onBack={() => setMainView('settings')} selectedEngine={selectedEngine} onSelectEngine={setSelectedEngine} t={t} />}
      {activeView === 'api' && <SetApiView onBack={() => setMainView('settings')} config={apiConfig} setConfig={setApiConfig} t={t} />}
      
      {isInspectorOpen && (
        <InspectorModal 
          slots={inputSlots} onClose={() => setIsInspectorOpen(false)} t={t}
          folderSortCriteria="NAME" folderSortDesc={false} fileSortCriteria="NAME" fileSortDesc={false}
          setFolderSortCriteria={() => {}} setFolderSortDesc={() => {}} setFileSortCriteria={() => {}} setFileSortDesc={() => {}}
        />
      )}
      
      <SizeChartDrawer isOpen={isSizeDrawerOpen} onClose={() => setIsSizeDrawerOpen(false)} onSelect={(s) => { setSelectedSize(s); setCustomWidth(s.width.toString()); setCustomHeight(s.height.toString()); setIsSizeDrawerOpen(false); }} />
      
      <TerminalPathModal 
        isOpen={terminalTargetSlot !== null} currentId={terminalTargetSlot !== null ? inputSlots[terminalTargetSlot].id : ''}
        onClose={() => setTerminalTargetSlot(null)}
        onConfirm={(path) => { if (terminalTargetSlot !== null) { const ns = [...inputSlots]; ns[terminalTargetSlot].customPath = path; ns[terminalTargetSlot].pathDisplay = path; setInputSlots(ns); setTerminalTargetSlot(null); } }}
      />

      <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => {
        const files = e.target.files; const idx = activeSlotIndex.current; if (!files || idx === null) return;
        const ns = [...inputSlots]; ns[idx].files = Array.from(files); ns[idx].pathDisplay = files.length === 1 ? files[0].name : `${files.length} items captured`; setInputSlots(ns);
        e.target.value = '';
      }} />
      <input type="file" ref={folderInputRef} className="hidden" {...({ webkitdirectory: "", directory: "" } as any)} onChange={(e) => {
        const files = e.target.files; const idx = activeSlotIndex.current; if (!files || idx === null) return;
        const ns = [...inputSlots]; ns[idx].files = Array.from(files); ns[idx].pathDisplay = `${files.length} items in tree`; setInputSlots(ns);
        e.target.value = '';
      }} />
    </div>
  );
};

export default App;
