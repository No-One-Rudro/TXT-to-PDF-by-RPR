
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
    setTotalBytes(queue.reduce((acc, c) => acc + c.file.size, 0));
    setLog([`[BOOT] Engine ${selectedEngine}`, `[INIT] Queue Size: ${queue.length}`, `[INIT] Mode: ${outputMode}`, `[INIT] Border: ${borderConfig.value}${borderConfig.mode}`]);

    const zip = new JSZip();
    let accumulatedSize = 0;
    const renderer = getEngine(selectedEngine);

    for (let i = 0; i < queue.length; i++) {
      const task = queue[i];
      setFileProgressCount(i);
      setLog(prev => [...prev, `(mapping) ${task.file.name}`]);
      try {
        const text = await task.file.text();
        const pdf = await renderer(
          text, 
          parseFloat(widthStr), 
          parseFloat(heightStr), 
          (p) => {
            setCurrentPageProgress(p);
            setProcessedBytes(accumulatedSize + (task.file.size * (p / 100)));
          }, 
          fonts,
          {
            fileName: task.file.name,
            borderConfig: borderConfig
          }
        );
        const fileNameNoExt = task.file.name.replace(/\.[^/.]+$/, "");
        
        // Output Logic: Mirror (Structure) vs Mixed (Flat)
        // If MIRROR: Use full calculated path (base + relative tree)
        // If MIXED: Use only the base path (Slot ID/Custom), flattening the tree
        const dirPathRaw = outputMode === OutputMode.MIRROR ? task.path : task.basePath;
        const dirPath = dirPathRaw.endsWith('/') ? dirPathRaw : `${dirPathRaw}/`;
        
        zip.file(`${dirPath}${fileNameNoExt}.pdf`.replace(/^\//, ''), pdf.output('blob'));
        accumulatedSize += task.file.size;
        setProcessedBytes(accumulatedSize);
      } catch (err) { 
        setLog(prev => [...prev, `[ERR] Logic fault in ${task.file.name}: ${err}`]); 
      }
    }
    
    setLog(prev => [...prev, `[FIN] Compressing archive...`]);
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    
    // Auto-trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `Convert_${Date.now()}.zip`;
    a.click();
    
    // State Updates
    setZipUrl(url);
    setIsFinished(true);
    // Note: We deliberately stay in 'processing' view to show the matrix done state.
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
    startProcess, processOcr, zipUrl
  };
};
