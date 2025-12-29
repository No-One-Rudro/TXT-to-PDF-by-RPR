import { jsPDF } from 'jspdf';
import { CustomFont } from './types';
import { segmentAndWrap } from './Hyphenation';
import { registerCustomFonts } from './EngineShared';

export const V3_CODE = `// ENGINE v0.3.0 - CITADEL ULTRA FLUX (System Native)`;

export const renderPDF_V3 = async (
  text: string, 
  wMM: number, 
  hMM: number, 
  onProgress: (pct: number) => void,
  customFonts: CustomFont[] = [],
  fileName: string = "document.txt"
): Promise<jsPDF> => {
  // 1. Detect File Type for Strict Formatting (Monospace Lock)
  const isCode = /\.(py|js|json|ts|tsx|c|cpp|h|gitignore|md|css|html|xml|java|kt|swift|sh|bat|cmd|yaml|yml|lock|toml)$/i.test(fileName);
  
  // 2. Strict Unicode Normalization (NFC)
  const normalizedText = text.normalize('NFC');

  const PX_PER_MM = 11.811; // 300 DPI
  const widthPx = Math.floor(wMM * PX_PER_MM);
  const heightPx = Math.floor(hMM * PX_PER_MM);
  const marginPx = Math.floor(6 * PX_PER_MM);

  const canvas = document.createElement('canvas');
  canvas.width = widthPx;
  canvas.height = heightPx;
  const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true })!;

  // 3. The Infinite Font Stack (System Native)
  const fontStack = [
    ...customFonts.map(f => `"${f.name}"`),
    isCode ? '"JetBrains Mono", "Fira Code", "Consolas", monospace' : '"Inter"',
    '"Noto Sans Bengali"', '"Noto Sans Arabic"', '"Noto Sans Devanagari"', 
    '"Noto Color Emoji"', '"Apple Color Emoji"', '"Segoe UI Emoji"', 
    'system-ui', '-apple-system', 'sans-serif'
  ].join(', ');

  const fontSizePt = isCode ? 9 : 10.5;
  const fontSizePx = fontSizePt * 4.166;
  const lineHeightPx = fontSizePx * (isCode ? 1.25 : 1.45);
  
  ctx.font = `${fontSizePx}px ${fontStack}`;
  
  // 4. Optimization Settings
  if (isCode) {
    ctx.textRendering = "optimizeSpeed";
    ctx.fontKerning = "none"; 
  } else {
    ctx.textRendering = "optimizeLegibility"; 
    ctx.fontKerning = "normal";
  }

  // 5. Wrap Logic
  let lines: string[] = [];
  const maxWidth = widthPx - (marginPx * 2);

  if (isCode) {
    // Code: Preserve Tabs & Spaces
    lines = normalizedText.split(/\r?\n/).map(l => l.replace(/\t/g, '    '));
  } else {
    // Text: Language Aware Wrap
    lines = segmentAndWrap(normalizedText, maxWidth, (t) => ctx.measureText(t).width);
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
    
    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, widthPx, heightPx);
    
    // Reset Context
    ctx.fillStyle = '#000000';
    ctx.font = `${fontSizePx}px ${fontStack}`;
    ctx.textBaseline = 'alphabetic';
    if (!isCode) {
       ctx.textRendering = "optimizeLegibility";
       ctx.fontKerning = "normal";
    } else {
       ctx.fontKerning = "none";
    }

    const start = p * linesPerPage;
    const end = Math.min(start + linesPerPage, lines.length);
    let currentY = marginPx + fontSizePx;

    for (let i = start; i < end; i++) {
      const lineText = lines[i];
      // Draw visible text using System Shaping
      ctx.fillText(lineText, marginPx, currentY);
      // Invisible Searchable Layer
      doc.setFontSize(fontSizePt);
      doc.text(lineText, marginPx / PX_PER_MM, currentY / PX_PER_MM, { renderingMode: 'invisible' });
      currentY += lineHeightPx;
    }

    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    doc.addImage(imgData, 'JPEG', 0, 0, wMM, hMM, undefined, 'FAST');
    onProgress(((p + 1) / totalPages) * 100);
  }

  return doc;
};