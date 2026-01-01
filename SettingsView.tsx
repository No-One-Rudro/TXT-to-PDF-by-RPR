
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ThemeType, CustomFont } from './types';
import ThemesView from './ThemesView';
import FontsView from './FontsView';
import InterfaceColorView from './InterfaceColorView';
import { SettingsMenu } from './SettingsMenu';

interface Props {
  onBack: () => void;
  theme: ThemeType;
  setTheme: (t: ThemeType) => void;
  userCustomColor: string;
  setUserCustomColor: (c: string) => void;
  userBackgroundColor: string;
  setUserBackgroundColor: (c: string) => void;
  customBgImage: string | null;
  onBgImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  useDirPicker: boolean;
  setUseDirPicker: (v: boolean) => void;
  keepSizePref: boolean;
  setKeepSizePref: (v: boolean) => void;
  onRunDiagnostic: () => void;
  onOpenRenderCodes: () => void;
  onOpenApi: () => void;
  fonts: CustomFont[];
  onAddFonts: (files: File[]) => void;
  onRemoveFont: (id: string) => void;
  onOcrPrompt: (files: File[]) => void;
  t: any;
}

const SettingsView: React.FC<Props> = (props) => {
  const [subView, setSubView] = useState<'main' | 'themes' | 'interface_color' | 'fonts'>('main');

  if (subView === 'themes') {
    return (
      <ThemesView 
        onBack={() => setSubView('main')}
        theme={props.theme}
        setTheme={props.setTheme}
        userBackgroundColor={props.userBackgroundColor}
        setUserBackgroundColor={props.setUserBackgroundColor}
        onBgImageUpload={props.onBgImageUpload}
        t={props.t}
      />
    );
  }

  if (subView === 'interface_color') {
    return (
      <InterfaceColorView 
        onBack={() => setSubView('main')}
        userCustomColor={props.userCustomColor}
        setUserCustomColor={props.setUserCustomColor}
        t={props.t}
      />
    );
  }

  if (subView === 'fonts') {
    return (
      <FontsView 
        onBack={() => setSubView('main')}
        fonts={props.fonts}
        onAddFonts={props.onAddFonts}
        onRemoveFont={props.onRemoveFont}
        onOcrPrompt={props.onOcrPrompt}
        t={props.t}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full p-8 flex-1 flex flex-col animate-in fade-in duration-300">
      <header className="py-10 flex items-center">
        <button onClick={props.onBack} className={`p-4 ${props.t.button} rounded-2xl mr-6 active:scale-90 transition-transform`}><ArrowLeft size={24} /></button>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">System Core</h1>
      </header>

      <SettingsMenu 
        userCustomColor={props.userCustomColor}
        useDirPicker={props.useDirPicker}
        setUseDirPicker={props.setUseDirPicker}
        keepSizePref={props.keepSizePref}
        setKeepSizePref={props.setKeepSizePref}
        onSubViewChange={setSubView}
        onOpenApi={props.onOpenApi}
        onOpenRenderCodes={props.onOpenRenderCodes}
        onRunDiagnostic={props.onRunDiagnostic}
        t={props.t}
      />

      <footer className="mt-auto py-12 text-center opacity-10">
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">TXT to PDF Universal Console v4.1</p>
      </footer>
    </div>
  );
};

export default SettingsView;
