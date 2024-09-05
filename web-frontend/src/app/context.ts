import * as React from 'react';
import { PlatformInfo200Response as PlatformData } from '@inkstain/client-api';
import { Space, Document, SystemDocumentType } from '~/web/types';
import { Appearance } from './types';

export type ContextType = {
  platform: PlatformData;
  appearance: Appearance;
  setAppearance: (appearance: Appearance) => void;
  toasterId: string;
  documentsAlive: Document[];
  openSystemDocument: (type: SystemDocumentType) => void;
  openDocument: (name: string) => void;
  closeDocument: (name: string) => void;
  activeSpace: Space | null;
  openSpace: (space: Space) => void;
  activeDocument: string | null;
  setActiveDocumentViewRef: (view: unknown) => void;
  activeDocumentViewRef: React.MutableRefObject<unknown>;
  showAuthDialog: (show?: boolean) => void;
};

export const AppContext = React.createContext<ContextType>({} as ContextType);
