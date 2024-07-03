import * as React from 'react';
import { Annotation } from '@inkstain/client-api';
import { StylusOption } from './types';

type ContextType = {
  showLayoutAnalysis: boolean;
  annotations: Record<number, Annotation[]>;
  addAnnotation: (params: Annotation) => void;
  updateAnnotation: (params: Annotation) => void;
  deleteAnnotations: (id: Array<string>) => void;
  documentPath: string;
  selectedStylus: StylusOption;
  strokeColor: string;
  strokeWidth: number;
};

export const PDFViewerContext = React.createContext<ContextType>({
  showLayoutAnalysis: false,
  annotations: {},
  addAnnotation: () => {},
  updateAnnotation: () => {},
  deleteAnnotations: () => {},
  documentPath: '',
  selectedStylus: 'select',
  strokeColor: '#000000',
  strokeWidth: 1,
});
