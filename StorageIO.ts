
import JSZip from 'jszip';

export class StorageIO {
  private cacheName: string;
  private cache: Cache | null = null;

  constructor(sessionId: string) {
    this.cacheName = `txt2pdf-session-${sessionId}`;
  }

  async init() {
    if (!this.cache) {
      this.cache = await caches.open(this.cacheName);
    }
  }

  /**
   * Saves a file to the cache with directory support.
   */
  async saveFile(path: string, blob: Blob) {
    await this.init();
    // Encode path components but keep slashes for the URL structure
    const safePath = path.split('/').map(encodeURIComponent).join('/');
    const url = new URL(`/_output/${safePath}`, self.location.origin).href;
    
    // CRITICAL FIX: HTTP headers only support ISO-8859-1.
    // We must encode the path to safely store Unicode filenames (emojis, etc.) in the header.
    await this.cache!.put(new Request(url), new Response(blob, {
      headers: { 
          'Content-Type': blob.type || 'application/pdf', 
          'Content-Length': blob.size.toString(),
          'X-Original-Path': encodeURIComponent(path) 
      }
    }));
  }

  async getFile(path: string): Promise<Blob | null> {
    await this.init();
    const safePath = path.split('/').map(encodeURIComponent).join('/');
    const url = new URL(`/_output/${safePath}`, self.location.origin).href;
    const response = await this.cache!.match(url);
    return response ? response.blob() : null;
  }

  async saveZipToCache(zipName: string, blob: Blob) {
    await this.init();
    // Ensure zip name is URL safe
    const safeName = encodeURIComponent(zipName);
    const url = new URL(`/_output/${safeName}`, self.location.origin).href;
    await this.cache!.put(new Request(url), new Response(blob, {
      headers: { 'Content-Type': 'application/zip' }
    }));
  }

  /**
   * Creates a ZIP from list of cached file paths.
   */
  async createZip(filePaths: string[]): Promise<Blob> {
    await this.init();
    const zip = new JSZip();
    let count = 0;
    
    for (const path of filePaths) {
      // path here comes from the cache URL decoding, so it is the original correct string
      const blob = await this.getFile(path);
      if (blob) {
          zip.file(path, blob);
          count++;
      }
    }
    
    if (count === 0) throw new Error("No files found to zip");
    
    return await zip.generateAsync({ type: 'blob' });
  }

  async clear() {
    await caches.delete(this.cacheName);
  }
  
  getCacheName() {
      return this.cacheName;
  }
}
