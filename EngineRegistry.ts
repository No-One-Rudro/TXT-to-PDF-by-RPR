
import { jsPDF } from 'jspdf';
import { EngineVersion, CustomFont, RenderOptions } from './types';
import { V1_CODE, renderPDF_V1 } from './EngineV1';
import { V2_CODE, renderPDF_V2 } from './EngineV2';
import { V3_CODE, renderPDF_V3 } from './EngineV3';
import { V4_CODE, renderPDF_V4 } from './EngineV4';

export type RenderFunction = (
  text: string, 
  wMM: number, 
  hMM: number, 
  onProgress: (pct: number) => void,
  customFonts: CustomFont[],
  options: RenderOptions
) => Promise<jsPDF>;

export interface EngineDef {
  id: EngineVersion;
  name: string;
  label: string;
  code: string;
  desc: string;
  renderer: RenderFunction;
}

// REGISTER NEW ENGINES HERE
export const ENGINE_REGISTRY: EngineDef[] = [
  { 
    id: EngineVersion.V1, 
    name: 'Legacy Core', 
    label: 'v₁', 
    code: V1_CODE, 
    desc: 'Robust Spectrum Renderer (Deprecated)', 
    renderer: renderPDF_V1 
  },
  { 
    id: EngineVersion.V2, 
    name: 'Flux Engine', 
    label: 'v₂', 
    code: V2_CODE, 
    desc: 'Reliable Fallback (High-DPI)', 
    renderer: renderPDF_V2 
  },
  { 
    id: EngineVersion.V3, 
    name: 'Matrix Core', 
    label: 'v₃', 
    code: V3_CODE, 
    desc: 'Constant Baseline (Stable)', 
    renderer: renderPDF_V3 
  },
  { 
    id: EngineVersion.V4, 
    name: 'Native Bridge', 
    label: 'v₄', 
    code: V4_CODE, 
    desc: 'Android PrintSpooler Matrix Port', 
    renderer: renderPDF_V4 
  }
];

export const getEngine = (version: EngineVersion): RenderFunction => {
  const engine = ENGINE_REGISTRY.find(e => e.id === version);
  return engine ? engine.renderer : ENGINE_REGISTRY[ENGINE_REGISTRY.length - 1].renderer;
};

export const getLatestEngineVersion = (): EngineVersion => {
  return ENGINE_REGISTRY[ENGINE_REGISTRY.length - 1].id;
};
