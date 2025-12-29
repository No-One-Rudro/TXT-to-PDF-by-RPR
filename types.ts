export enum AppMode {
  FILES_TO_PDF = 'FILES_TO_PDF',
  FOLDERS_TO_PDF = 'FOLDERS_TO_PDF',
  MIXED_MODE = 'MIXED_MODE'
}

export enum OutputMode {
  MIXED = 'MIXED',
  MIRROR = 'MIRROR'
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
  V1 = 'v0.1.0',
  V2 = 'v0.2.0',
  V3 = 'v0.3.0' // Citadel Ultra Flux
}

export type SortCriteria = 'NAME' | 'DATE' | 'SIZE' | 'TYPE';

export interface PaperSize {
  name: string;
  width: number;
  height: number;
  category: 'ISO' | 'JIS' | 'OTHER';
}

export interface CustomFont {
  id: string;
  name: string;
  fileName: string;
  data: string;
  format: 'ttf' | 'otf' | 'woff' | 'woff2' | 'glyph-map';
}

export interface ApiConfig {
  activeModel: string;
  ocrEnabled: boolean;
  fallbackEnabled: boolean;
}

export interface ExtendedSlot {
  id: string;
  type: 'file' | 'folder';
  files: File[];
  pathDisplay: string;
  customPath?: string;
}