import * as React from 'react';
import { PDFDocumentProxy, PDFDocumentLoadingTask } from 'pdfjs-dist';
import * as pdfjsLib from 'pdfjs-dist';

export const usePDFDocument = ({
  url,
  onDocumentLoadSuccess,
  onDocumentLoadFailure,
}: {
  url: string;
  onDocumentLoadSuccess?: (document: PDFDocumentProxy) => void;
  onDocumentLoadFailure?: (error: Error) => void;
}) => {
  const [pdfDocument, setPDFDocument] = React.useState<PDFDocumentProxy | null>(
    null
  );
  const loadingTaskRef = React.useRef<PDFDocumentLoadingTask | null>(null);
  React.useEffect(() => {
    if (!loadingTaskRef.current) {
      loadingTaskRef.current = pdfjsLib.getDocument(url);
    }
    loadingTaskRef.current.promise
      .then((loadedPdfDocument) => {
        setPDFDocument(loadedPdfDocument);
        onDocumentLoadSuccess?.(loadedPdfDocument);
      })
      .catch((error: Error) => {
        onDocumentLoadFailure?.(error);
      })
      .finally(() => {
        loadingTaskRef.current = null;
      });
  }, [
    url,
    // pdfDocument,
    loadingTaskRef,
    onDocumentLoadFailure,
    onDocumentLoadSuccess,
  ]);
  return pdfDocument;
};
