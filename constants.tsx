
import { PaperSize } from './types';

export const PAPER_SIZES: PaperSize[] = [
  // ISO A 0-10
  ...Array.from({ length: 11 }, (_, i) => ({
    name: `A${i}`,
    width: Math.floor(841 / Math.pow(Math.sqrt(2), i)),
    height: Math.floor(1189 / Math.pow(Math.sqrt(2), i)),
    category: 'ISO' as const
  })),
  // ISO B 0-10
  ...Array.from({ length: 11 }, (_, i) => ({
    name: `B${i}`,
    width: Math.floor(1000 / Math.pow(Math.sqrt(2), i)),
    height: Math.floor(1414 / Math.pow(Math.sqrt(2), i)),
    category: 'ISO' as const
  })),
  // ISO C 0-10
  ...Array.from({ length: 11 }, (_, i) => ({
    name: `C${i}`,
    width: Math.floor(917 / Math.pow(Math.sqrt(2), i)),
    height: Math.floor(1297 / Math.pow(Math.sqrt(2), i)),
    category: 'ISO' as const
  })),
  // JIS A 0-10
  ...Array.from({ length: 11 }, (_, i) => ({
    name: `JIS A${i}`,
    width: Math.floor(841 / Math.pow(Math.sqrt(2), i)),
    height: Math.floor(1189 / Math.pow(Math.sqrt(2), i)),
    category: 'JIS' as const
  })),
  // JIS B 0-10
  ...Array.from({ length: 11 }, (_, i) => ({
    name: `JIS B${i}`,
    width: Math.floor(1030 / Math.pow(Math.sqrt(2), i)),
    height: Math.floor(1456 / Math.pow(Math.sqrt(2), i)),
    category: 'JIS' as const
  })),
  // Android PrintSpooler Specific / Photo Sizes (from MediaSizes.java)
  { name: 'DSC Photo', width: 89, height: 119, category: 'OTHER' as const }, // OM_DSC_PHOTO
  { name: 'Card 54x86', width: 54, height: 86, category: 'OTHER' as const }, // OM_CARD
  { name: 'Photo L', width: 89, height: 127, category: 'OTHER' as const }, // OE_PHOTO_L (3.5x5in)
  { name: 'Hagaki', width: 100, height: 148, category: 'OTHER' as const }, // JPN_HAGAKI
  
  // US ANSI
  { name: 'Letter', width: 216, height: 279, category: 'OTHER' as const },
  { name: 'Legal', width: 216, height: 356, category: 'OTHER' as const },
  { name: 'Half Letter', width: 140, height: 216, category: 'OTHER' as const },
  { name: 'Junior Legal', width: 127, height: 203, category: 'OTHER' as const },
  { name: 'Gov Letter', width: 203, height: 267, category: 'OTHER' as const },
  { name: 'Tabloid', width: 279, height: 432, category: 'OTHER' as const },
  { name: 'Ledger', width: 432, height: 279, category: 'OTHER' as const },
  { name: 'Executive', width: 184, height: 267, category: 'OTHER' as const },
  { name: 'ANSI C', width: 432, height: 559, category: 'OTHER' as const },
  { name: 'ANSI D', width: 559, height: 864, category: 'OTHER' as const },
  { name: 'ANSI E', width: 864, height: 1118, category: 'OTHER' as const },
  // Arch
  { name: 'Arch A', width: 229, height: 305, category: 'OTHER' as const },
  { name: 'Arch B', width: 305, height: 457, category: 'OTHER' as const },
  { name: 'Arch C', width: 457, height: 610, category: 'OTHER' as const },
  { name: 'Arch D', width: 610, height: 914, category: 'OTHER' as const },
  { name: 'Arch E', width: 914, height: 1219, category: 'OTHER' as const },
  // Legacy / Other
  { name: 'Folio', width: 210, height: 330, category: 'OTHER' as const },
  { name: 'Quarto', width: 215, height: 275, category: 'OTHER' as const },
  { name: 'Foolscap', width: 203, height: 330, category: 'OTHER' as const },
  { name: 'Super B', width: 330, height: 483, category: 'OTHER' as const }
];

export const APP_NAME = "TXT to PDF";
