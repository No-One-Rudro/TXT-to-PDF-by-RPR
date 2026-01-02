
import { jsPDF } from 'jspdf';
import { CustomFont, RenderOptions } from './types';
import { registerCustomFonts, scanTextForMissingGlyphs } from './EngineShared';
import { getGlyphRegistry, logMissingCharacter } from './persistentRegistry';
import { PRE_SCANNED_GLYPHS } from './saved_characters';
import { calculateLayout, RenderLine } from './LineManager';

// Exporting actual code string for the "Render Codes" view
export const V2_CODE = `
// Flux Engine V2 (v4.5.1) - Reliable High-DPI Fallback
// Optimized for stability and compatibility

export const calculateV2Layout = (
  text: string, wMM: number, hMM: number, borderConfig: any, fileName: string, ctx: CanvasRenderingContext2D
): { lines: RenderLine[] }[] => {
  // Convert MM to Points (72 DPI base for layout calc)
  const MM_TO_POINTS = (mm: number) => (mm / 25.4) * 72;
  const widthPts = MM_TO_POINTS(wMM);
  const heightPts = MM_TO_POINTS(hMM);
  
  let marginPts = 0;
  if (borderConfig.mode === 'PERCENT') {
    const p = (borderConfig.value ?? 3.7);
    marginPts = Math.min(widthPts, heightPts) * (p / 100);
  } else {
    let mm = borderConfig.value ?? 3.7;
    marginPts = MM_TO_POINTS(mm);
  }

  const contentWidth = widthPts - (marginPts * 2);
  const contentHeight = heightPts - (marginPts * 2);

  const isCode = /\\.(py|js|json|ts|tsx|c|cpp|h|gitignore|md|css|html|xml|java|kt|swift|sh|bat|cmd|yaml|yml|lock|toml|rb|go|rs|php|sql)$/i.test(fileName || '');
  
  const fontSizePt = isCode ? 9 : 10.5;
  const lineHeightPt = fontSizePt * (isCode ? 1.25 : 1.35);

  const measure = (s: string) => ctx.measureText(s).width;
  
  if (isCode) {
    const lines: RenderLine[] = [];
    const rawLines = text.split(/\\r?\\n/).map(l => l.replace(/\\t/g, '    '));
    for (const rawLine of rawLines) {
      if (measure(rawLine) <= contentWidth) {
        lines.push({ runs: [rawLine], width: measure(rawLine) });
      } else {
        let temp = '';
        for (const char of rawLine) {
          if (measure(temp + char) > contentWidth) {
            lines.push({ runs: [temp], width: measure(temp) });
            temp = char;
          } else { temp += char; }
        }
        if (temp) lines.push({ runs: [temp], width: measure(temp) });
      }
    }
    const linesPerPage = Math.floor(contentHeight / lineHeightPt);
    const pages = [];
    for (let i = 0; i < lines.length; i += linesPerPage) {
       pages.push({ lines: lines.slice(i, i + linesPerPage) });
    }
    return pages;
  } else {
    return calculateLayout(text, contentWidth, contentHeight, lineHeightPt, measure);
  }
};

export const renderPDF_V2 = async (
  text: string, wMM: number, hMM: number, onProgress: (pct: number) => void, customFonts: CustomFont[], options: RenderOptions
): Promise<jsPDF> => {
  // ... Matrix setup ...
  const SCALE_FACTOR = 4.166;
  const canvas = document.createElement('canvas');
  // ... Canvas Init ...
  
  const fontStack = [
    ...(isCode ? ['"Courier New"', '"Courier"', 'monospace'] : []),
    ...customFonts.filter(f => f.format !== 'glyph-map').map(f => \`"\${f.name}"\`),
    'system-ui', 'sans-serif' 
  ].join(', ');
  
  // SCAN SYSTEM FONTS
  scanTextForMissingGlyphs(text, fontStack);
  
  // ... Rendering ...
};
`;

const getGlyphImage = (char: string): string | null => {
  const codePoint = char.codePointAt(0);
  if (codePoint === undefined) return null;
  const code = '0x' + codePoint.toString(16).toUpperCase();
  const staticMatch = PRE_SCANNED_GLYPHS.find(g => g.unicode === code);
  if (staticMatch) return staticMatch.data;
  const localRegistry = getGlyphRegistry();
  if (localRegistry[code]) return localRegistry[code].data;
  return null;
};

