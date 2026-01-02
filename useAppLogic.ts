
import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { OutputMode, ThemeType, PaperSize, EngineVersion, CustomFont, ApiConfig, BorderConfig, ExtendedSlot, ProcessingMode } from './types';
import { PAPER_SIZES } from './constants';
import { getLatestEngineVersion } from './EngineRegistry';
import { injectDOMFonts } from './EngineShared';
import { useConversionProcessor } from './useConversionProcessor';
import { processFilesMode } from './Files';
import { processTreesMode } from './Trees';

export type MainView = 'splash' | 'paths' | 'config' | 'settings' | 'render_codes' | 'api';

// Helper for Subscript Generation (0-9 -> ₀-₉)
const toSubscript = (num: number): string => {
  const map: Record<string, string> = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
  };
  return num.toString().split('').map(d => map[d] || d).join('');
};

export const useAppLogic = () => {
  // --- STATE ---
  const [mainView, setMainView] = useState<MainView>('splash');
  const [theme, setTheme] = useState<ThemeType>(() => (localStorage.getItem('citadel_theme') as ThemeType) || ThemeType.AMOLED);
  
  const [userCustomColor, setUserCustomColor] = useState(() => localStorage.getItem('citadel_custom_color') || '#22c55e');
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
  const [processingMode, setProcessingMode] = useState<ProcessingMode>(ProcessingMode.SAFE);
  
  // UI Toggles
  const [isSizeDrawerOpen, setIsSizeDrawerOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [terminalTargetSlot, setTerminalTargetSlot] = useState<number | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const activeSlotIndex = useRef<number | null>(null);

  // Logic Hooks
  const processor = useConversionProcessor();

  // --- EFFECTS ---

  // Splash Screen Timer
  useEffect(() => {
    if (mainView === 'splash') {
      const timer = setTimeout(() => setMainView('paths'), 1800);
      return () => clearTimeout(timer);
    }
  }, [mainView]);

  // Font Injection
  useEffect(() => {
    injectDOMFonts(customFonts);
  }, [customFonts]);

  // Persistence
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

  // --- HANDLERS ---

  const handleRemoveSlot = useCallback((index: number) => {
    setInputSlots(prev => {
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.map((slot, i) => ({ 
        ...slot, 
        id: `A${toSubscript(i + 1)}` 
      }));
    });
  }, []);

  const handleAddFonts = useCallback(async (files: File[]) => {
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
  }, []);

  const triggerStart = useCallback((isSelfTest = false) => {
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

    processor.startProcess(queue, selectedEngine, customWidth, customHeight, customFonts, borderConfig, outputPreference, processingMode);
  }, [inputSlots, selectedEngine, customWidth, customHeight, customFonts, borderConfig, outputPreference, processor, processingMode]);

  const handlePickSpecific = useCallback(async (idx: number, method: 'file' | 'folder' | 'terminal') => {
    activeSlotIndex.current = idx;
    if (method === 'file') fileInputRef.current?.click();
    else if (method === 'folder') folderInputRef.current?.click();
    else if (method === 'terminal') setTerminalTargetSlot(idx);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const idx = activeSlotIndex.current;
    if (!files || idx === null) return;
    
    setInputSlots(prev => {
        const ns = [...prev];
        if (ns[idx]) {
           ns[idx].files = Array.from(files);
           ns[idx].pathDisplay = files.length === 1 ? files[0].name : `${files.length} items captured`;
        }
        return ns;
    });
    e.target.value = '';
  }, []);

  const handleFolderInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const idx = activeSlotIndex.current;
    if (!files || idx === null) return;

    setInputSlots(prev => {
        const ns = [...prev];
        if (ns[idx]) {
           ns[idx].files = Array.from(files);
           ns[idx].pathDisplay = `${files.length} items in tree`;
        }
        return ns;
    });
    e.target.value = '';
  }, []);

  const handleBgImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const r = new FileReader();
      r.onload = (ev) => setCustomBgImage(ev.target?.result as string);
      r.readAsDataURL(e.target.files[0]);
    }
  }, []);

  // Theme Styles Calculation
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

  return {
    state: {
      mainView, setMainView,
      theme, setTheme,
      userCustomColor, setUserCustomColor,
      userBackgroundColor, setUserBackgroundColor,
      customBgImage, setCustomBgImage,
      keepSizePref, setKeepSizePref,
      useDirPicker, setUseDirPicker,
      selectedEngine, setSelectedEngine,
      apiConfig, setApiConfig,
      customFonts, setCustomFonts,
      inputSlots, setInputSlots,
      selectedSize, setSelectedSize,
      customWidth, setCustomWidth,
      customHeight, setCustomHeight,
      borderConfig, setBorderConfig,
      outputPreference, setOutputPreference,
      processingMode, setProcessingMode,
      isSizeDrawerOpen, setIsSizeDrawerOpen,
      isInspectorOpen, setIsInspectorOpen,
      terminalTargetSlot, setTerminalTargetSlot,
      activeView
    },
    refs: {
      fileInputRef,
      folderInputRef
    },
    processor,
    t,
    handlers: {
      handleRemoveSlot,
      handleAddFonts,
      triggerStart,
      handlePickSpecific,
      handleFileInputChange,
      handleFolderInputChange,
      handleBgImageUpload,
      toSubscript // Export helper for adding new slots
    }
  };
};
