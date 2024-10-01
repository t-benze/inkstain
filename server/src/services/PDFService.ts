import type * as PDFJSLib from 'pdfjs-dist';
import { Canvas } from 'canvas';

export class PDFService {
  private pdfjsLib: Promise<typeof PDFJSLib>;
  private pdfFileCache: Map<string, PDFJSLib.PDFDocumentProxy> = new Map();

  constructor() {
    this.pdfjsLib = import('pdfjs-dist/legacy/build/pdf.mjs').then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc =
        'pdfjs-dist/legacy/build/pdf.worker.mjs';
      return pdfjs;
    });
  }

  async loadPDFFile(pdfPath: string) {
    const pdfjs = await this.pdfjsLib;
    let doc = this.pdfFileCache.get(pdfPath);
    if (!doc) {
      doc = await pdfjs.getDocument(pdfPath).promise;
      this.pdfFileCache.set(pdfPath, doc);
    }
    return doc;
  }

  public async renderPdfPageToImage(
    doc: PDFJSLib.PDFDocumentProxy,
    pageNumber = 1
  ): Promise<string> {
    const page = await doc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = new Canvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');
    await page.render({
      //@ts-expect-error canvasContext is not typed
      canvasContext: context,
      viewport: viewport,
    }).promise;
    return canvas.toDataURL('image/png');
  }
}
