import { PDFDocumentProxy } from 'pdfjs-dist';
import { Canvas } from 'canvas';

export class PDFService {
  private pdfjsLib: typeof import('pdfjs-dist');
  private pdfFileCache: Map<string, PDFDocumentProxy> = new Map();

  constructor() {
    import('pdfjs-dist').then((pdfjs) => {
      this.pdfjsLib = pdfjs;
      this.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'pdfjs-dist/build/pdf.worker.min.mjs';
    });
  }

  async loadPDFFile(pdfPath: string) {
    let doc = this.pdfFileCache.get(pdfPath);
    if (!doc) {
      doc = await this.pdfjsLib.getDocument(pdfPath).promise;
      this.pdfFileCache.set(pdfPath, doc);
    }
    return doc;
  }

  public async renderPdfPageToImage(
    doc: PDFDocumentProxy,
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
