
import React from 'react';
import { Printer, Globe } from 'lucide-react';
import SizeChartDrawer from './SizeChartDrawer';
import ProcessingMatrix from './ProcessingMatrix';
import SettingsView from './SettingsView';
import PathsView from './PathsView';
import ConfigView from './ConfigView';
import InspectorModal from './InspectorModal';
import RenderCodesView from './RenderCodesView';
import SetApiView from './SetApiView';
import { TerminalPathModal } from './TerminalPathModal';
import { useAppLogic } from './useAppLogic';

const App: React.FC = () => {
  const { 
    state, 
    refs, 
    processor, 
    t, 
    handlers 
  } = useAppLogic();

  return (
    <div className={`min-h-screen ${t.root} flex flex-col overflow-y-auto custom-scrollbar transition-colors duration-500`} style={t.style}>
      {state.mainView === 'splash' && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center animate-pulse">
          <Printer size={100} className="text-green-accent" />
          <h1 className="text-5xl font-black italic mt-8 tracking-tighter">TXT to PDF<span className="text-green-accent">4.5</span></h1>
        </div>
      )}

      {processor.ocrQueue && (
        <div className="fixed inset-0 z-[9500] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-8">
          <div className="w-full max-w-lg bg-zinc-950 border border-white/10 rounded-[4rem] p-12 text-center shadow-3xl">
            <Globe size={64} className="text-blue-400 mx-auto mb-8" />
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Neural Mapping</h2>
            <p className="text-zinc-400 text-sm mb-10">Detected unknown glyphs in source. Trigger AI training sequence?</p>
            <div className="flex space-x-4">
              <button onClick={() => processor.processOcr(state.apiConfig, () => handlers.triggerStart())} className="flex-1 py-8 bg-green-accent text-black font-black uppercase rounded-[2.5rem] text-xl italic">EXECUTE</button>
              <button onClick={() => { processor.setOcrQueue(null); handlers.triggerStart(); }} className="flex-1 py-8 bg-zinc-900 rounded-[2.5rem] font-black uppercase text-xl italic border border-white/5 text-white">IGNORE</button>
            </div>
          </div>
        </div>
      )}

      {state.activeView === 'paths' && 
        <PathsView 
          slots={state.inputSlots} 
          activeMode={'MIXED_MODE'} 
          onBack={() => {}} 
          onNext={() => {
            const hasFiles = state.inputSlots.some(s => s.files.length > 0);
            if (hasFiles) {
              state.setMainView('config');
            } else {
              alert("INPUT MATRIX EMPTY. CAPTURE DATA TO PROCEED.");
            }
          }} 
          onOpenSettings={() => state.setMainView('settings')} 
          onAddSlot={() => state.setInputSlots([...state.inputSlots, { id: `A${handlers.toSubscript(state.inputSlots.length + 1)}`, type: 'file', files: [], pathDisplay: '' }])} 
          onRemoveSlot={handlers.handleRemoveSlot} 
          onToggleType={(i, type) => { const ns = [...state.inputSlots]; ns[i].type = type; state.setInputSlots(ns); }} 
          onInspect={() => state.setIsInspectorOpen(true)} 
          onPickSpecific={handlers.handlePickSpecific} 
          onRunDiagnostic={() => handlers.triggerStart(true)} 
          t={t} 
        />
      }
      
      {state.activeView === 'config' && 
        <ConfigView 
          selectedSize={state.selectedSize} 
          customWidth={state.customWidth} 
          customHeight={state.customHeight} 
          outputPreference={state.outputPreference} 
          borderConfig={state.borderConfig}
          setBorderConfig={state.setBorderConfig}
          onBack={() => state.setMainView('paths')} 
          onDeploy={() => handlers.triggerStart()} 
          onOpenSizeChart={() => state.setIsSizeDrawerOpen(true)} 
          setCustomWidth={state.setCustomWidth} 
          setCustomHeight={state.setCustomHeight} 
          setOutputPreference={state.setOutputPreference}
          processingMode={state.processingMode}
          setProcessingMode={state.setProcessingMode}
          t={t} 
        />
      }
      
      {processor.viewState === 'processing' && (
        <ProcessingMatrix 
          percentFiles={processor.totalFilesCount ? (processor.fileProgressCount / processor.totalFilesCount) * 100 : 0} 
          percentSize={processor.totalBytes ? (processor.processedBytes / processor.totalBytes) * 100 : 0} 
          processedBytes={processor.processedBytes}
          totalBytes={processor.totalBytes}
          percentPage={processor.currentPageProgress} 
          log={processor.log} 
          isFinished={processor.isFinished} 
          zipUrl={processor.zipUrl}
          outputCacheName={processor.outputCacheName}
          generatedFiles={processor.generatedFiles}
          onReturn={() => { processor.setViewState('paths'); state.setMainView('paths'); }} 
          isPartial={processor.isPartial}
          remainingQueue={processor.remainingQueue}
          partNumber={processor.partNumber}
          onContinue={processor.continueProcess}
          sessionBaseName={processor.sessionBaseName}
          t={t} 
        />
      )}
      
      {state.activeView === 'settings' && (
        <SettingsView 
          onBack={() => state.setMainView('paths')} 
          theme={state.theme} 
          setTheme={state.setTheme} 
          userCustomColor={state.userCustomColor} 
          setUserCustomColor={state.setUserCustomColor} 
          userBackgroundColor={state.userBackgroundColor} 
          setUserBackgroundColor={state.setUserBackgroundColor} 
          customBgImage={state.customBgImage} 
          onBgImageUpload={handlers.handleBgImageUpload} 
          useDirPicker={state.useDirPicker} 
          setUseDirPicker={state.setUseDirPicker} 
          keepSizePref={state.keepSizePref} 
          setKeepSizePref={state.setKeepSizePref} 
          onRunDiagnostic={() => handlers.triggerStart(true)} 
          onOpenRenderCodes={() => state.setMainView('render_codes')} 
          onOpenApi={() => state.setMainView('api')} 
          fonts={state.customFonts} 
          onAddFonts={handlers.handleAddFonts} 
          onRemoveFont={(id) => state.setCustomFonts(prev => prev.filter(f => f.id !== id))} 
          onOcrPrompt={(fs) => processor.setOcrQueue(fs.map(f => ({char: f.name})))} 
          t={t} 
        />
      )}
      
      {state.activeView === 'render_codes' && (
        <RenderCodesView 
          onBack={() => state.setMainView('settings')} 
          selectedEngine={state.selectedEngine} 
          onSelectEngine={state.setSelectedEngine} 
          t={t} 
        />
      )}
      
      {state.activeView === 'api' && (
        <SetApiView 
          onBack={() => state.setMainView('settings')} 
          config={state.apiConfig} 
          setConfig={state.setApiConfig} 
          t={t} 
        />
      )}
      
      {state.isInspectorOpen && (
        <InspectorModal 
          slots={state.inputSlots} onClose={() => state.setIsInspectorOpen(false)} t={t}
        />
      )}
      
      <SizeChartDrawer 
        isOpen={state.isSizeDrawerOpen} 
        onClose={() => state.setIsSizeDrawerOpen(false)} 
        onSelect={(s) => { state.setSelectedSize(s); state.setCustomWidth(s.width.toString()); state.setCustomHeight(s.height.toString()); state.setIsSizeDrawerOpen(false); }} 
      />
      
      <TerminalPathModal 
        isOpen={state.terminalTargetSlot !== null} 
        currentId={state.terminalTargetSlot !== null ? state.inputSlots[state.terminalTargetSlot].id : ''}
        onClose={() => state.setTerminalTargetSlot(null)}
        onConfirm={(path) => { if (state.terminalTargetSlot !== null) { const ns = [...state.inputSlots]; ns[state.terminalTargetSlot].customPath = path; ns[state.terminalTargetSlot].pathDisplay = path; state.setInputSlots(ns); state.setTerminalTargetSlot(null); } }}
      />

      <input 
        type="file" 
        ref={refs.fileInputRef} 
        className="hidden" 
        multiple 
        onChange={handlers.handleFileInputChange} 
      />
      <input 
        type="file" 
        ref={refs.folderInputRef} 
        className="hidden" 
        {...({ webkitdirectory: "", directory: "" } as any)} 
        onChange={handlers.handleFolderInputChange} 
      />
    </div>
  );
};

export default App;
