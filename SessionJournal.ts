
interface QueueItem {
  file: File;
  path: string;
  basePath: string;
}

export class SessionJournal {
  private static KEY = 'txt2pdf_active_session_v5';

  static startNew(sessionId: string, baseName: string, queue: QueueItem[]) {
    const session = {
      id: sessionId,
      baseName,
      // Which part file are we currently writing to?
      currentPart: 1,
      // How many pages are SAFELY committed in the current part?
      pagesInCurrentPart: 0,
      // Total safe pages across all parts (global progress)
      totalSafePages: 0,
      
      // File processing state
      currentFileIndex: 0,
      // Global page index where the current file started (for rewinding input stream if needed)
      fileStartGlobalPage: 0,
      
      // Used to store non-serializable file references if needed, 
      // though typically lost on refresh without re-selection.
      // We store metadata for UI restoration.
      queue: queue.map(q => ({ path: q.path, basePath: q.basePath, fileName: q.file.name })), 
      params: null as any
    };
    this.save(session);
    return session;
  }

  static update(updateData: Partial<any>) {
    const current = this.get();
    if (current) {
      const next = { ...current, ...updateData };
      this.save(next);
      return next;
    }
    return null;
  }

  static save(session: any) {
    localStorage.setItem(this.KEY, JSON.stringify(session));
  }

  static get() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY) || 'null');
    } catch {
      return null;
    }
  }

  static clear() {
    localStorage.removeItem(this.KEY);
  }
}
