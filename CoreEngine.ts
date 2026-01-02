
import { getEngine, getLatestEngineVersion } from './EngineRegistry';
import { EngineVersion } from './types';

export const scanDirectory = async (dirHandle: any, extensions: string[], path = ''): Promise<File[]> => {
  const files: File[] = [];
  for await (const entry of dirHandle.values()) {
    const e = entry as any;
    if (e.kind === 'file') {
      const file = await e.getFile();
      if (extensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
        Object.defineProperty(file, 'webkitRelativePath', { 
          value: path + file.name, 
          writable: false, 
          configurable: true 
        });
        files.push(file);
      }
    } else if (e.kind === 'directory') {
      files.push(...await scanDirectory(e, extensions, path + e.name + '/'));
    }
  }
  return files;
};

// Proxies to keep imports simple in App.tsx if needed, or App can use registry directly
export { getEngine, getLatestEngineVersion };
