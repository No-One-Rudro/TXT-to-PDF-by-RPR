
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
  // PRC (Chinese)
  { name: 'PRC 1', width: 102, height: 165, category: 'OTHER' as const },
  { name: 'PRC 2', width: 102, height: 176, category: 'OTHER' as const },
  { name: 'PRC 3', width: 125, height: 176, category: 'OTHER' as const },
  { name: 'PRC 4', width: 110, height: 208, category: 'OTHER' as const },
  { name: 'PRC 5', width: 110, height: 220, category: 'OTHER' as const },
  { name: 'PRC 6', width: 120, height: 280, category: 'OTHER' as const },
  { name: 'PRC 7', width: 160, height: 230, category: 'OTHER' as const },
  { name: 'PRC 8', width: 120, height: 300, category: 'OTHER' as const },
  { name: 'PRC 9', width: 229, height: 324, category: 'OTHER' as const },
  { name: 'PRC 10', width: 324, height: 458, category: 'OTHER' as const },
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
  { name: 'Super B', width: 330, height: 483, category: 'OTHER' as const },
  { name: 'Postcard', width: 100, height: 148, category: 'OTHER' as const }
];

export const APP_NAME = "TXT to PDF";
