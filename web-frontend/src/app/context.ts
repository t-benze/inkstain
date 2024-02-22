import * as React from 'react';
import { PlatformGet200Response as PlatformData } from '@inkstain/client-api';
import { Space, Document } from '../types';

export type ContextType = {
  platform: PlatformData;
  documentsAlive: Document[];
  openDocument: (type: string, name?: string) => void;
  activeSpace: Space | null;
  openSpace: (space: Space) => void;
};
export const AppContext = React.createContext<ContextType>({} as ContextType);
