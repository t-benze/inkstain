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
  isThumbnail: boolean;
};

export const defaultContextValue = {
  showLayoutAnalysis: false,
  annotations: {},
  addAnnotation: () => {},
  updateAnnotation: () => {},
  deleteAnnotations: () => {},
  documentPath: '',
  selectedStylus: 'select' as const,
  strokeColor: '#000000',
  strokeWidth: 1,
  isThumbnail: false,
};

export const PDFViewerContext =
  React.createContext<ContextType>(defaultContextValue);
