import * as React from 'react';
import { Space, Document } from '~/web/types';

export type DocumentViewContextType = {
  space: Space;
  document: Document;
};

export const DocumentViewContext = React.createContext<DocumentViewContextType>(
  {} as DocumentViewContextType
);
