import { jsPDF } from 'jspdf';
import { CustomFont } from './types';
import { PRE_SCANNED_GLYPHS } from './saved_characters';
import { getGlyphRegistry, logMissingCharacter } from './persistentRegistry';
import { registerCustomFonts } from './EngineShared';

export const V2_CODE = `
// ENGINE v4.1.0 - MATRIX CORE (Upgraded)
// Optimized for 300 DPI Neural Synthesis and Granular Page-Level Progress
// Inherits Ultra-Flux Vector logic from V3
export const renderPDF_V2 = async (
  text: string, 
  wMM: number, 
  hMM: number, 
  onProgress: (pct: number) => void,
  customFonts: CustomFont[] = []
): Promise<jsPDF> => {
  const PX_PER_MM = 11.811; 
  const widthPx = Math.floor(wMM * PX_PER_MM);
  const heightPx = Math.floor(hMM * PX_PER_MM);
  const marginPx = Math.floor(3 * PX_PER_MM);

  const canvas = document.createElement('canvas');
  canvas.width = widthPx;
  canvas.height = heightPx;
  
  const ctx = canvas.getContext('2d', { willReadFrequently: true, alpha: false });
  if (!ctx) throw new Error("GPU Acceleration Failed.");

  const fontSizePx = 10.5 * 4.166;
  const lineHeightPx = fontSizePx * 1.35;
  
  const fontStack = [
    'Inter', 
    '"Noto Sans"', '"Noto Serif"', 
    'Roboto', 'Helvetica', 'Arial', 'sans-serif',
    ...customFonts.filter(f => f.format !== 'glyph-map').map(f => \`"\${f.name}"\`)
  ].join(', ');

  const maxWidth = widthPx - (marginPx * 2);
  const lines: string[] = [];
  const paragraphs = text.split(/\\r?\\n/);
  
  ctx.font = \`\${fontSizePx}px \${fontStack}\`;
  const measure = (s: string) => ctx.measureText(s).width;

  // Granular Line Wrapping with Indent Support (Ported from V3)
  for (const para of paragraphs) {
    if (para === '') { 
      lines.push(''); 
      continue; 
    }
    const segments = para.split(/(\\s+)/);
    let currentLine = '';
    for (const segment of segments) {
      if (!segment) continue;
      const potentialLine = currentLine + segment;
      if (measure(potentialLine) <= maxWidth) {
        currentLine = potentialLine;
      } else {
        if (currentLine) lines.push(currentLine);
        if (measure(segment) <= maxWidth) {
          currentLine = segment;
        } else {
          let chunk = '';
          const chars = Array.from(segment);
          for (const c of chars) {
             if (measure(chunk + c) <= maxWidth) {
                chunk += c;
             } else {
                lines.push(chunk);
                chunk = c;
             }
          }
          currentLine = chunk;
        }
      }
    }
    if (currentLine) lines.push(currentLine);
  }

  const doc = new jsPDF({ 
    orientation: wMM > hMM ? 'l' : 'p', 
    unit: 'mm', 
    format: [wMM, hMM], 
    compress: true 
  });
  
  registerCustomFonts(doc, customFonts);
  const linesPerPage = Math.floor((heightPx - (marginPx * 2)) / lineHeightPx);
  const totalPages = Math.ceil(lines.length / linesPerPage) || 1;

  for (let p = 0; p < totalPages; p++) {
    if (p > 0) doc.addPage([wMM, hMM]);
    ctx.save();
    ctx.fillStyle = '#ffffff'; 
    ctx.fillRect(0, 0, widthPx, heightPx);
    ctx.fillStyle = '#000000'; 
    ctx.font = \`\${fontSizePx}px \${fontStack}\`;
    ctx.textBaseline = 'alphabetic';

    const start = p * linesPerPage; 
    const end = Math.min(start + linesPerPage, lines.length);
    let currentY = marginPx + fontSizePx;

    for (let i = start; i < end; i++) {
      const lineText = lines[i]; 
      let currentX = marginPx; 
      const chars = Array.from(lineText);
      for (const char of chars) {
        const charWidth = ctx.measureText(char).width;
        if (charWidth > 0 || !char.trim()) {
           ctx.fillText(char, currentX, currentY); 
           currentX += charWidth;
        } else {
           const glyphData = getGlyphImage(char);
           if (glyphData) {
             const img = new Image(); 
             img.src = \`data:image/png;base64,\${glyphData}\`;
             ctx.drawImage(img, currentX, currentY - fontSizePx * 0.8, fontSizePx * 0.8, fontSizePx * 0.8);
             currentX += fontSizePx * 0.85; 
           } else {
             logMissingCharacter(char); 
             currentX += fontSizePx * 0.6;
           }
        }
      }
      currentY += lineHeightPx;
    }
    
    doc.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, wMM, hMM, undefined, 'FAST');
    ctx.restore();
    
    onProgress(((p + 1) / totalPages) * 100);
  }
  return doc;
};
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
  customFonts: CustomFont[] = []
): Promise<jsPDF> => {
  const PX_PER_MM = 11.811; 
  const widthPx = Math.floor(wMM * PX_PER_MM);
  const heightPx = Math.floor(hMM * PX_PER_MM);
  const marginPx = Math.floor(3 * PX_PER_MM);
  const canvas = document.createElement('canvas');
  canvas.width = widthPx; canvas.height = heightPx;
  const ctx = canvas.getContext('2d', { willReadFrequently: true, alpha: false });
  if (!ctx) throw new Error("GPU Acceleration Failed.");
  const fontSizePx = 10.5 * 4.166;
  const lineHeightPx = fontSizePx * 1.35;
  const fontStack = ['Inter', '"Noto Sans"', '"Noto Serif"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif', ...customFonts.filter(f => f.format !== 'glyph-map').map(f => `"${f.name}"`)].join(', ');
  const maxWidth = widthPx - (marginPx * 2);
  const lines: string[] = [];
  const paragraphs = text.split(/\r?\n/);
  ctx.font = `${fontSizePx}px ${fontStack}`;
  const measure = (s: string) => ctx.measureText(s).width;
  for (const para of paragraphs) {
    if (para === '') { lines.push(''); continue; }
    const segments = para.split(/(\s+)/);
    let currentLine = '';
    for (const segment of segments) {
      if (!segment) continue;
      const potentialLine = currentLine + segment;
      if (measure(potentialLine) <= maxWidth) { currentLine = potentialLine; } else {
        if (currentLine) lines.push(currentLine);
        if (measure(segment) <= maxWidth) { currentLine = segment; } else {
          let chunk = ''; const chars = Array.from(segment);
          for (const c of chars) { if (measure(chunk + c) <= maxWidth) { chunk += c; } else { lines.push(chunk); chunk = c; } }
          currentLine = chunk;
        }
      }
    }
    if (currentLine) lines.push(currentLine);
  }
  const doc = new jsPDF({ orientation: wMM > hMM ? 'l' : 'p', unit: 'mm', format: [wMM, hMM], compress: true });
  registerCustomFonts(doc, customFonts);
  const linesPerPage = Math.floor((heightPx - (marginPx * 2)) / lineHeightPx);
  const totalPages = Math.ceil(lines.length / linesPerPage) || 1;
  for (let p = 0; p < totalPages; p++) {
    if (p > 0) doc.addPage([wMM, hMM]);
    ctx.save(); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, widthPx, heightPx);
    ctx.fillStyle = '#000000'; ctx.font = `${fontSizePx}px ${fontStack}`;
    ctx.textBaseline = 'alphabetic';
    const start = p * linesPerPage; const end = Math.min(start + linesPerPage, lines.length);
    let currentY = marginPx + fontSizePx;
    for (let i = start; i < end; i++) {
      const lineText = lines[i]; let currentX = marginPx; const chars = Array.from(lineText);
      for (const char of chars) {
        const charWidth = ctx.measureText(char).width;
        if (charWidth > 0 || !char.trim()) { ctx.fillText(char, currentX, currentY); currentX += charWidth; } else {
           const glyphData = getGlyphImage(char);
           if (glyphData) {
             const img = new Image(); img.src = `data:image/png;base64,${glyphData}`;
             ctx.drawImage(img, currentX, currentY - fontSizePx * 0.8, fontSizePx * 0.8, fontSizePx * 0.8);
             currentX += fontSizePx * 0.85; 
           } else { logMissingCharacter(char); currentX += fontSizePx * 0.6; }
        }
      }
      currentY += lineHeightPx;
    }
    doc.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, wMM, hMM, undefined, 'FAST');
    ctx.restore(); onProgress(((p + 1) / totalPages) * 100);
  }
  return doc;
};