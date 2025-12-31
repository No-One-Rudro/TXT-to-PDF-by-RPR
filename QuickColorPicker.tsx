
import React, { useState, useEffect } from 'react';
import { Hash } from 'lucide-react';

interface Props {
  initialHex: string;
  onUpdate: (hex: string) => void;
  t: any;
}

const hexToHsl = (hex: string) => {
  let r = 0, g = 0, b = 0;
  const hx = hex.startsWith('#') ? hex : '#' + hex;
  if (hx.length === 4) {
    r = parseInt("0x" + hx[1] + hx[1]);
    g = parseInt("0x" + hx[2] + hx[2]);
    b = parseInt("0x" + hx[3] + hx[3]);
  } else if (hx.length === 7) {
    r = parseInt("0x" + hx.substring(1, 3));
    g = parseInt("0x" + hx.substring(3, 5));
    b = parseInt("0x" + hx.substring(5, 7));
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const hslToHex = (h: number, s: number, l: number) => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
};

export const QuickColorPicker: React.FC<Props> = ({ initialHex, onUpdate, t }) => {
  const [hsl, setHsl] = useState(() => hexToHsl(initialHex));
  const [hexInput, setHexInput] = useState(initialHex.toUpperCase());

  const handleSliderChange = (key: 'h' | 's' | 'l', val: number) => {
    const newHsl = { ...hsl, [key]: val };
    setHsl(newHsl);
    const hex = hslToHex(newHsl.h, newHsl.s, newHsl.l);
    setHexInput(hex);
    onUpdate(hex);
  };

  const handleHexInput = (val: string) => {
    setHexInput(val);
    const clean = val.startsWith('#') ? val : '#' + val;
    if (/^#[0-9A-F]{6}$/i.test(clean)) {
      setHsl(hexToHsl(clean));
      onUpdate(clean);
    }
  };

  // Dynamic Gradients Logic
  // Hue Gradient: Rainbow, but darkened by Lightness to simulate "lights out"
  const hueGradient = `linear-gradient(to right, 
    hsl(0, ${hsl.s}%, ${hsl.l}%), 
    hsl(60, ${hsl.s}%, ${hsl.l}%), 
    hsl(120, ${hsl.s}%, ${hsl.l}%), 
    hsl(180, ${hsl.s}%, ${hsl.l}%), 
    hsl(240, ${hsl.s}%, ${hsl.l}%), 
    hsl(300, ${hsl.s}%, ${hsl.l}%), 
    hsl(360, ${hsl.s}%, ${hsl.l}%))`;

  // Saturation Gradient: Grayscale (at current L) -> Full Color (at current L)
  const satGradient = `linear-gradient(to right, hsl(${hsl.h}, 0%, ${hsl.l}%), hsl(${hsl.h}, 100%, ${hsl.l}%))`;
  
  // Lightness (Brightness) Gradient: Black -> Current Color -> White
  const lightGradient = `linear-gradient(to right, #000, hsl(${hsl.h}, ${hsl.s}%, 50%), #fff)`;

  return (
    <div className="flex flex-col space-y-8 w-full">
      
      {/* Top Row: Preview & Input */}
      <div className="flex items-center space-x-6">
        <div className="w-16 h-16 rounded-2xl border-4 border-white/10 shadow-lg shrink-0" style={{ backgroundColor: hslToHex(hsl.h, hsl.s, hsl.l) }} />
        <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl flex items-center px-4 py-3 space-x-3">
          <Hash size={20} className="text-zinc-500" />
          <input 
            type="text" 
            value={hexInput}
            onChange={(e) => handleHexInput(e.target.value.toUpperCase())}
            className="w-full bg-transparent font-mono text-xl font-black text-white outline-none placeholder:text-zinc-700 uppercase"
          />
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-6">
        {/* Hue */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500 tracking-widest px-1">
            <span>Hue</span>
            <span>{hsl.h}°</span>
          </div>
          <div className="relative h-10 rounded-xl overflow-hidden shadow-inner ring-1 ring-white/5">
            <div className="absolute inset-0" style={{ background: hueGradient }} />
            <input 
              type="range" min="0" max="360" value={hsl.h}
              onChange={(e) => handleSliderChange('h', parseInt(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Saturation */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500 tracking-widest px-1">
            <span>Saturation</span>
            <span>{hsl.s}%</span>
          </div>
          <div className="relative h-10 rounded-xl overflow-hidden shadow-inner ring-1 ring-white/5">
            <div className="absolute inset-0" style={{ background: satGradient }} />
            <input 
              type="range" min="0" max="100" value={hsl.s}
              onChange={(e) => handleSliderChange('s', parseInt(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Lightness (Brightness) */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500 tracking-widest px-1">
            <span>Brightness</span>
            <span>{hsl.l}%</span>
          </div>
          <div className="relative h-10 rounded-xl overflow-hidden shadow-inner ring-1 ring-white/5">
            <div className="absolute inset-0" style={{ background: lightGradient }} />
            <input 
              type="range" min="0" max="100" value={hsl.l}
              onChange={(e) => handleSliderChange('l', parseInt(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
