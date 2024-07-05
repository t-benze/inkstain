import * as React from 'react';
import { PDFViewer } from './PDFViewer';
import type { PDFViewHandle } from './PDFViewer';

export const PDFView = React.forwardRef<
  PDFViewHandle,
  { spaceKey: string; documentPath: string }
>(({ documentPath, spaceKey }, ref) => {
  return (
    <PDFViewer ref={ref} spaceKey={spaceKey} documentPath={documentPath} />
  );
});
export { PDFViewHandle };
export { PDFOutlineView } from './PDFOutlineView';
export { PDFThumbnailView } from './PDFThumbnailView';
export { PDFAnnotatedThumbnails } from './PDFAnnotatedThumbnails';
