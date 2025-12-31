
import React, { useState } from 'react';
import { ArrowLeft, Sun, Moon, Monitor, Zap, Palette, Image as ImageIcon, Upload, Trash2, LayoutTemplate } from 'lucide-react';
import { ThemeType } from './types';
import { ThemeOption } from './ThemeOption';
import { BackgroundPicker } from './BackgroundPicker';

interface Props {
  onBack: () => void;
  theme: ThemeType;
  setTheme: (t: ThemeType) => void;
  userBackgroundColor: string;
  setUserBackgroundColor: (c: string) => void;
  onBgImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  t: any;
}

const ThemesView: React.FC<Props> = ({ 
  onBack, theme, setTheme,
  userBackgroundColor, setUserBackgroundColor, onBgImageUpload, t 
}) => {
  const [currentBg, setCurrentBg] = useState<string | null>(localStorage.getItem('citadel_bg_image'));

  const themeOptions = [
    { type: ThemeType.AMOLED, label: 'OLED Black', icon: <Zap size={20} className={t.iconClass} />, desc: 'Pure Black' },
    { type: ThemeType.DARK, label: 'Dark Mode', icon: <Moon size={20} className={t.iconClass} />, desc: 'Standard Gray' },
    { type: ThemeType.WHITE, label: 'Light Mode', icon: <Sun size={20} className={t.iconClass} />, desc: 'Standard White' },
    { type: ThemeType.SYSTEM, label: 'System', icon: <Monitor size={20} className={t.iconClass} />, desc: 'Device Setting' },
    { type: ThemeType.CUSTOM_COLOR, label: 'Custom Solid', icon: <Palette size={20} className={t.iconClass} />, desc: 'Pick Background Color' },
    { type: ThemeType.CUSTOM_IMAGE, label: 'Custom Image', icon: <ImageIcon size={20} className={t.iconClass} />, desc: 'Background Photo' },
  ];

  return (
    <div className="max-w-2xl mx-auto w-full p-8 flex-1 flex flex-col animate-in fade-in duration-500 pb-48">
      <header className="py-10 flex items-center mb-6">
        <button onClick={onBack} className={`p-4 ${t.button} rounded-2xl mr-6 active:scale-90 transition-transform shadow-xl`}>
          <ArrowLeft size={24} color={t.iconColor} />
        </button>
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Themes</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-green-accent/60 mt-2">Background & Atmosphere</p>
        </div>
      </header>

      <div className="space-y-4 mb-10">
        {themeOptions.map((opt) => (
          <div key={opt.type} className="flex flex-col space-y-4">
            <ThemeOption 
              type={opt.type} 
              label={opt.label} 
              icon={opt.icon} 
              desc={opt.desc} 
              isActive={theme === opt.type} 
              onSelect={() => setTheme(opt.type)}
              t={t}
            />

            {/* Custom Background Picker Logic */}
            {theme === ThemeType.CUSTOM_COLOR && opt.type === ThemeType.CUSTOM_COLOR && (
              <BackgroundPicker userBackgroundColor={userBackgroundColor} setUserBackgroundColor={setUserBackgroundColor} t={t} />
            )}

            {/* Custom Image Logic */}
            {theme === ThemeType.CUSTOM_IMAGE && opt.type === ThemeType.CUSTOM_IMAGE && (
              <div className="p-8 bg-zinc-950/80 rounded-[4rem] border-2 border-pink-400/20 space-y-8 animate-in slide-in-from-top-4 shadow-3xl">
                <div className="w-full aspect-video rounded-[3rem] bg-black/60 border-4 border-white/10 overflow-hidden relative shadow-inner">
                  {currentBg ? <img src={currentBg} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-10"><ImageIcon size={64}/></div>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex-1 p-8 bg-white/5 border border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center space-y-2 cursor-pointer hover:bg-white/10">
                    <Upload size={24} color={t.iconColor} />
                    <span className="text-[10px] font-black uppercase">Upload Texture</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                       onBgImageUpload(e);
                       if (e.target.files?.[0]) {
                         const r = new FileReader(); r.onload = (ev) => setCurrentBg(ev.target?.result as string); r.readAsDataURL(e.target.files[0]);
                       }
                    }} />
                  </label>
                  <button onClick={() => { localStorage.removeItem('citadel_bg_image'); setCurrentBg(null); }} className="flex-1 p-8 bg-red-500/5 border border-red-500/10 rounded-[2.5rem] flex flex-col items-center justify-center space-y-2 hover:bg-red-500/10">
                    <Trash2 size={24} className="text-red-500" />
                    <span className="text-[10px] font-black uppercase">Purge</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThemesView;
