import * as React from 'react';
import { PlatformInfo200Response as PlatformData } from '@inkstain/client-api';
import { Space, Document, SystemDocumentType } from '~/web/types';

export type ContextType = {
  platform: PlatformData;
  documentsAlive: Document[];
  openSystemDocument: (type: SystemDocumentType) => void;
  openDocument: (name: string) => void;
  closeDocument: (name: string) => void;
  activeSpace: Space | null;
  openSpace: (space: Space) => void;
  activeDocument: string | null;
  setActiveDocument: (name: string) => void;
  setActiveDocumentViewRef: (view: unknown) => void;
  activeDocumentViewRef: React.MutableRefObject<unknown>;
  toasterId: string;
};
export const AppContext = React.createContext<ContextType>({} as ContextType);
