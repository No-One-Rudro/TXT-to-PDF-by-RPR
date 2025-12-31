
const CACHE_NAME = 'txt2pdf-v6.4-pro-ultra';
const ASSETS = [
  './',
  './index.html',
  './index.tsx',
  './App.tsx',
  './types.ts',
  './constants.tsx',
  './manifest.json',
  './vercel.json',
  './icon-192.png',
  './icon-512.png',
  
  // Logic Core
  './CharacterMaster.ts',
  './HyphenationCore.ts',
  './LineManager.ts',
  './persistentRegistry.ts',
  './saved_characters.ts',
  './EngineRegistry.ts',
  './EngineShared.ts',
  './EngineV1.ts',
  './EngineV2.ts',
  './EngineV3.ts',
  './CoreEngine.ts',
  './useConversionProcessor.ts',
  './Files.tsx',
  './Trees.tsx',
  './TreeUtils.ts',
  
  // UI - Input Matrix
  './PathsView.tsx',
  './MatrixManager.tsx',
  './PathSlotCard.tsx',
  './SlotActionMenu.tsx',
  './SlotHeader.tsx',
  './SlotInfo.tsx',
  './TerminalPathModal.tsx',

  // UI - Config & Processing
  './ConfigView.tsx',
  './SizeChartDrawer.tsx',
  './ProcessingMatrix.tsx',
  './MatrixRain.tsx',
  './DoneView.tsx',
  './InspectorModal.tsx',
  './RecursiveTreeRenderer.tsx',

  // UI - Settings & Theming
  './SettingsView.tsx',
  './SettingsMenu.tsx',
  './ThemesView.tsx',
  './ThemeOption.tsx',
  './BackgroundPicker.tsx',
  './ColorPicker.tsx',
  './QuickColorPicker.tsx',
  './InterfaceColorView.tsx',
  './AccentPicker.tsx',

  // UI - Fonts & API
  './FontsView.tsx',
  './FontDropZone.tsx',
  './SystemFontsList.tsx',
  './GlyphRegistryGrid.tsx',
  './SetApiView.tsx',
  './RenderCodesView.tsx',
  './BackupView.tsx',

  // Dependencies (CDN)
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react@19.0.0',
  'https://esm.sh/react-dom@19.0.0',
  'https://esm.sh/react-dom@19.0.0/client',
  'https://esm.sh/lucide-react@0.460.0',
  'https://esm.sh/jszip@3.10.1',
  'https://esm.sh/jspdf@2.5.1',
  'https://esm.sh/@google/genai@1.34.0'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k))))
  );
});

self.addEventListener('fetch', (e) => {
  // Navigation fallback
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match('./index.html')));
    return;
  }
  // Stale-while-revalidate for everything else
  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request).then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // Cache new assets dynamically if they match our scope
          if (e.request.url.startsWith(self.location.origin) || e.request.url.startsWith('https://esm.sh') || e.request.url.startsWith('https://cdn.tailwindcss.com')) {
             cache.put(e.request, response.clone());
          }
          return response;
        });
      });
    })
  );
});
