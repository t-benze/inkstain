import * as PDFJSLib from 'pdfjs-dist';
import { Canvas } from 'canvas';

export class PDFRenderer {
  static pdfjsLib: Promise<typeof PDFJSLib> = import(
    'pdfjs-dist/legacy/build/pdf.mjs'
  ).then((pdfjs) => {
    pdfjs.GlobalWorkerOptions.workerSrc =
      'pdfjs-dist/legacy/build/pdf.worker.mjs';
    return pdfjs;
  });

  static async loadPDFFile(pdfPath: string) {
    const doc = await PDFRenderer.pdfjsLib.then((pdfjs) => {
      return pdfjs.getDocument(pdfPath).promise;
    });
    return doc;
  }

  static async renderPdfPageToImage(
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
