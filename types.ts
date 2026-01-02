
export enum AppMode {
  FILES_TO_PDF = 'FILES_TO_PDF',
  FOLDERS_TO_PDF = 'FOLDERS_TO_PDF',
  MIXED_MODE = 'MIXED_MODE'
}

export enum OutputMode {
  MIXED = 'MIXED',
  MIRROR = 'MIRROR'
}

export enum ProcessingMode {
  SAFE = 'SAFE', // Disk-based, crash resilient, preserves tree
  FAST = 'FAST'  // RAM-based, faster
}

export enum ThemeType {
  AMOLED = 'AMOLED',
  DARK = 'DARK',
  WHITE = 'WHITE',
  CUSTOM_COLOR = 'CUSTOM_COLOR',
  CUSTOM_IMAGE = 'CUSTOM_IMAGE',
  SYSTEM = 'SYSTEM'
}

export enum EngineVersion {
  V1 = 'v2.1.0',
  V2 = 'v4.5.1',
  V3 = 'v3.5.0',
  V4 = 'v5.0.0'
}

export type SortCriteria = 'NAME' | 'DATE' | 'SIZE' | 'TYPE';

export interface PaperSize {
  name: string;
  width: number; // mm
  height: number; // mm
  category: 'ISO' | 'JIS' | 'OTHER';
}

export interface GlyphItem {
  unicode: string;
  data: string; // Base64 PNG
  sourceFile: string;
}

export interface CustomFont {
  id: string;
  name: string;
  fileName: string;
  data: string; // Base64
  format: 'ttf' | 'otf' | 'woff' | 'woff2' | 'glyph-map';
  glyphMap?: GlyphItem[];
}

export interface ApiConfig {
  activeModel: string;
  ocrEnabled: boolean;
  fallbackEnabled: boolean;
  searchGrounding?: boolean;
}

export interface BorderConfig {
  mode: 'MM' | 'PERCENT';
  value: number; // if 0 or null, defaults to 3.7%
}

export interface RenderOptions {
  fileName: string;
  borderConfig: BorderConfig;
}

export interface ExtendedSlot {
  id: string;
  type: 'file' | 'folder';
  files: File[];
  pathDisplay: string;
  customPath?: string;
}
