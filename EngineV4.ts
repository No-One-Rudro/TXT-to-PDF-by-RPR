
import { jsPDF } from 'jspdf';
import { CustomFont, RenderOptions } from './types';
import { registerCustomFonts, scanTextForMissingGlyphs } from './EngineShared';
import { getGlyphRegistry, logMissingCharacter } from './persistentRegistry';
import { PRE_SCANNED_GLYPHS } from './saved_characters';
import { calculateLayout, RenderPage, RenderLine } from './LineManager';

// Exporting actual code string for the "Render Codes" view
export const V4_CODE = `
// Native Bridge Engine V4 (v5.1.0 - Stable)
// Optimized for stability with Async Yielding

export const renderPDF_V4 = async (
  text: string, 
  wMM: number, 
  hMM: number, 
  onProgress: (pct: number) => void, 
  customFonts: CustomFont[], 
  options: RenderOptions
): Promise<jsPDF> => {
  const MM_TO_MILS = (mm: number) => (mm / 25.4) * 1000;
  const MILS_TO_POINTS = (mils: number) => (mils / 1000.0) * 72.0;
  
  const widthMils = MM_TO_MILS(wMM);
  const heightMils = MM_TO_MILS(hMM);
  const widthPts = MILS_TO_POINTS(widthMils);
  const heightPts = MILS_TO_POINTS(heightMils);

  // High-Res Canvas Backing (300 DPI Target)
  const MATRIX_SCALE = 4.166666667; 
  const widthPx = Math.ceil(widthPts * MATRIX_SCALE);
  const heightPx = Math.ceil(heightPts * MATRIX_SCALE);

  const canvas = document.createElement('canvas');
  canvas.width = widthPx;
  canvas.height = heightPx;
  const ctx = canvas.getContext('2d', { willReadFrequently: true, alpha: false })!;
  
  ctx.scale(MATRIX_SCALE, MATRIX_SCALE);

  let marginMils = 0;
  if (options.borderConfig.mode === 'PERCENT') {
    const p = (options.borderConfig.value ?? 3.7);
    marginMils = Math.min(widthMils, heightMils) * (p / 100);
  } else {
    let mm = options.borderConfig.value ?? 3.7;
    marginMils = MM_TO_MILS(mm);
  }
  const marginPts = MILS_TO_POINTS(marginMils);
  
  const contentWidthPts = widthPts - (marginPts * 2);
  const contentHeightPts = heightPts - (marginPts * 2);
  
  const isCode = /\\.(py|js|json|ts|tsx|c|cpp|h|gitignore|md|css|html|xml|java|kt|swift|sh|bat|cmd|yaml|yml|lock|toml|rb|go|rs|php|sql)$/i.test(options.fileName || '');
  
  const fontSizePt = isCode ? 9 : 10.5;
  const lineHeightPt = fontSizePt * (isCode ? 1.25 : 1.35);

  const fontStack = [
    ...(isCode ? ['"Courier New"', '"Courier"', 'monospace'] : []),
    ...customFonts.filter(f => f.format !== 'glyph-map').map(f => \`"\${f.name}"\`),
    'sans-serif' 
  ].join(', ');

  scanTextForMissingGlyphs(text, fontStack);

  ctx.font = \`\${fontSizePt}px \${fontStack}\`;
  ctx.textRendering = "optimizeLegibility";

  const measure = (s: string) => ctx.measureText(s).width;

  let lines: RenderLine[] = [];
  if (isCode) {
    const rawLines = text.split(/\\r?\\n/).map(l => l.replace(/\\t/g, '    '));
    for (const rawLine of rawLines) {
      if (measure(rawLine) <= contentWidthPts) {
        lines.push({ runs: [rawLine], width: measure(rawLine) });
      } else {
        let temp = '';
        for (const char of rawLine) {
          if (measure(temp + char) > contentWidthPts) {
            lines.push({ runs: [temp], width: measure(temp) });
            temp = char;
          } else { temp += char; }
        }
        if (temp) lines.push({ runs: [temp], width: measure(temp) });
      }
    }
  } else {
    const layoutPages = calculateLayout(text, contentWidthPts, contentHeightPts, lineHeightPt, measure);
    lines = layoutPages.flatMap(p => p.lines);
  }

  const linesPerPage = Math.floor(contentHeightPts / lineHeightPt);
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

  const doc = new jsPDF({ orientation: wMM > hMM ? 'l' : 'p', unit: 'mm', format: [wMM, hMM], compress: true });
  registerCustomFonts(doc, customFonts);
  const invisibleLayerFont = isCode ? 'Courier' : 'Helvetica';

  for (let p = 0; p < pages.length; p++) {
    if (p > 0) doc.addPage([wMM, hMM]);
    
    ctx.fillStyle = '#ffffff'; 
    ctx.fillRect(0, 0, widthPts, heightPts);

    ctx.save();
    ctx.beginPath();
    ctx.rect(marginPts, marginPts, widthPts - (marginPts * 2), heightPts - (marginPts * 2));
    ctx.clip();
    
    ctx.fillStyle = '#000000'; 
    ctx.textBaseline = 'alphabetic';
    ctx.textRendering = isCode ? "optimizeSpeed" : "optimizeLegibility";

    let currentY = marginPts + fontSizePt;
    const textBuffer: { text: string, x: number, y: number }[] = [];
    const PT_TO_MM = 0.352778;

    for (const line of pages[p].lines) {
      let currentX = marginPts;
      const currentY_MM = currentY * PT_TO_MM;

      for (const run of line.runs) {
        if (!run) continue;
        const rw = ctx.measureText(run).width;
        
        if (rw > 0 || run.trim() === '') {
           ctx.fillText(run, currentX, currentY);
           textBuffer.push({ text: run, x: currentX * PT_TO_MM, y: currentY_MM });
           currentX += rw;
        } else {
           // Glyph Fallback
           const glyphData = getGlyphImage(run);
           if (glyphData) {
             const img = new Image(); 
             img.src = \`data:image/png;base64,\${glyphData}\`;
             // Image drawing in point coords
             ctx.drawImage(img, currentX, currentY - fontSizePt * 0.8, fontSizePt * 0.8, fontSizePt * 0.8);
             currentX += fontSizePt * 0.85; 
           } else {
             logMissingCharacter(run); 
             // Tofu Box
             const tofuW = fontSizePt * 0.6;
             const tofuH = fontSizePt * 0.8;
             const tofuY = currentY - (fontSizePt * 0.7);
             
             ctx.save();
             ctx.lineWidth = 1; // 1 point width
             ctx.strokeStyle = '#000000';
             ctx.strokeRect(currentX, tofuY, tofuW, tofuH);
             ctx.font = \`\${fontSizePt * 0.6}px monospace\`;
             ctx.fillStyle = '#000000';
             ctx.fillText("?", currentX + (tofuW * 0.2), tofuY + (tofuH * 0.8));
             ctx.restore();

             currentX += tofuW + (fontSizePt * 0.1);
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
      doc.text(item.text, item.x, item.y, { 
        renderingMode: 'invisible',
        charSpace: 0 
      });
    }

    onProgress(((p + 1) / pages.length) * 100);
    
    // Critical: Yield to main thread every 5 pages to prevent freezing
    if (p % 5 === 0) await new Promise(r => setTimeout(r, 0));
  }

  return doc;
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

// --- CONSTANTS FROM ANDROID SOURCE ---
// 1 inch = 25.4 mm = 1000 mils = 72 points.
const MM_TO_MILS = (mm: number) => (mm / 25.4) * 1000;
const MILS_TO_POINTS = (mils: number) => (mils / 1000.0) * 72.0;

export const renderPDF_V4 = async (
  text: string, 
  wMM: number, 
  hMM: number, 
  onProgress: (pct: number) => void, 
  customFonts: CustomFont[], 
  options: RenderOptions
): Promise<jsPDF> => {
  // 1. Setup Dimensions (Android PrintAttributes Logic)
  const widthMils = MM_TO_MILS(wMM);
  const heightMils = MM_TO_MILS(hMM);
  
  const widthPts = MILS_TO_POINTS(widthMils);
  const heightPts = MILS_TO_POINTS(heightMils);

  // 2. High-Res Backing Store (300 DPI Target)
  // Scale = 300 DPI / 72 DPI ≈ 4.166667
  const MATRIX_SCALE = 4.166666667; 
  
  const widthPx = Math.ceil(widthPts * MATRIX_SCALE);
  const heightPx = Math.ceil(heightPts * MATRIX_SCALE);

  // 3. Margin Calculation (Android PrintAttributes.Margins)
  let marginMils = 0;
  if (options.borderConfig.mode === 'PERCENT') {
    const p = (options.borderConfig.value !== undefined && options.borderConfig.value !== null) ? options.borderConfig.value : 3.7;
    marginMils = Math.min(widthMils, heightMils) * (p / 100);
  } else {
    let mm = options.borderConfig.value;
    if (mm === undefined || mm === null || mm === 0) mm = 3.7;
    marginMils = MM_TO_MILS(mm);
  }
  
  const marginPts = MILS_TO_POINTS(marginMils);

  // 4. Initialize Context with Matrix
  const canvas = document.createElement('canvas');
  canvas.width = widthPx;
  canvas.height = heightPx;
  
  const ctx = canvas.getContext('2d', { willReadFrequently: true, alpha: false });
  if (!ctx) throw new Error("GPU Acceleration Failed.");
  
  // Apply Matrix Transformation (Mirrors 'matrix.postScale' in PdfManipulationService)
  ctx.scale(MATRIX_SCALE, MATRIX_SCALE);

  // 5. Config & Layout
  const fileName = options.fileName || "doc.txt";
  const isCode = /\.(py|js|json|ts|tsx|c|cpp|h|gitignore|md|css|html|xml|java|kt|swift|sh|bat|cmd|yaml|yml|lock|toml|rb|go|rs|php|sql)$/i.test(fileName);
  
  const fontSizePt = isCode ? 9 : 10.5;
  const lineHeightPt = fontSizePt * (isCode ? 1.25 : 1.35);

  const fontStack = [
    ...(isCode ? ['"Courier New"', '"Courier"', 'monospace'] : []),
    ...customFonts.filter(f => f.format !== 'glyph-map').map(f => `"${f.name}"`),
    'sans-serif' 
  ].join(', ');
  
  // PRE-SCAN GLYPHS BEFORE LAYOUT
  scanTextForMissingGlyphs(text, fontStack);
  
  ctx.font = `${fontSizePt}px ${fontStack}`;
  ctx.textRendering = "optimizeLegibility";
  
  // Measure in local coordinate space (Points)
  const measure = (s: string) => ctx.measureText(s).width;

  // Content Area
  const contentWidthPts = widthPts - (marginPts * 2);
  const contentHeightPts = heightPts - (marginPts * 2);
  
  // 6. Line Logic (Recycled from shared logic but ensuring point-based math)
  let lines: RenderLine[] = [];
  
  if (isCode) {
    const rawLines = text.split(/\r?\n/).map(l => l.replace(/\t/g, '    '));
    for (const rawLine of rawLines) {
      if (measure(rawLine) <= contentWidthPts) {
        lines.push({ runs: [rawLine], width: measure(rawLine) });
      } else {
        // Character wrap
        let temp = '';
        for (const char of rawLine) {
          if (measure(temp + char) > contentWidthPts) {
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
    // Word Wrap
    const layoutPages = calculateLayout(text, contentWidthPts, contentHeightPts, lineHeightPt, measure);
    lines = layoutPages.flatMap(p => p.lines);
  }

  // 7. Pagination
  const linesPerPage = Math.floor(contentHeightPts / lineHeightPt);
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

  // 8. Output PDF Generation
  const doc = new jsPDF({ orientation: wMM > hMM ? 'l' : 'p', unit: 'mm', format: [wMM, hMM], compress: true });
  registerCustomFonts(doc, customFonts);
  const invisibleLayerFont = isCode ? 'Courier' : 'Helvetica';

  for (let p = 0; p < pages.length; p++) {
    if (p > 0) doc.addPage([wMM, hMM]);
    
    // Clear Canvas (in Points coord space covering entire high-res bitmap)
    ctx.fillStyle = '#ffffff'; 
    ctx.fillRect(0, 0, widthPts, heightPts);

    // Apply Margins / Clipping (Android: Rect clip)
    ctx.save();
    ctx.beginPath();
    ctx.rect(marginPts, marginPts, widthPts - (marginPts * 2), heightPts - (marginPts * 2));
    ctx.clip();
    
    ctx.fillStyle = '#000000'; 
    ctx.textBaseline = 'alphabetic';
    ctx.textRendering = isCode ? "optimizeSpeed" : "optimizeLegibility";

    let currentY = marginPts + fontSizePt;
    const textBuffer: { text: string, x: number, y: number }[] = [];

    // Points to MM conversion for invisible layer (since jsPDF handles text in Unit units, which we set to MM)
    // 1 Point = 1/72 inch = 0.352778 mm
    const PT_TO_MM = 0.352778;

    for (const line of pages[p].lines) {
      let currentX = marginPts;
      const currentY_MM = currentY * PT_TO_MM;

      for (const run of line.runs) {
        if (!run) continue;
        const rw = ctx.measureText(run).width;
        
        if (rw > 0 || run.trim() === '') {
           ctx.fillText(run, currentX, currentY);
           textBuffer.push({ text: run, x: currentX * PT_TO_MM, y: currentY_MM });
           currentX += rw;
        } else {
           // Glyph Fallback
           const glyphData = getGlyphImage(run);
           if (glyphData) {
             const img = new Image(); 
             img.src = `data:image/png;base64,${glyphData}`;
             // Image drawing in point coords
             ctx.drawImage(img, currentX, currentY - fontSizePt * 0.8, fontSizePt * 0.8, fontSizePt * 0.8);
             currentX += fontSizePt * 0.85; 
           } else {
             logMissingCharacter(run); 
             // Tofu Box
             const tofuW = fontSizePt * 0.6;
             const tofuH = fontSizePt * 0.8;
             const tofuY = currentY - (fontSizePt * 0.7);
             
             ctx.save();
             ctx.lineWidth = 1; // 1 point width
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
      currentY += lineHeightPt;
    }
    ctx.restore();

    // 9. Commit Image Layer
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    doc.addImage(imgData, 'JPEG', 0, 0, wMM, hMM, undefined, 'FAST');

    // 10. Commit Invisible Text Layer
    doc.setFont(invisibleLayerFont, 'normal');
    doc.setFontSize(fontSizePt); 
    doc.setTextColor(0, 0, 0);

    for (const item of textBuffer) {
      doc.text(item.text, item.x, item.y, { 
        renderingMode: 'invisible',
        charSpace: 0 
      });
    }

    onProgress(((p + 1) / pages.length) * 100);
    
    // Critical: Yield to main thread every 5 pages to prevent freezing
    if (p % 5 === 0) await new Promise(r => setTimeout(r, 0));
  }

  return doc;
};
