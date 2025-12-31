
const CACHE_NAME = 'txt2pdf-v5.5-pro';
const ASSETS = [
  './',
  './index.html',
  './index.tsx',
  './App.tsx',
  './types.ts',
  './constants.tsx',
  './manifest.json',
  './vercel.json',
  
  // Logical Units
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
  './Files.tsx',
  './Trees.tsx',
  './ColorPicker.tsx',
  './QuickColorPicker.tsx',
  './ThemeOption.tsx',
  './AccentPicker.tsx',
  './BackgroundPicker.tsx',
  './ThemesView.tsx',
  './InterfaceColorView.tsx',

  // Pinned Libs
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
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