const MM_TO_POINTS = (mm: number) => (mm / 25.4) * 72;

export const calculateV2Layout = (
  text: string, 
  wMM: number, 
  hMM: number, 
  borderConfig: any, 
  fileName: string,
  ctx: CanvasRenderingContext2D
): { lines: RenderLine[] }[] => {
  const widthPts = MM_TO_POINTS(wMM);
  const heightPts = MM_TO_POINTS(hMM);
  
  let marginPts = 0;
  if (borderConfig.mode === 'PERCENT') {
    const p = (borderConfig.value !== undefined && borderConfig.value !== null) ? borderConfig.value : 3.7;
    marginPts = Math.min(widthPts, heightPts) * (p / 100);
  } else {
    let mm = borderConfig.value;
    if (mm === undefined || mm === null || mm === 0) mm = 3.7;
    marginPts = MM_TO_POINTS(mm);
  }

  const layoutWidth = widthPts - (marginPts * 2);
  const layoutHeight = heightPts - (marginPts * 2);

  const isCode = /\.(py|js|json|ts|tsx|c|cpp|h|gitignore|md|css|html|xml|java|kt|swift|sh|bat|cmd|yaml|yml|lock|toml|rb|go|rs|php|sql)$/i.test(fileName || '');
  
  const fontSizePt = isCode ? 9 : 10.5;
  const lineHeightPt = fontSizePt * (isCode ? 1.25 : 1.35);

  const measure = (s: string) => ctx.measureText(s).width;
  
  let lines: RenderLine[] = [];
  
  if (isCode) {
    const rawLines = text.split(/\r?\n/).map(l => l.replace(/\t/g, '    '));
    for (const rawLine of rawLines) {
      const w = measure(rawLine);
      if (w <= layoutWidth) {
        lines.push({ runs: [rawLine], width: w });
      } else {
        let temp = '';
        for (const char of rawLine) {
          if (measure(temp + char) > layoutWidth) {
            lines.push({ runs: [temp], width: measure(temp) });
            temp = char;
          } else {
            temp += char;
          }
        }
        if (temp) lines.push({ runs: [temp], width: measure(temp) });
      }
    }
  } else {
    const layoutPages = calculateLayout(text, layoutWidth, layoutHeight, lineHeightPt, measure);
    lines = layoutPages.flatMap(p => p.lines);
  }

  const linesPerPage = Math.floor(layoutHeight / lineHeightPt);
  let pages: { lines: RenderLine[] }[] = [];
  let currentP: RenderLine[] = [];
  
  for (const l of lines) {
    if (currentP.length >= linesPerPage) {
      pages.push({ lines: currentP });
      currentP = [];
    }
    currentP.push(l);
  }
  if (currentP.length > 0) pages.push({ lines: currentP });

  return pages.map(p => ({ lines: p.lines }));
};

