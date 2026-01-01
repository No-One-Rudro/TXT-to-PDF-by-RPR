
import { useState } from 'react';
import JSZip from 'jszip';
import { GoogleGenAI } from "@google/genai";
import { EngineVersion, CustomFont, ApiConfig, BorderConfig, OutputMode } from './types';
import { getEngine } from './EngineRegistry';
import { saveGlyphMapping, clearMissingCharacters } from './persistentRegistry';

export const useConversionProcessor = () => {
  const [processedBytes, setProcessedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [fileProgressCount, setFileProgressCount] = useState(0);
  const [totalFilesCount, setTotalFilesCount] = useState(0);
  const [currentPageProgress, setCurrentPageProgress] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [ocrQueue, setOcrQueue] = useState<{char: string}[] | null>(null);
  const [viewState, setViewState] = useState<'paths' | 'processing' | 'done'>('paths');
  const [zipUrl, setZipUrl] = useState<string | undefined>(undefined);
  
  // Cache Management
  const [outputCacheName, setOutputCacheName] = useState<string | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([]);

  const startProcess = async (
    queue: { file: File; path: string; basePath: string }[],
    selectedEngine: EngineVersion,
    widthStr: string,
    heightStr: string,
    fonts: CustomFont[],
    borderConfig: BorderConfig,
    outputMode: OutputMode
  ) => {
    
    if (!queue.length) return;

    clearMissingCharacters();
    setViewState('processing');
    setIsFinished(false);
    setZipUrl(undefined);
    setFileProgressCount(0); 
    setTotalFilesCount(queue.length);
    setCurrentPageProgress(0);
    setProcessedBytes(0);
    
    // Safely calculate total bytes
    const safeTotalBytes = queue.reduce((acc, c) => acc + (c.file?.size || 0), 0);
    setTotalBytes(safeTotalBytes);
    
    setLog([`[BOOT] Engine ${selectedEngine}`, `[INIT] Queue Size: ${queue.length}`, `[INIT] Mode: ${outputMode}`]);

    // Initialize Cache for this session
    const timestamp = Date.now();
    const cacheName = `txt2pdf-output-${timestamp}`;
    setOutputCacheName(cacheName);
    setGeneratedFiles([]);
    
    // Aggressive Cleanup: Delete ALL previous sessions to prevent QuotaExceededError
    try {
        const keys = await caches.keys();
        for (const key of keys) {
            if (key.startsWith('txt2pdf-output-')) {
                await caches.delete(key);
                setLog(prev => [...prev, `[CLEANUP] Purged old session: ${key}`]);
            }
        }
    } catch (e) {
        console.warn('Cache cleanup failed', e);
    }

    let outputCache: Cache;
    try {
        outputCache = await caches.open(cacheName);
    } catch (err) {
        setLog(prev => [...prev, `[ERR] Cache Init Failed: ${err}`]);
        alert("System Storage Error. Offline saving disabled.");
        return;
    }

    const zip = new JSZip();
    let accumulatedSize = 0;
    const renderer = getEngine(selectedEngine);
    const localFileList: string[] = [];

    for (let i = 0; i < queue.length; i++) {
      const task = queue[i];
      
      // Safety Check: Ensure task and file exist
      if (!task || !task.file) {
        setLog(prev => [...prev, `[WARN] Invalid task at index ${i}, skipping.`]);
        continue;
      }

      setFileProgressCount(i);
      setLog(prev => [...prev, `(mapping) ${task.file.name}`]);
      
      const fileSize = task.file.size || 0;

      try {
        const text = await task.file.text();
        const pdf = await renderer(
          text, 
          parseFloat(widthStr), 
          parseFloat(heightStr), 
          (p) => {
            setCurrentPageProgress(p);
            setProcessedBytes(accumulatedSize + (fileSize * (p / 100)));
          }, 
          fonts,
          {
            fileName: task.file.name,
            borderConfig: borderConfig
          }
        );
        const fileNameNoExt = task.file.name.replace(/\.[^/.]+$/, "");
        const dirPathRaw = outputMode === OutputMode.MIRROR ? task.path : task.basePath;
        const dirPath = dirPathRaw.endsWith('/') ? dirPathRaw : `${dirPathRaw}/`;
        const fullPath = `${dirPath}${fileNameNoExt}.pdf`.replace(/^\//, '');
        
        // Output PDF Blob
        let pdfBlob: Blob;
        try {
            pdfBlob = pdf.output('blob');
        } catch (blobErr) {
            setLog(prev => [...prev, `[ERR] PDF Blob Generation Failed (Memory): ${blobErr}`]);
            continue;
        }

        // 1. Save to Cache API
        try {
            // Use strict Origin URL to avoid browser security restrictions
            const safePath = fullPath.split('/').map(encodeURIComponent).join('/');
            const cacheUrl = new URL(`/_output/${safePath}`, self.location.origin).href;
            const cacheKey = new Request(cacheUrl);
            const response = new Response(pdfBlob, {
                headers: { 
                    'Content-Type': 'application/pdf',
                    'Content-Length': pdfBlob.size.toString()
                }
            });
            await outputCache.put(cacheKey, response);
            localFileList.push(fullPath);
            setGeneratedFiles(prev => [...prev, fullPath]);
        } catch (cacheErr: any) {
            if (cacheErr.name === 'QuotaExceededError') {
                setLog(prev => [...prev, `[CRITICAL] Storage Quota Exceeded. File not cached.`]);
            } else {
                setLog(prev => [...prev, `[WARN] Cache Write Failed: ${cacheErr.message || cacheErr}`]);
            }
        }

        // 2. Add to ZIP
        zip.file(fullPath, pdfBlob);
        
        accumulatedSize += fileSize;
        setProcessedBytes(accumulatedSize);
      } catch (err) { 
        setLog(prev => [...prev, `[ERR] Logic fault in ${task.file.name}: ${err}`]); 
      }
    }
    
    setLog(prev => [...prev, `[FIN] Generating ZIP Archive...`]);
    
    try {
        const zipBlob = await zip.generateAsync({ 
            type: "blob", 
            compression: "STORE" 
        });
        
        const url = URL.createObjectURL(zipBlob);
        setZipUrl(url);
        
        // Try to cache the ZIP as well for persistence
        try {
             const zipCacheKey = new Request(new URL(`/_output/session_archive.zip`, self.location.origin).href);
             await outputCache.put(zipCacheKey, new Response(zipBlob, {
                 headers: { 'Content-Type': 'application/zip' }
             }));
             setLog(prev => [...prev, `[SUCCESS] ZIP Cached Successfully`]);
        } catch(zipCacheErr: any) {
             if (zipCacheErr.name === 'QuotaExceededError') {
                 setLog(prev => [...prev, `[WARN] Not enough space to cache ZIP.`]);
             }
        }

        setLog(prev => [...prev, `[SUCCESS] ZIP Created (${(zipBlob.size / 1024 / 1024).toFixed(2)} MB)`]);
    } catch (zipErr) {
        setLog(prev => [...prev, `[CRITICAL] ZIP Failed (Memory Limit): ${zipErr}`]);
        setLog(prev => [...prev, `[INFO] Accessing Cached Files instead...`]);
    }
    
    setIsFinished(true);
  };

  const processOcr = async (
    apiConfig: ApiConfig, 
    resumeCallback: () => void
  ) => {
    if (!ocrQueue) return;
    setViewState('processing');
    setIsFinished(false);
    setLog(["[AI] Neural scanning active..."]);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    for (const item of ocrQueue) {
      try {
        setLog(prev => [...prev, `(scanning) character: ${item.char}`]);
        const response = await ai.models.generateContent({
          model: apiConfig.activeModel,
          contents: `Create a professional, clear black character on white background 64x64 PNG representing unicode "${item.char}". Return JSON: {"data": "BASE64"}`
        });
        const json = JSON.parse(response.text.replace(/```json|```/g, '').trim());
        if (json.data) saveGlyphMapping('0x' + item.char.charCodeAt(0).toString(16).toUpperCase(), json.data);
      } catch {
        setLog(prev => [...prev, `[ERR] AI training failed for ${item.char}`]);
      }
    }
    setOcrQueue(null);
    resumeCallback();
  };

  return {
    processedBytes, totalBytes, fileProgressCount, totalFilesCount, currentPageProgress,
    log, isFinished, ocrQueue, setOcrQueue, viewState, setViewState,
    startProcess, processOcr, zipUrl,
    outputCacheName, generatedFiles
  };
};
