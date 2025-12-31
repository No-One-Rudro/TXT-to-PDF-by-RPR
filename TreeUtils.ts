
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
          size: isFile ? file.size : 0,
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

  if (customPath) {
    return {
      name: `${rootName} (Target: ${customPath})`,
      type: 'folder',
      children: [root]
    };
  }
  return root;
};
