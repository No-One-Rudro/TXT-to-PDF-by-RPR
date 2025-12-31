
export const ENGINE_BACKUP_V2_1_0 = `
// ENGINE v2.1.0 - Robust Layout & Spectrum Renderer (3mm Margins)
const renderPDF = async (text: string, wMM: number, hMM: number) => {
  // 300 DPI CONSTANTS
  const PX_PER_MM = 11.81; 
  
  // Canvas setup for 300 DPI
  const widthPx = Math.floor(wMM * PX_PER_MM);
  const heightPx = Math.floor(hMM * PX_PER_MM);
  const marginPx = Math.floor(3 * PX_PER_MM); // Reduced to 3mm for C8/Compact layouts
  
  const canvas = document.createElement('canvas');
  canvas.width = widthPx;
  canvas.height = heightPx;
  const ctx = canvas.getContext('2d', { alpha: false })!; 
  
  // Font Config (Scale pt to px for 300 DPI)
  // 1pt = 1/72 inch. 300 DPI / 72 = 4.166 px/pt
  const fontSizePt = 10.5;
  const fontSizePx = fontSizePt * 4.166;
  const lineHeightPx = fontSizePx * 1.35; // Tight line height for density
  
  ctx.font = \`\${fontSizePx}px Roboto, Helvetica, Arial, sans-serif\`;
  ctx.textBaseline = 'alphabetic'; // Better for Latin scripts alignment
  
  const maxWidth = widthPx - (marginPx * 2);
  
  // Layout Logic
  const lines: string[] = [];
  const paragraphs = text.split(/\r?\n/);
  
  // Helper to measure
  const measure = (s: string) => ctx.measureText(s).width;

  for (const para of paragraphs) {
      if (para === '') {
          lines.push('');
          continue;
      }

      const words = para.split(' ');
      let currentLine = '';

      for (let i = 0; i < words.length; i++) {
          const word = words[i];
          const spacer = currentLine.length > 0 ? ' ' : '';
          
          // Check if word fits with spacer
          if (measure(currentLine + spacer + word) <= maxWidth) {
              currentLine += spacer + word;
          } else {
              // Flush current line if not empty
              if (currentLine.length > 0) {
                  lines.push(currentLine);
                  currentLine = '';
              }
              
              // Now handle the word. Does it fit on a new empty line?
              if (measure(word) <= maxWidth) {
                  currentLine = word;
              } else {
                  // Word is too long for a single line -> Hard Wrap with Hyphen
                  // Use Array.from to correctly split surrogate pairs (emojis)
                  const chars = Array.from(word);
                  let chunk = '';
                  
                  for (let k = 0; k < chars.length; k++) {
                      const char = chars[k];
                      const isLast = k === chars.length - 1;
                      // If not last, we might need space for a hyphen
                      const suffix = isLast ? '' : '-';
                      
                      if (measure(chunk + char + suffix) <= maxWidth) {
                          chunk += char;
                      } else {
                          // Flush chunk
                          if (chunk.length > 0) {
                              lines.push(chunk + '-');
                              chunk = char;
                          } else {
                              // Single char wider than line? (Unlikely unless huge font or small paper)
                              lines.push(char);
                              chunk = '';
                          }
                      }
                  }
                  currentLine = chunk;
              }
          }
      }
      if (currentLine.length > 0) lines.push(currentLine);
  }
  
  // Page Management & Drawing (Spectrum Renderer)
  const doc = new jsPDF({ orientation: wMM > hMM ? 'l' : 'p', unit: 'mm', format: [wMM, hMM] });
  
  const availableHeight = heightPx - (marginPx * 2);
  const linesPerPage = Math.floor(availableHeight / lineHeightPx);
  const totalPages = Math.ceil(lines.length / linesPerPage) || 1;

  for (let p = 0; p < totalPages; p++) {
      if (p > 0) doc.addPage([wMM, hMM]);
      
      // Reset Canvas for new page
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, widthPx, heightPx);
      
      const startLine = p * linesPerPage;
      const endLine = Math.min(startLine + linesPerPage, lines.length);
      
      // Initial baseline (font ascent adjustment approx)
      let cursorY = marginPx + fontSizePx;
      
      for (let i = startLine; i < endLine; i++) {
          const lineText = lines[i];
          
          // Spectrum Renderer: Tokenize for colors
          // Splits by the symbol to keep it separate
          const parts = lineText.split(/(\u2695)/g);
          let cursorX = marginPx;
          
          for (const part of parts) {
              if (part === '\u2695') {
                  ctx.fillStyle = '#800080'; // Force Purple for Staff of Asclepius
              } else {
                  ctx.fillStyle = '#000000'; // Black for text
              }
              ctx.fillText(part, cursorX, cursorY);
              cursorX += measure(part);
          }
          
          cursorY += lineHeightPx;
      }
      
      // Inject High Quality JPEG (Compression: NONE/FAST)
      const imgData = canvas.toDataURL('image/jpeg', 0.90);
      doc.addImage(imgData, 'JPEG', 0, 0, wMM, hMM, undefined, 'FAST');
  }
  
  return doc;
};
`;
