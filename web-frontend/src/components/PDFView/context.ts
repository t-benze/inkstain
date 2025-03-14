import * as React from 'react';
import { Annotation } from '@inkstain/client-api';

type ContextType = {
  annotations: Record<number, Annotation[]>;
  addAnnotation: (params: Annotation) => void;
  updateAnnotation: (params: Annotation) => void;
  deleteAnnotations: (id: Array<string>) => void;
  openTextView: (blockId?: string) => void;
  documentPath: string;
  isThumbnail: boolean;
};

export const defaultContextValue: ContextType = {
  annotations: {},
  addAnnotation: () => {
    return;
  },
  updateAnnotation: () => {
    return;
  },
  deleteAnnotations: () => {
    return;
  },
  openTextView: () => {
    return;
  },
  documentPath: '',
  isThumbnail: false,
};

export const PDFViewerContext =
  React.createContext<ContextType>(defaultContextValue);
