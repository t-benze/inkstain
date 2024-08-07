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
  isThumbnail: boolean;
};

export const defaultContextValue: ContextType = {
  showLayoutAnalysis: false,
  annotations: {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  addAnnotation: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  updateAnnotation: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  deleteAnnotations: () => {},
  documentPath: '',
  isThumbnail: false,
};

export const PDFViewerContext =
  React.createContext<ContextType>(defaultContextValue);
