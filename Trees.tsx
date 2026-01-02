
import { ExtendedSlot } from './types';

const IGNORED_EXTENSIONS = ['.png', '.ttf', '.otf', '.woff', '.woff2'];

export const processTreesMode = (slot: ExtendedSlot): { file: File; path: string; basePath: string }[] => {
  const tasks: { file: File; path: string; basePath: string }[] = [];
  const basePath = slot.customPath || slot.id;

  // TREES MODE LOGIC:
  // 1. Accepts all files found in the uploaded folder and its subfolders.
  // 2. Preserves the directory structure relative to the Slot ID.
  // 3. Normalizes paths to handle cross-platform separators (Windows backslashes).

  slot.files.forEach(f => {
    // Safety check for invalid file objects
    if (!f) return;

    if (IGNORED_EXTENSIONS.some(ext => f.name.toLowerCase().endsWith(ext))) return;

    const rawRel = (f as any).webkitRelativePath;
    let finalPath = basePath;

    if (rawRel) {
       // Normalize separators to forward slash
       const normalized = rawRel.replace(/\\/g, '/');
       
       // Extract directory path: "Docs/Work/Notes.txt" -> "Docs/Work"
       const lastSlashIndex = normalized.lastIndexOf('/');
       
       if (lastSlashIndex !== -1) {
         const relDir = normalized.substring(0, lastSlashIndex);
         const cleanBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
         
         // Combine base path with the preserved directory structure
         finalPath = `${cleanBasePath}/${relDir}`;
       }
    }

    tasks.push({ 
      file: f, 
      path: finalPath,
      basePath: basePath
    });
  });

  return tasks;
};
