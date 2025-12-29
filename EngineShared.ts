
import { jsPDF } from 'jspdf';
import { CustomFont } from './types';

export const registerCustomFonts = (doc: jsPDF, fonts: CustomFont[]) => {
  fonts.forEach(font => {
    if (font.format === 'glyph-map') return;
    try {
      doc.addFileToVFS(`${font.name}.${font.format}`, font.data);
      doc.addFont(`${font.name}.${font.format}`, font.name, 'normal');
    } catch (e) {
      console.warn(`Font load failed: ${font.name}`);
    }
  });
};
