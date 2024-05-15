import * as React from 'react';

export const PDFViewerContext = React.createContext<{
  showLayoutAnalysis: boolean;
}>({
  showLayoutAnalysis: false,
});
