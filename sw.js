
const CACHE_NAME = 'txt2pdf-v7.0-offline-pro';
const ASSETS = [
  './',
  './index.html',
  './index.tsx',
  './App.tsx',
  './types.ts',
  './constants.tsx',
  './manifest.json',
  './vercel.json',
  './metadata.json',
  './icon-192.png',
  './icon-512.png',
  
  // 0. Runtime Compilers
  'https://unpkg.com/@babel/standalone/babel.min.js',

  // 1. Core Logic & Engines
  './CoreEngine.ts',
  './EngineRegistry.ts',
  './EngineShared.ts',
  './EngineV1.ts',
  './EngineV2.ts',
  './EngineV3.ts',
  './EngineV4.ts',
  './engine_backup.ts',
  './CharacterMaster.ts',
  './HyphenationCore.ts',
  './LineManager.ts',
  './useConversionProcessor.ts',
  './persistentRegistry.ts',
  './saved_characters.ts',
  './Files.tsx',
  './Trees.tsx',
  './TreeUtils.ts',
  './StorageIO.ts',
  './SessionJournal.ts',

  // 2. Main Views
  './PathsView.tsx',
  './ConfigView.tsx',
  './SettingsView.tsx',
  './ProcessingMatrix.tsx',
  './DoneView.tsx',
  './ThemesView.tsx',
  './FontsView.tsx',
  './RenderCodesView.tsx',
  './SetApiView.tsx',
  './InterfaceColorView.tsx',
  './BackupView.tsx',
  './MainView.tsx',

  // 3. UI Components
  './InspectorModal.tsx',
  './TerminalPathModal.tsx',
  './SizeChartDrawer.tsx',
  './MatrixManager.tsx',
  './PathSlotCard.tsx',
  './SlotActionMenu.tsx',
  './SlotActionMenu.tsx',
  './SlotHeader.tsx',
  './SlotInfo.tsx',
  './SettingsMenu.tsx',
  './ThemeOption.tsx',
  './BackgroundPicker.tsx',
  './ColorPicker.tsx',
  './QuickColorPicker.tsx',
  './AccentPicker.tsx',
  './FontDropZone.tsx',
  './SystemFontsList.tsx',
  './GlyphRegistryGrid.tsx',
  './RecursiveTreeRenderer.tsx',
  './MatrixRain.tsx',

  // 4. External Libraries & Fonts
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react@19.0.0',
  'https://esm.sh/react-dom@19.0.0',
  'https://esm.sh/react-dom@19.0.0/client',
  'https://esm.sh/lucide-react@0.460.0',
  'https://esm.sh/jszip@3.10.1',
  'https://esm.sh/jspdf@2.5.1',
  'https://esm.sh/@google/genai@1.34.0',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=JetBrains+Mono:wght@500&family=Noto+Sans:wght@400;700&family=Noto+Serif:wght@400;700&family=Noto+Sans+Mono:wght@400;700&display=swap'
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
  const url = new URL(e.request.url);

  if (url.pathname.startsWith('/_output/')) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        return cached || new Response("File not generated or missing from cache.", { status: 404 });
      })
    );
    return;
  }

  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match('./index.html')));
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((response) => {
        if (!response || response.status !== 200 || (response.type !== 'basic' && response.type !== 'cors' && response.type !== 'opaque')) {
          return response;
        }
        const shouldCache = 
          url.origin === self.location.origin ||
          url.hostname === 'esm.sh' ||
          url.hostname === 'cdn.tailwindcss.com' ||
          url.hostname === 'unpkg.com' ||
          url.hostname === 'fonts.googleapis.com' || 
          url.hostname === 'fonts.gstatic.com';

        if (shouldCache) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            try {
              cache.put(e.request, responseToCache);
            } catch (err) {
              console.warn('Cache put failed', err);
            }
          });
        }
        return response;
      }).catch(() => {
        // Offline
      });
    })
  );
});
