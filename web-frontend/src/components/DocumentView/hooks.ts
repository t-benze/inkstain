import * as React from 'react';
import { DocumentViewContext } from './context';

export const useDocumentContext = () => {
  const context = React.useContext(DocumentViewContext);
  if (context === null) {
    throw new Error('DocumentContext is not defined');
  }
  return context;
};
