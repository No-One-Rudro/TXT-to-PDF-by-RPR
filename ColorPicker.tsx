
import React, { useRef, useState, useEffect } from 'react';
import { Hash, Sliders } from 'lucide-react';

const hsvToRgb = (h: number, s: number, v: number) => {
  const f = (n: number, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  const r = Math.round(f(5) * 255).toString(16).padStart(2, '0');
  const g = Math.round(f(3) * 255).toString(16).padStart(2, '0');
  const b = Math.round(f(1) * 255).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
};

const hexToRgb = (hex: string) => {
  let r = 0, g = 0, b = 0;
  const hx = hex.startsWith('#') ? hex : '#' + hex;
  if (hx.length === 4) {
    r = parseInt(hx[1] + hx[1], 16); g = parseInt(hx[2] + hx[2], 16); b = parseInt(hx[3] + hx[3], 16);
  } else if (hx.length === 7) {
    r = parseInt(hx.substring(1, 3), 16); g = parseInt(hx.substring(3, 5), 16); b = parseInt(hx.substring(5, 7), 16);
  }
  return { r, g, b };
};

const rgbToHex = (r: number, g: number, b: number) => {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const hexToHsv = (hex: string) => {
  const { r: rRaw, g: gRaw, b: bRaw } = hexToRgb(hex);
  const r = rRaw / 255; const g = gRaw / 255; const b = bRaw / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0; const s = max === 0 ? 0 : d / max; const v = max;
  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s, v };
};

interface Props {
  initialHex: string;
  onUpdate: (hex: string) => void;
  t: any;
}

export const ColorPicker: React.FC<Props> = ({ initialHex, onUpdate, t }) => {
  const svRef = useRef<HTMLCanvasElement>(null);
  const hRef = useRef<HTMLCanvasElement>(null);
  const [hsv, setHsv] = useState(() => hexToHsv(initialHex));
  const [rgb, setRgb] = useState(() => hexToRgb(initialHex));
  const [hexInput, setHexInput] = useState(initialHex.toUpperCase());
  const dragRef = useRef({ sv: false, hue: false });

  const SIZE = 300;
  const HUE_WIDTH = 60;
  const SCALE = window.devicePixelRatio || 1;

  useEffect(() => {
    const sv = svRef.current;
    const hue = hRef.current;
    if (!sv || !hue) return;

    sv.width = SIZE * SCALE; sv.height = SIZE * SCALE;
    sv.style.width = `${SIZE}px`; sv.style.height = `${SIZE}px`;
    hue.width = HUE_WIDTH * SCALE; hue.height = SIZE * SCALE;
    hue.style.width = `${HUE_WIDTH}px`; hue.style.height = `${SIZE}px`;

    const svCtx = sv.getContext('2d')!;
    const hCtx = hue.getContext('2d')!;
    svCtx.scale(SCALE, SCALE);
    hCtx.scale(SCALE, SCALE);

    const renderLoop = () => {
      const hGrad = hCtx.createLinearGradient(0, 0, 0, SIZE);
      ["red", "yellow", "lime", "cyan", "blue", "magenta", "red"].forEach((c, i, a) => hGrad.addColorStop(i / (a.length - 1), c));
      hCtx.fillStyle = hGrad;
      hCtx.fillRect(0, 0, HUE_WIDTH, SIZE);
      const hy = (hsv.h / 360) * SIZE;
      hCtx.strokeStyle = 'white'; hCtx.lineWidth = 6; hCtx.strokeRect(0, hy - 4, HUE_WIDTH, 8);

      svCtx.fillStyle = `hsl(${hsv.h}, 100%, 50%)`;
      svCtx.fillRect(0, 0, SIZE, SIZE);
      const white = svCtx.createLinearGradient(0, 0, SIZE, 0);
      white.addColorStop(0, "white"); white.addColorStop(1, "transparent");
      svCtx.fillStyle = white; svCtx.fillRect(0, 0, SIZE, SIZE);
      const black = svCtx.createLinearGradient(0, 0, 0, SIZE);
      black.addColorStop(0, "transparent"); black.addColorStop(1, "black");
      svCtx.fillStyle = black; svCtx.fillRect(0, 0, SIZE, SIZE);

      const cx = hsv.s * SIZE; const cy = (1 - hsv.v) * SIZE;
      svCtx.beginPath(); svCtx.arc(cx, cy, 12, 0, Math.PI * 2);
      svCtx.strokeStyle = "white"; svCtx.lineWidth = 4;
      svCtx.shadowBlur = 12; svCtx.shadowColor = 'rgba(0,0,0,0.8)';
      svCtx.stroke();
    };
    renderLoop();
  }, [hsv, SCALE]);

  const updateFromHsv = (newHsv: typeof hsv) => {
    setHsv(newHsv);
    const hex = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
    setRgb(hexToRgb(hex));
    setHexInput(hex.toUpperCase());
    onUpdate(hex);
  };

  const handlePointer = (e: React.PointerEvent, type: 'sv' | 'hue') => {
    const rect = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect();
    const x = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const y = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1);
    if (type === 'sv') updateFromHsv({ ...hsv, s: x, v: 1 - y });
    else updateFromHsv({ ...hsv, h: y * 360 });
  };

  const handleRgbChange = (channel: 'r' | 'g' | 'b', value: number) => {
    const newRgb = { ...rgb, [channel]: value };
    setRgb(newRgb);
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setHexInput(hex.toUpperCase());
    setHsv(hexToHsv(hex));
    onUpdate(hex);
  };

  const handleHexInput = (val: string) => {
    setHexInput(val);
    const clean = val.startsWith('#') ? val : '#' + val;
    if (/^#[0-9A-F]{6}$/i.test(clean)) {
      onUpdate(clean);
      setRgb(hexToRgb(clean));
      setHsv(hexToHsv(clean));
    }
  };

  return (
    <div className="flex flex-col space-y-10 items-center w-full">
      <div className="flex space-x-10 items-center justify-center py-4 w-full">
        <canvas 
          ref={svRef} 
          className="rounded-[3.5rem] cursor-crosshair border-8 border-white/5 shadow-3xl touch-none"
          onPointerDown={e => { (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId); dragRef.current.sv = true; handlePointer(e, 'sv'); }}
          onPointerMove={e => dragRef.current.sv && handlePointer(e, 'sv')}
          onPointerUp={() => dragRef.current.sv = false}
        />
        <canvas 
          ref={hRef} 
          className="rounded-full cursor-ns-resize border-8 border-white/5 shadow-3xl touch-none"
          onPointerDown={e => { (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId); dragRef.current.hue = true; handlePointer(e, 'hue'); }}
          onPointerMove={e => dragRef.current.hue && handlePointer(e, 'hue')}
          onPointerUp={() => dragRef.current.hue = false}
        />
      </div>

      <div className="w-full bg-black/40 p-8 rounded-[3.5rem] border border-white/10 space-y-8 shadow-inner">
        <div className="flex items-center space-x-4 mb-4">
           <Sliders size={18} className="text-zinc-500" />
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Chroma Calibration</span>
        </div>
        {(['r', 'g', 'b'] as const).map(ch => (
          <div key={ch} className="flex items-center space-x-6">
            <span className="w-6 text-xs font-mono font-black uppercase text-zinc-500">{ch}</span>
            <input 
              type="range" min="0" max="255" value={rgb[ch]}
              onChange={e => handleRgbChange(ch, parseInt(e.target.value))}
              className="flex-1 accent-green-accent h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer"
            />
            <span className="w-10 text-right font-mono text-xs font-black text-green-accent">{rgb[ch]}</span>
          </div>
        ))}

        <div className="pt-6 border-t border-white/5 flex items-center space-x-4">
           <div className="p-4 bg-white/5 rounded-2xl"><Hash size={18} className="text-zinc-500" /></div>
           <input 
             type="text" value={hexInput}
             onChange={e => handleHexInput(e.target.value.toUpperCase())}
             className="flex-1 bg-transparent text-3xl font-mono font-black uppercase tracking-tighter text-white outline-none placeholder:text-zinc-800"
             placeholder="#000000"
           />
           <div className="w-14 h-14 rounded-2xl border-4 border-white/10 shadow-lg" style={{ backgroundColor: initialHex }} />
        </div>
      </div>
    </div>
  );
};
