
import { jsPDF } from 'jspdf';
import { CustomFont, RenderOptions } from './types';
import { registerCustomFonts } from './EngineShared';
import { getGlyphRegistry, logMissingCharacter } from './persistentRegistry';
import { PRE_SCANNED_GLYPHS } from './saved_characters';
import { calculateLayout } from './LineManager';

export const V2_CODE = `
// ENGINE v6.6.0 - HIGH-FIDELITY VECTOR SIMULATION
// Replaces previous Matrix Core.
// Features: DOM Font Injection, Safety Buffers, Layer Stacking (Text > Image)
// Font Priority: Noto Sans Mono (Code) / Noto Sans (Text)
`;

const getGlyphImage = (char: string): string | null => {
  const code = '0x' + char.charCodeAt(0).toString(16).toUpperCase();
  const staticMatch = PRE_SCANNED_GLYPHS.find(g => g.unicode === code);
  if (staticMatch) return staticMatch.data;
  const localRegistry = getGlyphRegistry();
  if (localRegistry[code]) return localRegistry[code].data;
  return null;
};

export const renderPDF_V2 = async (
  text: string, 
  wMM: number, 
  hMM: number, 
  onProgress: (pct: number) => void,
  customFonts: CustomFont[] = [],
  options: RenderOptions
): Promise<jsPDF> => {
  // CONSTANTS
  const PX_PER_MM = 11.811; // 300 DPI
  const SAFETY_BUFFER_MM = 2.5; 

  // 1. Setup Canvas Dimensions
  const widthPx = Math.floor(wMM * PX_PER_MM);
  const heightPx = Math.floor(hMM * PX_PER_MM);
  
  // 2. Margin Calculation
  let marginPx = 0;
  if (options.borderConfig.mode === 'PERCENT') {
    const p = (options.borderConfig.value !== undefined && options.borderConfig.value !== null) ? options.borderConfig.value : 3.7;
    marginPx = Math.floor(Math.min(widthPx, heightPx) * (p / 100));
  } else {
    let mm = options.borderConfig.value;
    if (mm === undefined || mm === null || mm === 0) {
       mm = Math.min(wMM, hMM) * 0.037;
    }
    marginPx = Math.floor(mm * PX_PER_MM);
  }

  // 3. Layout Area
  const safetyPx = Math.floor(SAFETY_BUFFER_MM * PX_PER_MM);
  const layoutWidth = widthPx - (marginPx * 2) - safetyPx;
  const layoutHeight = heightPx - (marginPx * 2);

  const canvas = document.createElement('canvas');
  canvas.width = widthPx;
  canvas.height = heightPx;
  
  const ctx = canvas.getContext('2d', { willReadFrequently: true, alpha: false });
  if (!ctx) throw new Error("GPU Acceleration Failed.");

  // Code Detection
  const fileName = options.fileName || "doc.txt";
  const isCode = /\.(py|js|json|ts|tsx|c|cpp|h|gitignore|md|css|html|xml|java|kt|swift|sh|bat|cmd|yaml|yml|lock|toml|rb|go|rs|php|sql)$/i.test(fileName);
  
  // Font Config
  const fontSizePt = isCode ? 9 : 10.5;
  const fontSizePx = fontSizePt * 4.166;
  const lineHeightPx = fontSizePx * (isCode ? 1.25 : 1.35);

  // Expanded System Font Stack for Maximum Coverage
  // Prioritized Noto Sans Mono for code as requested
  const fontStack = [
    ...(isCode ? ['"Noto Sans Mono"', '"Courier New"', '"Courier"', 'monospace'] : []),
    ...customFonts.filter(f => f.format !== 'glyph-map').map(f => `"${f.name}"`),
    '"Noto Sans"', '"Roboto"', '"Segoe UI"', 
    '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Noto Color Emoji"',
    'sans-serif' 
  ].join(', ');
  
  ctx.font = `${fontSizePx}px ${fontStack}`;
  ctx.textRendering = "optimizeLegibility"; // Crucial for crisp text
  
  const measure = (s: string) => ctx.measureText(s).width;
  
  // Layout Calculation using upgraded LineManager (Intl.Segmenter aware)
  let lines: { text: string; runs?: string[] }[] = [];
  
  if (isCode) {
    const rawLines = text.split(/\r?\n/).map(l => l.replace(/\t/g, '    '));
    for (const rawLine of rawLines) {
      if (measure(rawLine) <= layoutWidth) {
        lines.push({ text: rawLine });
      } else {
        // Simple char wrap for code to preserve exact characters
        let temp = '';
        for (const char of rawLine) {
          if (measure(temp + char) > layoutWidth) {
            lines.push({ text: temp });
            temp = char;
          } else {
            temp += char;
          }
        }
        if (temp) lines.push({ text: temp });
      }
    }
  } else {
    // Robust Word/Segment Wrap
    const layoutPages = calculateLayout(text, layoutWidth, layoutHeight, lineHeightPx, measure);
    lines = layoutPages.flatMap(p => p.lines.map(l => ({
      text: l.runs.join(''), 
      runs: l.runs
    })));
  }

  const doc = new jsPDF({ orientation: wMM > hMM ? 'l' : 'p', unit: 'mm', format: [wMM, hMM], compress: true });
  registerCustomFonts(doc, customFonts);
  
  // Use standard fonts for the invisible text layer to guarantee searchability
  const invisibleLayerFont = isCode ? 'Courier' : 'Helvetica';

  const linesPerPage = Math.floor(layoutHeight / lineHeightPx);
  let pages: { lines: typeof lines }[] = [];
  let currentP: typeof lines = [];
  
  for (const l of lines) {
    if (currentP.length >= linesPerPage) {
      pages.push({ lines: currentP });
      currentP = [];
    }
    currentP.push(l);
  }
  if (currentP.length > 0) pages.push({ lines: currentP });

  // RENDER LOOP
  for (let p = 0; p < pages.length; p++) {
    if (p > 0) doc.addPage([wMM, hMM]);
    
    // PHASE 1: VISUAL RENDER (CANVAS)
    ctx.fillStyle = '#ffffff'; 
    ctx.fillRect(0, 0, widthPx, heightPx);

    ctx.save();
    ctx.beginPath();
    ctx.rect(marginPx, marginPx, widthPx - (marginPx * 2), heightPx - (marginPx * 2));
    ctx.clip();
    
    ctx.fillStyle = '#000000'; 
    ctx.font = `${fontSizePx}px ${fontStack}`;
    ctx.textBaseline = 'alphabetic';
    ctx.textRendering = isCode ? "optimizeSpeed" : "optimizeLegibility";

    let currentY = marginPx + fontSizePx;
    
    // We buffer the text operations so we can replay them into the PDF *after* the image is added
    const textBuffer: { text: string, x: number, y: number }[] = [];

    for (const line of pages[p].lines) {
      let currentX = marginPx;
      const currentY_MM = currentY / PX_PER_MM; // Pre-calc MM Y-coord

      if (isCode || !line.runs) {
        // Simple Text
        ctx.fillText(line.text, currentX, currentY);
        textBuffer.push({ text: line.text, x: currentX / PX_PER_MM, y: currentY_MM });
      } else {
        // Complex Text (Runs)
        for (const run of line.runs) {
          if (!run) continue;
          const rw = ctx.measureText(run).width; 
          
          if (rw > 0 || run.trim() === '') {
             ctx.fillText(run, currentX, currentY);
             textBuffer.push({ text: run, x: currentX / PX_PER_MM, y: currentY_MM });
             currentX += rw;
          } else {
             // Missing Glyph
             const glyphData = getGlyphImage(run);
             if (glyphData) {
               const img = new Image(); 
               img.src = `data:image/png;base64,${glyphData}`;
               ctx.drawImage(img, currentX, currentY - fontSizePx * 0.8, fontSizePx * 0.8, fontSizePx * 0.8);
               currentX += fontSizePx * 0.85; 
             } else {
               logMissingCharacter(run); 
               currentX += fontSizePx * 0.4;
             }
          }
        }
      }
      currentY += lineHeightPx;
    }
    ctx.restore();

    // PHASE 2: INJECT IMAGE (Background Layer)
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    doc.addImage(imgData, 'JPEG', 0, 0, wMM, hMM, undefined, 'FAST');

    // PHASE 3: INJECT INVISIBLE TEXT (Foreground Layer)
    doc.setFont(invisibleLayerFont, 'normal');
    doc.setFontSize(fontSizePt);
    doc.setTextColor(0, 0, 0);

    for (const item of textBuffer) {
      doc.text(item.text, item.x, item.y, { 
        renderingMode: 'invisible',
        charSpace: 0 // Ensure standard spacing
      });
    }

    onProgress(((p + 1) / pages.length) * 100);
  }

  return doc;
};
