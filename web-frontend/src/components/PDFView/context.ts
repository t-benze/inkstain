import * as React from 'react';
import { Annotation, AnnotationData } from '@inkstain/client-api';

type ContextType = {
  showLayoutAnalysis: boolean;
  bookmarks: Record<number, Annotation>;
  addAnnotation: (params: {
    page: number;
    data: AnnotationData;
    comment?: string;
  }) => void;
  updateAnnotation: (params: {
    page: number;
    data: AnnotationData;
    comment?: string;
  }) => void;
  deleteAnnotations: (id: Array<string>) => void;
};
export const PDFViewerContext = React.createContext<ContextType>({
  showLayoutAnalysis: false,
  bookmarks: {},
  addAnnotation: () => {},
  updateAnnotation: () => {},
  deleteAnnotations: () => {},
});
