
import { jsPDF } from 'jspdf';
import { CustomFont } from './types';
import { registerCustomFonts } from './EngineShared';

export const V1_CODE = `
export const renderPDF_V1 = async (
  text: string, wMM: number, hMM: number, onProgress: (pct: number) => void, customFonts: CustomFont[] = []
): Promise<jsPDF> => {
  const PX_PER_MM = 11.811; 
  const widthPx = Math.floor(wMM * PX_PER_MM);
  const heightPx = Math.floor(hMM * PX_PER_MM);
  const marginPx = Math.floor(3 * PX_PER_MM);
  const canvas = document.createElement('canvas');
  canvas.width = widthPx; canvas.height = heightPx;
  const ctx = canvas.getContext('2d', { alpha: false })!;
  if (!ctx) throw new Error("GPU Context Failed"); 
  
  const fontSizePx = 10.5 * 4.166;
  const lineHeightPx = fontSizePx * 1.35;
  const doc = new jsPDF({ orientation: wMM > hMM ? 'l' : 'p', unit: 'mm', format: [wMM, hMM] });
  registerCustomFonts(doc, customFonts);

  const lines = text.split('\\n');
  const linesPerPage = Math.floor((heightPx - (marginPx * 2)) / lineHeightPx);
  const totalPages = Math.ceil(lines.length / linesPerPage) || 1;

  for (let p = 0; p < totalPages; p++) {
      if (p > 0) doc.addPage([wMM, hMM]);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, widthPx, heightPx);
      ctx.fillStyle = '#000000'; ctx.font = \`\${fontSizePx}px Inter\`;
      const start = p * linesPerPage;
      const end = Math.min(start + linesPerPage, lines.length);
      let cursorY = marginPx + fontSizePx;
      for (let i = start; i < end; i++) {
          ctx.fillText(lines[i], marginPx, cursorY);
          cursorY += lineHeightPx;
      }
      doc.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, wMM, hMM);
      onProgress(((p + 1) / totalPages) * 100);
  }
  return doc;
};
`;

export const renderPDF_V1 = async (
  text: string, wMM: number, hMM: number, onProgress: (pct: number) => void, customFonts: CustomFont[] = []
): Promise<jsPDF> => {
  const PX_PER_MM = 11.811; 
  const widthPx = Math.floor(wMM * PX_PER_MM);
  const heightPx = Math.floor(hMM * PX_PER_MM);
  const marginPx = Math.floor(3 * PX_PER_MM);
  const canvas = document.createElement('canvas');
  canvas.width = widthPx; canvas.height = heightPx;
  const ctx = canvas.getContext('2d', { alpha: false })!;
  if (!ctx) throw new Error("GPU Context Failed"); 
  
  const fontSizePx = 10.5 * 4.166;
  const lineHeightPx = fontSizePx * 1.35;
  const doc = new jsPDF({ orientation: wMM > hMM ? 'l' : 'p', unit: 'mm', format: [wMM, hMM] });
  registerCustomFonts(doc, customFonts);

  const lines = text.split('\n');
  const linesPerPage = Math.floor((heightPx - (marginPx * 2)) / lineHeightPx);
  const totalPages = Math.ceil(lines.length / linesPerPage) || 1;

  for (let p = 0; p < totalPages; p++) {
      if (p > 0) doc.addPage([wMM, hMM]);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, widthPx, heightPx);
      ctx.fillStyle = '#000000'; ctx.font = `${fontSizePx}px Inter`;
      const start = p * linesPerPage;
      const end = Math.min(start + linesPerPage, lines.length);
      let cursorY = marginPx + fontSizePx;
      for (let i = start; i < end; i++) {
          ctx.fillText(lines[i], marginPx, cursorY);
          cursorY += lineHeightPx;
      }
      doc.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, wMM, hMM);
      onProgress(((p + 1) / totalPages) * 100);
  }
  return doc;
};
