import { jsPDF } from 'jspdf';
import { EngineVersion, CustomFont } from './types';
import { V1_CODE, renderPDF_V1 } from './EngineV1';
import { V2_CODE, renderPDF_V2 } from './EngineV2';
import { V3_CODE, renderPDF_V3 } from './EngineV3';

export type RenderFunction = (
  text: string, 
  wMM: number, 
  hMM: number, 
  onProgress: (pct: number) => void,
  customFonts: CustomFont[],
  fileName?: string
) => Promise<jsPDF>;

export interface EngineDef {
  id: EngineVersion;
  name: string;
  label: string;
  code: string;
  desc: string;
  renderer: RenderFunction;
}

export const ENGINE_REGISTRY: EngineDef[] = [
  { 
    id: EngineVersion.V1, 
    name: 'Legacy Core', 
    label: 'v0.1.0', 
    code: V1_CODE, 
    desc: 'Basic Spectrum Renderer', 
    renderer: renderPDF_V1 
  },
  { 
    id: EngineVersion.V2, 
    name: 'Matrix Core', 
    label: 'v0.2.0', 
    code: V2_CODE, 
    desc: 'High-DPI Neural Synthesis', 
    renderer: renderPDF_V2 
  },
  { 
    id: EngineVersion.V3, 
    name: 'Citadel Ultra Core', 
    label: 'v0.3.0', 
    code: V3_CODE, 
    desc: 'System Native & Code Robust', 
    renderer: renderPDF_V3 
  }
];

export const getEngine = (version: EngineVersion): RenderFunction => {
  const engine = ENGINE_REGISTRY.find(e => e.id === version);
  return engine ? engine.renderer : ENGINE_REGISTRY[ENGINE_REGISTRY.length - 1].renderer;
};

export const getLatestEngineVersion = (): EngineVersion => {
  return ENGINE_REGISTRY[ENGINE_REGISTRY.length - 1].id;
};