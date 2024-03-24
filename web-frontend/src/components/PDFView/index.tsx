import * as React from 'react';
import { useDocument } from '~/web/hooks/useDocument';
import { PDFViewer } from './PDFViewer';
import type { PDFViewHandle } from './PDFViewer';

export const PDFView = React.forwardRef<PDFViewHandle, { name: string }>(
  ({ name }, ref) => {
    const url = useDocument(name);
    return <PDFViewer ref={ref} url={url} />;
  }
);
export { PDFViewHandle };

export { PDFOutlineView } from './PDFOutlineView';
export { PDFThumbnailView } from './PDFThumbnailView';
