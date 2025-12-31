
import { jsPDF } from 'jspdf';
import { CustomFont, RenderOptions } from './types';
import { registerCustomFonts } from './EngineShared';
import { getGlyphRegistry, logMissingCharacter } from './persistentRegistry';
import { PRE_SCANNED_GLYPHS } from './saved_characters';
import { calculateLayout } from './LineManager';

export const V2_CODE = `
// ENGINE v4.7.0 - MATRIX CORE (Strict Border Compliance)
// Exact Page Size Preservation with Safety Buffer Layout
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
  const SAFETY_BUFFER_MM = 1.5; // Internal buffer to prevent browser rendering artifacts from touching edge

  // 1. Setup Canvas Dimensions (EXACT 300 DPI)
  const widthPx = Math.floor(wMM * PX_PER_MM);
  const heightPx = Math.floor(hMM * PX_PER_MM);
  
  // 2. Calculate Margins (Border)
  let marginPx = 0;
  if (options.borderConfig.mode === 'PERCENT') {
    const p = options.borderConfig.value > 0 ? options.borderConfig.value : 3.7;
    marginPx = Math.floor(Math.min(widthPx, heightPx) * (p / 100));
  } else {
    // MM
    const m = options.borderConfig.value > 0 ? options.borderConfig.value : (Math.min(wMM, hMM) * 0.037);
    marginPx = Math.floor(m * PX_PER_MM);
  }

  // 3. Define Printable Area (Strict)
  // The layout engine sees this width. We subtract a small safety buffer (1.5mm) 
  // to ensure text wrapping happens slightly before the visual border edge.
  // This DOES NOT change the font size or page size, just where the line breaks.
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

  const fontStack = [
    ...(isCode ? ['"Courier New"', '"Courier"', 'monospace'] : []),
    ...customFonts.filter(f => f.format !== 'glyph-map').map(f => `"${f.name}"`),
    'Helvetica', 'Arial', 'sans-serif' 
  ].join(', ');
  
  ctx.font = `${fontSizePx}px ${fontStack}`;
  ctx.textRendering = "optimizeLegibility"; 
  // Note: We do NOT scale the measure function. We trust the browser's measurement 
  // but wrap strictly within 'layoutWidth' which includes the safety buffer.
  const measure = (s: string) => ctx.measureText(s).width;
  
  // Layout Calculation
  let lines: { text: string; runs?: string[] }[] = [];
  
  if (isCode) {
    const rawLines = text.split(/\r?\n/).map(l => l.replace(/\t/g, '    '));
    for (const rawLine of rawLines) {
      if (measure(rawLine) <= layoutWidth) {
        lines.push({ text: rawLine });
      } else {
        // Hard wrap for code
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
    // Standard Text Flow
    const layoutPages = calculateLayout(text, layoutWidth, layoutHeight, lineHeightPx, measure);
    lines = layoutPages.flatMap(p => p.lines.map(l => ({
      text: l.runs.join(''), 
      runs: l.runs
    })));
  }

  // PDF Generation
  const doc = new jsPDF({ orientation: wMM > hMM ? 'l' : 'p', unit: 'mm', format: [wMM, hMM], compress: true });
  registerCustomFonts(doc, customFonts);
  const primaryFont = customFonts.find(f => f.format !== 'glyph-map')?.name || (isCode ? 'Courier' : 'Helvetica');

  // Repaginate strictly based on visual height
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
    
    // Clear Canvas (White Paper)
    ctx.fillStyle = '#ffffff'; 
    ctx.fillRect(0, 0, widthPx, heightPx);
    
    // Text Settings
    ctx.fillStyle = '#000000'; 
    ctx.font = `${fontSizePx}px ${fontStack}`;
    ctx.textBaseline = 'alphabetic';
    ctx.textRendering = isCode ? "optimizeSpeed" : "optimizeLegibility";

    let currentY = marginPx + fontSizePx;
    
    for (const line of pages[p].lines) {
      // Start writing exactly at the margin
      let currentX = marginPx;
      const currentY_MM = currentY / PX_PER_MM;

      // Selectable Layer (Invisible PDF Text)
      doc.setFont(primaryFont, 'normal');
      doc.setFontSize(fontSizePt);
      doc.setTextColor(0, 0, 0);

      if (isCode || !line.runs) {
        ctx.fillText(line.text, currentX, currentY);
        doc.text(line.text, currentX / PX_PER_MM, currentY_MM, { renderingMode: 'invisible' });
      } else {
        // Run-based rendering
        for (const run of line.runs) {
          if (!run) continue;
          const rw = ctx.measureText(run).width; 
          
          if (rw > 0 || run.trim() === '') {
             ctx.fillText(run, currentX, currentY);
             doc.text(run, currentX / PX_PER_MM, currentY_MM, { renderingMode: 'invisible' });
             currentX += rw;
          } else {
             // Missing Glyph Handling
             const glyphData = getGlyphImage(run);
             if (glyphData) {
               const img = new Image(); 
               img.src = `data:image/png;base64,${glyphData}`;
               ctx.drawImage(img, currentX, currentY - fontSizePx * 0.8, fontSizePx * 0.8, fontSizePx * 0.8);
               currentX += fontSizePx * 0.85; 
             } else {
               logMissingCharacter(run); 
               // Do NOT draw a box. Just skip ahead slightly to indicate presence.
               currentX += fontSizePx * 0.4;
             }
          }
        }
      }
      currentY += lineHeightPx;
    }

    // Inject high-quality JPEG of the canvas
    doc.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, wMM, hMM, undefined, 'FAST');
    onProgress(((p + 1) / pages.length) * 100);
  }

  return doc;
};
