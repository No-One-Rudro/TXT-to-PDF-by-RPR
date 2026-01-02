
export interface TreeNode {
  name: string;
  type: 'file' | 'folder';
  children: TreeNode[];
  file?: File;
  lastModified?: number;
  size?: number;
  extension?: string;
  matchesSearch?: boolean;
}

export const buildTreeFromFiles = (files: File[], rootName: string, customPath?: string, searchTerm?: string): TreeNode => {
  const root: TreeNode = {
    name: rootName,
    type: 'folder',
    children: [],
  };

  const term = searchTerm?.toLowerCase() || '';

  files.forEach(file => {
    // Safety Check: Ensure file exists before processing
    if (!file) return;

    const fullPath = (file as any).webkitRelativePath || file.name;
    const parts = fullPath.split('/');
    let current = root;
    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      let existing = current.children.find(c => c.name === part && c.type === (isFile ? 'file' : 'folder'));
      if (!existing) {
        existing = {
          name: part,
          type: isFile ? 'file' : 'folder',
          children: [],
          file: isFile ? file : undefined,
          lastModified: file.lastModified,
          // Safe Access
          size: (isFile && file) ? file.size : 0,
          extension: isFile ? part.split('.').pop() || '' : '',
          matchesSearch: term ? part.toLowerCase().includes(term) : false
        };
        current.children.push(existing);
      }
      current = existing;
    });
  });

  if (term) {
    const filterNode = (node: TreeNode): boolean => {
      const childrenMatch = node.children.some(filterNode);
      const selfMatch = node.name.toLowerCase().includes(term);
      node.children = node.children.filter(c => c.matchesSearch || c.children.length > 0);
      node.matchesSearch = selfMatch;
      return selfMatch || childrenMatch;
    };
    filterNode(root);
  }

  // Auto-calculate folder stats so sorting by SIZE/DATE works for directories too
  calculateFolderStats(root);

  if (customPath) {
    return {
      name: `${rootName} (Target: ${customPath})`,
      type: 'folder',
      children: [root],
      size: root.size,
      lastModified: root.lastModified
    };
  }
  return root;
};

export const calculateFolderStats = (node: TreeNode) => {
    if (node.type === 'file') return;
    let size = 0;
    let time = 0;
    node.children.forEach(c => {
        calculateFolderStats(c);
        size += (c.size || 0);
        if ((c.lastModified || 0) > time) time = c.lastModified || 0;
    });
    node.size = size;
    node.lastModified = time;
};

export const sortTree = (
  node: TreeNode, 
  folderCriteria: string, 
  folderDesc: boolean, 
  fileCriteria: string, 
  fileDesc: boolean
) => {
    if (node.children && node.children.length > 0) {
        node.children.sort((a, b) => {
             // Always keep folders on top for better UX
             if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
             
             const isFolder = a.type === 'folder';
             const criteria = isFolder ? folderCriteria : fileCriteria;
             const desc = isFolder ? folderDesc : fileDesc;
             
             let vA: any = a.name;
             let vB: any = b.name;
             
             if (criteria === 'SIZE') { vA = a.size || 0; vB = b.size || 0; }
             if (criteria === 'DATE') { vA = a.lastModified || 0; vB = b.lastModified || 0; }
             if (criteria === 'TYPE') { vA = a.extension || ''; vB = b.extension || ''; }
             
             if (typeof vA === 'string') vA = vA.toLowerCase();
             if (typeof vB === 'string') vB = vB.toLowerCase();
             
             if (vA < vB) return desc ? 1 : -1;
             if (vA > vB) return desc ? -1 : 1;
             return 0;
        });
        // Recursively sort children
        node.children.forEach(c => sortTree(c, folderCriteria, folderDesc, fileCriteria, fileDesc));
    }
};