export const renderPDF_V2 = async (
  text: string, wMM: number, hMM: number, onProgress: (pct: number) => void, customFonts: CustomFont[], options: RenderOptions
): Promise<jsPDF> => {
  const SCALE_FACTOR = 4.166;
  const widthPts = MM_TO_POINTS(wMM);
  const heightPts = MM_TO_POINTS(hMM);
  
  const widthPx = Math.ceil(widthPts * SCALE_FACTOR);
  const heightPx = Math.ceil(heightPts * SCALE_FACTOR);

  let marginPts = 0;
  if (options.borderConfig.mode === 'PERCENT') {
    const p = (options.borderConfig.value !== undefined && options.borderConfig.value !== null) ? options.borderConfig.value : 3.7;
    marginPts = Math.min(widthPts, heightPts) * (p / 100);
  } else {
    let mm = options.borderConfig.value;
    if (mm === undefined || mm === null || mm === 0) mm = 3.7;
    marginPts = MM_TO_POINTS(mm);
  }

  const canvas = document.createElement('canvas');
  canvas.width = widthPx;
  canvas.height = heightPx;
  const ctx = canvas.getContext('2d', { willReadFrequently: true, alpha: false })!;
  
  ctx.scale(SCALE_FACTOR, SCALE_FACTOR);

  const fileName = options.fileName || "doc.txt";
  const isCode = /\.(py|js|json|ts|tsx|c|cpp|h|gitignore|md|css|html|xml|java|kt|swift|sh|bat|cmd|yaml|yml|lock|toml|rb|go|rs|php|sql)$/i.test(fileName);
  const fontSizePt = isCode ? 9 : 10.5;
  const lineHeightPt = fontSizePt * (isCode ? 1.25 : 1.35);
  
  const fontStack = [
    ...(isCode ? ['"Courier New"', '"Courier"', 'monospace'] : []),
    ...customFonts.filter(f => f.format !== 'glyph-map').map(f => `"${f.name}"`),
    'system-ui', 'sans-serif' 
  ].join(', ');
  
  // PRE-SCAN GLYPHS BEFORE LAYOUT
  scanTextForMissingGlyphs(text, fontStack);
  
  ctx.font = `${fontSizePt}px ${fontStack}`;
  ctx.textRendering = "optimizeLegibility";

  const pages = calculateV2Layout(text, wMM, hMM, options.borderConfig, options.fileName, ctx);
  
  const doc = new jsPDF({ orientation: wMM > hMM ? 'l' : 'p', unit: 'mm', format: [wMM, hMM], compress: true });
  registerCustomFonts(doc, customFonts);
  
  const invisibleLayerFont = isCode ? 'Courier' : 'Helvetica';

  for(let i=0; i<pages.length; i++) {
    if(i > 0) doc.addPage([wMM, hMM]);
    
    ctx.fillStyle = '#ffffff'; 
    ctx.fillRect(0, 0, widthPts, heightPts);
    
    ctx.save();
    ctx.beginPath();
    ctx.rect(marginPts, marginPts, widthPts - (marginPts * 2), heightPts - (marginPts * 2));
    ctx.clip();
    
    ctx.fillStyle = '#000000'; 
    ctx.textBaseline = 'alphabetic';

    let currentY = marginPts + fontSizePt;
    const textBuffer: { text: string, x: number, y: number }[] = [];

    for (const line of pages[i].lines) {
      let currentX = marginPts;
      
      const PT_TO_MM = 0.352778;
      const currentY_MM = currentY * PT_TO_MM;
      
      const runs = line.runs;

      if (isCode) {
        for (const run of runs) {
           ctx.fillText(run, currentX, currentY);
           textBuffer.push({ text: run, x: currentX * PT_TO_MM, y: currentY_MM });
           currentX += ctx.measureText(run).width;
        }
      } else {
        for (const run of runs) {
          if (!run) continue;
          const rw = ctx.measureText(run).width; 
          if (rw > 0 || run.trim() === '') {
             ctx.fillText(run, currentX, currentY);
             textBuffer.push({ text: run, x: currentX * PT_TO_MM, y: currentY_MM });
             currentX += rw;
          } else {
             const glyphData = getGlyphImage(run);
             if (glyphData) {
               const img = new Image(); 
               img.src = `data:image/png;base64,${glyphData}`;
               ctx.drawImage(img, currentX, currentY - fontSizePt * 0.8, fontSizePt * 0.8, fontSizePt * 0.8);
               currentX += fontSizePt * 0.85; 
             } else {
               logMissingCharacter(run); 
               const tofuW = fontSizePt * 0.6;
               const tofuH = fontSizePt * 0.8;
               const tofuY = currentY - (fontSizePt * 0.7);
               
               ctx.save();
               ctx.lineWidth = 1;
               ctx.strokeStyle = '#000000';
               ctx.strokeRect(currentX, tofuY, tofuW, tofuH);
               ctx.font = `${fontSizePt * 0.6}px monospace`;
               ctx.fillStyle = '#000000';
               ctx.fillText("?", currentX + (tofuW * 0.2), tofuY + (tofuH * 0.8));
               ctx.restore();

               currentX += tofuW + (fontSizePt * 0.1);
             }
          }
        }
      }
      currentY += lineHeightPt;
    }
    ctx.restore();

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    doc.addImage(imgData, 'JPEG', 0, 0, wMM, hMM, undefined, 'FAST');

    doc.setFont(invisibleLayerFont, 'normal');
    doc.setFontSize(fontSizePt);
    doc.setTextColor(0, 0, 0);

    for (const item of textBuffer) {
      doc.text(item.text, item.x, item.y, { renderingMode: 'invisible', charSpace: 0 });
    }

    onProgress(((i + 1) / pages.length) * 100);
  }
  return doc;
};
