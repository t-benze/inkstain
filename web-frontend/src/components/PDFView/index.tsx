import * as React from 'react';
import { useDocument } from '~/web/hooks/useDocument';
import { PDFViewer } from './PDFViewer';

interface PDFViewProps {
  name: string;
}
export const PDFView = ({ name }: PDFViewProps) => {
  const url = useDocument(name);
  return <PDFViewer url={url} />;
};
