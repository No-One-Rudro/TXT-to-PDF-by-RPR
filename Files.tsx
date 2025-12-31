
import { ExtendedSlot } from './types';

const IGNORED_EXTENSIONS = ['.png', '.ttf', '.otf', '.woff', '.woff2'];

export const processFilesMode = (slot: ExtendedSlot): { file: File; path: string; basePath: string }[] => {
  const tasks: { file: File; path: string; basePath: string }[] = [];
  const basePath = slot.customPath || slot.id;

  // FILES MODE LOGIC:
  // 1. Files selected in "Files" mode should ALWAYS be flattened to the slot root.
  // 2. We explicitly IGNORE webkitRelativePath directory structure here.
  // 3. This ensures that if a user drags a folder into a "File" slot, 
  //    all files inside are extracted and placed flat, not in a tree.

  slot.files.forEach(f => {
    // Filter excluded types
    if (IGNORED_EXTENSIONS.some(ext => f.name.toLowerCase().endsWith(ext))) return;

    // In FILES mode, we purposely discard the relative path structure.
    // Everything goes to 'A1/' or 'CustomPath/' directly.
    tasks.push({ 
      file: f, 
      path: basePath,
      basePath: basePath 
    });
  });

  return tasks;
};
